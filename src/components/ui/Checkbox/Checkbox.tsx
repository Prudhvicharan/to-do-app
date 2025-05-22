import React, { forwardRef, useId } from "react";
import styles from "./Checkbox.module.css";

// Checkbox sizes
export type CheckboxSize = "sm" | "md" | "lg";

// Checkbox variants
export type CheckboxVariant = "default" | "rounded";

// Base checkbox props
export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  size?: CheckboxSize;
  variant?: CheckboxVariant;
  label?: string;
  description?: string;
  errorMessage?: string;
  isIndeterminate?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  labelPosition?: "left" | "right";
  className?: string;
  labelClassName?: string;
  checkboxClassName?: string;
}

// Checkbox Group context
interface CheckboxGroupContextValue {
  name?: string;
  value?: string[];
  onChange?: (value: string[]) => void;
  isDisabled?: boolean;
  size?: CheckboxSize;
  variant?: CheckboxVariant;
}

const CheckboxGroupContext =
  React.createContext<CheckboxGroupContextValue | null>(null);

// Individual Checkbox component
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      size = "md",
      variant = "default",
      label,
      description,
      errorMessage,
      isIndeterminate = false,
      isDisabled = false,
      isRequired = false,
      labelPosition = "right",
      className = "",
      labelClassName = "",
      checkboxClassName = "",
      id,
      checked,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;
    const groupContext = React.useContext(CheckboxGroupContext);

    // Use group context values if available
    const finalSize = groupContext?.size || size;
    const finalVariant = groupContext?.variant || variant;
    const finalDisabled = groupContext?.isDisabled || isDisabled;
    const finalName = groupContext?.name || props.name;

    // Handle group checkbox state
    const isChecked = groupContext?.value
      ? groupContext.value.includes(value as string)
      : checked;

    // Handle group checkbox change
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (groupContext?.onChange && value) {
        const currentValues = groupContext.value || [];
        const newValues = event.target.checked
          ? [...currentValues, value as string]
          : currentValues.filter((v) => v !== value);
        groupContext.onChange(newValues);
      } else if (onChange) {
        onChange(event);
      }
    };

    // Handle indeterminate state
    React.useEffect(() => {
      if (ref && typeof ref === "object" && ref.current) {
        ref.current.indeterminate = isIndeterminate;
      }
    }, [isIndeterminate, ref]);

    // Container classes
    const containerClasses = [
      styles.container,
      styles[`container--${labelPosition}`],
      finalDisabled && styles["container--disabled"],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    // Checkbox wrapper classes
    const checkboxWrapperClasses = [
      styles.checkboxWrapper,
      styles[`checkboxWrapper--${finalSize}`],
      styles[`checkboxWrapper--${finalVariant}`],
      isChecked && styles["checkboxWrapper--checked"],
      isIndeterminate && styles["checkboxWrapper--indeterminate"],
      finalDisabled && styles["checkboxWrapper--disabled"],
      errorMessage && styles["checkboxWrapper--error"],
      checkboxClassName,
    ]
      .filter(Boolean)
      .join(" ");

    // Label classes
    const labelClasses = [
      styles.labelText,
      styles[`labelText--${finalSize}`],
      finalDisabled && styles["labelText--disabled"],
      labelClassName,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={containerClasses}>
        <div className={styles.checkboxContainer}>
          {/* Checkbox input and visual indicator */}
          <div className={checkboxWrapperClasses}>
            <input
              ref={ref}
              id={checkboxId}
              type="checkbox"
              className={styles.checkboxInput}
              checked={isChecked}
              disabled={finalDisabled}
              required={isRequired}
              name={finalName}
              value={value}
              onChange={handleChange}
              aria-describedby={
                description || errorMessage
                  ? `${checkboxId}-description`
                  : undefined
              }
              {...props}
            />

            {/* Custom checkbox visual */}
            <div className={styles.checkboxVisual}>
              {isIndeterminate ? (
                // Indeterminate icon
                <svg
                  className={styles.checkboxIcon}
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <rect x="2" y="7" width="12" height="2" rx="1" />
                </svg>
              ) : isChecked ? (
                // Checked icon
                <svg
                  className={styles.checkboxIcon}
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : null}
            </div>
          </div>

          {/* Label and description */}
          {(label || description) && (
            <div className={styles.labelContainer}>
              {label && (
                <label htmlFor={checkboxId} className={labelClasses}>
                  {label}
                  {isRequired && <span className={styles.required}>*</span>}
                </label>
              )}

              {description && (
                <div
                  id={`${checkboxId}-description`}
                  className={styles.description}
                >
                  {description}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div id={`${checkboxId}-description`} className={styles.errorMessage}>
            {errorMessage}
          </div>
        )}
      </div>
    );
  }
);

// Checkbox Group component
export interface CheckboxGroupProps {
  children: React.ReactNode;
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  name?: string;
  label?: string;
  description?: string;
  errorMessage?: string;
  isDisabled?: boolean;
  isRequired?: boolean;
  size?: CheckboxSize;
  variant?: CheckboxVariant;
  orientation?: "horizontal" | "vertical";
  className?: string;
  labelClassName?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  children,
  value,
  defaultValue = [],
  onChange,
  name,
  label,
  description,
  errorMessage,
  isDisabled = false,
  isRequired = false,
  size = "md",
  variant = "default",
  orientation = "vertical",
  className = "",
  labelClassName = "",
}) => {
  const [internalValue, setInternalValue] = React.useState<string[]>(
    value || defaultValue
  );

  // Use controlled or uncontrolled state
  const currentValue = value !== undefined ? value : internalValue;

  const handleChange = (newValue: string[]) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const contextValue: CheckboxGroupContextValue = {
    name,
    value: currentValue,
    onChange: handleChange,
    isDisabled,
    size,
    variant,
  };

  const groupClasses = [
    styles.group,
    styles[`group--${orientation}`],
    isDisabled && styles["group--disabled"],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const groupLabelClasses = [styles.groupLabel, labelClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <CheckboxGroupContext.Provider value={contextValue}>
      <div
        className={groupClasses}
        role="group"
        aria-labelledby={label ? "group-label" : undefined}
      >
        {/* Group label */}
        {label && (
          <div id="group-label" className={groupLabelClasses}>
            {label}
            {isRequired && <span className={styles.required}>*</span>}
          </div>
        )}

        {/* Group description */}
        {description && (
          <div className={styles.groupDescription}>{description}</div>
        )}

        {/* Checkboxes */}
        <div className={styles.groupContent}>{children}</div>

        {/* Group error message */}
        {errorMessage && (
          <div className={styles.groupErrorMessage}>{errorMessage}</div>
        )}
      </div>
    </CheckboxGroupContext.Provider>
  );
};

// Display names
Checkbox.displayName = "Checkbox";
CheckboxGroup.displayName = "CheckboxGroup";
