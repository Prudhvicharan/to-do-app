import React from "react";
import styles from "./Badge.module.css";

// Badge variants
export type BadgeVariant =
  | "default"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "outline";

// Badge sizes
export type BadgeSize = "xs" | "sm" | "md" | "lg";

// Badge colors (for custom color schemes)
export type BadgeColor =
  | "gray"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "indigo"
  | "purple"
  | "pink";

// Badge props
export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: BadgeSize;
  isRounded?: boolean;
  isDot?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRemove?: () => void;
  className?: string;
  onClick?: () => void;
  "aria-label"?: string;
}

// Dot Badge component (for notifications, status indicators)
export const DotBadge: React.FC<{
  color?: BadgeColor;
  size?: "sm" | "md" | "lg";
  className?: string;
  "aria-label"?: string;
}> = ({
  color = "gray",
  size = "md",
  className = "",
  "aria-label": ariaLabel,
}) => {
  const dotClasses = [
    styles.dot,
    styles[`dot--${color}`],
    styles[`dot--${size}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <span className={dotClasses} aria-label={ariaLabel} role="status" />;
};

// Main Badge component
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  color,
  size = "sm",
  isRounded = false,
  isDot = false,
  leftIcon,
  rightIcon,
  onRemove,
  className = "",
  onClick,
  "aria-label": ariaLabel,
}) => {
  // If it's a dot badge, render the dot component
  if (isDot) {
    return (
      <DotBadge
        color={color || "gray"}
        size={
          size === "xs" || size === "sm" ? "sm" : size === "md" ? "md" : "lg"
        }
        className={className}
        aria-label={ariaLabel}
      />
    );
  }

  // Determine the element type
  const Element = onClick ? "button" : "span";

  // Build CSS classes
  const badgeClasses = [
    styles.badge,
    styles[`badge--${variant}`],
    styles[`badge--${size}`],
    color && styles[`badge--${color}`],
    isRounded && styles["badge--rounded"],
    onClick && styles["badge--clickable"],
    onRemove && styles["badge--removable"],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Element
      className={badgeClasses}
      onClick={onClick}
      aria-label={ariaLabel}
      role={onClick ? "button" : undefined}
      type={onClick && Element === "button" ? "button" : undefined}
    >
      {/* Left icon */}
      {leftIcon && <span className={styles.icon}>{leftIcon}</span>}

      {/* Badge content */}
      <span className={styles.content}>{children}</span>

      {/* Right icon */}
      {rightIcon && <span className={styles.icon}>{rightIcon}</span>}

      {/* Remove button */}
      {onRemove && (
        <button
          type="button"
          className={styles.removeButton}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Remove"
        >
          <svg
            width="12"
            height="12"
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
    </Element>
  );
};

// Priority Badge component (specialized for todo app)
export interface PriorityBadgeProps {
  priority: "low" | "medium" | "high";
  size?: BadgeSize;
  showIcon?: boolean;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = "sm",
  showIcon = true,
  className = "",
}) => {
  const priorityConfig = {
    low: {
      variant: "secondary" as BadgeVariant,
      color: "gray" as BadgeColor,
      label: "Low",
      icon: (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6,9 12,15 18,9" />
        </svg>
      ),
    },
    medium: {
      variant: "warning" as BadgeVariant,
      color: "yellow" as BadgeColor,
      label: "Medium",
      icon: (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
    },
    high: {
      variant: "danger" as BadgeVariant,
      color: "red" as BadgeColor,
      label: "High",
      icon: (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="18,15 12,9 6,15" />
        </svg>
      ),
    },
  };

  const config = priorityConfig[priority];

  return (
    <Badge
      variant={config.variant}
      color={config.color}
      size={size}
      leftIcon={showIcon ? config.icon : undefined}
      className={className}
      aria-label={`${config.label} priority`}
    >
      {config.label}
    </Badge>
  );
};

// Status Badge component (specialized for todo app)
export interface StatusBadgeProps {
  status: "todo" | "in_progress" | "completed";
  size?: BadgeSize;
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "sm",
  showIcon = true,
  className = "",
}) => {
  const statusConfig = {
    todo: {
      variant: "secondary" as BadgeVariant,
      color: "gray" as BadgeColor,
      label: "To Do",
      icon: (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
    },
    in_progress: {
      variant: "info" as BadgeVariant,
      color: "blue" as BadgeColor,
      label: "In Progress",
      icon: (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12,6 12,12 16,14" />
        </svg>
      ),
    },
    completed: {
      variant: "success" as BadgeVariant,
      color: "green" as BadgeColor,
      label: "Completed",
      icon: (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22,4 12,14.01 9,11.01" />
        </svg>
      ),
    },
  };

  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      color={config.color}
      size={size}
      leftIcon={showIcon ? config.icon : undefined}
      className={className}
      aria-label={`Status: ${config.label}`}
    >
      {config.label}
    </Badge>
  );
};

// Tag Badge component (for task tags)
export interface TagBadgeProps {
  tag: string;
  color?: BadgeColor;
  size?: BadgeSize;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
}

export const TagBadge: React.FC<TagBadgeProps> = ({
  tag,
  color = "blue",
  size = "sm",
  onRemove,
  onClick,
  className = "",
}) => {
  return (
    <Badge
      variant="outline"
      color={color}
      size={size}
      onRemove={onRemove}
      onClick={onClick}
      className={className}
      leftIcon={
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      }
      aria-label={`Tag: ${tag}`}
    >
      {tag}
    </Badge>
  );
};

// Count Badge component (for notifications, counts)
export interface CountBadgeProps {
  count: number;
  max?: number;
  size?: BadgeSize;
  color?: BadgeColor;
  showZero?: boolean;
  className?: string;
}

export const CountBadge: React.FC<CountBadgeProps> = ({
  count,
  max = 99,
  size = "sm",
  color = "red",
  showZero = false,
  className = "",
}) => {
  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <Badge
      variant="default"
      color={color}
      size={size}
      isRounded={true}
      className={className}
      aria-label={`${count} items`}
    >
      {displayCount}
    </Badge>
  );
};

// Display names
Badge.displayName = "Badge";
DotBadge.displayName = "DotBadge";
PriorityBadge.displayName = "PriorityBadge";
StatusBadge.displayName = "StatusBadge";
TagBadge.displayName = "TagBadge";
CountBadge.displayName = "CountBadge";
