import React, { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import styles from "./Modal.module.css";

// Modal sizes
export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

// Modal props
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: ModalSize;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  preventBodyScroll?: boolean;
}

// Modal Header component
export interface ModalHeaderProps {
  children: React.ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
  className?: string;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  children,
  onClose,
  showCloseButton = true,
  className = "",
}) => (
  <div className={`${styles.header} ${className}`}>
    <div className={styles.title}>{children}</div>
    {showCloseButton && onClose && (
      <button
        type="button"
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Close modal"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    )}
  </div>
);

// Modal Body component
export interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalBody: React.FC<ModalBodyProps> = ({
  children,
  className = "",
}) => <div className={`${styles.body} ${className}`}>{children}</div>;

// Modal Footer component
export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  className = "",
}) => <div className={`${styles.footer} ${className}`}>{children}</div>;

// Main Modal component
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = "",
  overlayClassName = "",
  contentClassName = "",
  preventBodyScroll = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Handle escape key
  const handleEscapeKey = useCallback(
    (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape") {
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  // Handle overlay click
  const handleOverlayClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnOverlayClick && event.target === event.currentTarget) {
        onClose();
      }
    },
    [closeOnOverlayClick, onClose]
  );

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus the modal
      if (modalRef.current) {
        modalRef.current.focus();
      }

      // Add escape key listener
      if (closeOnEscape) {
        document.addEventListener("keydown", handleEscapeKey);
      }

      // Prevent body scroll
      if (preventBodyScroll) {
        document.body.style.overflow = "hidden";
      }
    } else {
      // Restore focus to the previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }

      // Remove escape key listener
      document.removeEventListener("keydown", handleEscapeKey);

      // Restore body scroll
      if (preventBodyScroll) {
        document.body.style.overflow = "";
      }
    }

    // Cleanup function
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      if (preventBodyScroll) {
        document.body.style.overflow = "";
      }
    };
  }, [isOpen, closeOnEscape, handleEscapeKey, preventBodyScroll]);

  // Focus trap
  const handleTabKey = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "Tab") return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    },
    []
  );

  // Don't render if not open
  if (!isOpen) return null;

  // Modal content classes
  const contentClasses = [
    styles.content,
    styles[`content--${size}`],
    contentClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const modalContent = (
    <div
      className={`${styles.overlay} ${overlayClassName}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        ref={modalRef}
        className={`${styles.modal} ${className}`}
        tabIndex={-1}
        onKeyDown={handleTabKey}
      >
        <div className={contentClasses}>
          {/* Header with title */}
          {title && (
            <ModalHeader onClose={onClose} showCloseButton={showCloseButton}>
              <h2 id="modal-title" className={styles.titleText}>
                {title}
              </h2>
            </ModalHeader>
          )}

          {/* Content */}
          <div className={styles.content}>{children}</div>
        </div>
      </div>
    </div>
  );

  // Render to portal
  return createPortal(modalContent, document.body);
};

// Compound component pattern
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

// Display name
Modal.displayName = "Modal";
