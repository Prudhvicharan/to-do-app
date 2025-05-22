// src/components/layout/Header/Header.tsx
import React from "react";
import { IconButton, Button } from "../../ui";
import styles from "./Header.module.css";

export interface HeaderProps {
  title?: string;
  showMenuButton?: boolean;
  showThemeToggle?: boolean;
  showSearch?: boolean;
  onMenuClick?: () => void;
  onSearchChange?: (query: string) => void;
  searchValue?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title = "TodoApp",
  showMenuButton = true,
  showThemeToggle = true,
  showSearch = false,
  onMenuClick,
  onSearchChange,
  searchValue = "",
  actions,
  className = "",
}) => {
  const [searchQuery, setSearchQuery] = React.useState(searchValue);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearchChange?.(value);
  };

  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <header className={`${styles.header} ${className}`}>
      <div className={styles.headerContent}>
        {/* Left section */}
        <div className={styles.leftSection}>
          {showMenuButton && (
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
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              }
              variant="ghost"
              size="md"
              aria-label="Toggle menu"
              onClick={onMenuClick}
              className={styles.menuButton}
            />
          )}

          <div className={styles.titleSection}>
            <h1 className={styles.title}>{title}</h1>
          </div>
        </div>

        {/* Center section - Search */}
        {showSearch && (
          <div className={styles.centerSection}>
            <div className={styles.searchWrapper}>
              <svg
                className={styles.searchIcon}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={handleSearchChange}
                className={styles.searchInput}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    onSearchChange?.("");
                  }}
                  className={styles.clearButton}
                  aria-label="Clear search"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Right section */}
        <div className={styles.rightSection}>
          {/* Custom actions */}
          {actions && <div className={styles.actions}>{actions}</div>}

          {/* Theme toggle */}
          {showThemeToggle && (
            <IconButton
              icon={
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              }
              variant="ghost"
              size="sm"
              aria-label="Toggle theme"
              onClick={toggleTheme}
              tooltip="Toggle theme"
            />
          )}

          {/* Quick add button */}
          <Button
            variant="primary"
            size="sm"
            leftIcon={
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
            className={styles.addButton}
          >
            Add Task
          </Button>
        </div>
      </div>
    </header>
  );
};

Header.displayName = "Header";
