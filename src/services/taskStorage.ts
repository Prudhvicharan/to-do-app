import {
  Task,
  Project,
  CreateTaskInput,
  CreateProjectInput,
  DEFAULT_PROJECT,
  ProjectColor,
} from "../types";
import { LocalStorageService } from "./localStorage";

// Storage keys
const STORAGE_KEYS = {
  TASKS: "todoapp_tasks",
  PROJECTS: "todoapp_projects",
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
   * Generate unique ID for tasks and projects
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
    const newTask: Task = {
      id: this.generateId(),
      title: input.title,
      description: input.description,
      completed: false,
      status: "todo" as const,
      priority: input.priority || "medium",
      projectId: input.projectId,
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

  // ===== PROJECT OPERATIONS =====

  /**
   * Get all projects from localStorage
   */
  static getProjects(): Project[] {
    const projects = LocalStorageService.get<Project[]>(
      STORAGE_KEYS.PROJECTS,
      []
    );

    // If no projects exist, create the default project
    if (projects.length === 0) {
      const defaultProject = this.createDefaultProject();
      return [defaultProject];
    }

    // Convert date strings back to Date objects
    return projects.map((project) => ({
      ...project,
      createdAt: new Date(project.createdAt),
      updatedAt: new Date(project.updatedAt),
    }));
  }

  /**
   * Save all projects to localStorage
   */
  static saveProjects(projects: Project[]): boolean {
    return LocalStorageService.set(STORAGE_KEYS.PROJECTS, projects);
  }

  /**
   * Create the default project
   */
  private static createDefaultProject(): Project {
    const now = new Date();
    const defaultProject: Project = {
      ...DEFAULT_PROJECT,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    };

    this.saveProjects([defaultProject]);
    return defaultProject;
  }

  /**
   * Add a new project
   */
  static addProject(input: CreateProjectInput): Project {
    const now = new Date();
    const newProject: Project = {
      id: this.generateId(),
      name: input.name,
      description: input.description,
      color: input.color || ProjectColor.BLUE,
      createdAt: now,
      updatedAt: now,
    };

    const projects = this.getProjects();
    projects.push(newProject);
    this.saveProjects(projects);
    return newProject;
  }

  /**
   * Update an existing project
   */
  static updateProject(
    projectId: string,
    updates: Partial<Omit<Project, "id" | "createdAt">>
  ): Project | null {
    const projects = this.getProjects();
    const projectIndex = projects.findIndex(
      (project) => project.id === projectId
    );

    if (projectIndex === -1) return null;

    const updatedProject = {
      ...projects[projectIndex],
      ...updates,
      updatedAt: new Date(),
    };

    projects[projectIndex] = updatedProject;
    this.saveProjects(projects);
    return updatedProject;
  }

  /**
   * Delete a project (and move its tasks to default project)
   */
  static deleteProject(projectId: string): boolean {
    const projects = this.getProjects();
    const project = projects.find((p) => p.id === projectId);

    // Don't delete default projects
    if (!project || project.isDefault) return false;

    // Move tasks to default project
    const defaultProject = projects.find((p) => p.isDefault);
    if (defaultProject) {
      const tasks = this.getTasks();
      const tasksToMove = tasks.filter((task) => task.projectId === projectId);
      tasksToMove.forEach((task) => {
        this.updateTask(task.id, { projectId: defaultProject.id });
      });
    }

    // Remove the project
    const filteredProjects = projects.filter(
      (project) => project.id !== projectId
    );
    return this.saveProjects(filteredProjects);
  }

  // ===== SETTINGS OPERATIONS =====

  /**
   * Get app settings
   */
  static getSettings(): AppSettings {
    const defaultProject = this.getProjects().find((p) => p.isDefault);
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
   * Clear all app data
   */
  static clearAllData(): boolean {
    try {
      LocalStorageService.remove(STORAGE_KEYS.TASKS);
      LocalStorageService.remove(STORAGE_KEYS.PROJECTS);
      LocalStorageService.remove(STORAGE_KEYS.SETTINGS);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Export all data for backup
   */
  static exportData() {
    return {
      tasks: this.getTasks(),
      projects: this.getProjects(),
      settings: this.getSettings(),
      exportedAt: new Date().toISOString(),
    };
  }

  /**
   * Import data from backup
   */
  static importData(
    data: ReturnType<typeof TaskStorageService.exportData>
  ): boolean {
    try {
      if (data.tasks) this.saveTasks(data.tasks);
      if (data.projects) this.saveProjects(data.projects);
      if (data.settings) this.saveSettings(data.settings);
      return true;
    } catch {
      return false;
    }
  }
}
