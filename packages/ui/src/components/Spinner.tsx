import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const spinnerVariants = cva('inline-block animate-spin', {
  variants: {
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
    color: {
      default: 'text-[var(--ui-color-brand)]',
      brand: 'text-[var(--ui-color-brand)]',
      error: 'text-[var(--ui-color-error)]',
      success: 'text-[var(--ui-color-success)]',
      warning: 'text-[var(--ui-color-warning)]',
      muted: 'text-[var(--ui-color-fg-muted)]',
    },
  },
  defaultVariants: { size: 'md', color: 'default' },
});

export interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'md', color = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(spinnerVariants({ size, color, className }))}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <svg
        className="h-full w-full"
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
      <span className="sr-only">Loading...</span>
    </div>
  )
);
Spinner.displayName = 'Spinner';

export { Spinner };