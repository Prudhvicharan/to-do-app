// src/components/layout/MainLayout/MainLayout.tsx
import React, { useState, useEffect } from "react";
import { Header } from "../Header/Header";
import { Sidebar } from "../Sidebar/Sidebar";
import type { NavItem, SidebarProject } from "../Sidebar/Sidebar";
import styles from "./MainLayout.module.css";

export interface MainLayoutProps {
  children: React.ReactNode;
  headerTitle?: string;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (query: string) => void;
  headerActions?: React.ReactNode;
  navItems?: NavItem[];
  projects?: SidebarProject[];
  onProjectAdd?: () => void;
  showProjects?: boolean;
  sidebarOpen?: boolean;
  onSidebarToggle?: (open: boolean) => void;
  className?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  headerTitle,
  showSearch = false,
  searchValue,
  onSearchChange,
  headerActions,
  navItems,
  projects,
  onProjectAdd,
  showProjects = true,
  sidebarOpen,
  onSidebarToggle,
  className = "",
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Use controlled or internal sidebar state
  const sidebarIsOpen = sidebarOpen !== undefined ? sidebarOpen : isSidebarOpen;
  const setSidebarIsOpen = onSidebarToggle || setIsSidebarOpen;

  // Detect mobile breakpoint
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      // Auto-close sidebar on mobile when switching from desktop
      if (mobile && sidebarIsOpen) {
        setSidebarIsOpen(false);
      }
      // Auto-open sidebar on desktop
      else if (!mobile) {
        setSidebarIsOpen(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [sidebarIsOpen, setSidebarIsOpen]);

  // Initialize sidebar state based on screen size
  useEffect(() => {
    if (sidebarOpen === undefined) {
      setIsSidebarOpen(window.innerWidth >= 1024);
    }
  }, [sidebarOpen]);

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    setSidebarIsOpen(!sidebarIsOpen);
  };

  // Close sidebar when clicking outside on mobile
  const handleSidebarClose = () => {
    if (isMobile) {
      setSidebarIsOpen(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Toggle sidebar with Ctrl/Cmd + B
      if ((event.ctrlKey || event.metaKey) && event.key === "b") {
        event.preventDefault();
        handleSidebarToggle();
      }
      // Close sidebar with Escape (mobile only)
      else if (event.key === "Escape" && isMobile && sidebarIsOpen) {
        setSidebarIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobile, sidebarIsOpen, setSidebarIsOpen]);

  const layoutClasses = [
    styles.layout,
    sidebarIsOpen && !isMobile ? styles["layout--sidebarOpen"] : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={layoutClasses}>
      {/* Header */}
      <Header
        title={headerTitle}
        showSearch={showSearch}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        showMenuButton={isMobile}
        onMenuClick={handleSidebarToggle}
        actions={headerActions}
        className={styles.header}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarIsOpen}
        onClose={handleSidebarClose}
        navItems={navItems}
        projects={projects}
        onProjectAdd={onProjectAdd}
        showProjects={showProjects}
        className={styles.sidebar}
      />

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>

      {/* Skip link for accessibility */}
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>
    </div>
  );
};

MainLayout.displayName = "MainLayout";
