import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center font-medium rounded-[var(--ui-radius-full)] transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[var(--ui-color-bg-tertiary)] text-[var(--ui-color-fg-primary)] border border-[var(--ui-color-border)]',
        success: 'bg-[var(--ui-color-success-muted)] text-[var(--ui-color-success)] border-[var(--ui-color-success)]',
        warning: 'bg-[var(--ui-color-warning-muted)] text-[var(--ui-color-warning)] border-[var(--ui-color-warning)]',
        error: 'bg-[var(--ui-color-error-muted)] text-[var(--ui-color-error)] border-[var(--ui-color-error)]',
        info: 'bg-[var(--ui-color-brand-muted)] text-[var(--ui-color-brand)] border-[var(--ui-color-brand)]',
        outline: 'bg-transparent text-[var(--ui-color-fg-secondary)] border-[var(--ui-color-border)]',
      },
      size: {
        sm: 'px-2 py-0.5 text-[var(--ui-text-xs)]',
        md: 'px-2.5 py-1 text-[var(--ui-text-sm)]',
        lg: 'px-3 py-1.5 text-[var(--ui-text-base)]',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant, size, className }))} {...props} />
  )
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };