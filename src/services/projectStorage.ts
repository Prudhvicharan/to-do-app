import type { Project, CreateProjectInput } from "../types";
import { DEFAULT_PROJECT, ProjectColor } from "../types";
import { LocalStorageService } from "./localStorage";

// Storage keys
const STORAGE_KEYS = {
  PROJECTS: "todoapp_projects",
} as const;

export class ProjectStorageService {
  /**
   * Generate unique ID for projects
   */
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

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
   * Get a project by ID
   */
  static getProjectById(projectId: string): Project | null {
    const projects = this.getProjects();
    return projects.find((project) => project.id === projectId) || null;
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
   * Get the default project
   */
  static getDefaultProject(): Project | null {
    const projects = this.getProjects();
    return projects.find((project) => project.isDefault) || null;
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
   * Delete a project
   * Note: This doesn't handle task reassignment - that should be done at the service layer
   */
  static deleteProject(projectId: string): boolean {
    const projects = this.getProjects();
    const project = projects.find((p) => p.id === projectId);

    // Don't delete default projects
    if (!project || project.isDefault) return false;

    // Remove the project
    const filteredProjects = projects.filter(
      (project) => project.id !== projectId
    );
    return this.saveProjects(filteredProjects);
  }

  /**
   * Check if project exists
   */
  static projectExists(projectId: string): boolean {
    const projects = this.getProjects();
    return projects.some((project) => project.id === projectId);
  }

  /**
   * Get project statistics
   */
  static getProjectStats() {
    const projects = this.getProjects();
    return {
      total: projects.length,
      default: projects.filter((p) => p.isDefault).length,
      custom: projects.filter((p) => !p.isDefault).length,
    };
  }

  /**
   * Clear all projects (will recreate default)
   */
  static clearAllProjects(): boolean {
    try {
      LocalStorageService.remove(STORAGE_KEYS.PROJECTS);
      // This will recreate the default project on next getProjects() call
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Export projects data
   */
  static exportProjects() {
    return {
      projects: this.getProjects(),
      exportedAt: new Date().toISOString(),
    };
  }

  /**
   * Import projects data
   */
  static importProjects(projects: Project[]): boolean {
    try {
      // Ensure at least one default project exists
      const hasDefault = projects.some((p) => p.isDefault);
      if (!hasDefault) {
        const defaultProject = {
          ...DEFAULT_PROJECT,
          id: this.generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        projects.unshift(defaultProject);
      }

      return this.saveProjects(projects);
    } catch {
      return false;
    }
  }
}
