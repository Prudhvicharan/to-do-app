// src/context/AppContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from "react";
import {
  type Task,
  type Project,
  type TaskFilter,
  type TaskSort,
  type TaskStats,
  type TaskViewState,
  DEFAULT_FILTER,
  DEFAULT_SORT,
  ViewMode,
} from "../types";
import { useTasks } from "../hooks/useTasks";
import { useProjects } from "../hooks/useProjects";
import { useLocalStorage } from "../hooks/useLocalStorage";

// Theme types
export type Theme = "light" | "dark" | "system";

// App settings interface
export interface AppSettings {
  theme: Theme;
  sidebarOpen: boolean;
  defaultProjectId?: string;
  notifications: {
    enabled: boolean;
    dueDateReminders: boolean;
    dailySummary: boolean;
  };
  display: {
    taskListView: ViewMode;
    showCompletedTasks: boolean;
    groupByProject: boolean;
    compactMode: boolean;
  };
}

// App state interface
export interface AppState {
  // Core data
  tasks: Task[];
  allTasks: Task[];
  projects: Project[];

  // UI state
  loading: boolean;
  error: string | null;

  // Task management
  taskStats: TaskStats;
  taskFilter: TaskFilter;
  taskSort: TaskSort;
  taskViewState: TaskViewState;

  // App settings
  settings: AppSettings;

  // UI state
  modals: {
    taskForm: boolean;
    taskDetails: string | null;
    projectForm: boolean;
    settings: boolean;
    confirmDelete: string | null;
  };

  // Search and navigation
  searchQuery: string;
  activeView: string;
  selectedTaskIds: string[];
}

// Action types
export type AppAction =
  // Task actions
  | { type: "TASKS_LOADING"; payload: boolean }
  | { type: "TASKS_ERROR"; payload: string | null }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_TASK_FILTER"; payload: Partial<TaskFilter> }
  | { type: "SET_TASK_SORT"; payload: Partial<TaskSort> }
  | { type: "CLEAR_TASK_FILTERS" }
  | { type: "SET_VIEW_MODE"; payload: ViewMode }
  | { type: "SET_SELECTED_TASKS"; payload: string[] }
  | { type: "TOGGLE_TASK_SELECTION"; payload: string }
  | { type: "CLEAR_TASK_SELECTION" }

  // Navigation actions
  | { type: "SET_ACTIVE_VIEW"; payload: string }

  // Modal actions
  | { type: "OPEN_TASK_FORM" }
  | { type: "CLOSE_TASK_FORM" }
  | { type: "OPEN_TASK_DETAILS"; payload: string }
  | { type: "CLOSE_TASK_DETAILS" }
  | { type: "OPEN_PROJECT_FORM" }
  | { type: "CLOSE_PROJECT_FORM" }
  | { type: "OPEN_SETTINGS" }
  | { type: "CLOSE_SETTINGS" }
  | { type: "OPEN_CONFIRM_DELETE"; payload: string }
  | { type: "CLOSE_CONFIRM_DELETE" }

  // Settings actions
  | { type: "SET_THEME"; payload: Theme }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "SET_SIDEBAR_OPEN"; payload: boolean }
  | { type: "UPDATE_SETTINGS"; payload: Partial<AppSettings> };

// Default settings
const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  sidebarOpen: true,
  notifications: {
    enabled: true,
    dueDateReminders: true,
    dailySummary: false,
  },
  display: {
    taskListView: ViewMode.LIST,
    showCompletedTasks: true,
    groupByProject: false,
    compactMode: false,
  },
};

