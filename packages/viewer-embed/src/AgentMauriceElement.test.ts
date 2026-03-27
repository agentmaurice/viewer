import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockRender,
  mockUnmount,
  mockCreateRoot,
  mockBootstrapInit,
  mockCreateMockEmbedController,
  mockMockController,
  mockStateMachineInitialize,
  mockStateMachineDestroy,
  mockStateMachineSubscribe,
  mockStateMachineDispatchEvent,
  mockStateMachineGetState,
  MockViewerStateMachine,
  MockViewerAPIClient,
  MockExternalAuthAdapter,
} = vi.hoisted(() => {
  const mockRender = vi.fn();
  const mockUnmount = vi.fn();
  const mockCreateRoot = vi.fn(() => ({
    render: mockRender,
    unmount: mockUnmount,
  }));

  const mockBootstrapInit = vi.fn();
  const mockMockController = {
    getState: vi.fn(() => ({
      phase: "ready",
      runtime: {
        ui: { tree: { type: "text", value: "Mock" } },
      },
      error: null,
    })),
    subscribe: vi.fn(() => () => {}),
    dispatchEvent: vi.fn(),
  };
  const mockCreateMockEmbedController = vi.fn(() => mockMockController);
  const mockStateMachineInitialize = vi.fn();
  const mockStateMachineDestroy = vi.fn();
  const mockStateMachineSubscribe = vi.fn(() => () => {});
  const mockStateMachineDispatchEvent = vi.fn();
  const mockStateMachineGetState = vi.fn(() => ({
    phase: "idle",
    runtime: null,
    error: null,
  }));
  const MockViewerStateMachine = vi.fn().mockImplementation(() => ({
    initialize: mockStateMachineInitialize,
    destroy: mockStateMachineDestroy,
    subscribe: mockStateMachineSubscribe,
    dispatchEvent: mockStateMachineDispatchEvent,
    getState: mockStateMachineGetState,
  }));
  const MockViewerAPIClient = vi.fn();
  const MockExternalAuthAdapter = vi
    .fn()
    .mockImplementation((config) => config);

  return {
    mockRender,
    mockUnmount,
    mockCreateRoot,
    mockBootstrapInit,
    mockCreateMockEmbedController,
    mockMockController,
    mockStateMachineInitialize,
    mockStateMachineDestroy,
    mockStateMachineSubscribe,
    mockStateMachineDispatchEvent,
    mockStateMachineGetState,
    MockViewerStateMachine,
    MockViewerAPIClient,
    MockExternalAuthAdapter,
  };
});

vi.mock("react-dom/client", () => ({
  createRoot: mockCreateRoot,
}));

vi.mock("@agent-maurice/viewer-core", () => ({
  ViewerBootstrap: {
    init: mockBootstrapInit,
  },
  ViewerStateMachine: MockViewerStateMachine,
  ViewerAPIClient: MockViewerAPIClient,
  ExternalAuthAdapter: MockExternalAuthAdapter,
}));

vi.mock("@agent-maurice/viewer-web", () => ({
  defaultWebRegistry: {},
  ViewerRoot: function ViewerRoot() {
    return React.createElement("div", null, "viewer-root");
  },
}));

vi.mock("./mock-controller", () => ({
  createMockEmbedController: mockCreateMockEmbedController,
}));

import {
  AgentMauriceElement,
  parseEmbedAttributes,
} from "./AgentMauriceElement";

