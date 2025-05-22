// src/TodoApp.tsx
import React from "react";
import { MainLayout } from "./components/layout";
import { Button } from "./components/ui";
import {
  useAppState,
  useAppSettings,
  useTasksContext,
  useProjectsContext,
  useAppModals,
} from "./context";
import type { NavItem, SidebarProject } from "./components/layout";

export const TodoApp: React.FC = () => {
  const state = useAppState();
  const { settings, toggleSidebar } = useAppSettings();
  const { tasks, taskStats } = useTasksContext();
  const { projects } = useProjectsContext();
  const { openTaskForm, openProjectForm } = useAppModals();

  // Convert projects to sidebar format
  const sidebarProjects: SidebarProject[] = projects.map((project) => ({
    id: project.id,
    name: project.name,
    color: getProjectColorHex(project.color),
    taskCount: tasks.filter((task) => task.projectId === project.id).length,
    isActive: state.activeView === `project-${project.id}`,
    onClick: () => {
      // TODO: Navigate to project view
      console.log(`Navigate to project: ${project.name}`);
    },
  }));

  // Create navigation items with real data
  const navItems: NavItem[] = [
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
      count: taskStats.pending,
      isActive: state.activeView === "inbox",
      onClick: () => {
        // TODO: Navigate to inbox
        console.log("Navigate to Inbox");
      },
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
      count: getTodayTaskCount(tasks),
      isActive: state.activeView === "today",
      onClick: () => {
        // TODO: Navigate to today view
        console.log("Navigate to Today");
      },
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
      count: getUpcomingTaskCount(tasks),
      isActive: state.activeView === "upcoming",
      onClick: () => {
        // TODO: Navigate to upcoming view
        console.log("Navigate to Upcoming");
      },
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
      count: taskStats.completed,
      isActive: state.activeView === "completed",
      onClick: () => {
        // TODO: Navigate to completed view
        console.log("Navigate to Completed");
      },
    },
  ];

  // Header actions
  const headerActions = (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <Button variant="outline" size="sm">
        Filter
      </Button>
      <Button variant="ghost" size="sm">
        Sort
      </Button>
    </div>
  );

  return (
    <MainLayout
      headerTitle="TodoApp"
      showSearch={true}
      searchValue={state.searchQuery}
      onSearchChange={(query) => {
        // TODO: Implement search dispatch
        console.log("Search:", query);
      }}
      headerActions={headerActions}
      navItems={navItems}
      projects={sidebarProjects}
      onProjectAdd={openProjectForm}
      sidebarOpen={settings.sidebarOpen}
      onSidebarToggle={toggleSidebar}
    >
      {/* Main content area - this will be replaced with actual views */}
      <div style={{ padding: "2rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1>Welcome to TodoApp</h1>
          <p>
            You have {taskStats.pending} pending tasks across {projects.length}{" "}
            projects.
          </p>
        </div>

        {/* Quick stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <StatsCard
            title="Total Tasks"
            value={taskStats.total}
            color="var(--color-primary)"
          />
          <StatsCard
            title="Completed"
            value={taskStats.completed}
            color="#10b981"
          />
          <StatsCard
            title="Pending"
            value={taskStats.pending}
            color="#f59e0b"
          />
          <StatsCard
            title="Overdue"
            value={taskStats.overdue}
            color="var(--color-danger)"
          />
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Button
            onClick={openTaskForm}
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
          >
            Add Task
          </Button>

          <Button variant="outline" onClick={openProjectForm}>
            New Project
          </Button>

          <Button variant="ghost">View All Tasks</Button>
        </div>

        {/* Recent tasks preview */}
        <div style={{ marginTop: "2rem" }}>
          <h2>Recent Tasks</h2>
          {tasks.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {tasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "var(--color-white)",
                    border: "1px solid var(--color-gray-200)",
                    borderRadius: "var(--border-radius-md)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <span
                      style={{
                        textDecoration: task.completed
                          ? "line-through"
                          : "none",
                        color: task.completed
                          ? "var(--color-gray-500)"
                          : "var(--color-gray-900)",
                      }}
                    >
                      {task.title}
                    </span>
                    {task.dueDate && (
                      <span
                        style={{
                          marginLeft: "0.5rem",
                          fontSize: "0.75rem",
                          color: "var(--color-gray-500)",
                        }}
                      >
                        Due: {task.dueDate.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      padding: "0.25rem 0.5rem",
                      backgroundColor: getPriorityColor(task.priority),
                      color: "white",
                      borderRadius: "var(--border-radius-sm)",
                      fontSize: "0.75rem",
                      textTransform: "capitalize",
                    }}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--color-gray-500)" }}>
              No tasks yet. Create your first task to get started!
            </p>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

// Helper components and functions
const StatsCard: React.FC<{ title: string; value: number; color: string }> = ({
  title,
  value,
  color,
}) => (
  <div
    style={{
      padding: "1.5rem",
      backgroundColor: "var(--color-white)",
      border: "1px solid var(--color-gray-200)",
      borderRadius: "var(--border-radius-lg)",
      textAlign: "center",
    }}
  >
    <div
      style={{
        fontSize: "2rem",
        fontWeight: "bold",
        color,
        marginBottom: "0.5rem",
      }}
    >
      {value}
    </div>
    <div
      style={{
        fontSize: "0.875rem",
        color: "var(--color-gray-600)",
      }}
    >
      {title}
    </div>
  </div>
);

// Helper functions
function getProjectColorHex(color: string): string {
  const colorMap: Record<string, string> = {
    blue: "#3b82f6",
    green: "#10b981",
    red: "#ef4444",
    yellow: "#f59e0b",
    purple: "#a855f7",
    pink: "#ec4899",
    orange: "#f97316",
    gray: "#6b7280",
  };
  return colorMap[color] || "#3b82f6";
}

function getPriorityColor(priority: string): string {
  const priorityColors: Record<string, string> = {
    high: "#ef4444",
    medium: "#f59e0b",
    low: "#10b981",
  };
  return priorityColors[priority] || "#6b7280";
}

function getTodayTaskCount(tasks: any[]): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return tasks.filter((task) => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate >= today && dueDate < tomorrow;
  }).length;
}

function getUpcomingTaskCount(tasks: any[]): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return tasks.filter((task) => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate >= today && dueDate < nextWeek;
  }).length;
}
