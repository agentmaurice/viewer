import type { MiniAppRuntimePayload } from "../types/protocol";
import type { AppEventRequest, ViewerApiError } from "../types/events";
import type { AuthAdapter } from "../auth/auth-adapter";

export type ViewerAPIConfig = {
  baseURL: string;
  fetch?: typeof globalThis.fetch;
  authAdapter?: AuthAdapter;
  getAuthToken?: () => Promise<string | null>;
  headers?: Record<string, string>;
  onErrorResponse?: (context: {
    response: Response;
    body: ViewerApiError;
  }) => Promise<void> | void;
};

export class ViewerAPIClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ViewerAPIClientError";
  }
}

export class ViewerAPIClient {
  private config: ViewerAPIConfig;
  private fetchFn: typeof globalThis.fetch;

  constructor(config: ViewerAPIConfig) {
    this.config = config;
    this.fetchFn = config.fetch ?? globalThis.fetch.bind(globalThis);
  }

  private async buildHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...this.config.headers,
    };
    if (this.config.authAdapter) {
      const token = await this.config.authAdapter.getToken();
      headers["Authorization"] = `Bearer ${token}`;
    } else if (this.config.getAuthToken) {
      const token = await this.config.getAuthToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.config.baseURL}${path}`;
    const headers = await this.buildHeaders();
    const response = await this.fetchFn(url, { ...options, headers });
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as ViewerApiError;
      await this.config.onErrorResponse?.({ response, body });
      throw new ViewerAPIClientError(
        body.error?.code ?? `http_${response.status}`,
        body.error?.message ?? `HTTP ${response.status}`,
        response.status,
        body.error?.details,
      );
    }
    return response.json() as Promise<T>;
  }

  async createInstance(
    deploymentId: string,
    recipeId: string,
    options?: {
      recipeVersion?: string;
      seedState?: Record<string, unknown>;
      seedData?: Record<string, unknown>;
    },
  ): Promise<MiniAppRuntimePayload> {
    return this.request(`/app/${deploymentId}/${recipeId}/instances`, {
      method: "POST",
      body: JSON.stringify({
        recipe_version: options?.recipeVersion,
        seed_state: options?.seedState,
        seed_data: options?.seedData,
      }),
    });
  }

  async getInstance(appInstanceId: string): Promise<MiniAppRuntimePayload> {
    return this.request(`/app/instances/${appInstanceId}`);
  }

  async sendEvent(
    appInstanceId: string,
    eventId: string,
    payload: AppEventRequest,
  ): Promise<MiniAppRuntimePayload> {
    return this.request(`/app/instances/${appInstanceId}/events/${eventId}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
}
