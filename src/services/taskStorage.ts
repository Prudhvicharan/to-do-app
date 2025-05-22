import { Task, CreateTaskInput } from "../types";
import { LocalStorageService } from "./localStorage";
import { ProjectStorageService } from "./projectStorage";

// Storage keys
const STORAGE_KEYS = {
  TASKS: "todoapp_tasks",
  SETTINGS: "todoapp_settings",
} as const;

// App settings interface
interface AppSettings {
  theme: "light" | "dark" | "system";
  defaultProjectId: string;
  lastUsedFilters: any;
}

export class TaskStorageService {
  /**
   * Generate unique ID for tasks
   */
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ===== TASK OPERATIONS =====

  /**
   * Get all tasks from localStorage
   */
  static getTasks(): Task[] {
    const tasks = LocalStorageService.get<Task[]>(STORAGE_KEYS.TASKS, []);
    // Convert date strings back to Date objects
    return tasks.map((task) => ({
      ...task,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
    }));
  }

  /**
   * Get a task by ID
   */
  static getTaskById(taskId: string): Task | null {
    const tasks = this.getTasks();
    return tasks.find((task) => task.id === taskId) || null;
  }

  /**
   * Get tasks by project ID
   */
  static getTasksByProject(projectId: string): Task[] {
    const tasks = this.getTasks();
    return tasks.filter((task) => task.projectId === projectId);
  }

  /**
   * Save all tasks to localStorage
   */
  static saveTasks(tasks: Task[]): boolean {
    return LocalStorageService.set(STORAGE_KEYS.TASKS, tasks);
  }

  /**
   * Add a new task
   */
  static addTask(input: CreateTaskInput): Task {
    const now = new Date();

    // Use default project if none specified
    let projectId = input.projectId;
    if (!projectId) {
      const defaultProject = ProjectStorageService.getDefaultProject();
      projectId = defaultProject?.id;
    }

    // Validate project exists
    if (projectId && !ProjectStorageService.projectExists(projectId)) {
      const defaultProject = ProjectStorageService.getDefaultProject();
      projectId = defaultProject?.id;
    }

    const newTask: Task = {
      id: this.generateId(),
      title: input.title,
      description: input.description,
      completed: false,
      status: "todo" as const,
      priority: input.priority || "medium",
      projectId: projectId,
      dueDate: input.dueDate,
      createdAt: now,
      updatedAt: now,
      tags: input.tags || [],
    };

    const tasks = this.getTasks();
    tasks.push(newTask);
    this.saveTasks(tasks);
    return newTask;
  }

  /**
   * Update an existing task
   */
  static updateTask(
    taskId: string,
    updates: Partial<Omit<Task, "id" | "createdAt">>
  ): Task | null {
    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex((task) => task.id === taskId);

    if (taskIndex === -1) return null;

    // Validate project exists if being updated
    if (
      updates.projectId &&
      !ProjectStorageService.projectExists(updates.projectId)
    ) {
      const defaultProject = ProjectStorageService.getDefaultProject();
      updates.projectId = defaultProject?.id;
    }

    const updatedTask = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date(),
    };

