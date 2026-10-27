'use client';

import React from 'react';
import { cn } from '../lib/utils';

interface AccordionProps {
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  children: React.ReactNode;
  className?: string;
}

interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onTriggerClick?: () => void;
}

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Accordion = ({
  type = 'single',
  collapsible = true,
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: AccordionProps) => {
  const [activeValues, setActiveValues] = React.useState<string[]>(() => {
    if (value !== undefined) return Array.isArray(value) ? value : [value];
    if (defaultValue !== undefined) return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
    return [];
  });

  const controlled = value !== undefined;
  const currentValues = controlled ? (Array.isArray(value) ? value : [value]) : activeValues;

  const handleTriggerClick = (itemValue: string) => {
    let newValues: string[];
    if (type === 'single') {
      newValues = currentValues.includes(itemValue) && collapsible ? [] : [itemValue];
    } else {
      newValues = currentValues.includes(itemValue)
        ? currentValues.filter((v) => v !== itemValue)
        : [...currentValues, itemValue];
    }
    if (!controlled) setActiveValues(newValues);
    onValueChange?.(type === 'single' ? newValues[0] : newValues);
  };

  return (
    <div className={cn(className)} data-accordion>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, {
          value: currentValues,
          onValueChange: handleTriggerClick,
        } as any);
      })}
    </div>
  );
};
Accordion.displayName = 'Accordion';

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, value, children, disabled, ...props }, ref) => {
    const context = React.useContext(AccordionContext);
    const isOpen = context?.value.includes(value);
    const handleClick = () => {
      if (!disabled) context?.onValueChange?.(value);
    };

    return (
      <div ref={ref} className={cn('border border-[var(--ui-color-border)] rounded-[var(--ui-radius-md)] overflow-hidden', className)} {...props}>
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child;
          return React.cloneElement(child, {
            isOpen,
            onTriggerClick: handleClick,
            disabled,
            value,
          } as any);
        })}
      </div>
    );
  }
);
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps & { isOpen?: boolean; disabled?: boolean }>(
  ({ className, isOpen, disabled, children, onTriggerClick, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        'w-full px-4 py-3 text-left font-medium transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-color-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ui-color-bg-primary)]',
        'hover:bg-[var(--ui-color-bg-tertiary)]',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
      onClick={onTriggerClick}
      disabled={disabled}
      aria-expanded={isOpen}
      {...props}
    >
      <div className="flex items-center justify-between gap-4">
        <span>{children}</span>
        <svg
          className={cn('h-4 w-4 flex-shrink-0 text-[var(--ui-color-fg-muted)] transition-transform duration-150', isOpen && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>
  )
);
AccordionTrigger.displayName = 'AccordionTrigger';

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps & { isOpen?: boolean }>(
  ({ className, isOpen, children, ...props }, ref) => {
    const [height, setHeight] = React.useState(0);
    const contentRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (isOpen && contentRef.current) {
        setHeight(contentRef.current.scrollHeight);
      } else {
        setHeight(0);
      }
    }, [isOpen]);

    if (!isOpen && height === 0) return null;

    return (
      <div
        ref={ref}
        className={cn('overflow-hidden transition-all duration-200 ease-out', className)}
        style={{ maxHeight: isOpen ? height : 0 }}
        {...props}
      >
        <div ref={contentRef} className="px-4 pb-4">
          {children}
        </div>
      </div>
    );
  }
);
AccordionContent.displayName = 'AccordionContent';

const AccordionContext = React.createContext<{
  value: string[];
  onValueChange: (value: string) => void;
} | null>(null);

Accordion.Item = AccordionItem;
Accordion.Trigger = AccordionTrigger;
Accordion.Content = AccordionContent;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
export type { AccordionProps, AccordionItemProps, AccordionTriggerProps, AccordionContentProps };