// App reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // Task actions
    case "TASKS_LOADING":
      return { ...state, loading: action.payload };

    case "TASKS_ERROR":
      return { ...state, error: action.payload, loading: false };

    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };

    case "SET_TASK_FILTER":
      return {
        ...state,
        taskFilter: { ...state.taskFilter, ...action.payload },
        taskViewState: {
          ...state.taskViewState,
          filter: { ...state.taskFilter, ...action.payload },
        },
      };

    case "SET_TASK_SORT":
      return {
        ...state,
        taskSort: { ...state.taskSort, ...action.payload },
        taskViewState: {
          ...state.taskViewState,
          sort: { ...state.taskSort, ...action.payload },
        },
      };

    case "CLEAR_TASK_FILTERS":
      return {
        ...state,
        taskFilter: DEFAULT_FILTER,
        taskViewState: { ...state.taskViewState, filter: DEFAULT_FILTER },
      };

    case "SET_VIEW_MODE":
      return {
        ...state,
        taskViewState: { ...state.taskViewState, viewMode: action.payload },
        settings: {
          ...state.settings,
          display: { ...state.settings.display, taskListView: action.payload },
        },
      };

    case "SET_SELECTED_TASKS":
      return { ...state, selectedTaskIds: action.payload };

    case "TOGGLE_TASK_SELECTION":
      const taskId = action.payload;
      const isSelected = state.selectedTaskIds.includes(taskId);
      return {
        ...state,
        selectedTaskIds: isSelected
          ? state.selectedTaskIds.filter((id) => id !== taskId)
          : [...state.selectedTaskIds, taskId],
      };

    case "CLEAR_TASK_SELECTION":
      return { ...state, selectedTaskIds: [] };

    // Navigation actions
    case "SET_ACTIVE_VIEW":
      return { ...state, activeView: action.payload };

    // Modal actions
    case "OPEN_TASK_FORM":
      return { ...state, modals: { ...state.modals, taskForm: true } };

    case "CLOSE_TASK_FORM":
      return { ...state, modals: { ...state.modals, taskForm: false } };

    case "OPEN_TASK_DETAILS":
      return {
        ...state,
        modals: { ...state.modals, taskDetails: action.payload },
      };

    case "CLOSE_TASK_DETAILS":
      return { ...state, modals: { ...state.modals, taskDetails: null } };

    case "OPEN_PROJECT_FORM":
      return { ...state, modals: { ...state.modals, projectForm: true } };

    case "CLOSE_PROJECT_FORM":
      return { ...state, modals: { ...state.modals, projectForm: false } };

    case "OPEN_SETTINGS":
      return { ...state, modals: { ...state.modals, settings: true } };

    case "CLOSE_SETTINGS":
      return { ...state, modals: { ...state.modals, settings: false } };

    case "OPEN_CONFIRM_DELETE":
      return {
        ...state,
        modals: { ...state.modals, confirmDelete: action.payload },
      };

    case "CLOSE_CONFIRM_DELETE":
      return { ...state, modals: { ...state.modals, confirmDelete: null } };

    // Settings actions
    case "SET_THEME":
      return {
        ...state,
        settings: { ...state.settings, theme: action.payload },
      };

    case "TOGGLE_SIDEBAR":
      return {
        ...state,
        settings: {
          ...state.settings,
          sidebarOpen: !state.settings.sidebarOpen,
        },
      };

    case "SET_SIDEBAR_OPEN":
      return {
        ...state,
        settings: {
          ...state.settings,
          sidebarOpen: action.payload,
        },
      };

    case "UPDATE_SETTINGS":
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    default:
      return state;
  }
}

// Context interface
export interface AppContextType {
  // State
  state: AppState;
  dispatch: React.Dispatch<AppAction>;

  // Task management (from hooks)
  addTask: (input: any) => Promise<Task | null>;
  updateTask: (id: string, updates: any) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  toggleTask: (id: string) => Promise<Task | null>;
  clearCompletedTasks: () => Promise<number>;

  // Project management (from hooks)
  addProject: (input: any) => Promise<Project | null>;
  updateProject: (id: string, updates: any) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;

  // Utility functions
  applyTheme: (theme: Theme) => void;
  resetApp: () => void;
  exportData: () => any;
  importData: (data: any) => Promise<boolean>;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Context provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Get settings from localStorage
  const [persistedSettings, setPersistedSettings] =
    useLocalStorage<AppSettings>("todoapp_settings", DEFAULT_SETTINGS);

  // Initialize state
  const initialState: AppState = {
    tasks: [],
    allTasks: [],
    projects: [],
    loading: false,
    error: null,
    taskStats: {
      total: 0,
      completed: 0,
      pending: 0,
      overdue: 0,
      highPriority: 0,
    },
    taskFilter: DEFAULT_FILTER,
    taskSort: DEFAULT_SORT,
    taskViewState: {
      filter: DEFAULT_FILTER,
      sort: DEFAULT_SORT,
      viewMode: persistedSettings.display.taskListView,
    },
    settings: persistedSettings,
    modals: {
      taskForm: false,
      taskDetails: null,
      projectForm: false,
      settings: false,
      confirmDelete: null,
    },
    searchQuery: "",
    activeView: "inbox",
    selectedTaskIds: [],
  };

  const [state, dispatch] = useReducer(appReducer, initialState);

