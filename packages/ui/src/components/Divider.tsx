import React from 'react';
import { cn } from '../lib/utils';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
  labelPosition?: 'start' | 'center' | 'end';
}

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ className, orientation = 'horizontal', label, labelPosition = 'center', ...props }, ref) => {
    if (orientation === 'vertical') {
      return (
        <div
          ref={ref}
          className={cn('h-full w-px bg-[var(--ui-color-border)]', className)}
          role="separator"
          aria-orientation="vertical"
          {...props}
        />
      );
    }

    return (
      <div
        ref={ref}
        className={cn('flex items-center w-full', className)}
        role="separator"
        aria-orientation="horizontal"
        {...props}
      >
        <div className={cn('flex-1 h-px bg-[var(--ui-color-border)]', labelPosition !== 'start' && 'min-w-0')} />
        {label && (
          <span
            className={cn(
              'px-3 text-[var(--ui-text-xs)] font-medium text-[var(--ui-color-fg-muted)] uppercase tracking-wider whitespace-nowrap',
              labelPosition === 'start' && 'order-first',
              labelPosition === 'end' && 'order-last'
            )}
          >
            {label}
          </span>
        )}
        <div className={cn('flex-1 h-px bg-[var(--ui-color-border)]', labelPosition !== 'end' && 'min-w-0')} />
      </div>
    );
  }
);
Divider.displayName = 'Divider';

export { Divider };