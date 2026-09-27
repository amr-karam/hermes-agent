'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastProps extends ToastOptions {
  id: string;
  onClose: (id: string) => void;
}

const toastVariants = cva(
  'relative flex items-start gap-3 p-4 rounded-[var(--ui-radius-lg)] border shadow-[var(--ui-shadow-lg)] animate-slide-in',
  {
    variants: {
      variant: {
        default: 'bg-[var(--ui-color-bg-secondary)] border-[var(--ui-color-border)]',
        success: 'bg-[var(--ui-color-success-muted)] border-[var(--ui-color-success)]',
        error: 'bg-[var(--ui-color-error-muted)] border-[var(--ui-color-error)]',
        warning: 'bg-[var(--ui-color-warning-muted)] border-[var(--ui-color-warning)]',
        info: 'bg-[var(--ui-color-brand-muted)] border-[var(--ui-brand)]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

const iconVariants = {
  success: (
    <svg className="h-5 w-5 text-[var(--ui-color-success)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5 text-[var(--ui-color-error)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="h-5 w-5 text-[var(--ui-color-warning)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className="h-5 w-5 text-[var(--ui-color-brand)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  default: (
    <svg className="h-5 w-5 text-[var(--ui-color-fg-secondary)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const Toast = ({ id, title, description, variant = 'default', duration = 5000, onClose }: ToastProps) => {
  React.useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div className={cn(toastVariants({ variant }))} role="alert" aria-live="polite">
      <div className="flex-shrink-0 mt-0.5">{iconVariants[variant]}</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[var(--ui-color-fg-primary)]">{title}</p>
        {description && (
          <p className="mt-1 text-[var(--ui-text-sm)] text-[var(--ui-color-fg-secondary)]">{description}</p>
        )}
      </div>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 p-1 rounded-[var(--ui-radius-sm)] text-[var(--ui-color-fg-muted)] hover:text-[var(--ui-color-fg-primary)] hover:bg-[var(--ui-color-bg-tertiary)] transition-colors"
        aria-label="Dismiss"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
Toast.displayName = 'Toast';

const ToastContainer = ({ toasts, onClose }: { toasts: ToastProps[]; onClose: (id: string) => void }) => {
  return (
    <div
      className="fixed bottom-4 right-4 z-[var(--ui-z-toast)] flex flex-col gap-2 max-w-sm w-full"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
};
ToastContainer.displayName = 'ToastContainer';

interface ToastContextValue {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const toast = React.useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...options, id, onClose: dismiss }]);
    return id;
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onClose={dismiss} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export { Toast, ToastContainer };
export type { ToastProps, ToastOptions };