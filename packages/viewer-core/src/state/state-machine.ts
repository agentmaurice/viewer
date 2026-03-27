import type { ViewerState, ViewerStateListener } from "./types";
import type { ViewerAPIClient } from "../client/api-client";

export class ViewerStateMachine {
  private state: ViewerState = { phase: "idle", runtime: null, error: null };
  private listeners = new Set<ViewerStateListener>();
  private client: ViewerAPIClient;
  private deploymentId?: string;
  private recipeId?: string;
  private seedState?: Record<string, unknown>;

  constructor(
    client: ViewerAPIClient,
    deploymentId?: string,
    recipeId?: string,
    seedState?: Record<string, unknown>,
  ) {
    this.client = client;
    this.deploymentId = deploymentId;
    this.recipeId = recipeId;
    this.seedState = seedState;
  }

  getState(): ViewerState {
    return this.state;
  }

  subscribe(listener: ViewerStateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private setState(updates: Partial<ViewerState>): void {
    this.state = { ...this.state, ...updates };
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  async init(
    deploymentId: string,
    recipeId: string,
    options?: { seedState?: Record<string, unknown> },
  ): Promise<void> {
    this.deploymentId = deploymentId;
    this.recipeId = recipeId;
    this.seedState = options?.seedState;
    this.setState({ phase: "loading", error: null });
    try {
      const runtime = await this.client.createInstance(deploymentId, recipeId, {
        seedState: options?.seedState,
      });
      this.setState({ phase: "ready", runtime });
    } catch (err) {
      this.setState({
        phase: "error",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async initialize(): Promise<void> {
    if (!this.deploymentId || !this.recipeId) {
      throw new Error(
        "ViewerStateMachine requires deploymentId and recipeId for initialize()",
      );
    }
    await this.init(this.deploymentId, this.recipeId, {
      seedState: this.seedState,
    });
  }

  async resume(appInstanceId: string): Promise<void> {
    this.setState({ phase: "loading", error: null });
    try {
      const runtime = await this.client.getInstance(appInstanceId);
      this.setState({ phase: "ready", runtime });
    } catch (err) {
      this.setState({
        phase: "error",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async dispatchEvent(
    eventId: string,
    payload: Record<string, unknown>,
    formData?: Record<string, unknown>,
  ): Promise<void> {
    if (!this.state.runtime) throw new Error("Viewer not initialized");
    this.setState({ phase: "sending", error: null });
    try {
      const runtime = await this.client.sendEvent(
        this.state.runtime.app_instance_id,
        eventId,
        {
          payload,
          form_data: formData,
          expected_state_version: this.state.runtime.state_version,
        },
      );
      this.setState({ phase: "ready", runtime });
    } catch (err) {
      this.setState({
        phase: "error",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  destroy(): void {
    this.listeners.clear();
  }
}
