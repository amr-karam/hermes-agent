"""Minimal LLM seam for the Rig.

The Rig plans with a model only when one is configured (``$HERMES_RIG_MODEL``)
or explicitly required (``$HERMES_RIG_REQUIRE_MODEL``); otherwise slicing is
deterministic and no client is consulted, so a model outage never takes the
default path down.
"""

from __future__ import annotations

import os
from collections.abc import Callable

MODEL_ENV = "HERMES_RIG_MODEL"
REQUIRE_ENV = "HERMES_RIG_REQUIRE_MODEL"


class LLMUnavailableError(Exception):
    """No model is configured, or the configured provider cannot answer."""


class LLMOutputError(Exception):
    """The model answered with empty or unparseable output."""


class LLMClient:
    """Complete a prompt with the configured model.

    ``transport`` is the injection seam: a callable ``prompt -> text``. With no
    model (or no transport) completion is *unavailable* rather than guessed —
    callers fall back to deterministic planning or surface the outage.
    """

    def __init__(
        self,
        model: str | None = None,
        transport: Callable[[str], str] | None = None,
    ) -> None:
        configured = model if model is not None else os.environ.get(MODEL_ENV, "")
        self.model = configured.strip() or None
        self._transport = transport

    def complete(self, prompt: str) -> str:
        """Return the model's answer, or raise the matching Rig error."""
        if not self.model:
            raise LLMUnavailableError(
                f"no model configured; set {MODEL_ENV} to plan with a model"
            )
        if self._transport is None:
            raise LLMUnavailableError(
                f"model {self.model!r} is configured but no transport is wired"
            )
        answer = self._transport(prompt)
        if not isinstance(answer, str) or not answer.strip():
            raise LLMOutputError(
                f"model {self.model!r} returned empty or invalid output"
            )
        return answer


def model_required() -> bool:
    """True when the environment explicitly demands model-backed planning."""
    return os.environ.get(REQUIRE_ENV, "").strip().lower() in ("1", "true", "yes", "on")
