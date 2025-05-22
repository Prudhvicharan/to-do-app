import React, { forwardRef } from "react";
import styles from "./Button.module.css";

// Button variants
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost"
  | "outline";

// Button sizes
export type ButtonSize = "sm" | "md" | "lg";

// Button props interface
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isFullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

// Loading spinner component
const LoadingSpinner: React.FC<{ size: ButtonSize }> = ({ size }) => (
  <svg
    className={`${styles.spinner} ${styles[`spinner--${size}`]}`}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="31.416"
      strokeDashoffset="31.416"
    />
  </svg>
);

// Button component with forwardRef for better ref handling
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      isFullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      className = "",
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    // Combine CSS classes
    const buttonClasses = [
      styles.button,
      styles[`button--${variant}`],
      styles[`button--${size}`],
      isFullWidth && styles["button--fullWidth"],
      isLoading && styles["button--loading"],
      disabled && styles["button--disabled"],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    // Button is disabled when loading or explicitly disabled
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        className={buttonClasses}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        {/* Left icon or loading spinner */}
        {isLoading ? (
          <LoadingSpinner size={size} />
        ) : leftIcon ? (
          <span className={styles.icon}>{leftIcon}</span>
        ) : null}

        {/* Button text */}
        <span className={styles.text}>{children}</span>

        {/* Right icon (hidden when loading) */}
        {!isLoading && rightIcon && (
          <span className={styles.icon}>{rightIcon}</span>
        )}
      </button>
    );
  }
);

// Display name for debugging
Button.displayName = "Button";
