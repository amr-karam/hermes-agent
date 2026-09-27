'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/utils';

type Side = 'top' | 'right' | 'bottom' | 'left';
type Align = 'start' | 'center' | 'end';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: Side;
  align?: Align;
  offset?: number;
  openDelay?: number;
  closeDelay?: number;
}

interface TooltipTriggerProps extends React.HTMLAttributes<HTMLDivElement> {}
interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: Side;
  align?: Align;
}
interface TooltipProviderProps {
  children: React.ReactNode;
}

const TooltipContext = React.createContext<{
  triggerRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
} | null>(null);

export const TooltipProvider = ({ children }: TooltipProviderProps) => {
  const triggerRef = React.useRef<HTMLElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  return (
    <TooltipContext.Provider
      value={{
        triggerRef,
        contentRef,
      }}
    >
      {children}
    </TooltipContext.Provider>
  );
};

const Tooltip = ({
  content,
  children,
  side = 'top',
  align = 'center',
  offset = 8,
  openDelay = 200,
  closeDelay = 100,
}: TooltipProps) => {
  const [open, setOpen] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();
  const childRef = React.useRef<HTMLElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setOpen(true), openDelay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setOpen(false), closeDelay);
  };

  const handleFocus = () => setOpen(true);
  const handleBlur = () => setOpen(false);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const child = React.Children.only(children);
  const clonedChild = React.cloneElement(child, {
    ref: childRef,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleFocus,
    onBlur: handleBlur,
  });

  const tooltipContent = open ? (
    <div
      ref={contentRef}
      className={cn(
        'fixed z-[var(--ui-z-tooltip)] max-w-xs px-3 py-2 rounded-[var(--ui-radius-md)] bg-[var(--ui-color-bg-tertiary)] border border-[var(--ui-color-border)] shadow-[var(--ui-shadow-lg)] text-[var(--ui-text-sm)] text-[var(--ui-color-fg-primary)] animate-fade-in',
        'pointer-events-none'
      )}
      role="tooltip"
    >
      {content}
    </div>
  ) : null;

  const positionTooltip = () => {
    if (!childRef.current || !contentRef.current) return;

    const triggerRect = childRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();
    let top = 0;
    let left = 0;

    switch (side) {
      case 'top':
        top = triggerRect.top - contentRect.height - offset;
        break;
      case 'bottom':
        top = triggerRect.bottom + offset;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - contentRect.height) / 2;
        left = triggerRect.left - contentRect.width - offset;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - contentRect.height) / 2;
        left = triggerRect.right + offset;
        break;
    }

    switch (align) {
      case 'start':
        left = triggerRect.left;
        break;
      case 'center':
        left = triggerRect.left + (triggerRect.width - contentRect.width) / 2;
        break;
      case 'end':
        left = triggerRect.right - contentRect.width;
        break;
    }

    contentRef.current.style.top = `${top}px`;
    contentRef.current.style.left = `${left}px`;
  };

  React.useEffect(() => {
    if (open) {
      requestAnimationFrame(positionTooltip);
      window.addEventListener('scroll', positionTooltip, { passive: true });
      window.addEventListener('resize', positionTooltip);
    }
    return () => {
      window.removeEventListener('scroll', positionTooltip);
      window.removeEventListener('resize', positionTooltip);
    };
  }, [open, side, align, offset]);

  return (
    <>
      {clonedChild}
      {createPortal(tooltipContent, document.body)}
    </>
  );
};
Tooltip.displayName = 'Tooltip';

const TooltipTrigger = React.forwardRef<HTMLDivElement, TooltipTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('inline-block', className)} {...props}>
      {children}
    </div>
  )
);
TooltipTrigger.displayName = 'TooltipTrigger';

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props}>
      {children}
    </div>
  )
);
TooltipContent.displayName = 'TooltipContent';

export { Tooltip, TooltipTrigger, TooltipContent };
export type { TooltipProps, TooltipTriggerProps, TooltipContentProps, TooltipProviderProps };