import React, { forwardRef } from "react";
import styles from "./Card.module.css";

// Card variants
export type CardVariant = "default" | "outlined" | "elevated" | "flat";

// Card sizes
export type CardSize = "sm" | "md" | "lg";

// Card padding options
export type CardPadding = "none" | "sm" | "md" | "lg";

// Base card props
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  size?: CardSize;
  padding?: CardPadding;
  isHoverable?: boolean;
  isClickable?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  asChild?: boolean;
  children: React.ReactNode;
}

// Card Header component
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  actions?: React.ReactNode;
  divider?: boolean;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  actions,
  divider = false,
  className = "",
  ...props
}) => {
  const headerClasses = [
    styles.header,
    divider && styles["header--divider"],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={headerClasses} {...props}>
      <div className={styles.headerContent}>{children}</div>
      {actions && <div className={styles.headerActions}>{actions}</div>}
    </div>
  );
};

// Card Body component
export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: CardPadding;
}

export const CardBody: React.FC<CardBodyProps> = ({
  children,
  padding,
  className = "",
  ...props
}) => {
  const bodyClasses = [
    styles.body,
    padding && styles[`body--padding-${padding}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={bodyClasses} {...props}>
      {children}
    </div>
  );
};

// Card Footer component
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  divider?: boolean;
  justify?: "start" | "center" | "end" | "between";
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  divider = false,
  justify = "end",
  className = "",
  ...props
}) => {
  const footerClasses = [
    styles.footer,
    styles[`footer--${justify}`],
    divider && styles["footer--divider"],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={footerClasses} {...props}>
      {children}
    </div>
  );
};

// Card Image component
export interface CardImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  aspectRatio?: "square" | "video" | "wide" | "auto";
  objectFit?: "cover" | "contain" | "fill";
  position?: "top" | "bottom";
}

export const CardImage: React.FC<CardImageProps> = ({
  src,
  alt,
  aspectRatio = "auto",
  objectFit = "cover",
  position = "top",
  className = "",
  ...props
}) => {
  const imageClasses = [
    styles.image,
    styles[`image--${aspectRatio}`],
    styles[`image--${objectFit}`],
    styles[`image--${position}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`${styles.imageWrapper} ${
        styles[`imageWrapper--${position}`]
      }`}
    >
      <img src={src} alt={alt} className={imageClasses} {...props} />
    </div>
  );
};

// Card Divider component
export const CardDivider: React.FC<{ className?: string }> = ({
  className = "",
}) => <hr className={`${styles.divider} ${className}`} />;

// Main Card component
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      size = "md",
      padding = "md",
      isHoverable = false,
      isClickable = false,
      isSelected = false,
      isDisabled = false,
      asChild = false,
      children,
      className = "",
      onClick,
      onKeyDown,
      tabIndex,
      role,
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    // Determine if card should be interactive
    const interactive = isClickable || Boolean(onClick);

    // Build CSS classes
    const cardClasses = [
      styles.card,
      styles[`card--${variant}`],
      styles[`card--${size}`],
      padding !== "none" && styles[`card--padding-${padding}`],
      isHoverable && styles["card--hoverable"],
      interactive && styles["card--clickable"],
      isSelected && styles["card--selected"],
      isDisabled && styles["card--disabled"],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    // Handle keyboard navigation for clickable cards
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (interactive && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        onClick?.(event as any);
      }
      onKeyDown?.(event);
    };

    // Determine accessibility props
    const accessibilityProps = {
      role: role || (interactive ? "button" : undefined),
      tabIndex: interactive ? tabIndex ?? 0 : tabIndex,
      "aria-label": ariaLabel,
      "aria-disabled": isDisabled || undefined,
      "aria-pressed": isSelected || undefined,
    };

    if (asChild && React.isValidElement(children)) {
      // Render as child element with card styles
      return React.cloneElement(children, {
        ref,
        className: `${cardClasses} ${children.props.className || ""}`,
        onClick: !isDisabled ? onClick : undefined,
        onKeyDown: handleKeyDown,
        ...accessibilityProps,
        ...props,
      });
    }

    return (
      <div
        ref={ref}
        className={cardClasses}
        onClick={!isDisabled ? onClick : undefined}
        onKeyDown={handleKeyDown}
        {...accessibilityProps}
        {...props}
      >
        {children}
      </div>
    );
  }
);