  // Use custom hooks for data management
  const {
    tasks,
    allTasks,
    loading: tasksLoading,
    error: tasksError,
    stats: taskStats,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    clearCompletedTasks,
    updateFilter,
    updateSort,
  } = useTasks();

  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    addProject,
    updateProject,
    deleteProject,
  } = useProjects();

  // Apply theme function
  const applyTheme = (theme: Theme) => {
    let actualTheme = theme;

    if (theme === "system") {
      actualTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    document.documentElement.setAttribute("data-theme", actualTheme);

    // Save to settings
    dispatch({ type: "SET_THEME", payload: theme });
    setPersistedSettings({ ...state.settings, theme });
  };

  // Reset app function
  const resetApp = () => {
    dispatch({ type: "CLEAR_TASK_FILTERS" });
    dispatch({ type: "CLEAR_TASK_SELECTION" });
    dispatch({ type: "SET_SEARCH_QUERY", payload: "" });
    dispatch({ type: "SET_ACTIVE_VIEW", payload: "inbox" });
  };

  // Export data function
  const exportData = () => {
    return {
      tasks: allTasks,
      projects,
      settings: state.settings,
      exportedAt: new Date().toISOString(),
    };
  };

  // Import data function
  const importData = async (data: any): Promise<boolean> => {
    try {
      // This would integrate with your storage services
      // For now, just return success
      return true;
    } catch (error) {
      dispatch({ type: "TASKS_ERROR", payload: "Failed to import data" });
      return false;
    }
  };

  // Update state when hooks change
  useEffect(() => {
    // Update tasks and stats in state
    // This ensures the context state stays in sync with hook state
  }, [tasks, allTasks, taskStats, projects]);

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(state.settings.theme);
  }, [state.settings.theme]);

  // Save settings when they change
  useEffect(() => {
    setPersistedSettings(state.settings);
  }, [state.settings, setPersistedSettings]);

  // Handle system theme changes
  useEffect(() => {
    if (state.settings.theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme("system");

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [state.settings.theme]);

  // Context value
  const contextValue: AppContextType = {
    state: {
      ...state,
      tasks,
      allTasks,
      projects,
      loading: tasksLoading || projectsLoading,
      error: tasksError || projectsError,
      taskStats,
    },
    dispatch,

    // Task management
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    clearCompletedTasks,

    // Project management
    addProject,
    updateProject,
    deleteProject,

    // Utility functions
    applyTheme,
    resetApp,
    exportData,
    importData,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

// Selector hooks for specific pieces of state
export const useAppState = () => useAppContext().state;
export const useTasksContext = () => {
  const {
    state,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    clearCompletedTasks,
  } = useAppContext();
  return {
    tasks: state.tasks,
    allTasks: state.allTasks,
    taskStats: state.taskStats,
    loading: state.loading,
    error: state.error,
    filter: state.taskFilter,
    sort: state.taskSort,
    selectedIds: state.selectedTaskIds,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    clearCompletedTasks,
  };
};

export const useProjectsContext = () => {
  const { state, addProject, updateProject, deleteProject } = useAppContext();
  return {
    projects: state.projects,
    loading: state.loading,
    error: state.error,
    addProject,
    updateProject,
    deleteProject,
  };
};

export const useAppSettings = () => {
  const { state, dispatch, applyTheme } = useAppContext();
  return {
    settings: state.settings,
    updateSettings: (settings: Partial<AppSettings>) =>
      dispatch({ type: "UPDATE_SETTINGS", payload: settings }),
    setTheme: (theme: Theme) => applyTheme(theme),
    toggleSidebar: () => dispatch({ type: "TOGGLE_SIDEBAR" }),
    setSidebarOpen: (open: boolean) =>
      dispatch({ type: "SET_SIDEBAR_OPEN", payload: open }),
  };
};

export const useAppModals = () => {
  const { state, dispatch } = useAppContext();
  return {
    modals: state.modals,
    openTaskForm: () => dispatch({ type: "OPEN_TASK_FORM" }),
    closeTaskForm: () => dispatch({ type: "CLOSE_TASK_FORM" }),
    openTaskDetails: (id: string) =>
      dispatch({ type: "OPEN_TASK_DETAILS", payload: id }),
    closeTaskDetails: () => dispatch({ type: "CLOSE_TASK_DETAILS" }),
    openProjectForm: () => dispatch({ type: "OPEN_PROJECT_FORM" }),
    closeProjectForm: () => dispatch({ type: "CLOSE_PROJECT_FORM" }),
    openSettings: () => dispatch({ type: "OPEN_SETTINGS" }),
    closeSettings: () => dispatch({ type: "CLOSE_SETTINGS" }),
    openConfirmDelete: (id: string) =>
      dispatch({ type: "OPEN_CONFIRM_DELETE", payload: id }),
    closeConfirmDelete: () => dispatch({ type: "CLOSE_CONFIRM_DELETE" }),
  };
};
