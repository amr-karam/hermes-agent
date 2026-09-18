"""
Traccia Tracer wrapper for Hermes Agent Desktop.

Wraps the Traccia SDK to provide Hermes-specific tracing capabilities:
- Agent workflow tracing
- Model call tracing
- Tool usage tracing
- Memory operations tracing
- Error tracking and context propagation
"""

from __future__ import annotations

import asyncio
import functools
import inspect
import logging
import os
import sys
from contextvars import ContextVar
from datetime import datetime
from functools import wraps
from typing import Any, Callable, Dict, List, Optional, TypeVar, Union

logger = logging.getLogger(__name__)

try:
    from hermes_traccia_integration import (
        get_config,
        is_traccia_available,
        get_tracer,
        load_config,
    )
    TRACCIA_AVAILABLE = True
except ImportError:
    TRACCIA_AVAILABLE = False

T = TypeVar('T')

# Context variables for trace propagation
_trace_context: ContextVar[Optional[Dict[str, Any]]] = ContextVar('trace_context', default=None)
_current_span: ContextVar[Any] = ContextVar('current_span', default=None)


def redact_pii(value: str, max_length: int = 1000) -> str:
    """Redact sensitive information from values."""
    if not isinstance(value, str):
        value = str(value)
    
    if len(value) > max_length:
        value = value[:max_length] + "...[truncated]"
    
    # Redact common PII patterns
    import re
    
    # Email
    value = re.sub(r'\b[\w\.-]+@[\w\.-]+\.\w+\b', '[email redacted]', value)
    
    # Phone numbers
    value = re.sub(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', '[phone redacted]', value)
    
    # Credit card numbers
    value = re.sub(r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b', '[card redacted]', value)
    
    # SSN
    value = re.sub(r'\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b', '[ssn redacted]', value)
    
    return value


class HermesTracer:
    """Hermes-specific tracer that wraps Traccia or provides no-op fallback."""
    
    def __init__(self):
        self._enabled = get_config('enabled', False) if TRACCIA_AVAILABLE else False
        self._config = load_config() if TRACCIA_AVAILABLE else {}
        self._tracer = get_tracer() if self._enabled and TRACCIA_AVAILABLE else None
    
    def is_available(self) -> bool:
        return TRACCIA_AVAILABLE and self._enabled and self._tracer is not None
    
    def _maybe_redact(self, value: str) -> str:
        if self._config.get('redact_pii', True):
            return redact_pii(value, self._config.get('max_string_length', 1000))
        return value[:self._config.get('max_string_length', 1000)]
    
    def _capture_value(self, key: str, value: Any, span: Any) -> None:
        """Capture a value for tracing, with optional redaction."""
        if value is None:
            span.set_attribute(f"hermes.{key}", "null")
            return
        
        str_val = str(value)
        if len(str_val) > 1000:
            str_val = self._maybe_redact(str_val)
        
        span.set_attribute(f"hermes.{key}", str_val)
    
    def start_span(self, name: str, attributes: Optional[Dict[str, Any]] = None,
                   parent: Optional[Any] = None) -> Optional[Any]:
        """Start a new trace span."""
        if not self.is_available():
            return None
        
        span = self._tracer.start_span(name, parent=parent)
        
        if attributes:
            for key, value in attributes.items():
                if key.startswith('hermes.'):
                    self._capture_value(key, value, span)
                else:
                    self._capture_value(key, value, span)
        
        # Store in context
        _current_span.set(span)
        
        return span
    
    def end_span(self, span: Any, status: str = "OK", message: str = "") -> None:
        """End a trace span."""
        if span is None:
            return
        
        if message:
            span.set_attribute("hermes.message", message)
        
        if status:
            from opentelemetry.sdk.trace import Status, StatusCode
            code = StatusCode.OK if status == "OK" else StatusCode.ERROR
            span.set_status(Status(code, message if message else None))
        
        span.end()
        _current_span.set(None)
    
    def set_attribute(self, key: str, value: Any) -> None:
        """Set an attribute on the current span."""
        span = _current_span.get()
        if span is not None:
            self._capture_value(key, value, span)
    
    def add_event(self, name: str, attributes: Optional[Dict[str, Any]] = None) -> None:
        """Add an event to the current span."""
        span = _current_span.get()
        if span is not None:
            span.add_event(name, attributes or {})


# Global tracer instance
tracer = HermesTracer()


def traced(operation_name: str, capture_input: bool = True, capture_output: bool = True,
           **kwargs) -> Callable[[T], T]:
    """
    Decorator to trace function execution.
    
    Usage:
        @traced("model-call", model="gpt-4")
        async def call_model(prompt: str) -> str:
            ...
        
        @traced("tool-execution", tool="python")
        def run_python(code: str) -> str:
            ...
    """
    def decorator(func: T) -> T:
        if not TRACCIA_AVAILABLE:
            return func
        
        is_async = inspect.iscoroutinefunction(func)
        sig = inspect.signature(func)
        
        @wraps(func)
        async def async_wrapper(*args, **fn_kwargs) -> Any:
            if not tracer.is_available():
                return await func(*args, **fn_kwargs)
            
            # Build attribute dict
            attrs = {}
            for key, value in kwargs.items():
                attrs[key] = value
            
            attrs['hermes.function'] = func.__name__
            attrs['hermes.module'] = func.__module__ or 'unknown'
            
            span = tracer.start_span(f"hermes.{operation_name}", attrs)
            
            if capture_input:
                try:
                    bound = sig.bind(*args, **fn_kwargs)
                    bound.apply_defaults()
                    for param_name, param_value in bound.arguments.items():
                        if param_name not in ['self', 'cls']:
                            tracer.set_attribute(f"hermes.input.{param_name}", param_value)
                except Exception:
                    pass
            
            try:
                result = await func(*args, **fn_kwargs)
                if capture_output and span:
                    if isinstance(result, str) and len(result) > 1000:
                        result = result[:1000] + "...[truncated]"
                    tracer.set_attribute("hermes.output", str(result))
                tracer.end_span(span, "OK")
                return result
            except Exception as e:
                if span:
                    tracer.set_attribute("hermes.error", str(e))
                    tracer.end_span(span, "ERROR", str(e))
                raise
        
        @wraps(func)
        def sync_wrapper(*args, **fn_kwargs) -> Any:
            if not tracer.is_available():
                return func(*args, **fn_kwargs)
            
            attrs = {}
            for key, value in kwargs.items():
                attrs[key] = value
            
            attrs['hermes.function'] = func.__name__
            attrs['hermes.module'] = func.__module__ or 'unknown'
            
            span = tracer.start_span(f"hermes.{operation_name}", attrs)
            
            if capture_input:
                try:
                    bound = sig.bind(*args, **fn_kwargs)
                    bound.apply_defaults()
                    for param_name, param_value in bound.arguments.items():
                        if param_name not in ['self', 'cls']:
                            tracer.set_attribute(f"hermes.input.{param_name}", param_value)
                except Exception:
                    pass
            
            try:
                result = func(*args, **fn_kwargs)
                if capture_output and span:
                    if isinstance(result, str) and len(result) > 1000:
                        result = result[:1000] + "...[truncated]"
                    tracer.set_attribute("hermes.output", str(result))
                tracer.end_span(span, "OK")
                return result
            except Exception as e:
                if span:
                    tracer.set_attribute("hermes.error", str(e))
                    tracer.end_span(span, "ERROR", str(e))
                raise
        
        return async_wrapper if is_async else sync_wrapper
    
    return decorator


# Convenience decorators for common Hermes operations
def trace_model_call(**kwargs) -> Callable:
    """Trace a model API call."""
    return traced("model-call", **kwargs)


def trace_tool_execution(**kwargs) -> Callable:
    """Trace a tool execution."""
    return traced("tool-execution", **kwargs)


def trace_memory_operation(**kwargs) -> Callable:
    """Trace a memory operation."""
    return traced("memory-op", **kwargs)


def trace_skill_execution(**kwargs) -> Callable:
    """Trace a skill execution."""
    return traced("skill-exec", **kwargs)


def trace_conversation_turn(**kwargs) -> Callable:
    """Trace a conversation turn."""
    return traced("conversation-turn", **kwargs)


# Context manager for tracing blocks
from contextlib import contextmanager

@contextmanager
def trace_context(operation_name: str, attributes: Optional[Dict[str, Any]] = None):
    """Context manager for tracing code blocks."""
    span = tracer.start_span(operation_name, attributes or {})
    try:
        yield span
    except Exception as e:
        if span:
            tracer.set_attribute("hermes.error", str(e))
            tracer.end_span(span, "ERROR", str(e))
        raise
    else:
        tracer.end_span(span, "OK")


# Async context manager for tracing async blocks
from contextlib import asynccontextmanager

@asynccontextmanager
async def atrace_context(operation_name: str, attributes: Optional[Dict[str, Any]] = None):
    """Async context manager for tracing async code blocks."""
    span = tracer.start_span(operation_name, attributes or {})
    try:
        yield span
    except Exception as e:
        if span:
            tracer.set_attribute("hermes.error", str(e))
            tracer.end_span(span, "ERROR", str(e))
        raise
    else:
        tracer.end_span(span, "OK")


__all__ = [
    'tracer',
    'HermesTracer',
    'redact_pii',
    'traced',
    'trace_model_call',
    'trace_tool_execution',
    'trace_memory_operation',
    'trace_skill_execution',
    'trace_conversation_turn',
    'trace_context',
    'atrace_context',
    'TRACCIA_AVAILABLE',
]