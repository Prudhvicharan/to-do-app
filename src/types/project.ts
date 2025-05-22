// Project color options for visual organization
export enum ProjectColor {
  BLUE = "blue",
  GREEN = "green",
  RED = "red",
  YELLOW = "yellow",
  PURPLE = "purple",
  PINK = "pink",
  ORANGE = "orange",
  GRAY = "gray",
}

// Project interface
export interface Project {
  id: string;
  name: string;
  description?: string;
  color: ProjectColor;
  isDefault?: boolean; // For "Personal" or "Inbox" project
  createdAt: Date;
  updatedAt: Date;
}

// For creating new projects
export interface CreateProjectInput {
  name: string;
  description?: string;
  color?: ProjectColor;
}

// For updating existing projects
export interface UpdateProjectInput {
  id: string;
  name?: string;
  description?: string;
  color?: ProjectColor;
}

// Project with task counts for dashboard
export interface ProjectWithStats {
  id: string;
  name: string;
  description?: string;
  color: ProjectColor;
  isDefault?: boolean;
  taskCount: number;
  completedCount: number;
  pendingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// For project operations
export type ProjectAction =
  | { type: "ADD_PROJECT"; payload: Project }
  | { type: "UPDATE_PROJECT"; payload: UpdateProjectInput }
  | { type: "DELETE_PROJECT"; payload: string }
  | { type: "SET_PROJECTS"; payload: Project[] };

// Default project that every user gets
export const DEFAULT_PROJECT: Omit<Project, "id" | "createdAt" | "updatedAt"> =
  {
    name: "Personal",
    description: "Your personal tasks and reminders",
    color: ProjectColor.BLUE,
    isDefault: true,
  };