    tasks[taskIndex] = updatedTask;
    this.saveTasks(tasks);
    return updatedTask;
  }

  /**
   * Delete a task
   */
  static deleteTask(taskId: string): boolean {
    const tasks = this.getTasks();
    const filteredTasks = tasks.filter((task) => task.id !== taskId);

    if (filteredTasks.length === tasks.length) return false; // Task not found

    return this.saveTasks(filteredTasks);
  }

  /**
   * Toggle task completion status
   */
  static toggleTask(taskId: string): Task | null {
    const tasks = this.getTasks();
    const task = tasks.find((t) => t.id === taskId);

    if (!task) return null;

    const completed = !task.completed;
    return this.updateTask(taskId, {
      completed,
      status: completed ? "completed" : "todo",
    });
  }

  /**
   * Clear all completed tasks
   */
  static clearCompletedTasks(): number {
    const tasks = this.getTasks();
    const activeTasks = tasks.filter((task) => !task.completed);
    const deletedCount = tasks.length - activeTasks.length;

    this.saveTasks(activeTasks);
    return deletedCount;
  }

  /**
   * Move tasks from one project to another
   */
  static moveTasksToProject(
    taskIds: string[],
    targetProjectId: string
  ): boolean {
    if (!ProjectStorageService.projectExists(targetProjectId)) {
      return false;
    }

    const tasks = this.getTasks();
    let updated = false;

    tasks.forEach((task) => {
      if (taskIds.includes(task.id)) {
        task.projectId = targetProjectId;
        task.updatedAt = new Date();
        updated = true;
      }
    });

    return updated ? this.saveTasks(tasks) : false;
  }

  /**
   * Move all tasks from deleted project to default project
   */
  static handleProjectDeletion(deletedProjectId: string): boolean {
    const defaultProject = ProjectStorageService.getDefaultProject();
    if (!defaultProject) return false;

    const tasks = this.getTasks();
    const tasksToMove = tasks.filter(
      (task) => task.projectId === deletedProjectId
    );

    if (tasksToMove.length === 0) return true;

    tasksToMove.forEach((task) => {
      task.projectId = defaultProject.id;
      task.updatedAt = new Date();
    });

    return this.saveTasks(tasks);
  }

  /**
   * Get task statistics
   */
  static getTaskStats() {
    const tasks = this.getTasks();
    const now = new Date();

    return {
      total: tasks.length,
      completed: tasks.filter((task) => task.completed).length,
      pending: tasks.filter((task) => !task.completed).length,
      overdue: tasks.filter(
        (task) => task.dueDate && task.dueDate < now && !task.completed
      ).length,
      highPriority: tasks.filter(
        (task) => task.priority === "high" && !task.completed
      ).length,
    };
  }

  /**
   * Get task statistics by project
   */
  static getTaskStatsByProject(projectId: string) {
    const tasks = this.getTasksByProject(projectId);
    const now = new Date();

    return {
      total: tasks.length,
      completed: tasks.filter((task) => task.completed).length,
      pending: tasks.filter((task) => !task.completed).length,
      overdue: tasks.filter(
        (task) => task.dueDate && task.dueDate < now && !task.completed
      ).length,
      highPriority: tasks.filter(
        (task) => task.priority === "high" && !task.completed
      ).length,
    };
  }

  // ===== SETTINGS OPERATIONS =====

  /**
   * Get app settings
   */
  static getSettings(): AppSettings {
    const defaultProject = ProjectStorageService.getDefaultProject();
    return LocalStorageService.get<AppSettings>(STORAGE_KEYS.SETTINGS, {
      theme: "system",
      defaultProjectId: defaultProject?.id || "",
      lastUsedFilters: null,
    });
  }

  /**
   * Save app settings
   */
  static saveSettings(settings: Partial<AppSettings>): boolean {
    const currentSettings = this.getSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    return LocalStorageService.set(STORAGE_KEYS.SETTINGS, updatedSettings);
  }

  // ===== UTILITY OPERATIONS =====

  /**
   * Clear all task data
   */
  static clearAllTasks(): boolean {
    try {
      LocalStorageService.remove(STORAGE_KEYS.TASKS);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clear all app data (tasks and settings)
   */
  static clearAllData(): boolean {
    try {
      LocalStorageService.remove(STORAGE_KEYS.TASKS);
      LocalStorageService.remove(STORAGE_KEYS.SETTINGS);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Export task data for backup
   */
  static exportTasks() {
    return {
      tasks: this.getTasks(),
      settings: this.getSettings(),
      exportedAt: new Date().toISOString(),
    };
  }

  /**
   * Import task data from backup
   */
  static importTasks(data: {
    tasks?: Task[];
    settings?: AppSettings;
  }): boolean {
    try {
      if (data.tasks) this.saveTasks(data.tasks);
      if (data.settings) this.saveSettings(data.settings);
      return true;
    } catch {
      return false;
    }
  }
}
