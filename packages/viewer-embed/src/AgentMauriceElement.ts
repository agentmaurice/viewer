import React from "react";
import { createRoot } from "react-dom/client";
import {
  ExternalAuthAdapter,
  ViewerBootstrap,
  ViewerStateMachine,
  ViewerAPIClient,
  type ViewerInstance,
  type ViewerStateController,
} from "@agent-maurice/viewer-core";
import { defaultWebRegistry, ViewerRoot } from "@agent-maurice/viewer-web";
import { createMockEmbedController } from "./mock-controller";
import styles from "./styles.css?raw";

export interface EmbedConfig {
  deploymentId?: string;
  recipeId?: string;
  slug?: string;
  mockScenario?: string;
  authToken?: string;
  apiURL: string;
  theme?: Partial<{
    primary: string;
    secondary: string;
    radius: string;
    fontFamily: string;
  }>;
  seedState?: Record<string, unknown>;
}

export function parseEmbedAttributes(
  attrs: Record<string, string>,
): EmbedConfig {
  const deploymentId = attrs["deployment-id"];
  const recipeId = attrs["recipe-id"];
  const slug = attrs["slug"];
  const mockScenario = attrs["mock-scenario"];
  const authToken = attrs["auth-token"];
  const apiURL =
    attrs["api-url"] || attrs["api-base-url"] || "https://api.agentmaurice.dev";

  if (!deploymentId && !slug && !mockScenario) {
    throw new Error("Missing required attribute: deployment-id, slug or mock-scenario");
  }

  const config: EmbedConfig = {
    deploymentId,
    recipeId,
    slug,
    mockScenario,
    authToken,
    apiURL,
  };

  // Parse theme overrides
  const themePrimary = attrs["theme-primary"];
  const themeSecondary = attrs["theme-secondary"];
  const themeRadius = attrs["theme-radius"];
  const themeFontFamily = attrs["theme-font-family"];

  if (themePrimary || themeSecondary || themeRadius || themeFontFamily) {
    config.theme = {};
    if (themePrimary) config.theme.primary = themePrimary;
    if (themeSecondary) config.theme.secondary = themeSecondary;
    if (themeRadius) config.theme.radius = themeRadius;
    if (themeFontFamily) config.theme.fontFamily = themeFontFamily;
  }

  // Parse seed state JSON
  const seedStateStr = attrs["seed-state"];
  if (seedStateStr) {
    try {
      config.seedState = JSON.parse(seedStateStr);
    } catch (err) {
      console.warn("Failed to parse seed-state JSON:", err);
    }
  }

  return config;
}

function mergeTheme(
  config:
    | Partial<{
        primary: string;
        secondary: string;
        radius: string;
        fontFamily: string;
      }>
    | undefined,
  rootElement: HTMLElement,
): void {
  if (config?.primary) {
    rootElement.style.setProperty("--am-primary", config.primary);
  }
  if (config?.secondary) {
    rootElement.style.setProperty("--am-secondary", config.secondary);
  }
  if (config?.radius) {
    rootElement.style.setProperty("--am-radius", config.radius);
  }
  if (config?.fontFamily) {
    rootElement.style.setProperty("--am-font", config.fontFamily);
  }
}

export class AgentMauriceElement extends HTMLElement {
  private reactRoot: ReturnType<typeof createRoot> | null = null;
  private stateMachine: ViewerStateMachine | null = null;
  private apiClient: ViewerAPIClient | null = null;
  private viewerInstance: ViewerInstance | null = null;
  private mockController: ViewerStateController | null = null;
  private stateUnsubscribe: (() => void) | null = null;
  private connectVersion = 0;

