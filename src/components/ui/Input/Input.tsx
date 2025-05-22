import React, { forwardRef, useState } from "react";
import styles from "./Input.module.css";

// Input variants
export type InputVariant = "default" | "filled" | "outline";

// Input sizes
export type InputSize = "sm" | "md" | "lg";

// Input types
export type InputType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url"
  | "search";

// Base input props
interface BaseInputProps {
  variant?: InputVariant;
  size?: InputSize;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isFullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
}

// Input component props
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type">,
    BaseInputProps {
  type?: InputType;
}

// Textarea component props
export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    BaseInputProps {
  rows?: number;
  resize?: "none" | "vertical" | "horizontal" | "both";
}

// Input component
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = "default",
      size = "md",
      type = "text",
      label,
      helperText,
      errorMessage,
      isRequired = false,
      isDisabled = false,
      isReadOnly = false,
      isFullWidth = false,
      leftIcon,
      rightIcon,
      onRightIconClick,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasError = Boolean(errorMessage);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    // Container classes
    const containerClasses = [
      styles.container,
      isFullWidth && styles["container--fullWidth"],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    // Input wrapper classes
    const wrapperClasses = [
      styles.inputWrapper,
      styles[`inputWrapper--${variant}`],
      styles[`inputWrapper--${size}`],
      isFocused && styles["inputWrapper--focused"],
      hasError && styles["inputWrapper--error"],
      isDisabled && styles["inputWrapper--disabled"],
      isReadOnly && styles["inputWrapper--readonly"],
    ]
      .filter(Boolean)
      .join(" ");

    // Input classes
    const inputClasses = [
      styles.input,
      leftIcon && styles["input--hasLeftIcon"],
      rightIcon && styles["input--hasRightIcon"],
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={containerClasses}>
        {/* Label */}
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {isRequired && <span className={styles.required}>*</span>}
          </label>
        )}

        {/* Input wrapper */}
        <div className={wrapperClasses}>
          {/* Left icon */}
          {leftIcon && <div className={styles.leftIcon}>{leftIcon}</div>}

          {/* Input field */}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={inputClasses}
            disabled={isDisabled}
            readOnly={isReadOnly}
            required={isRequired}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <div
              className={`${styles.rightIcon} ${
                onRightIconClick ? styles["rightIcon--clickable"] : ""
              }`}
              onClick={onRightIconClick}
              role={onRightIconClick ? "button" : undefined}
              tabIndex={onRightIconClick ? 0 : undefined}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {/* Helper text or error message */}
        {(helperText || errorMessage) && (
          <div
            className={`${styles.helperText} ${
              hasError ? styles["helperText--error"] : ""
            }`}
          >
            {errorMessage || helperText}
          </div>
        )}
      </div>
    );
  }
);

// Textarea component
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      variant = "default",
      size = "md",
      label,
      helperText,
      errorMessage,
      isRequired = false,
      isDisabled = false,
      isReadOnly = false,
      isFullWidth = false,
      rows = 3,
      resize = "vertical",
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasError = Boolean(errorMessage);
    const textareaId =
      id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    // Container classes
    const containerClasses = [
      styles.container,
      isFullWidth && styles["container--fullWidth"],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    // Textarea wrapper classes
    const wrapperClasses = [
      styles.textareaWrapper,
      styles[`textareaWrapper--${variant}`],
      styles[`textareaWrapper--${size}`],
      isFocused && styles["textareaWrapper--focused"],
      hasError && styles["textareaWrapper--error"],
      isDisabled && styles["textareaWrapper--disabled"],
      isReadOnly && styles["textareaWrapper--readonly"],
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={containerClasses}>
        {/* Label */}
        {label && (
          <label htmlFor={textareaId} className={styles.label}>
            {label}
            {isRequired && <span className={styles.required}>*</span>}
          </label>
        )}

        {/* Textarea wrapper */}
        <div className={wrapperClasses}>
          <textarea
            ref={ref}
            id={textareaId}
            className={styles.textarea}
            disabled={isDisabled}
            readOnly={isReadOnly}
            required={isRequired}
            rows={rows}
            style={{ resize }}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
        </div>

        {/* Helper text or error message */}
        {(helperText || errorMessage) && (
          <div
            className={`${styles.helperText} ${
              hasError ? styles["helperText--error"] : ""
            }`}
          >
            {errorMessage || helperText}
          </div>
        )}
      </div>
    );
  }
);

// Display names
Input.displayName = "Input";
Textarea.displayName = "Textarea";
