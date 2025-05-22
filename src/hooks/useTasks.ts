import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilter,
  TaskSort,
  TaskStats,
  SortBy,
  SortDirection,
  DueDateFilter,
  DEFAULT_FILTER,
  DEFAULT_SORT,
} from "../types";
import { TaskStorageService } from "../services";
import { useLocalStorage } from "./useLocalStorage";

/**
 * Custom hook for task management with React state integration
 * Provides CRUD operations, filtering, sorting, and statistics
 */
export function useTasks() {
  // State for tasks
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Persistent filter and sort state
  const [filter, setFilter] = useLocalStorage<TaskFilter>(
    "task_filter",
    DEFAULT_FILTER
  );
  const [sort, setSort] = useLocalStorage<TaskSort>("task_sort", DEFAULT_SORT);

  // Load tasks from storage
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedTasks = TaskStorageService.getTasks();
      setTasks(loadedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize tasks on mount
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // === CRUD OPERATIONS ===

  const addTask = useCallback(
    async (input: CreateTaskInput): Promise<Task | null> => {
      try {
        setError(null);
        const newTask = TaskStorageService.addTask(input);
        setTasks((prev) => [...prev, newTask]);
        return newTask;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add task");
        return null;
      }
    },
    []
  );

  const updateTask = useCallback(
    async (
      taskId: string,
      updates: Partial<Omit<Task, "id" | "createdAt">>
    ): Promise<Task | null> => {
      try {
        setError(null);
        const updatedTask = TaskStorageService.updateTask(taskId, updates);
        if (updatedTask) {
          setTasks((prev) =>
            prev.map((task) => (task.id === taskId ? updatedTask : task))
          );
          return updatedTask;
        }
        return null;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update task");
        return null;
      }
    },
    []
  );

  const deleteTask = useCallback(async (taskId: string): Promise<boolean> => {
    try {
      setError(null);
      const success = TaskStorageService.deleteTask(taskId);
      if (success) {
        setTasks((prev) => prev.filter((task) => task.id !== taskId));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
      return false;
    }
  }, []);

  const toggleTask = useCallback(
    async (taskId: string): Promise<Task | null> => {
      try {
        setError(null);
        const updatedTask = TaskStorageService.toggleTask(taskId);
        if (updatedTask) {
          setTasks((prev) =>
            prev.map((task) => (task.id === taskId ? updatedTask : task))
          );
          return updatedTask;
        }
        return null;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to toggle task");
        return null;
      }
    },
    []
  );

  const clearCompletedTasks = useCallback(async (): Promise<number> => {
    try {
      setError(null);
      const deletedCount = TaskStorageService.clearCompletedTasks();
      setTasks((prev) => prev.filter((task) => !task.completed));
      return deletedCount;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to clear completed tasks"
      );
      return 0;
    }
  }, []);

  // === FILTERING AND SORTING ===

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = [...tasks];

    // Apply search filter
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (filter.status && filter.status !== "all") {
      filtered = filtered.filter((task) => task.status === filter.status);
    }

    // Apply priority filter
    if (filter.priority && filter.priority !== "all") {
      filtered = filtered.filter((task) => task.priority === filter.priority);
    }

    // Apply project filter
    if (filter.projectId && filter.projectId !== "all") {
      filtered = filtered.filter((task) => task.projectId === filter.projectId);
    }

    // Apply completed filter
    if (filter.showCompleted === false) {
      filtered = filtered.filter((task) => !task.completed);
    }

    // Apply due date filter
    if (filter.dueDate && filter.dueDate !== DueDateFilter.ALL) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const thisWeekEnd = new Date(today);
      thisWeekEnd.setDate(thisWeekEnd.getDate() + (7 - today.getDay()));
      const nextWeekEnd = new Date(thisWeekEnd);
      nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);

      filtered = filtered.filter((task) => {
        if (!task.dueDate) {
          return filter.dueDate === DueDateFilter.NO_DUE_DATE;
        }

        const dueDate = new Date(task.dueDate);
        const dueDateOnly = new Date(
          dueDate.getFullYear(),
          dueDate.getMonth(),
          dueDate.getDate()
        );

        switch (filter.dueDate) {
          case DueDateFilter.TODAY:
            return dueDateOnly.getTime() === today.getTime();
          case DueDateFilter.TOMORROW:
            return dueDateOnly.getTime() === tomorrow.getTime();
          case DueDateFilter.THIS_WEEK:
            return dueDateOnly >= today && dueDateOnly <= thisWeekEnd;
          case DueDateFilter.NEXT_WEEK:
            return dueDateOnly > thisWeekEnd && dueDateOnly <= nextWeekEnd;
          case DueDateFilter.OVERDUE:
            return dueDateOnly < today && !task.completed;
          case DueDateFilter.NO_DUE_DATE:
            return false;
          default:
            return true;
        }
      });
    }

    // Apply tags filter
    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter((task) =>
        filter.tags!.some((filterTag) => task.tags?.includes(filterTag))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sort.sortBy) {
        case SortBy.TITLE:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case SortBy.CREATED_DATE:
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case SortBy.UPDATED_DATE:
          aValue = a.updatedAt.getTime();
          bValue = b.updatedAt.getTime();
          break;
        case SortBy.DUE_DATE:
          aValue = a.dueDate?.getTime() || Infinity;
          bValue = b.dueDate?.getTime() || Infinity;
          break;
        case SortBy.PRIORITY:
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case SortBy.STATUS:
          const statusOrder = { todo: 1, in_progress: 2, completed: 3 };
          aValue = statusOrder[a.status];
          bValue = statusOrder[b.status];
          break;
        default:
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
      }

      if (aValue < bValue) {
        return sort.direction === SortDirection.ASC ? -1 : 1;
      }
      if (aValue > bValue) {
        return sort.direction === SortDirection.ASC ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [tasks, filter, sort]);

  // === STATISTICS ===

  const stats = useMemo((): TaskStats => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return {
      total: tasks.length,
      completed: tasks.filter((task) => task.completed).length,
      pending: tasks.filter((task) => !task.completed).length,
      overdue: tasks.filter(
        (task) =>
          task.dueDate && new Date(task.dueDate) < today && !task.completed
      ).length,
      highPriority: tasks.filter(
        (task) => task.priority === "high" && !task.completed
      ).length,
    };
  }, [tasks]);

  // === FILTER AND SORT HELPERS ===

  const updateFilter = useCallback(
    (newFilter: Partial<TaskFilter>) => {
      setFilter((prev) => ({ ...prev, ...newFilter }));
    },
    [setFilter]
  );

  const updateSort = useCallback(
    (newSort: Partial<TaskSort>) => {
      setSort((prev) => ({ ...prev, ...newSort }));
    },
    [setSort]
  );

  const clearFilters = useCallback(() => {
    setFilter(DEFAULT_FILTER);
  }, [setFilter]);

  const resetSort = useCallback(() => {
    setSort(DEFAULT_SORT);
  }, [setSort]);

  // === BULK OPERATIONS ===

  const moveTasksToProject = useCallback(
    async (taskIds: string[], projectId: string): Promise<boolean> => {
      try {
        setError(null);
        const success = TaskStorageService.moveTasksToProject(
          taskIds,
          projectId
        );
        if (success) {
          setTasks((prev) =>
            prev.map((task) =>
              taskIds.includes(task.id)
                ? { ...task, projectId, updatedAt: new Date() }
                : task
            )
          );
        }
        return success;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to move tasks");
        return false;
      }
    },
    []
  );

  const bulkUpdateTasks = useCallback(
    async (
      taskIds: string[],
      updates: Partial<Omit<Task, "id" | "createdAt">>
    ): Promise<boolean> => {
      try {
        setError(null);
        let success = true;

        for (const taskId of taskIds) {
          const result = TaskStorageService.updateTask(taskId, updates);
          if (!result) success = false;
        }

        if (success) {
          setTasks((prev) =>
            prev.map((task) =>
              taskIds.includes(task.id)
                ? { ...task, ...updates, updatedAt: new Date() }
                : task
            )
          );
        }
        return success;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to bulk update tasks"
        );
        return false;
      }
    },
    []
  );

  const bulkDeleteTasks = useCallback(
    async (taskIds: string[]): Promise<number> => {
      try {
        setError(null);
        let deletedCount = 0;

        for (const taskId of taskIds) {
          const success = TaskStorageService.deleteTask(taskId);
          if (success) deletedCount++;
        }

        setTasks((prev) => prev.filter((task) => !taskIds.includes(task.id)));
        return deletedCount;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to bulk delete tasks"
        );
        return 0;
      }
    },
    []
  );

  // === UTILITY FUNCTIONS ===

  const getTasksByProject = useCallback(
    (projectId: string): Task[] => {
      return tasks.filter((task) => task.projectId === projectId);
    },
    [tasks]
  );

  const getTaskById = useCallback(
    (taskId: string): Task | undefined => {
      return tasks.find((task) => task.id === taskId);
    },
    [tasks]
  );

  const getAllTags = useMemo((): string[] => {
    const tagSet = new Set<string>();
    tasks.forEach((task) => {
      task.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [tasks]);

  return {
    // State
    tasks: filteredAndSortedTasks,
    allTasks: tasks,
    loading,
    error,
    stats,
    filter,
    sort,

    // CRUD operations
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    clearCompletedTasks,

    // Filtering and sorting
    updateFilter,
    updateSort,
    clearFilters,
    resetSort,

    // Bulk operations
    moveTasksToProject,
    bulkUpdateTasks,
    bulkDeleteTasks,

    // Utility functions
    getTasksByProject,
    getTaskById,
    getAllTags,
    loadTasks,
  };
}