function createBootstrapInstance() {
  return {
    get state() {
      return {
        phase: "ready",
        runtime: {
          ui: { tree: { type: "text", value: "Hello" } },
        },
        error: null,
      };
    },
    bootstrapResponse: {
      deployment_id: "dep_123",
      api_base_url: "https://api.example.com",
      config: {
        auth_mode: "api_key",
        enabled: true,
      },
    },
    subscribe: vi.fn(() => () => {}),
    sendEvent: vi.fn(async () => undefined),
    sendAction: vi.fn(async () => undefined),
    destroy: vi.fn(),
  };
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("parseEmbedAttributes", () => {
  it("should extract deployment-id and recipe-id", () => {
    const config = parseEmbedAttributes({
      "deployment-id": "deploy_xyz",
      "recipe-id": "contact_form",
    });
    expect(config.deploymentId).toBe("deploy_xyz");
    expect(config.recipeId).toBe("contact_form");
  });

  it("should accept slug without deployment-id", () => {
    const config = parseEmbedAttributes({
      slug: "contact-form",
    });
    expect(config.slug).toBe("contact-form");
    expect(config.deploymentId).toBeUndefined();
  });

  it("should accept mock-scenario without deployment-id or slug", () => {
    const config = parseEmbedAttributes({
      "mock-scenario": "sales-cockpit",
    });
    expect(config.mockScenario).toBe("sales-cockpit");
    expect(config.slug).toBeUndefined();
    expect(config.deploymentId).toBeUndefined();
  });

  it("should extract api-url", () => {
    const config = parseEmbedAttributes({
      "deployment-id": "d1",
      "recipe-id": "r1",
      "api-url": "https://custom.api.com",
    });
    expect(config.apiURL).toBe("https://custom.api.com");
  });

  it("should extract api-base-url alias", () => {
    const config = parseEmbedAttributes({
      "deployment-id": "d1",
      "api-base-url": "https://custom.api.com",
    });
    expect(config.apiURL).toBe("https://custom.api.com");
  });

  it("should extract auth-token", () => {
    const config = parseEmbedAttributes({
      "deployment-id": "d1",
      "auth-token": "jwt_123",
    });
    expect(config.authToken).toBe("jwt_123");
  });

  it("should use default api-url if not provided", () => {
    const config = parseEmbedAttributes({
      "deployment-id": "d1",
      "recipe-id": "r1",
    });
    expect(config.apiURL).toBe("https://api.agentmaurice.dev");
  });

  it("should extract theme overrides", () => {
    const config = parseEmbedAttributes({
      "deployment-id": "d1",
      "recipe-id": "r1",
      "theme-primary": "#7C3AED",
      "theme-radius": "8px",
    });
    expect(config.theme?.primary).toBe("#7C3AED");
    expect(config.theme?.radius).toBe("8px");
  });

  it("should extract all theme options", () => {
    const config = parseEmbedAttributes({
      "deployment-id": "d1",
      "recipe-id": "r1",
      "theme-primary": "#FF0000",
      "theme-secondary": "#00FF00",
      "theme-radius": "12px",
      "theme-font-family": "Georgia",
    });
    expect(config.theme?.primary).toBe("#FF0000");
    expect(config.theme?.secondary).toBe("#00FF00");
    expect(config.theme?.radius).toBe("12px");
    expect(config.theme?.fontFamily).toBe("Georgia");
  });

  it("should throw if deployment-id, slug and mock-scenario are all missing", () => {
    expect(() => parseEmbedAttributes({ "recipe-id": "r1" })).toThrow(
      "deployment-id, slug or mock-scenario",
    );
  });

  it("should parse seed-state JSON", () => {
    const config = parseEmbedAttributes({
      "deployment-id": "d1",
      "recipe-id": "r1",
      "seed-state": '{"name":"test","count":42}',
    });
    expect(config.seedState).toEqual({ name: "test", count: 42 });
  });

  it("should handle invalid seed-state JSON gracefully", () => {
    const config = parseEmbedAttributes({
      "deployment-id": "d1",
      "recipe-id": "r1",
      "seed-state": "not-valid-json",
    });
    expect(config.seedState).toBeUndefined();
  });

  it("should not include theme if no theme attributes provided", () => {
    const config = parseEmbedAttributes({
      "deployment-id": "d1",
      "recipe-id": "r1",
    });
    expect(config.theme).toBeUndefined();
  });
});

describe("AgentMauriceElement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
    if (!customElements.get("agent-maurice-viewer-test")) {
      customElements.define("agent-maurice-viewer-test", AgentMauriceElement);
    }
  });

  it("uses ViewerBootstrap when slug is present", async () => {
    mockBootstrapInit.mockResolvedValue(createBootstrapInstance());

    const element = document.createElement(
      "agent-maurice-viewer-test",
    ) as AgentMauriceElement;
    element.setAttribute("slug", "contact-form");
    document.body.appendChild(element);

    await Promise.resolve();
    await Promise.resolve();

    expect(mockBootstrapInit).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "contact-form",
        deploymentId: undefined,
        apiBaseUrl: "https://api.agentmaurice.dev",
      }),
    );
    expect(MockViewerStateMachine).not.toHaveBeenCalled();
    expect(mockCreateRoot).toHaveBeenCalled();
  });

  it("passes ExternalAuthAdapter when auth-token is present", async () => {
    mockBootstrapInit.mockResolvedValue(createBootstrapInstance());

    const element = document.createElement(
      "agent-maurice-viewer-test",
    ) as AgentMauriceElement;
    element.setAttribute("deployment-id", "dep_123");
    element.setAttribute("auth-token", "jwt_123");
    document.body.appendChild(element);

    await Promise.resolve();
    await Promise.resolve();

    expect(MockExternalAuthAdapter).toHaveBeenCalledWith(
      expect.objectContaining({
        user: { id: "embed-user" },
      }),
    );
    expect(mockBootstrapInit).toHaveBeenCalledWith(
      expect.objectContaining({
        deploymentId: "dep_123",
        authAdapter: expect.any(Object),
      }),
    );
  });

  it("keeps manual path for deployment-id + recipe-id", async () => {
    const element = document.createElement(
      "agent-maurice-viewer-test",
    ) as AgentMauriceElement;
    element.setAttribute("deployment-id", "dep_123");
    element.setAttribute("recipe-id", "recipe_456");
    document.body.appendChild(element);

    await Promise.resolve();

    expect(MockViewerAPIClient).toHaveBeenCalledWith(
      "https://api.agentmaurice.dev",
    );
    expect(MockViewerStateMachine).toHaveBeenCalledWith(
      expect.anything(),
      "dep_123",
      "recipe_456",
      undefined,
    );
    expect(mockStateMachineInitialize).toHaveBeenCalled();
    expect(mockBootstrapInit).not.toHaveBeenCalled();
  });

  it("uses local mock controller when mock-scenario is present", async () => {
    const element = document.createElement(
      "agent-maurice-viewer-test",
    ) as AgentMauriceElement;
    element.setAttribute("mock-scenario", "ops-review");
    document.body.appendChild(element);

    await Promise.resolve();

    expect(mockCreateMockEmbedController).toHaveBeenCalledWith("ops-review");
    expect(mockBootstrapInit).not.toHaveBeenCalled();
    expect(MockViewerStateMachine).not.toHaveBeenCalled();
    expect(mockCreateRoot).toHaveBeenCalled();
  });

  it("disconnect cleans up root and viewer instance", async () => {
    const instance = createBootstrapInstance();
    mockBootstrapInit.mockResolvedValue(instance);

    const element = document.createElement(
      "agent-maurice-viewer-test",
    ) as AgentMauriceElement;
    element.setAttribute("slug", "contact-form");
    document.body.appendChild(element);

    await Promise.resolve();
    await Promise.resolve();

    element.remove();

    expect(mockUnmount).toHaveBeenCalled();
    expect(instance.destroy).toHaveBeenCalled();
  });

  it("can reconnect the same element without crashing", async () => {
    mockBootstrapInit.mockResolvedValue(createBootstrapInstance());

    const element = document.createElement(
      "agent-maurice-viewer-test",
    ) as AgentMauriceElement;
    element.setAttribute("slug", "contact-form");
    document.body.appendChild(element);

    await Promise.resolve();
    await Promise.resolve();

    element.remove();
    document.body.appendChild(element);

    await Promise.resolve();
    await Promise.resolve();

    expect(mockBootstrapInit).toHaveBeenCalledTimes(2);
    expect(mockCreateRoot).toHaveBeenCalledTimes(2);
    expect(mockUnmount).toHaveBeenCalledTimes(1);
  });

  it("destroys late bootstrap instances after disconnect", async () => {
    const deferred = createDeferred<ReturnType<typeof createBootstrapInstance>>();
    mockBootstrapInit.mockReturnValue(deferred.promise);

    const element = document.createElement(
      "agent-maurice-viewer-test",
    ) as AgentMauriceElement;
    element.setAttribute("slug", "contact-form");
    document.body.appendChild(element);

    element.remove();

    const instance = createBootstrapInstance();
    deferred.resolve(instance);

    await Promise.resolve();
    await Promise.resolve();

    expect(instance.destroy).toHaveBeenCalled();
    expect(mockCreateRoot).not.toHaveBeenCalled();
  });
});
