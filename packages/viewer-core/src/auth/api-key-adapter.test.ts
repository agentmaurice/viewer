import { describe, expect, it, vi } from "vitest";
import { APIKeyAuthAdapter } from "./api-key-adapter";

describe("APIKeyAuthAdapter", () => {
  const apiKey = "sk_maurice_test_key_123";

  it("authenticate() returns anonymous user and API key as token", async () => {
    const adapter = new APIKeyAuthAdapter(apiKey);
    const result = await adapter.authenticate();

    expect(result.token).toBe(apiKey);
    expect(result.user.id).toBeTruthy();
    expect(result.user.displayName).toBe("Anonymous");
  });

  it("getToken() returns API key", async () => {
    const adapter = new APIKeyAuthAdapter(apiKey);
    await expect(adapter.getToken()).resolves.toBe(apiKey);
  });

  it("logout() resolves without error", async () => {
    const adapter = new APIKeyAuthAdapter(apiKey);
    await expect(adapter.logout()).resolves.toBeUndefined();
  });

  it("onAuthStateChange fires callback immediately with anonymous user", () => {
    const adapter = new APIKeyAuthAdapter(apiKey);
    const callback = vi.fn();
    adapter.onAuthStateChange(callback);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ displayName: "Anonymous" }),
    );
  });

  it("onAuthStateChange unsubscribe stops further callbacks", async () => {
    const adapter = new APIKeyAuthAdapter(apiKey);
    const callback = vi.fn();
    const unsubscribe = adapter.onAuthStateChange(callback);
    unsubscribe();
    await adapter.logout();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("generates different anonymous user IDs per instance", async () => {
    const adapter1 = new APIKeyAuthAdapter(apiKey);
    const adapter2 = new APIKeyAuthAdapter(apiKey);
    const result1 = await adapter1.authenticate();
    const result2 = await adapter2.authenticate();
    expect(result1.user.id).not.toBe(result2.user.id);
  });
});
