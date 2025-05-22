// src/components/layout/Sidebar/Sidebar.tsx
import React from "react";
import { IconButton, Badge, CountBadge } from "../../ui";
import styles from "./Sidebar.module.css";

// Navigation item interface
export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
  isActive?: boolean;
  onClick?: () => void;
  badge?: {
    text: string;
    variant?: "success" | "warning" | "danger" | "info";
  };
}

// Project interface for sidebar
export interface SidebarProject {
  id: string;
  name: string;
  color: string;
  taskCount: number;
  isActive?: boolean;
  onClick?: () => void;
}

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  navItems?: NavItem[];
  projects?: SidebarProject[];
  onProjectAdd?: () => void;
  showProjects?: boolean;
  className?: string;
}

const defaultNavItems: NavItem[] = [
  {
    id: "inbox",
    label: "Inbox",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
      </svg>
    ),
    count: 0,
  },
  {
    id: "today",
    label: "Today",
    icon: (
      <svg
        width="20"
        height="20"
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
    ),
    count: 0,
  },
  {
    id: "upcoming",
    label: "Upcoming",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
      </svg>
    ),
    count: 0,
  },
  {
    id: "completed",
    label: "Completed",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22,4 12,14.01 9,11.01" />
      </svg>
    ),
    count: 0,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = true,
  onClose,
  navItems = defaultNavItems,
  projects = [],
  onProjectAdd,
  showProjects = true,
  className = "",
}) => {
  const sidebarClasses = [
    styles.sidebar,
    isOpen ? styles["sidebar--open"] : styles["sidebar--closed"],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      )}

      {/* Sidebar */}
      <aside className={sidebarClasses}>
        <div className={styles.sidebarContent}>
          {/* Close button (mobile) */}
          <div className={styles.header}>
            <div className={styles.logo}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={styles.logoIcon}
              >
                <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4" />
                <path d="M9 11V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
                <line x1="9" y1="11" x2="15" y2="11" />
              </svg>
              <span className={styles.logoText}>TodoApp</span>
            </div>

            <IconButton
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              }
              variant="ghost"
              size="sm"
              aria-label="Close sidebar"
              onClick={onClose}
              className={styles.closeButton}
            />
          </div>

          {/* Navigation */}
          <nav className={styles.navigation}>
            <ul className={styles.navList}>
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`${styles.navItem} ${
                      item.isActive ? styles["navItem--active"] : ""
                    }`}
                    onClick={item.onClick}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    <span className={styles.navLabel}>{item.label}</span>
                    <div className={styles.navMeta}>
                      {item.badge && (
                        <Badge variant={item.badge.variant || "info"} size="xs">
                          {item.badge.text}
                        </Badge>
                      )}
                      {item.count !== undefined && item.count > 0 && (
                        <CountBadge count={item.count} size="xs" />
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Projects Section */}
          {showProjects && (
            <div className={styles.projectsSection}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Projects</h3>
                {onProjectAdd && (
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
                    variant="ghost"
                    size="xs"
                    aria-label="Add project"
                    onClick={onProjectAdd}
                    tooltip="Add project"
                    className={styles.addProjectButton}
                  />
                )}
              </div>

              <ul className={styles.projectsList}>
                {projects.map((project) => (
                  <li key={project.id}>
                    <button
                      type="button"
                      className={`${styles.projectItem} ${
                        project.isActive ? styles["projectItem--active"] : ""
                      }`}
                      onClick={project.onClick}
                    >
                      <span
                        className={styles.projectColor}
                        style={{ backgroundColor: project.color }}
                        aria-hidden="true"
                      />
                      <span className={styles.projectName}>{project.name}</span>
                      {project.taskCount > 0 && (
                        <CountBadge
                          count={project.taskCount}
                          size="xs"
                          className={styles.projectCount}
                        />
                      )}
                    </button>
                  </li>
                ))}
              </ul>

              {projects.length === 0 && (
                <div className={styles.emptyProjects}>
                  <p className={styles.emptyText}>No projects yet</p>
                  {onProjectAdd && (
                    <button
                      type="button"
                      className={styles.createProjectButton}
                      onClick={onProjectAdd}
                    >
                      Create your first project
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.footerButton}
              title="Settings"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6" />
                <path d="M1 12h6m6 0h6" />
              </svg>
              <span>Settings</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

Sidebar.displayName = "Sidebar";
