import { useState, useEffect, useCallback, useMemo } from "react";
import {
  type Project,
  type CreateProjectInput,
  type UpdateProjectInput,
  type ProjectWithStats,
  ProjectColor,
} from "../types";
import { ProjectStorageService, TaskStorageService } from "../services";

/**
 * Custom hook for project management with React state integration
 * Provides CRUD operations, statistics, and task integration
 */
export function useProjects() {
  // State for projects
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load projects from storage
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedProjects = ProjectStorageService.getProjects();
      setProjects(loadedProjects);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize projects on mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // === CRUD OPERATIONS ===

  const addProject = useCallback(
    async (input: CreateProjectInput): Promise<Project | null> => {
      try {
        setError(null);
        const newProject = ProjectStorageService.addProject(input);
        setProjects((prev) => [...prev, newProject]);
        return newProject;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add project");
        return null;
      }
    },
    []
  );

  const updateProject = useCallback(
    async (
      projectId: string,
      updates: Partial<Omit<Project, "id" | "createdAt">>
    ): Promise<Project | null> => {
      try {
        setError(null);
        const updatedProject = ProjectStorageService.updateProject(
          projectId,
          updates
        );
        if (updatedProject) {
          setProjects((prev) =>
            prev.map((project) =>
              project.id === projectId ? updatedProject : project
            )
          );
          return updatedProject;
        }
        return null;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update project"
        );
        return null;
      }
    },
    []
  );

  const deleteProject = useCallback(
    async (projectId: string): Promise<boolean> => {
      try {
        setError(null);

        // First, handle task reassignment
        const success = TaskStorageService.handleProjectDeletion(projectId);
        if (!success) {
          setError("Failed to reassign tasks from deleted project");
          return false;
        }

        // Then delete the project
        const projectDeleted = ProjectStorageService.deleteProject(projectId);
        if (projectDeleted) {
          setProjects((prev) =>
            prev.filter((project) => project.id !== projectId)
          );
          return true;
        }
        return false;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete project"
        );
        return false;
      }
    },
    []
  );

  // === PROJECT WITH STATISTICS ===

  const projectsWithStats = useMemo((): ProjectWithStats[] => {
    return projects.map((project) => {
      const taskStats = TaskStorageService.getTaskStatsByProject(project.id);
      return {
        ...project,
        taskCount: taskStats.total,
        completedCount: taskStats.completed,
        pendingCount: taskStats.pending,
      };
    });
  }, [projects]);

  // === GETTERS ===

  const getProjectById = useCallback(
    (projectId: string): Project | undefined => {
      return projects.find((project) => project.id === projectId);
    },
    [projects]
  );

  const getDefaultProject = useCallback((): Project | undefined => {
    return projects.find((project) => project.isDefault);
  }, [projects]);

  const getProjectsByColor = useCallback(
    (color: ProjectColor): Project[] => {
      return projects.filter((project) => project.color === color);
    },
    [projects]
  );

  const getCustomProjects = useCallback((): Project[] => {
    return projects.filter((project) => !project.isDefault);
  }, [projects]);

  // === STATISTICS ===

  const projectStats = useMemo(() => {
    const totalTasks = projectsWithStats.reduce(
      (sum, project) => sum + project.taskCount,
      0
    );
    const totalCompleted = projectsWithStats.reduce(
      (sum, project) => sum + project.completedCount,
      0
    );
    const totalPending = projectsWithStats.reduce(
      (sum, project) => sum + project.pendingCount,
      0
    );

    return {
      totalProjects: projects.length,
      customProjects: projects.filter((p) => !p.isDefault).length,
      defaultProjects: projects.filter((p) => p.isDefault).length,
      totalTasks,
      totalCompleted,
      totalPending,
      averageTasksPerProject:
        projects.length > 0 ? Math.round(totalTasks / projects.length) : 0,
      completionRate:
        totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0,
    };
  }, [projects, projectsWithStats]);

  // === PROJECT VALIDATION ===

  const validateProjectName = useCallback(
    (name: string, excludeId?: string): boolean => {
      const trimmedName = name.trim();
      if (!trimmedName) return false;

      return !projects.some(
        (project) =>
          project.name.toLowerCase() === trimmedName.toLowerCase() &&
          project.id !== excludeId
      );
    },
    [projects]
  );

  const getProjectNameSuggestion = useCallback(
    (baseName: string): string => {
      const trimmedName = baseName.trim();
      let counter = 1;
      let suggestion = trimmedName;

      while (!validateProjectName(suggestion)) {
        suggestion = `${trimmedName} (${counter})`;
        counter++;
      }

      return suggestion;
    },
    [validateProjectName]
  );

  // === BULK OPERATIONS ===

  const bulkUpdateProjects = useCallback(
    async (
      projectIds: string[],
      updates: Partial<Omit<Project, "id" | "createdAt">>
    ): Promise<number> => {
      try {
        setError(null);
        let updateCount = 0;

        for (const projectId of projectIds) {
          const result = ProjectStorageService.updateProject(
            projectId,
            updates
          );
          if (result) updateCount++;
        }

        if (updateCount > 0) {
          setProjects((prev) =>
            prev.map((project) =>
              projectIds.includes(project.id)
                ? { ...project, ...updates, updatedAt: new Date() }
                : project
            )
          );
        }

        return updateCount;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to bulk update projects"
        );
        return 0;
      }
    },
    []
  );

  const bulkDeleteProjects = useCallback(
    async (projectIds: string[]): Promise<number> => {
      try {
        setError(null);
        let deletedCount = 0;

        // Filter out default projects
        const deletableIds = projectIds.filter((id) => {
          const project = getProjectById(id);
          return project && !project.isDefault;
        });

        for (const projectId of deletableIds) {
          // Handle task reassignment for each project
          const tasksMoved =
            TaskStorageService.handleProjectDeletion(projectId);
          if (tasksMoved) {
            const projectDeleted =
              ProjectStorageService.deleteProject(projectId);
            if (projectDeleted) deletedCount++;
          }
        }

        if (deletedCount > 0) {
          setProjects((prev) =>
            prev.filter((project) => !deletableIds.includes(project.id))
          );
        }

        return deletedCount;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to bulk delete projects"
        );
        return 0;
      }
    },
    [getProjectById]
  );

  // === UTILITY FUNCTIONS ===

  const ensureDefaultProject = useCallback(async (): Promise<Project> => {
    let defaultProject = getDefaultProject();

    if (!defaultProject) {
      // Create a new default project if none exists
      const newDefault = await addProject({
        name: "Personal",
        description: "Your personal tasks and reminders",
        color: ProjectColor.BLUE,
      });

      if (newDefault) {
        // Mark it as default
        const updated = await updateProject(newDefault.id, { isDefault: true });
        defaultProject = updated || newDefault;
      }
    }

    return defaultProject!;
  }, [getDefaultProject, addProject, updateProject]);

  const exportProjects = useCallback(() => {
    return {
      projects: projects,
      projectsWithStats: projectsWithStats,
      stats: projectStats,
      exportedAt: new Date().toISOString(),
    };
  }, [projects, projectsWithStats, projectStats]);

  const importProjects = useCallback(
    async (importedProjects: Project[]): Promise<boolean> => {
      try {
        setError(null);
        const success = ProjectStorageService.importProjects(importedProjects);
        if (success) {
          await loadProjects();
        }
        return success;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to import projects"
        );
        return false;
      }
    },
    [loadProjects]
  );

  const clearAllProjects = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const success = ProjectStorageService.clearAllProjects();
      if (success) {
        await loadProjects(); // This will recreate the default project
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear projects");
      return false;
    }
  }, [loadProjects]);

  // === COLOR UTILITIES ===

  const getAvailableColors = useCallback((): ProjectColor[] => {
    return Object.values(ProjectColor);
  }, []);

  const getColorUsageCount = useCallback(
    (color: ProjectColor): number => {
      return projects.filter((project) => project.color === color).length;
    },
    [projects]
  );

  const getSuggestedColor = useCallback((): ProjectColor => {
    const colorCounts = Object.values(ProjectColor).map((color) => ({
      color,
      count: getColorUsageCount(color),
    }));

    // Sort by usage count (ascending) and return the least used color
    colorCounts.sort((a, b) => a.count - b.count);
    return colorCounts[0].color;
  }, [getColorUsageCount]);

  return {
    // State
    projects,
    projectsWithStats,
    loading,
    error,
    projectStats,

    // CRUD operations
    addProject,
    updateProject,
    deleteProject,

    // Getters
    getProjectById,
    getDefaultProject,
    getProjectsByColor,
    getCustomProjects,

    // Validation
    validateProjectName,
    getProjectNameSuggestion,

    // Bulk operations
    bulkUpdateProjects,
    bulkDeleteProjects,

    // Utility functions
    ensureDefaultProject,
    exportProjects,
    importProjects,
    clearAllProjects,
    loadProjects,

    // Color utilities
    getAvailableColors,
    getColorUsageCount,
    getSuggestedColor,
  };
}