// Task Card component (specialized for todo app)
export interface TaskCardProps extends Omit<CardProps, "children"> {
  task: {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    priority?: "low" | "medium" | "high";
    dueDate?: Date;
    tags?: string[];
  };
  showPriority?: boolean;
  showDueDate?: boolean;
  showTags?: boolean;
  onToggleComplete?: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  children?: React.ReactNode;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  showPriority = true,
  showDueDate = true,
  showTags = true,
  onToggleComplete,
  onEdit,
  onDelete,
  children,
  ...cardProps
}) => {
  const isOverdue =
    task.dueDate && task.dueDate < new Date() && !task.completed;

  return (
    <Card
      variant="outlined"
      isHoverable
      isSelected={task.completed}
      className={`${styles.taskCard} ${
        task.completed ? styles["taskCard--completed"] : ""
      } ${isOverdue ? styles["taskCard--overdue"] : ""}`}
      {...cardProps}
    >
      <CardBody padding="md">
        <div className={styles.taskContent}>
          {/* Task title and completion */}
          <div className={styles.taskHeader}>
            {onToggleComplete && (
              <button
                type="button"
                className={styles.taskCheckbox}
                onClick={() => onToggleComplete(task.id)}
                aria-label={
                  task.completed ? "Mark as incomplete" : "Mark as complete"
                }
              >
                <svg
                  className={`${styles.checkIcon} ${
                    task.completed ? styles["checkIcon--checked"] : ""
                  }`}
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  {task.completed && (
                    <path
                      fillRule="evenodd"
                      d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
                      clipRule="evenodd"
                    />
                  )}
                </svg>
              </button>
            )}

            <div className={styles.taskTitle}>
              <h3
                className={task.completed ? styles["taskTitle--completed"] : ""}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className={styles.taskDescription}>{task.description}</p>
              )}
            </div>

            {/* Priority indicator */}
            {showPriority && task.priority && (
              <div className={styles.taskPriority}>
                <span
                  className={`${styles.priorityDot} ${
                    styles[`priorityDot--${task.priority}`]
                  }`}
                />
              </div>
            )}
          </div>

          {/* Task metadata */}
          <div className={styles.taskMeta}>
            {/* Due date */}
            {showDueDate && task.dueDate && (
              <div
                className={`${styles.taskDueDate} ${
                  isOverdue ? styles["taskDueDate--overdue"] : ""
                }`}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>{task.dueDate.toLocaleDateString()}</span>
              </div>
            )}

            {/* Tags */}
            {showTags && task.tags && task.tags.length > 0 && (
              <div className={styles.taskTags}>
                {task.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className={styles.taskTag}>
                    {tag}
                  </span>
                ))}
                {task.tags.length > 3 && (
                  <span className={styles.taskTagMore}>
                    +{task.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          {(onEdit || onDelete) && (
            <div className={styles.taskActions}>
              {onEdit && (
                <button
                  type="button"
                  className={styles.taskAction}
                  onClick={() => onEdit(task.id)}
                  aria-label="Edit task"
                >
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
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  className={`${styles.taskAction} ${styles["taskAction--danger"]}`}
                  onClick={() => onDelete(task.id)}
                  aria-label="Delete task"
                >
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
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Custom children content */}
          {children}
        </div>
      </CardBody>
    </Card>
  );
};

// Display names
Card.displayName = "Card";
CardHeader.displayName = "CardHeader";
CardBody.displayName = "CardBody";
CardFooter.displayName = "CardFooter";
CardImage.displayName = "CardImage";
CardDivider.displayName = "CardDivider";
TaskCard.displayName = "TaskCard";
