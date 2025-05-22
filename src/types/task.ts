// Task priority levels
export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

// Task status options
export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
}

// Main Task interface
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  status: TaskStatus;
  priority: TaskPriority;
  projectId?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

// For creating new tasks (omits auto-generated fields)
export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  projectId?: string;
  dueDate?: Date;
  tags?: string[];
}

// For updating existing tasks (all optional except id)
export interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string;
  completed?: boolean;
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string;
  dueDate?: Date;
  tags?: string[];
}

// Task statistics for dashboard
export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  highPriority: number;
}

// For task operations
export type TaskAction =
  | { type: "ADD_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: UpdateTaskInput }
  | { type: "DELETE_TASK"; payload: string }
  | { type: "TOGGLE_TASK"; payload: string }
  | { type: "SET_TASKS"; payload: Task[] }
  | { type: "CLEAR_COMPLETED" };
