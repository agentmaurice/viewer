import { describe, expect, it, vi } from "vitest";
import { ExternalAuthAdapter } from "./external-adapter";

describe("ExternalAuthAdapter", () => {
  it("authenticate() returns user and token from config", async () => {
    const adapter = new ExternalAuthAdapter({
      user: { id: "user-1", displayName: "John" },
      getToken: async () => "jwt_token_123",
    });
    const result = await adapter.authenticate();
    expect(result.user.id).toBe("user-1");
    expect(result.token).toBe("jwt_token_123");
  });

  it("getToken() delegates to config.getToken", async () => {
    let callCount = 0;
    const adapter = new ExternalAuthAdapter({
      user: { id: "user-1" },
      getToken: async () => {
        callCount++;
        return `token_${callCount}`;
      },
    });
    await expect(adapter.getToken()).resolves.toBe("token_1");
    await expect(adapter.getToken()).resolves.toBe("token_2");
  });

  it("logout() calls config.onLogout if provided", async () => {
    const onLogout = vi.fn();
    const adapter = new ExternalAuthAdapter({
      user: { id: "user-1" },
      getToken: async () => "tok",
      onLogout,
    });
    await adapter.logout();
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it("logout() resolves if onLogout not provided", async () => {
    const adapter = new ExternalAuthAdapter({
      user: { id: "user-1" },
      getToken: async () => "tok",
    });
    await expect(adapter.logout()).resolves.toBeUndefined();
  });

  it("onAuthStateChange fires immediately with user", () => {
    const adapter = new ExternalAuthAdapter({
      user: { id: "user-1", displayName: "Jane" },
      getToken: async () => "tok",
    });
    const callback = vi.fn();
    adapter.onAuthStateChange(callback);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user-1", displayName: "Jane" }),
    );
  });
});
