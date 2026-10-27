import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const avatarVariants = cva('inline-flex items-center justify-center font-medium bg-[var(--ui-color-bg-tertiary)] border border-[var(--ui-color-border)] rounded-full overflow-hidden', {
  variants: {
    size: {
      xs: 'h-6 w-6 text-[var(--ui-text-xs)]',
      sm: 'h-8 w-8 text-[var(--ui-text-sm)]',
      md: 'h-10 w-10 text-[var(--ui-text-base)]',
      lg: 'h-12 w-12 text-[var(--ui-text-lg)]',
      xl: 'h-16 w-16 text-[var(--ui-text-xl)]',
    },
  },
  defaultVariants: { size: 'md' },
});

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getColorFromName(name: string): string {
  const colors = [
    'bg-[var(--ui-color-brand)]',
    'bg-[var(--ui-color-success)]',
    'bg-[var(--ui-color-warning)]',
    'bg-[var(--ui-color-error)]',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  name?: string;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, name, size = 'md', ...props }, ref) => {
    const colorClass = name ? getColorFromName(name) : '';
    const initials = name ? getInitials(name) : '?';

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size, className: cn(colorClass, className) }))}
        {...props}
      >
        {src ? (
          <img src={src} alt={alt || name || 'Avatar'} className="h-full w-full object-cover" />
        ) : (
          <span className="text-[var(--ui-color-fg-inverse)]">{initials}</span>
        )}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, max = 5, size = 'md', children, ...props }, ref) => {
    const validChildren = React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement[];
    const visibleAvatars = validChildren.slice(0, max);
    const remainingCount = validChildren.length - max;

    return (
      <div ref={ref} className={cn('flex -space-x-2', className)} {...props}>
        {visibleAvatars.map((child, index) =>
          React.cloneElement(child, { key: child.key || index, size })
        )}
        {remainingCount > 0 && (
          <div
            className={cn(
              avatarVariants({ size }),
              'bg-[var(--ui-color-bg-tertiary)] border-[var(--ui-color-border)] text-[var(--ui-color-fg-secondary)]'
            )}
            aria-label={`${remainingCount} more`}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    )
  }
);
AvatarGroup.displayName = 'AvatarGroup';

export { Avatar, AvatarGroup };
export type { AvatarGroupProps };