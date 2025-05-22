import { TaskPriority, TaskStatus } from "./task";

// View modes for different task displays
export enum ViewMode {
  LIST = "list",
  BOARD = "board", // Kanban-style (future feature)
  CALENDAR = "calendar", // Calendar view (future feature)
}

// Sorting options
export enum SortBy {
  CREATED_DATE = "createdDate",
  UPDATED_DATE = "updatedDate",
  DUE_DATE = "dueDate",
  TITLE = "title",
  PRIORITY = "priority",
  STATUS = "status",
}

// Sort direction
export enum SortDirection {
  ASC = "asc",
  DESC = "desc",
}

// Filter for due dates
export enum DueDateFilter {
  ALL = "all",
  TODAY = "today",
  TOMORROW = "tomorrow",
  THIS_WEEK = "thisWeek",
  NEXT_WEEK = "nextWeek",
  OVERDUE = "overdue",
  NO_DUE_DATE = "noDueDate",
}

// Main filter interface
export interface TaskFilter {
  searchQuery?: string;
  status?: TaskStatus | "all";
  priority?: TaskPriority | "all";
  projectId?: string | "all";
  dueDate?: DueDateFilter;
  tags?: string[];
  showCompleted?: boolean;
}

// Sorting configuration
export interface TaskSort {
  sortBy: SortBy;
  direction: SortDirection;
}

// Complete view state combining filters, sorting, and view mode
export interface TaskViewState {
  filter: TaskFilter;
  sort: TaskSort;
  viewMode: ViewMode;
}

// Predefined filter presets for quick access
export interface FilterPreset {
  id: string;
  name: string;
  icon?: string;
  filter: TaskFilter;
  sort?: TaskSort;
}

// Quick filter actions
export type FilterAction =
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_STATUS_FILTER"; payload: TaskStatus | "all" }
  | { type: "SET_PRIORITY_FILTER"; payload: TaskPriority | "all" }
  | { type: "SET_PROJECT_FILTER"; payload: string | "all" }
  | { type: "SET_DUE_DATE_FILTER"; payload: DueDateFilter }
  | { type: "TOGGLE_COMPLETED"; payload: boolean }
  | { type: "SET_SORT"; payload: TaskSort }
  | { type: "SET_VIEW_MODE"; payload: ViewMode }
  | { type: "CLEAR_FILTERS" }
  | { type: "APPLY_PRESET"; payload: FilterPreset };

// Default filter states
export const DEFAULT_FILTER: TaskFilter = {
  searchQuery: "",
  status: "all",
  priority: "all",
  projectId: "all",
  dueDate: DueDateFilter.ALL,
  tags: [],
  showCompleted: true,
};

export const DEFAULT_SORT: TaskSort = {
  sortBy: SortBy.CREATED_DATE,
  direction: SortDirection.DESC,
};

export const DEFAULT_VIEW_STATE: TaskViewState = {
  filter: DEFAULT_FILTER,
  sort: DEFAULT_SORT,
  viewMode: ViewMode.LIST,
};

// Common filter presets
export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: "today",
    name: "Today",
    icon: "📅",
    filter: {
      ...DEFAULT_FILTER,
      dueDate: DueDateFilter.TODAY,
      showCompleted: false,
    },
  },
  {
    id: "overdue",
    name: "Overdue",
    icon: "⚠️",
    filter: {
      ...DEFAULT_FILTER,
      dueDate: DueDateFilter.OVERDUE,
      showCompleted: false,
    },
  },
  {
    id: "high-priority",
    name: "High Priority",
    icon: "🔴",
    filter: {
      ...DEFAULT_FILTER,
      priority: TaskPriority.HIGH,
      showCompleted: false,
    },
  },
  {
    id: "completed",
    name: "Completed",
    icon: "✅",
    filter: {
      ...DEFAULT_FILTER,
      status: TaskStatus.COMPLETED,
    },
  },
];
