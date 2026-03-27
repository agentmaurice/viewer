import { beforeEach, describe, expect, it, vi } from "vitest";
import { ViewerBootstrap } from "./viewer-bootstrap";
import type { ViewerBootstrapResponse } from "./bootstrap-types";
import type { MiniAppRuntimePayload } from "../types/protocol";

vi.mock("./bootstrap-api", () => ({
  fetchBootstrapConfig: vi.fn(),
  resolveSlug: vi.fn(),
}));

import { fetchBootstrapConfig, resolveSlug } from "./bootstrap-api";

const mockBootstrapResponse: ViewerBootstrapResponse = {
  deployment_id: "dep_123",
  organization_id: "org_456",
  api_base_url: "https://api.test.com",
  config: {
    default_recipe_id: "recipe_1",
    auth_mode: "api_key",
    auth_provider_config: { api_key: "sk_test" },
    enabled: true,
  },
  recipes: [{ id: "recipe_1", name: "Default" }],
};

const mockRuntimePayload: MiniAppRuntimePayload = {
  contract: "agentmaurice-ui-runtime-v1",
  app_instance_id: "inst_1",
  recipe_id: "recipe_1",
  state_version: 1,
  ui: { tree: { type: "text", value: "Hello" } },
  state: {},
  forms: {},
  status: "active",
};

describe("ViewerBootstrap", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("init with deploymentId fetches bootstrap config and creates instance", async () => {
    vi.mocked(fetchBootstrapConfig).mockResolvedValue(mockBootstrapResponse);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockRuntimePayload),
    });

    const instance = await ViewerBootstrap.init({
      deploymentId: "dep_123",
      apiBaseUrl: "https://api.test.com",
      fetch: mockFetch,
    });

    expect(fetchBootstrapConfig).toHaveBeenCalledWith(
      expect.objectContaining({ deploymentId: "dep_123" }),
    );
    expect(instance.state.phase).toBe("ready");
    expect(instance.bootstrapResponse.deployment_id).toBe("dep_123");
  });

  it("init with slug resolves slug then bootstraps", async () => {
    vi.mocked(resolveSlug).mockResolvedValue(mockBootstrapResponse);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockRuntimePayload),
    });

    const instance = await ViewerBootstrap.init({
      slug: "contact-form",
      apiBaseUrl: "https://api.test.com",
      fetch: mockFetch,
    });

    expect(resolveSlug).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "contact-form" }),
    );
    expect(instance.state.phase).toBe("ready");
  });

  it("throws if neither deploymentId nor slug provided", async () => {
    await expect(
      ViewerBootstrap.init({ apiBaseUrl: "https://api.test.com" }),
    ).rejects.toThrow(/deploymentId or slug/);
  });

  it("uses provided authAdapter instead of auto-resolving", async () => {
    vi.mocked(fetchBootstrapConfig).mockResolvedValue(mockBootstrapResponse);

    const customAdapter = {
      authenticate: vi
        .fn()
        .mockResolvedValue({ user: { id: "u1" }, token: "custom_tok" }),
      getToken: vi.fn().mockResolvedValue("custom_tok"),
      logout: vi.fn(),
      onAuthStateChange: vi.fn().mockReturnValue(() => {}),
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockRuntimePayload),
    });

    const instance = await ViewerBootstrap.init({
      deploymentId: "dep_123",
      apiBaseUrl: "https://api.test.com",
      authAdapter: customAdapter,
      fetch: mockFetch,
    });

    expect(customAdapter.authenticate).toHaveBeenCalled();
    expect(fetchBootstrapConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        deploymentId: "dep_123",
        headers: expect.objectContaining({
          Authorization: "Bearer custom_tok",
        }),
      }),
    );
    expect(instance.state.phase).toBe("ready");
  });

  it("calls onReady callback when initialization succeeds", async () => {
    vi.mocked(fetchBootstrapConfig).mockResolvedValue(mockBootstrapResponse);
    const onReady = vi.fn();

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockRuntimePayload),
    });

    await ViewerBootstrap.init({
      deploymentId: "dep_123",
      apiBaseUrl: "https://api.test.com",
      onReady,
      fetch: mockFetch,
    });

    expect(onReady).toHaveBeenCalledWith(
      expect.objectContaining({
        state: expect.objectContaining({ phase: "ready" }),
      }),
    );
  });

  it("calls onError callback on failure", async () => {
    vi.mocked(fetchBootstrapConfig).mockRejectedValue(new Error("Not found"));
    const onError = vi.fn();

    await expect(
      ViewerBootstrap.init({
        deploymentId: "bad",
        apiBaseUrl: "https://api.test.com",
        onError,
      }),
    ).rejects.toThrow();

    expect(onError).toHaveBeenCalled();
  });

  it("destroy() cleans up subscriptions", async () => {
    vi.mocked(fetchBootstrapConfig).mockResolvedValue(mockBootstrapResponse);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockRuntimePayload),
    });

    const instance = await ViewerBootstrap.init({
      deploymentId: "dep_123",
      apiBaseUrl: "https://api.test.com",
      fetch: mockFetch,
    });

    expect(() => instance.destroy()).not.toThrow();
  });

  it("sendEvent() forwards event payload to the state machine", async () => {
    vi.mocked(fetchBootstrapConfig).mockResolvedValue(mockBootstrapResponse);

    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRuntimePayload),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            ...mockRuntimePayload,
            state_version: 2,
          }),
      });

    const instance = await ViewerBootstrap.init({
      deploymentId: "dep_123",
      apiBaseUrl: "https://api.test.com",
      fetch: mockFetch,
    });

    await expect(
      instance.sendEvent("refresh", { scope: "all" }),
    ).resolves.toBeUndefined();
    expect(instance.state.runtime?.state_version).toBe(2);
  });
});
