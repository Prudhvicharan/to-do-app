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
  isMultiple?: boolean;
  maxHeight?: number;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  label?: string;
  errorMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// Multi-select dropdown props
export interface MultiSelectDropdownProps
  extends Omit<
    DropdownProps,
    "value" | "defaultValue" | "onSelect" | "isMultiple"
  > {
  value?: string[];
  defaultValue?: string[];
  onSelect: (values: string[], options: DropdownOption[]) => void;
  maxSelectedDisplay?: number;
}

// Dropdown trigger component
const DropdownTrigger: React.FC<{
  isOpen: boolean;
  selectedOption: DropdownOption | null;
  selectedOptions?: DropdownOption[];
  placeholder?: string;
  size: DropdownSize;
  variant: DropdownVariant;
  isDisabled?: boolean;
  isFullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  maxSelectedDisplay?: number;
  onClick: () => void;
}> = ({
  isOpen,
  selectedOption,
  selectedOptions,
  placeholder,
  size,
  variant,
  isDisabled,
  isFullWidth,
  leftIcon,
  rightIcon,
  className,
  maxSelectedDisplay = 2,
  onClick,
}) => {
  const triggerClasses = [
    styles.trigger,
    styles[`trigger--${variant}`],
    styles[`trigger--${size}`],
    isOpen && styles["trigger--open"],
    isDisabled && styles["trigger--disabled"],
    isFullWidth && styles["trigger--fullWidth"],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const renderSelectedContent = () => {
    if (selectedOptions) {
      // Multi-select mode
      if (selectedOptions.length === 0) {
        return <span className={styles.placeholder}>{placeholder}</span>;
      }

      if (selectedOptions.length <= maxSelectedDisplay) {
        return (
          <div className={styles.selectedTags}>
            {selectedOptions.map((option) => (
              <span key={option.value} className={styles.selectedTag}>
                {option.label}
              </span>
            ))}
          </div>
        );
      }

      return (
        <span className={styles.selectedText}>
          {selectedOptions.length} items selected
        </span>
      );
    }

    // Single select mode
    if (selectedOption) {
      return (
        <div className={styles.selectedContent}>
          {selectedOption.icon && (
            <span className={styles.selectedIcon}>{selectedOption.icon}</span>
          )}
          <span className={styles.selectedText}>{selectedOption.label}</span>
        </div>
      );
    }

    return <span className={styles.placeholder}>{placeholder}</span>;
  };

  return (
    <button
      type="button"
      className={triggerClasses}
      onClick={onClick}
      disabled={isDisabled}
      aria-expanded={isOpen}
      aria-haspopup="listbox"
    >
      {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}

      <div className={styles.triggerContent}>{renderSelectedContent()}</div>

      {rightIcon ? (
        <span className={styles.rightIcon}>{rightIcon}</span>
      ) : (
        <svg
          className={`${styles.chevron} ${isOpen ? styles["chevron--up"] : ""}`}
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
  );
};

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
        <DropdownTrigger
          isOpen={isOpen}
          selectedOption={selectedOption}
          placeholder={placeholder}
          size={size}
          variant={variant}
          isDisabled={isDisabled}
          isFullWidth={isFullWidth}
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          className={triggerClassName}
          onClick={() => !isDisabled && setIsOpen(!isOpen)}
        />

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

// Multi-select dropdown
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

  return (
    <Dropdown
      {...props}
      options={options}
      value=""
      placeholder={placeholder}
      onSelect={handleSelect}
      triggerContent={
        <DropdownTrigger
          isOpen={false}
          selectedOption={null}
          selectedOptions={selectedOptions}
          placeholder={placeholder}
          size={props.size || "md"}
          variant={props.variant || "default"}
          maxSelectedDisplay={maxSelectedDisplay}
          onClick={() => {}}
        />
      }
    />
  );
};

// Display names
Dropdown.displayName = "Dropdown";
MultiSelectDropdown.displayName = "MultiSelectDropdown";
