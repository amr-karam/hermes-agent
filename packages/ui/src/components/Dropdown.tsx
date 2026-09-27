'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/utils';

export type DropdownItem = {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  dangerous?: boolean;
  divider?: boolean;
};

interface DropdownProps {
  trigger: React.ReactElement;
  items: DropdownItem[];
  onSelect?: (value: string, item: DropdownItem) => void;
  align?: 'start' | 'center' | 'end';
  offset?: number;
}

const Dropdown = ({ trigger, items, onSelect, align = 'start', offset = 4 }: DropdownProps) => {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'ArrowDown' && open) {
        e.preventDefault();
        const firstItem = contentRef.current?.querySelector('[role="menuitem"]:not([disabled])') as HTMLElement;
        firstItem?.focus();
      }
      if (e.key === 'ArrowUp' && open) {
        e.preventDefault();
        const lastItem = contentRef.current?.querySelector('[role="menuitem"]:not([disabled]):last-child') as HTMLElement;
        lastItem?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (triggerRef.current?.contains(e.target as Node)) return;
      if (contentRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const originalOnClick = (trigger.props as { onClick?: (event: React.MouseEvent) => void }).onClick;
    originalOnClick?.(e);
    setOpen((prev) => !prev);
  };

  const clonedTrigger = React.cloneElement(trigger as React.ReactElement<any>, {
    onClick: handleTriggerClick,
    'aria-haspopup': 'menu' as const,
    'aria-expanded': open,
  });

  if (!open) return clonedTrigger;

  const dropdownContent = (
    <div
      ref={contentRef}
      className={cn(
        'fixed z-[var(--ui-z-dropdown)] min-w-[160px] rounded-[var(--ui-radius-md)] bg-[var(--ui-color-bg-secondary)] border border-[var(--ui-color-border)] shadow-[var(--ui-shadow-lg)] py-1 animate-scale-in',
        align === 'start' && 'left-0',
        align === 'center' && 'left-1/2 -translate-x-1/2',
        align === 'end' && 'right-0'
      )}
      role="menu"
      style={{
        top: `${(triggerRef.current?.getBoundingClientRect().bottom || 0) + offset}px`,
        left: align === 'start' ? `${triggerRef.current?.getBoundingClientRect().left || 0}px` : undefined,
        right: align === 'end' ? `${window.innerWidth - (triggerRef.current?.getBoundingClientRect().right || 0)}px` : undefined,
        transform: align === 'center' ? 'translateX(-50%)' : undefined,
      }}
    >
      {items.map((item, index) => {
        if (item.divider) {
          return <div key={`divider-${index}`} className="h-px bg-[var(--ui-color-border)] my-1" role="separator" />;
        }
        return (
          <button
            key={item.value}
            role="menuitem"
            tabIndex={0}
            disabled={item.disabled}
            className={cn(
              'w-full px-3 py-2 text-left text-[var(--ui-text-sm)] transition-colors',
              'focus:outline-none focus:bg-[var(--ui-color-bg-tertiary)]',
              item.dangerous
                ? 'text-[var(--ui-color-error)] hover:bg-[var(--ui-color-error-muted)]'
                : 'text-[var(--ui-color-fg-primary)] hover:bg-[var(--ui-color-bg-tertiary)]',
              item.disabled && 'opacity-50 pointer-events-none'
            )}
            onClick={() => {
              if (!item.disabled) {
                onSelect?.(item.value, item);
                setOpen(false);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!item.disabled) {
                  onSelect?.(item.value, item);
                  setOpen(false);
                }
              }
            }}
          >
            <div className="flex items-center gap-2">
              {item.icon && <span className="flex-shrink-0 h-4 w-4">{item.icon}</span>}
              <span>{item.label}</span>
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      {clonedTrigger}
      {createPortal(dropdownContent, document.body)}
    </>
  );
};

Dropdown.displayName = 'Dropdown';

export { Dropdown };
export type { DropdownProps };