  connectedCallback(): void {
    try {
      const connectVersion = ++this.connectVersion;

      // Get element attributes
      const config = parseEmbedAttributes(this.getAttributeMap());

      // Create Shadow DOM
      const shadowRoot = this.shadowRoot ?? this.attachShadow({ mode: "open" });
      shadowRoot.innerHTML = "";

      // Inject styles
      const styleElement = document.createElement("style");
      styleElement.textContent = styles;
      shadowRoot.appendChild(styleElement);

      // Create container for React
      const container = document.createElement("div");
      container.style.width = "100%";
      container.style.height = "100%";
      shadowRoot.appendChild(container);

      // Merge theme overrides into container
      mergeTheme(config.theme, container);

      if (config.mockScenario) {
        this.mockController = createMockEmbedController(config.mockScenario);
        this.renderViewerRoot(container, this.mockController);
        this.setupEventForwarding();
        return;
      }

      if (config.slug || (config.deploymentId && !config.recipeId)) {
        const authAdapter = config.authToken
          ? new ExternalAuthAdapter({
              user: { id: "embed-user" },
              getToken: async () => config.authToken!,
            })
          : undefined;

        ViewerBootstrap.init({
          deploymentId: config.deploymentId,
          slug: config.slug,
          apiBaseUrl: config.apiURL,
          authAdapter,
          seedState: config.seedState,
        })
          .then((instance) => {
            if (connectVersion !== this.connectVersion || !this.isConnected) {
              instance.destroy();
              return;
            }
            this.viewerInstance = instance;
            this.renderViewerRoot(container, this.createController(instance));
            this.setupEventForwarding();
          })
          .catch((err) => {
            if (connectVersion !== this.connectVersion || !this.isConnected) {
              return;
            }
            console.error("Failed to initialize AgentMauriceElement:", err);
            if (this.shadowRoot) {
              this.shadowRoot.innerHTML = `
              <div style="color: red; padding: 1rem; font-family: monospace; font-size: 12px;">
                Error initializing viewer: ${err instanceof Error ? err.message : String(err)}
              </div>
            `;
            }
          });
        return;
      }

      // Create API client
      this.apiClient = new ViewerAPIClient(config.apiURL);

      // Create state machine
      this.stateMachine = new ViewerStateMachine(
        this.apiClient,
        config.deploymentId,
        config.recipeId,
        config.seedState,
      );

      // Mount React component
      this.renderViewerRoot(container, this.stateMachine);

      // Set up event forwarding
      this.setupEventForwarding();

      // Initialize the state machine
      this.stateMachine.initialize();
    } catch (err) {
      console.error("Failed to initialize AgentMauriceElement:", err);
      if (this.shadowRoot) {
        this.shadowRoot.innerHTML = `
          <div style="color: red; padding: 1rem; font-family: monospace; font-size: 12px;">
            Error initializing viewer: ${err instanceof Error ? err.message : String(err)}
          </div>
        `;
      }
    }
  }

  disconnectedCallback(): void {
    this.connectVersion += 1;
    if (this.stateUnsubscribe) {
      this.stateUnsubscribe();
      this.stateUnsubscribe = null;
    }
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }
    if (this.stateMachine) {
      this.stateMachine.destroy();
      this.stateMachine = null;
    }
    if (this.viewerInstance) {
      this.viewerInstance.destroy();
      this.viewerInstance = null;
    }
    if (this.mockController) {
      this.mockController = null;
    }
    if (this.apiClient) {
      this.apiClient = null;
    }
  }

  private getAttributeMap(): Record<string, string> {
    const map: Record<string, string> = {};
    for (const attr of this.attributes) {
      map[attr.name] = attr.value;
    }
    return map;
  }

  private renderViewerRoot(
    container: HTMLElement,
    controller: ViewerStateController,
  ): void {
    if (this.reactRoot) {
      this.reactRoot.unmount();
    }
    this.reactRoot = createRoot(container);
    this.reactRoot.render(
      React.createElement(ViewerRoot, {
        stateMachine: controller,
        registry: defaultWebRegistry,
        className: "am-embed",
      }),
    );
  }

  private createController(instance: ViewerInstance): ViewerStateController {
    return {
      getState: () => instance.state,
      subscribe: (listener) => instance.subscribe(listener),
      dispatchEvent: (eventId, payload, formData) =>
        instance.sendEvent(eventId, payload, formData),
    };
  }

  private getController(): ViewerStateController | null {
    if (this.mockController) {
      return this.mockController;
    }
    if (this.viewerInstance) {
      return this.createController(this.viewerInstance);
    }
    return this.stateMachine;
  }

  private setupEventForwarding(): void {
    const controller = this.getController();
    if (!controller) return;
    if (this.stateUnsubscribe) {
      this.stateUnsubscribe();
    }

    // Subscribe to state changes and emit custom events
    this.stateUnsubscribe = controller.subscribe((state) => {
      if ((state.runtime as any)?.completed) {
        this.dispatchEvent(
          new CustomEvent("am:complete", {
            detail: {
              finalState: state,
              result: (state.runtime as any)?.result,
            },
            bubbles: true,
            composed: true,
          }),
        );
      }
    });

    // You could also listen for errors here if the state machine emits them
    // For now, we'll catch them in the event handlers
  }

  // Public method to dispatch events to the state machine
  public dispatchViewerEvent(
    eventId: string,
    payload?: Record<string, unknown>,
  ): void {
    const controller = this.getController();
    if (controller) {
      try {
        controller.dispatchEvent(eventId, payload || {});
      } catch (err) {
        this.dispatchEvent(
          new CustomEvent("am:error", {
            detail: {
              message: err instanceof Error ? err.message : String(err),
              eventId,
              payload,
            },
            bubbles: true,
            composed: true,
          }),
        );
      }
    }
  }

  // Public method to get current state
  public getCurrentState() {
    return this.getController()?.getState();
  }
}
