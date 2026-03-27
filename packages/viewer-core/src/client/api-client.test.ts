import { describe, it, expect, vi, beforeEach } from "vitest";
import { ViewerAPIClient, ViewerAPIClientError } from "./api-client";
import type { MiniAppRuntimePayload } from "../types/protocol";

describe("ViewerAPIClient", () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
  });

  const mockPayload: MiniAppRuntimePayload = {
    contract: "agentmaurice-ui-runtime-v1",
    app_instance_id: "app-123",
    recipe_id: "recipe-1",
    status: "active",
    state: { count: 5 },
    state_version: 1,
  };

  it("should create instance successfully", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockPayload,
    });

    const client = new ViewerAPIClient({
      baseURL: "http://api.test",
      fetch: mockFetch,
    });
    const result = await client.createInstance("deploy-1", "recipe-1");

    expect(result).toEqual(mockPayload);
    expect(mockFetch).toHaveBeenCalledWith(
      "http://api.test/app/deploy-1/recipe-1/instances",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipe_version: undefined,
          seed_state: undefined,
          seed_data: undefined,
        }),
      },
    );
  });

  it("should create instance with seed state", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockPayload,
    });

    const client = new ViewerAPIClient({
      baseURL: "http://api.test",
      fetch: mockFetch,
    });
    await client.createInstance("deploy-1", "recipe-1", {
      seedState: { initial: true },
    });

    const callArgs = mockFetch.mock.calls[0];
    expect(callArgs[1].body).toContain("seed_state");
  });

  it("should get instance successfully", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockPayload,
    });

    const client = new ViewerAPIClient({
      baseURL: "http://api.test",
      fetch: mockFetch,
    });
    const result = await client.getInstance("app-123");

    expect(result).toEqual(mockPayload);
    expect(mockFetch).toHaveBeenCalledWith(
      "http://api.test/app/instances/app-123",
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  });

  it("should send event successfully", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockPayload,
    });

    const client = new ViewerAPIClient({
      baseURL: "http://api.test",
      fetch: mockFetch,
    });
    const result = await client.sendEvent("app-123", "event-1", {
      expected_state_version: 1,
    });

    expect(result).toEqual(mockPayload);
    expect(mockFetch).toHaveBeenCalled();
  });

  it("should include auth token in headers", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockPayload,
    });

    const client = new ViewerAPIClient({
      baseURL: "http://api.test",
      fetch: mockFetch,
      getAuthToken: async () => "token-123",
    });
    await client.getInstance("app-123");

    const callArgs = mockFetch.mock.calls[0];
    expect(callArgs[1].headers).toEqual({
      "Content-Type": "application/json",
      Authorization: "Bearer token-123",
    });
  });

  it("should prefer authAdapter token when provided", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockPayload,
    });

    const authAdapter = {
      authenticate: vi.fn(),
      getToken: vi.fn().mockResolvedValue("adapter-token"),
      logout: vi.fn(),
      onAuthStateChange: vi.fn(),
    };

    const client = new ViewerAPIClient({
      baseURL: "http://api.test",
      fetch: mockFetch,
      authAdapter,
      getAuthToken: async () => "legacy-token",
    });
    await client.getInstance("app-123");

    const callArgs = mockFetch.mock.calls[0];
    expect(callArgs[1].headers).toEqual({
      "Content-Type": "application/json",
      Authorization: "Bearer adapter-token",
    });
  });

  it("should merge custom headers", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockPayload,
    });

    const client = new ViewerAPIClient({
      baseURL: "http://api.test",
      fetch: mockFetch,
      headers: { "X-Custom": "value" },
    });
    await client.getInstance("app-123");

    const callArgs = mockFetch.mock.calls[0];
    expect(callArgs[1].headers["X-Custom"]).toBe("value");
  });

  it("should handle error responses", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({
        error: { code: "CONFLICT", message: "State version mismatch" },
      }),
    });

    const client = new ViewerAPIClient({
      baseURL: "http://api.test",
      fetch: mockFetch,
    });

    try {
      await client.getInstance("app-123");
      expect.fail("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(ViewerAPIClientError);
      expect((error as ViewerAPIClientError).code).toBe("CONFLICT");
      expect((error as ViewerAPIClientError).status).toBe(409);
    }
  });

  it("should handle error responses without error body", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    const client = new ViewerAPIClient({
      baseURL: "http://api.test",
      fetch: mockFetch,
    });

    try {
      await client.getInstance("app-123");
      expect.fail("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(ViewerAPIClientError);
      expect((error as ViewerAPIClientError).code).toBe("http_500");
    }
  });

  it("should provide error details", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        error: {
          code: "INVALID_REQUEST",
          message: "Invalid payload",
          details: { field: "recipe_id", reason: "required" },
        },
      }),
    });

    const client = new ViewerAPIClient({
      baseURL: "http://api.test",
      fetch: mockFetch,
    });

    try {
      await client.getInstance("app-123");
    } catch (error) {
      expect((error as ViewerAPIClientError).details).toEqual({
        field: "recipe_id",
        reason: "required",
      });
    }
  });

  it("should invoke onErrorResponse hook before throwing", async () => {
    const onErrorResponse = vi.fn();
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        error: { code: "UNAUTHORIZED", message: "Unauthorized" },
      }),
    });

    const client = new ViewerAPIClient({
      baseURL: "http://api.test",
      fetch: mockFetch,
      onErrorResponse,
    });

    await expect(client.getInstance("app-123")).rejects.toBeInstanceOf(
      ViewerAPIClientError,
    );
    expect(onErrorResponse).toHaveBeenCalledTimes(1);
    expect(onErrorResponse.mock.calls[0]?.[0]?.response?.status).toBe(401);
    expect(onErrorResponse.mock.calls[0]?.[0]?.body?.error?.code).toBe(
      "UNAUTHORIZED",
    );
  });
});
