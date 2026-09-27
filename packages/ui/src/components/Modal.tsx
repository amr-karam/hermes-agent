'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/utils';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Modal = ({ open, onOpenChange, title, description, children, size = 'md' }: ModalProps) => {
  if (!open) return null;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onOpenChange(false);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onOpenChange(false);
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, []);

  const modalContent = (
    <div
      className="fixed inset-0 z-[var(--ui-z-modal)] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />
      <div
        className={cn(
          'relative w-full max-h-[90vh] overflow-hidden rounded-[var(--ui-radius-xl)] bg-[var(--ui-color-bg-secondary)] border border-[var(--ui-color-border)] shadow-[var(--ui-shadow-xl)] animate-scale-in',
          {
            'max-w-sm': size === 'sm',
            'max-w-md': size === 'md',
            'max-w-lg': size === 'lg',
            'max-w-2xl': size === 'xl',
            'max-w-5xl': size === 'full',
          }
        )}
      >
        {(title || description) && (
          <div className="px-6 py-4 border-b border-[var(--ui-color-border)]">
            {title && (
              <h2 id="modal-title" className="text-[var(--ui-text-lg)] font-semibold text-[var(--ui-color-fg-primary)]">
                {title}
              </h2>
            )}
            {description && (
              <p id="modal-description" className="mt-1 text-[var(--ui-text-sm)] text-[var(--ui-color-fg-secondary)]">
                {description}
              </p>
            )}
          </div>
        )}
        <div className="px-6 py-4 max-h-[calc(90vh-8rem)] overflow-y-auto">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

Modal.displayName = 'Modal';

export { Modal };
export type { ModalProps };