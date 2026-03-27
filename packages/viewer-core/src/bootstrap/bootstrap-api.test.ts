import { describe, expect, it, vi } from "vitest";
import { fetchBootstrapConfig, resolveSlug } from "./bootstrap-api";
import type { ViewerBootstrapResponse } from "./bootstrap-types";

const mockResponse: ViewerBootstrapResponse = {
  deployment_id: "dep_123",
  organization_id: "org_456",
  api_base_url: "https://api.agentmaurice.com",
  config: {
    default_recipe_id: "recipe_contact",
    auth_mode: "api_key",
    enabled: true,
  },
  recipes: [{ id: "recipe_contact", name: "Contact Form" }],
};

describe("fetchBootstrapConfig", () => {
  it("calls GET /viewer/{deploymentId} and returns parsed response", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await fetchBootstrapConfig({
      deploymentId: "dep_123",
      apiBaseUrl: "https://api.agentmaurice.com",
      fetch: mockFetch,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.agentmaurice.com/viewer/dep_123",
      expect.objectContaining({ method: "GET" }),
    );
    expect(result.deployment_id).toBe("dep_123");
    expect(result.config.auth_mode).toBe("api_key");
  });

  it("throws ViewerError on HTTP error", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: () =>
        Promise.resolve({
          error: { code: "not_found", message: "Deployment not found" },
        }),
    });

    await expect(
      fetchBootstrapConfig({
        deploymentId: "bad_id",
        apiBaseUrl: "https://api.agentmaurice.com",
        fetch: mockFetch,
      }),
    ).rejects.toThrow("Deployment not found");
  });

  it("throws ViewerError on network failure", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new TypeError("Network error"));

    await expect(
      fetchBootstrapConfig({
        deploymentId: "dep_123",
        apiBaseUrl: "https://api.agentmaurice.com",
        fetch: mockFetch,
      }),
    ).rejects.toThrow(/Network error/);
  });

  it("passes custom headers when provided", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    await fetchBootstrapConfig({
      deploymentId: "dep_123",
      apiBaseUrl: "https://api.agentmaurice.com",
      headers: { Authorization: "Bearer ext_tok" },
      fetch: mockFetch,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.agentmaurice.com/viewer/dep_123",
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: "application/json",
          Authorization: "Bearer ext_tok",
        }),
      }),
    );
  });
});

describe("resolveSlug", () => {
  it("calls GET /viewer/s/{slug} and returns bootstrap response", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await resolveSlug({
      slug: "contact-form",
      apiBaseUrl: "https://api.agentmaurice.com",
      fetch: mockFetch,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.agentmaurice.com/viewer/s/contact-form",
      expect.objectContaining({ method: "GET" }),
    );
    expect(result.deployment_id).toBe("dep_123");
  });
});
