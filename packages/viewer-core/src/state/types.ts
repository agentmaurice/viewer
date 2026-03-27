import type { MiniAppRuntimePayload } from "../types/protocol";

export type ViewerPhase = "idle" | "loading" | "ready" | "sending" | "error";
export type ViewerState = {
  phase: ViewerPhase;
  runtime: MiniAppRuntimePayload | null;
  error: string | null;
};
export type ViewerStateListener = (state: ViewerState) => void;

export interface ViewerStateController {
  getState(): ViewerState;
  subscribe(listener: ViewerStateListener): () => void;
  dispatchEvent(
    eventId: string,
    payload: Record<string, unknown>,
    formData?: Record<string, unknown>,
  ): Promise<void>;
}
