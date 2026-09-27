import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 ease-out rounded-[var(--ui-radius-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-color-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-color-bg-primary)] disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-[var(--ui-color-brand)] text-[var(--ui-color-fg-inverse)] hover:bg-[var(--ui-color-brand-hover)] active:bg-[var(--ui-color-brand)]/90',
        secondary: 'bg-[var(--ui-color-bg-tertiary)] text-[var(--ui-color-fg-primary)] border border-[var(--ui-color-border)] hover:bg-[var(--ui-color-bg-hover)] hover:border-[var(--ui-color-border-strong)] active:bg-[var(--ui-color-bg-active)]',
        outline: 'bg-transparent text-[var(--ui-color-fg-primary)] border border-[var(--ui-color-border)] hover:bg-[var(--ui-color-bg-secondary)] hover:border-[var(--ui-color-border-strong)] active:bg-[var(--ui-color-bg-tertiary)]',
        ghost: 'bg-transparent text-[var(--ui-color-fg-secondary)] hover:bg-[var(--ui-color-bg-secondary)] hover:text-[var(--ui-color-fg-primary)] active:bg-[var(--ui-color-bg-tertiary)]',
        danger: 'bg-[var(--ui-color-error)] text-[var(--ui-color-fg-inverse)] hover:bg-[var(--ui-color-error)]/90 active:bg-[var(--ui-color-error)]',
      },
      size: {
        sm: 'px-3 py-1.5 text-[var(--ui-text-sm)] h-8',
        md: 'px-4 py-2 text-[var(--ui-text-base)] h-10',
        lg: 'px-6 py-3 text-[var(--ui-text-lg)] h-12',
        xl: 'px-8 py-4 text-[var(--ui-text-xl)] h-14',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };