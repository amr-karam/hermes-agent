import React from 'react';
import { cn } from '../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || `input-${React.useId()}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[var(--ui-text-sm)] font-medium text-[var(--ui-color-fg-primary)] mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3 py-2 rounded-[var(--ui-radius-md)] bg-[var(--ui-color-bg-primary)] border transition-all duration-150',
            'text-[var(--ui-color-fg-primary)] placeholder-[var(--ui-color-fg-muted)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--ui-color-brand)] focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--ui-color-bg-tertiary)]',
            error
              ? 'border-[var(--ui-color-error)] focus:ring-[var(--ui-color-error)]'
              : 'border-[var(--ui-color-border)] hover:border-[var(--ui-color-border-strong)]',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={cn(errorId, helperId)}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-1.5 text-[var(--ui-text-sm)] text-[var(--ui-color-error)]" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-[var(--ui-text-sm)] text-[var(--ui-color-fg-muted)]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };