import React, { forwardRef } from "react";
import styles from "./IconButton.module.css";

// IconButton variants
export type IconButtonVariant =
  | "default"
  | "primary"
  | "secondary"
  | "danger"
  | "success"
  | "warning"
  | "ghost"
  | "outline";

// IconButton sizes
export type IconButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

// IconButton shapes
export type IconButtonShape = "square" | "rounded" | "circle";

// IconButton props
export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon: React.ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  shape?: IconButtonShape;
  isLoading?: boolean;
  isActive?: boolean;
  tooltip?: string;
  "aria-label": string; // Required for accessibility
}

// Loading spinner component
const LoadingSpinner: React.FC<{ size: IconButtonSize }> = ({ size }) => {
  const spinnerSizes = {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.25rem",
    xl: "1.5rem",
  };

  return (
    <svg
      className={styles.spinner}
      width={spinnerSizes[size]}
      height={spinnerSizes[size]}
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
};

// Main IconButton component
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      variant = "default",
      size = "md",
      shape = "rounded",
      isLoading = false,
      isActive = false,
      tooltip,
      disabled,
      className = "",
      type = "button",
      "aria-label": ariaLabel,
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [showTooltip, setShowTooltip] = React.useState(false);

    // Combine CSS classes
    const buttonClasses = [
      styles.iconButton,
      styles[`iconButton--${variant}`],
      styles[`iconButton--${size}`],
      styles[`iconButton--${shape}`],
      isActive && styles["iconButton--active"],
      isLoading && styles["iconButton--loading"],
      disabled && styles["iconButton--disabled"],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    // Button is disabled when loading or explicitly disabled
    const isDisabled = disabled || isLoading;

    // Handle tooltip visibility
    const handleMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (tooltip && !isDisabled) {
        setShowTooltip(true);
      }
      onMouseEnter?.(event);
    };

    const handleMouseLeave = (event: React.MouseEvent<HTMLButtonElement>) => {
      setShowTooltip(false);
      onMouseLeave?.(event);
    };

    const handleFocus = (event: React.FocusEvent<HTMLButtonElement>) => {
      if (tooltip && !isDisabled) {
        setShowTooltip(true);
      }
      onFocus?.(event);
    };

    const handleBlur = (event: React.FocusEvent<HTMLButtonElement>) => {
      setShowTooltip(false);
      onBlur?.(event);
    };

    return (
      <div className={styles.container}>
        <button
          ref={ref}
          type={type}
          className={buttonClasses}
          disabled={isDisabled}
          aria-label={ariaLabel}
          aria-pressed={isActive}
          aria-disabled={isDisabled}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        >
          {/* Icon or loading spinner */}
          <span className={styles.iconWrapper}>
            {isLoading ? (
              <LoadingSpinner size={size} />
            ) : (
              <span className={styles.icon}>{icon}</span>
            )}
          </span>
        </button>

        {/* Tooltip */}
        {tooltip && showTooltip && (
          <div className={styles.tooltip} role="tooltip">
            {tooltip}
            <div className={styles.tooltipArrow} />
          </div>
        )}
      </div>
    );
  }
);

// Specialized IconButton variants for common actions

// Edit IconButton
export interface EditIconButtonProps
  extends Omit<IconButtonProps, "icon" | "aria-label"> {
  "aria-label"?: string;
}

export const EditIconButton: React.FC<EditIconButtonProps> = ({
  "aria-label": ariaLabel = "Edit",
  variant = "ghost",
  ...props
}) => (
  <IconButton
    icon={
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    }
    aria-label={ariaLabel}
    variant={variant}
    {...props}
  />
);

// Delete IconButton
export interface DeleteIconButtonProps
  extends Omit<IconButtonProps, "icon" | "aria-label"> {
  "aria-label"?: string;
}

export const DeleteIconButton: React.FC<DeleteIconButtonProps> = ({
  "aria-label": ariaLabel = "Delete",
  variant = "ghost",
  ...props
}) => (
  <IconButton
    icon={
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="3,6 5,6 21,6" />
        <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
    }
    aria-label={ariaLabel}
    variant={variant}
    {...props}
  />
);

// More IconButton
export interface MoreIconButtonProps
  extends Omit<IconButtonProps, "icon" | "aria-label"> {
  "aria-label"?: string;
  direction?: "horizontal" | "vertical";
}

export const MoreIconButton: React.FC<MoreIconButtonProps> = ({
  "aria-label": ariaLabel = "More options",
  direction = "horizontal",
  variant = "ghost",
  ...props
}) => (
  <IconButton
    icon={
      direction === "horizontal" ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="12" r="1" />
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      )
    }
    aria-label={ariaLabel}
    variant={variant}
    {...props}
  />
);

// Close IconButton
export interface CloseIconButtonProps
  extends Omit<IconButtonProps, "icon" | "aria-label"> {
  "aria-label"?: string;
}

export const CloseIconButton: React.FC<CloseIconButtonProps> = ({
  "aria-label": ariaLabel = "Close",
  variant = "ghost",
  ...props
}) => (
  <IconButton
    icon={
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    }
    aria-label={ariaLabel}
    variant={variant}
    {...props}
  />
);

// Add IconButton
export interface AddIconButtonProps
  extends Omit<IconButtonProps, "icon" | "aria-label"> {
  "aria-label"?: string;
}

export const AddIconButton: React.FC<AddIconButtonProps> = ({
  "aria-label": ariaLabel = "Add",
  variant = "primary",
  ...props
}) => (
  <IconButton
    icon={
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    }
    aria-label={ariaLabel}
    variant={variant}
    {...props}
  />
);

// Chevron IconButton (for navigation)
export interface ChevronIconButtonProps
  extends Omit<IconButtonProps, "icon" | "aria-label"> {
  direction: "up" | "down" | "left" | "right";
  "aria-label"?: string;
}

export const ChevronIconButton: React.FC<ChevronIconButtonProps> = ({
  direction,
  "aria-label": ariaLabel = `Navigate ${direction}`,
  variant = "ghost",
  ...props
}) => {
  const getChevronPath = () => {
    switch (direction) {
      case "up":
        return "M18 15l-6-6-6 6";
      case "down":
        return "M6 9l6 6 6-6";
      case "left":
        return "M15 18l-6-6 6-6";
      case "right":
        return "M9 18l6-6-6-6";
    }
  };

  return (
    <IconButton
      icon={
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points={getChevronPath()} />
        </svg>
      }
      aria-label={ariaLabel}
      variant={variant}
      {...props}
    />
  );
};

// Favorite/Star IconButton
export interface FavoriteIconButtonProps
  extends Omit<IconButtonProps, "icon" | "aria-label"> {
  isFavorited?: boolean;
  "aria-label"?: string;
}

export const FavoriteIconButton: React.FC<FavoriteIconButtonProps> = ({
  isFavorited = false,
  "aria-label": ariaLabel = isFavorited
    ? "Remove from favorites"
    : "Add to favorites",
  variant = "ghost",
  isActive,
  ...props
}) => (
  <IconButton
    icon={
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={isFavorited ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
      >
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    }
    aria-label={ariaLabel}
    variant={variant}
    isActive={isActive ?? isFavorited}
    {...props}
  />
);

// Copy IconButton
export interface CopyIconButtonProps
  extends Omit<IconButtonProps, "icon" | "aria-label"> {
  "aria-label"?: string;
}

export const CopyIconButton: React.FC<CopyIconButtonProps> = ({
  "aria-label": ariaLabel = "Copy",
  variant = "ghost",
  ...props
}) => (
  <IconButton
    icon={
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    }
    aria-label={ariaLabel}
    variant={variant}
    {...props}
  />
);

// Display names
IconButton.displayName = "IconButton";
EditIconButton.displayName = "EditIconButton";
DeleteIconButton.displayName = "DeleteIconButton";
MoreIconButton.displayName = "MoreIconButton";
CloseIconButton.displayName = "CloseIconButton";
AddIconButton.displayName = "AddIconButton";
ChevronIconButton.displayName = "ChevronIconButton";
FavoriteIconButton.displayName = "FavoriteIconButton";
CopyIconButton.displayName = "CopyIconButton";
