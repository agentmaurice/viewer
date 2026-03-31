import type { AuthAdapter } from "../auth/auth-adapter";
import type { ViewerState } from "../state/types";
import type { AppActionBinding } from "../types/events";

export type ViewerAuthMode =
  | "none"
  | "api_key"
  | "firebase"
  | "supabase"
  | "oidc"
  | "external"
  | string;

export interface ViewerBootstrapRecipe {
  id: string;
  name: string;
  description?: string;
  version?: string;
}

export interface ViewerBootstrapConfigResponse {
  default_recipe_id?: string;
  auth_mode: ViewerAuthMode;
  auth_provider_config?: Record<string, unknown>;
  enabled: boolean;
  title?: string;
  slug?: string;
}

export interface ViewerBootstrapResponse {
  deployment_id: string;
  organization_id?: string;
  api_base_url: string;
  config: ViewerBootstrapConfigResponse;
  recipes?: ViewerBootstrapRecipe[];
}

export interface ViewerBootstrapConfig {
  deploymentId?: string;
  slug?: string;
  recipeId?: string;
  apiBaseUrl?: string;
  authAdapter?: AuthAdapter;
  seedState?: Record<string, unknown>;
  onReady?: (instance: ViewerInstance) => void;
  onError?: (error: ViewerError) => void;
}

export interface ViewerInstance {
  readonly state: ViewerState;
  readonly bootstrapResponse: ViewerBootstrapResponse;
  subscribe(listener: (state: ViewerState) => void): () => void;
  sendEvent(
    eventId: string,
    payload?: Record<string, unknown>,
    formData?: Record<string, unknown>,
  ): Promise<void>;
  sendAction(action: AppActionBinding): Promise<void>;
  destroy(): void;
}

export class ViewerError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ViewerError";
    this.code = code;
    this.details = details;
  }
}
