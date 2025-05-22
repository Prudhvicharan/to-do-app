import React, { useState, useRef, useEffect, useCallback } from "react";
import styles from "./Dropdown.module.css";

// Dropdown option interface
export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

// Dropdown positions
export type DropdownPosition =
  | "bottom-left"
  | "bottom-right"
  | "top-left"
  | "top-right";

// Dropdown sizes
export type DropdownSize = "sm" | "md" | "lg";

// Dropdown variants
export type DropdownVariant = "default" | "filled" | "outline";

// Base dropdown props
export interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onSelect: (value: string, option: DropdownOption) => void;
  size?: DropdownSize;
  variant?: DropdownVariant;
  position?: DropdownPosition;
  isDisabled?: boolean;
  isFullWidth?: boolean;
  isSearchable?: boolean;
  isClearable?: boolean;
  maxHeight?: number;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  label?: string;
  errorMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// Single select dropdown
export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  defaultValue,
  placeholder = "Select an option",
  onSelect,
  size = "md",
  variant = "default",
  position = "bottom-left",
  isDisabled = false,
  isFullWidth = false,
  isSearchable = false,
  isClearable = false,
  maxHeight = 200,
  className = "",
  triggerClassName = "",
  menuClassName = "",
  label,
  errorMessage,
  leftIcon,
  rightIcon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(
    value || defaultValue || ""
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Update selected value when prop changes
  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  // Filter options based on search term
  const filteredOptions = isSearchable
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Get selected option
  const selectedOption =
    options.find((option) => option.value === selectedValue) || null;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isOpen) {
        if (
          event.key === "Enter" ||
          event.key === " " ||
          event.key === "ArrowDown"
        ) {
          event.preventDefault();
          setIsOpen(true);
          setHighlightedIndex(0);
        }
        return;
      }

      switch (event.key) {
        case "Escape":
          event.preventDefault();
          setIsOpen(false);
          setSearchTerm("");
          setHighlightedIndex(-1);
          break;

        case "ArrowDown":
          event.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          break;

        case "ArrowUp":
          event.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          break;

        case "Enter":
          event.preventDefault();
          if (
            highlightedIndex >= 0 &&
            highlightedIndex < filteredOptions.length
          ) {
            handleSelectOption(filteredOptions[highlightedIndex]);
          }
          break;

        case "Tab":
          setIsOpen(false);
          setSearchTerm("");
          setHighlightedIndex(-1);
          break;
      }
    },
    [isOpen, filteredOptions, highlightedIndex]
  );

  // Handle option selection
  const handleSelectOption = (option: DropdownOption) => {
    if (option.disabled) return;

    setSelectedValue(option.value);
    setIsOpen(false);
    setSearchTerm("");
    setHighlightedIndex(-1);
    onSelect(option.value, option);
  };

  // Handle clear selection
  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedValue("");
    onSelect("", { value: "", label: "" });
  };

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && isSearchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, isSearchable]);

  // Container classes
  const containerClasses = [
    styles.container,
    isFullWidth && styles["container--fullWidth"],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Trigger classes
  const triggerClasses = [
    styles.trigger,
    styles[`trigger--${variant}`],
    styles[`trigger--${size}`],
    isOpen && styles["trigger--open"],
    isDisabled && styles["trigger--disabled"],
    isFullWidth && styles["trigger--fullWidth"],
    triggerClassName,
  ]
    .filter(Boolean)
    .join(" ");

  // Menu classes
  const menuClasses = [styles.menu, styles[`menu--${position}`], menuClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses} ref={dropdownRef}>
      {/* Label */}
      {label && <label className={styles.label}>{label}</label>}

      {/* Trigger */}
      <div className={styles.triggerWrapper} onKeyDown={handleKeyDown}>
        <button
          type="button"
          className={triggerClasses}
          onClick={() => !isDisabled && setIsOpen(!isOpen)}
          disabled={isDisabled}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}

          <div className={styles.triggerContent}>
            {selectedOption ? (
              <div className={styles.selectedContent}>
                {selectedOption.icon && (
                  <span className={styles.selectedIcon}>
                    {selectedOption.icon}
                  </span>
                )}
                <span className={styles.selectedText}>
                  {selectedOption.label}
                </span>
              </div>
            ) : (
              <span className={styles.placeholder}>{placeholder}</span>
            )}
          </div>

          {rightIcon ? (
            <span className={styles.rightIcon}>{rightIcon}</span>
          ) : (
            <svg
              className={`${styles.chevron} ${
                isOpen ? styles["chevron--up"] : ""
              }`}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6,9 12,15 18,9" />
            </svg>
          )}
        </button>

        {/* Clear button */}
        {isClearable && selectedValue && !isDisabled && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClear}
            aria-label="Clear selection"
          >
            <svg
              width="14"
              height="14"
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

      {/* Dropdown menu */}
      {isOpen && (
        <div className={menuClasses} ref={menuRef} style={{ maxHeight }}>
          {/* Search input */}
          {isSearchable && (
            <div className={styles.searchWrapper}>
              <input
                ref={searchInputRef}
                type="text"
                className={styles.searchInput}
                placeholder="Search options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          )}

          {/* Options */}
          <div className={styles.optionsWrapper}>
            {filteredOptions.length === 0 ? (
              <div className={styles.noOptions}>
                {isSearchable ? "No options found" : "No options available"}
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  className={`${styles.option} ${
                    option.value === selectedValue
                      ? styles["option--selected"]
                      : ""
                  } ${
                    index === highlightedIndex
                      ? styles["option--highlighted"]
                      : ""
                  } ${option.disabled ? styles["option--disabled"] : ""}`}
                  onClick={() => handleSelectOption(option)}
                  disabled={option.disabled}
                  role="option"
                  aria-selected={option.value === selectedValue}
                >
                  {option.icon && (
                    <span className={styles.optionIcon}>{option.icon}</span>
                  )}
                  <div className={styles.optionContent}>
                    <span className={styles.optionLabel}>{option.label}</span>
                    {option.description && (
                      <span className={styles.optionDescription}>
                        {option.description}
                      </span>
                    )}
                  </div>
                  {option.value === selectedValue && (
                    <svg
                      className={styles.checkIcon}
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className={styles.errorMessage}>{errorMessage}</div>
      )}
    </div>
  );
};

// Multi-select dropdown (simplified version)
export interface MultiSelectDropdownProps
  extends Omit<DropdownProps, "value" | "defaultValue" | "onSelect"> {
  value?: string[];
  defaultValue?: string[];
  onSelect: (values: string[], options: DropdownOption[]) => void;
  maxSelectedDisplay?: number;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  value = [],
  defaultValue = [],
  placeholder = "Select options",
  onSelect,
  maxSelectedDisplay = 2,
  ...props
}) => {
  const [selectedValues, setSelectedValues] = useState<string[]>(
    value.length > 0 ? value : defaultValue
  );

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValues(value);
    }
  }, [value]);

  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.value)
  );

  const handleSelect = (optionValue: string, option: DropdownOption) => {
    if (option.disabled) return;

    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter((v) => v !== optionValue)
      : [...selectedValues, optionValue];

    setSelectedValues(newValues);
    const newOptions = options.filter((opt) => newValues.includes(opt.value));
    onSelect(newValues, newOptions);
  };

  // Create a single-select dropdown that manages multiple selections internally
  return (
    <Dropdown
      {...props}
      options={options}
      value=""
      placeholder={
        selectedOptions.length === 0
          ? placeholder
          : selectedOptions.length <= maxSelectedDisplay
          ? selectedOptions.map((o) => o.label).join(", ")
          : `${selectedOptions.length} items selected`
      }
      onSelect={handleSelect}
    />
  );
};

// Display names
Dropdown.displayName = "Dropdown";
MultiSelectDropdown.displayName = "MultiSelectDropdown";
