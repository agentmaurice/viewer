import { createContext, useContext } from "react";
import type {
  ViewerStateController,
  ComponentRegistry,
} from "@agent-maurice/viewer-core";

export type ViewerContextValue = {
  stateMachine: ViewerStateController;
  registry: ComponentRegistry<React.ComponentType<any>>;
};

export const ViewerContext = createContext<ViewerContextValue | null>(null);

export function useViewerContext(): ViewerContextValue {
  const ctx = useContext(ViewerContext);
  if (!ctx)
    throw new Error("useViewerContext must be used within <ViewerRoot>");
  return ctx;
}
