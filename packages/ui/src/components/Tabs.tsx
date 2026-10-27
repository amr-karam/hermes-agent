'use client';

import React from 'react';
import { cn } from '../lib/utils';

interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}
interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
}
interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const Tabs = ({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: TabsProps) => {
  const [activeValue, setActiveValue] = React.useState(defaultValue);
  const controlled = value !== undefined;
  const currentValue = controlled ? value : activeValue;

  const handleTriggerClick = (triggerValue: string) => {
    if (!controlled) setActiveValue(triggerValue);
    onValueChange?.(triggerValue);
  };

  return (
    <div className={cn(className)} data-tabs>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, {
          value: currentValue,
          onValueChange: handleTriggerClick,
        } as any);
      })}
    </div>
  );
};
Tabs.displayName = 'Tabs';

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1 p-1 rounded-[var(--ui-radius-md)] bg-[var(--ui-color-bg-tertiary)]',
        className
      )}
      role="tablist"
      {...props}
    >
      {children}
    </div>
  )
);
TabsList.displayName = 'TabsList';

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, disabled, children, onValueChange, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    const isActive = context?.value === value;
    const handleClick = () => {
      if (!disabled) context?.onValueChange?.(value);
    };

    return (
      <button
        ref={ref}
        role="tab"
        aria-selected={isActive}
        aria-controls={`tabs-content-${value}`}
        id={`tabs-trigger-${value}`}
        tabIndex={isActive ? 0 : -1}
        className={cn(
          'px-4 py-2 text-[var(--ui-text-sm)] font-medium rounded-[var(--ui-radius-sm)] transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-color-brand)]',
          isActive
            ? 'bg-[var(--ui-color-bg-secondary)] text-[var(--ui-color-fg-primary)] shadow-[var(--ui-shadow-sm)]'
            : 'text-[var(--ui-color-fg-secondary)] hover:text-[var(--ui-color-fg-primary)] hover:bg-[var(--ui-color-bg-secondary)]',
          disabled && 'opacity-50 pointer-events-none',
          className
        )}
        onClick={handleClick}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);
TabsTrigger.displayName = 'TabsTrigger';

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    const isActive = context?.value === value;

    if (!isActive) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`tabs-content-${value}`}
        aria-labelledby={`tabs-trigger-${value}`}
        className={cn('animate-fade-in', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsContent.displayName = 'TabsContent';

const TabsContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
} | null>(null);

Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;

export { Tabs, TabsList, TabsTrigger, TabsContent };
export type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps };