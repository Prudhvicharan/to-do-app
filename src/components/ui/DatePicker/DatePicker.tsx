import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  format,
  isValid,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  isAfter,
} from "date-fns";
import styles from "./DatePicker.module.css";

// DatePicker sizes
export type DatePickerSize = "sm" | "md" | "lg";

// DatePicker variants
export type DatePickerVariant = "default" | "filled" | "outline";

// DatePicker props
export interface DatePickerProps {
  value?: Date | string | null;
  defaultValue?: Date | string | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  dateFormat?: string;
  size?: DatePickerSize;
  variant?: DatePickerVariant;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isFullWidth?: boolean;
  minDate?: Date | string;
  maxDate?: Date | string;
  highlightToday?: boolean;
  showWeekNumbers?: boolean;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, etc.
  className?: string;
  inputClassName?: string;
  calendarClassName?: string;
  disabledDates?: Date[] | ((date: Date) => boolean);
  onFocus?: () => void;
  onBlur?: () => void;
}

// Helper function to parse date
const parseDate = (date: Date | string | null): Date | null => {
  if (!date) return null;
  if (date instanceof Date) return isValid(date) ? date : null;
  if (typeof date === "string") {
    const parsed = parseISO(date);
    return isValid(parsed) ? parsed : null;
  }
  return null;
};

// Helper function to check if date is disabled
const isDateDisabled = (
  date: Date,
  minDate?: Date | string,
  maxDate?: Date | string,
  disabledDates?: Date[] | ((date: Date) => boolean)
): boolean => {
  const min = parseDate(minDate);
  const max = parseDate(maxDate);

  if (min && isBefore(date, min)) return true;
  if (max && isAfter(date, max)) return true;

  if (disabledDates) {
    if (Array.isArray(disabledDates)) {
      return disabledDates.some((disabledDate) => {
        const parsed = parseDate(disabledDate);
        return parsed && isSameDay(date, parsed);
      });
    } else if (typeof disabledDates === "function") {
      return disabledDates(date);
    }
  }

  return false;
};

// Calendar component
const Calendar: React.FC<{
  selectedDate: Date | null;
  currentMonth: Date;
  onDateSelect: (date: Date) => void;
  onMonthChange: (date: Date) => void;
  minDate?: Date | string;
  maxDate?: Date | string;
  disabledDates?: Date[] | ((date: Date) => boolean);
  highlightToday?: boolean;
  showWeekNumbers?: boolean;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}> = ({
  selectedDate,
  currentMonth,
  onDateSelect,
  onMonthChange,
  minDate,
  maxDate,
  disabledDates,
  highlightToday = true,
  showWeekNumbers = false,
  weekStartsOn = 1,
  className = "",
}) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn });
  const endDate = endOfWeek(monthEnd, { weekStartsOn });

  const dateFormat = "yyyy-MM-dd";
  const rows = [];
  let days = [];
  let day = startDate;

  // Generate calendar grid
  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = new Date(day);
      const isDisabled = isDateDisabled(
        cloneDay,
        minDate,
        maxDate,
        disabledDates
      );
      const isSelected = selectedDate && isSameDay(day, selectedDate);
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isTodayDate = isToday(day);

      days.push(
        <button
          key={format(day, dateFormat)}
          type="button"
          className={`${styles.calendarDay} ${
            !isCurrentMonth ? styles["calendarDay--outside"] : ""
          } ${isSelected ? styles["calendarDay--selected"] : ""} ${
            isTodayDate && highlightToday ? styles["calendarDay--today"] : ""
          } ${isDisabled ? styles["calendarDay--disabled"] : ""}`}
          onClick={() => !isDisabled && onDateSelect(cloneDay)}
          disabled={isDisabled}
          aria-label={format(cloneDay, "EEEE, MMMM do, yyyy")}
        >
          {format(day, "d")}
        </button>
      );
      day = addDays(day, 1);
    }

    // Add week number if enabled
    if (showWeekNumbers) {
      const weekNumber = Math.ceil(
        (new Date(days[0].key as string).getTime() -
          new Date(new Date().getFullYear(), 0, 1).getTime()) /
          (24 * 60 * 60 * 1000 * 7)
      );
      rows.push(
        <div key={days[0].key} className={styles.calendarWeek}>
          <div className={styles.weekNumber}>{weekNumber}</div>
          {days}
        </div>
      );
    } else {
      rows.push(
        <div key={days[0].key} className={styles.calendarWeek}>
          {days}
        </div>
      );
    }
    days = [];
  }

  // Week day names
  const weekDays = [];
  const weekStart = startOfWeek(new Date(), { weekStartsOn });
  for (let i = 0; i < 7; i++) {
    weekDays.push(
      <div key={i} className={styles.weekDay}>
        {format(addDays(weekStart, i), "EEEEEE")}
      </div>
    );
  }

  return (
    <div className={`${styles.calendar} ${className}`}>
      {/* Calendar header */}
      <div className={styles.calendarHeader}>
        <button
          type="button"
          className={styles.navButton}
          onClick={() => onMonthChange(subMonths(currentMonth, 1))}
          aria-label="Previous month"
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
            <polyline points="15,18 9,12 15,6" />
          </svg>
        </button>

        <h2 className={styles.monthYear}>
          {format(currentMonth, "MMMM yyyy")}
        </h2>

        <button
          type="button"
          className={styles.navButton}
          onClick={() => onMonthChange(addMonths(currentMonth, 1))}
          aria-label="Next month"
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
            <polyline points="9,18 15,12 9,6" />
          </svg>
        </button>
      </div>

      {/* Week days header */}
      <div className={styles.weekDaysHeader}>
        {showWeekNumbers && <div className={styles.weekNumberHeader}>Wk</div>}
        {weekDays}
      </div>

      {/* Calendar grid */}
      <div className={styles.calendarGrid}>{rows}</div>
    </div>
  );
};

// Main DatePicker component
export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  defaultValue,
  onChange,
  placeholder = "Select date",
  dateFormat = "MMM dd, yyyy",
  size = "md",
  variant = "default",
  label,
  helperText,
  errorMessage,
  isRequired = false,
  isDisabled = false,
  isReadOnly = false,
  isFullWidth = false,
  minDate,
  maxDate,
  highlightToday = true,
  showWeekNumbers = false,
  weekStartsOn = 1,
  className = "",
  inputClassName = "",
  calendarClassName = "",
  disabledDates,
  onFocus,
  onBlur,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(() =>
    parseDate(value !== undefined ? value : defaultValue)
  );
  const [currentMonth, setCurrentMonth] = useState(
    () => selectedDate || new Date()
  );
  const [inputValue, setInputValue] = useState(() =>
    selectedDate ? format(selectedDate, dateFormat) : ""
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Update selected date when value prop changes
  useEffect(() => {
    if (value !== undefined) {
      const parsed = parseDate(value);
      setSelectedDate(parsed);
      setInputValue(parsed ? format(parsed, dateFormat) : "");
      if (parsed) {
        setCurrentMonth(parsed);
      }
    }
  }, [value, dateFormat]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.focus();
      } else if (event.key === "Enter" && !isOpen) {
        setIsOpen(true);
      }
    },
    [isOpen]
  );

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setInputValue(format(date, dateFormat));
    setIsOpen(false);
    onChange?.(date);
  };

  // Handle input change (manual typing)
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = event.target.value;
    setInputValue(inputVal);

    // Try to parse the input value
    try {
      const parsed = new Date(inputVal);
      if (
        isValid(parsed) &&
        !isDateDisabled(parsed, minDate, maxDate, disabledDates)
      ) {
        setSelectedDate(parsed);
        setCurrentMonth(parsed);
        onChange?.(parsed);
      }
    } catch (error) {
      // Invalid input, don't update selected date
    }
  };

  // Handle input blur
  const handleInputBlur = () => {
    // Reset input value to formatted selected date if invalid
    if (selectedDate) {
      setInputValue(format(selectedDate, dateFormat));
    } else {
      setInputValue("");
    }
    onBlur?.();
  };

  // Handle clear date
  const handleClear = () => {
    setSelectedDate(null);
    setInputValue("");
    onChange?.(null);
  };

  // Container classes
  const containerClasses = [
    styles.container,
    isFullWidth && styles["container--fullWidth"],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Input wrapper classes
  const inputWrapperClasses = [
    styles.inputWrapper,
    styles[`inputWrapper--${variant}`],
    styles[`inputWrapper--${size}`],
    isOpen && styles["inputWrapper--open"],
    errorMessage && styles["inputWrapper--error"],
    isDisabled && styles["inputWrapper--disabled"],
    isReadOnly && styles["inputWrapper--readonly"],
    inputClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const inputId = `datepicker-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={containerClasses} ref={containerRef}>
      {/* Label */}
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {isRequired && <span className={styles.required}>*</span>}
        </label>
      )}

      {/* Input wrapper */}
      <div className={inputWrapperClasses}>
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          className={styles.input}
          value={inputValue}
          placeholder={placeholder}
          disabled={isDisabled}
          readOnly={isReadOnly}
          required={isRequired}
          onChange={handleInputChange}
          onFocus={() => {
            if (!isReadOnly) {
              setIsOpen(true);
            }
            onFocus?.();
          }}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label={label || "Select date"}
        />

        {/* Calendar icon */}
        <button
          type="button"
          className={styles.calendarIcon}
          onClick={() => !isDisabled && !isReadOnly && setIsOpen(!isOpen)}
          disabled={isDisabled}
          aria-label="Open calendar"
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
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </button>

        {/* Clear button */}
        {selectedDate && !isDisabled && !isReadOnly && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClear}
            aria-label="Clear date"
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

      {/* Calendar dropdown */}
      {isOpen && (
        <div className={styles.calendarDropdown} ref={calendarRef}>
          <Calendar
            selectedDate={selectedDate}
            currentMonth={currentMonth}
            onDateSelect={handleDateSelect}
            onMonthChange={setCurrentMonth}
            minDate={minDate}
            maxDate={maxDate}
            disabledDates={disabledDates}
            highlightToday={highlightToday}
            showWeekNumbers={showWeekNumbers}
            weekStartsOn={weekStartsOn}
            className={calendarClassName}
          />
        </div>
      )}

      {/* Helper text or error message */}
      {(helperText || errorMessage) && (
        <div
          className={`${styles.helperText} ${
            errorMessage ? styles["helperText--error"] : ""
          }`}
        >
          {errorMessage || helperText}
        </div>
      )}
    </div>
  );
};

// Display name
DatePicker.displayName = "DatePicker";
