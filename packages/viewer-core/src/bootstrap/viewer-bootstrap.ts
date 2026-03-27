import { APIKeyAuthAdapter } from "../auth/api-key-adapter";
import type { AuthAdapter } from "../auth/auth-adapter";
import { ViewerAPIClient } from "../client/api-client";
import { ViewerStateMachine } from "../state/state-machine";
import { fetchBootstrapConfig, resolveSlug } from "./bootstrap-api";
import { ViewerError } from "./bootstrap-types";
import type {
  ViewerBootstrapConfig,
  ViewerBootstrapResponse,
  ViewerInstance,
} from "./bootstrap-types";

export interface ViewerBootstrapInitConfig extends ViewerBootstrapConfig {
  fetch?: typeof globalThis.fetch;
}

export class ViewerBootstrap {
  static async init(
    config: ViewerBootstrapInitConfig,
  ): Promise<ViewerInstance> {
    try {
      if (!config.deploymentId && !config.slug) {
        throw new ViewerError(
          "invalid_config",
          "ViewerBootstrap.init() requires either deploymentId or slug",
        );
      }

      const apiBaseUrl = config.apiBaseUrl ?? "https://api.agentmaurice.com";
      const fetchFn = config.fetch ?? globalThis.fetch.bind(globalThis);
      let authAdapter = config.authAdapter;
      let bootstrapHeaders: HeadersInit | undefined;
      if (authAdapter) {
        await authAdapter.authenticate();
        const token = await authAdapter.getToken();
        if (token) {
          bootstrapHeaders = { Authorization: `Bearer ${token}` };
        }
      }
      const bootstrapResponse = config.slug
        ? await resolveSlug({
            slug: config.slug,
            apiBaseUrl,
            fetch: fetchFn,
            headers: bootstrapHeaders,
          })
        : await fetchBootstrapConfig({
            deploymentId: config.deploymentId!,
            apiBaseUrl,
            fetch: fetchFn,
            headers: bootstrapHeaders,
          });

      if (bootstrapResponse.config.enabled === false) {
        throw new ViewerError(
          "viewer_disabled",
          "Viewer is disabled for this deployment",
        );
      }

      authAdapter = authAdapter ?? resolveAuthAdapter(bootstrapResponse);
      if (!config.authAdapter) {
        await authAdapter.authenticate();
      }

      const client = new ViewerAPIClient({
        baseURL: bootstrapResponse.api_base_url || apiBaseUrl,
        authAdapter,
        fetch: fetchFn,
      });

      const stateMachine = new ViewerStateMachine(client);
      const recipeId =
        config.recipeId ?? bootstrapResponse.config.default_recipe_id;
      if (!recipeId) {
        throw new ViewerError(
          "missing_recipe",
          "Viewer bootstrap did not provide a default recipe",
        );
      }

      await stateMachine.init(bootstrapResponse.deployment_id, recipeId, {
        seedState: config.seedState,
      });
      const state = stateMachine.getState();
      if (state.phase === "error" || !state.runtime) {
        throw new ViewerError(
          "init_failed",
          state.error ?? "Viewer initialization failed",
        );
      }

      const instance: ViewerInstance = {
        get state() {
          return stateMachine.getState();
        },
        bootstrapResponse,
        subscribe(listener) {
          return stateMachine.subscribe(listener);
        },
        async sendEvent(eventId, payload, formData) {
          await stateMachine.dispatchEvent(eventId, payload ?? {}, formData);
          const current = stateMachine.getState();
          if (current.phase === "error") {
            throw new ViewerError(
              "event_failed",
              current.error ?? "Viewer event failed",
            );
          }
        },
        async sendAction(action) {
          await instance.sendEvent(
            action.event_id,
            action.payload_template ?? {},
          );
        },
        destroy() {
          stateMachine.destroy();
        },
      };

      config.onReady?.(instance);
      return instance;
    } catch (error) {
      const viewerError =
        error instanceof ViewerError
          ? error
          : new ViewerError(
              "init_failed",
              error instanceof Error ? error.message : String(error),
            );
      config.onError?.(viewerError);
      throw viewerError;
    }
  }
}

function resolveAuthAdapter(bootstrap: ViewerBootstrapResponse): AuthAdapter {
  const authMode = bootstrap.config.auth_mode;
  const providerConfig = bootstrap.config.auth_provider_config ?? {};

  switch (authMode) {
    case "api_key": {
      const token =
        providerConfig.api_key ??
        providerConfig.public_token ??
        providerConfig.viewer_token;
      if (typeof token !== "string" || token.length === 0) {
        throw new ViewerError(
          "missing_api_key",
          "Public viewer token not found in bootstrap config",
        );
      }
      return new APIKeyAuthAdapter(token);
    }
    case "external":
      throw new ViewerError(
        "external_auth_required",
        "External auth mode requires an explicit authAdapter",
      );
    case "firebase":
    case "supabase":
    case "oidc":
      throw new ViewerError(
        "auth_adapter_required",
        `${authMode} auth requires an explicit authAdapter`,
      );
    default:
      throw new ViewerError(
        "unknown_auth_mode",
        `Unknown auth mode: ${authMode}`,
      );
  }
}
