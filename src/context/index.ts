// src/context/index.ts
export {
  AppProvider,
  useAppContext,
  useAppState,
  useTasksContext,
  useProjectsContext,
  useAppSettings,
  useAppModals,
} from "./AppContext";

export type {
  AppState,
  AppAction,
  AppSettings,
  AppContextType,
  Theme,
} from "./AppContext";
