import { describe, it, expect, vi, beforeEach } from "vitest";
import { ViewerStateMachine } from "./state-machine";
import type { ViewerAPIClient } from "../client/api-client";
import type { MiniAppRuntimePayload } from "../types/protocol";

describe("ViewerStateMachine", () => {
  let mockClient: ReturnType<typeof vi.mocked<ViewerAPIClient>>;
  let stateMachine: ViewerStateMachine;

  const mockPayload: MiniAppRuntimePayload = {
    contract: "agentmaurice-ui-runtime-v1",
    app_instance_id: "app-123",
    recipe_id: "recipe-1",
    status: "active",
    state: { count: 5 },
    state_version: 1,
  };

  beforeEach(() => {
    mockClient = {
      createInstance: vi.fn(),
      getInstance: vi.fn(),
      sendEvent: vi.fn(),
    } as unknown as ReturnType<typeof vi.mocked<ViewerAPIClient>>;

    stateMachine = new ViewerStateMachine(
      mockClient as unknown as ViewerAPIClient,
    );
  });

  it("should initialize in idle state", () => {
    const state = stateMachine.getState();
    expect(state.phase).toBe("idle");
    expect(state.runtime).toBeNull();
    expect(state.error).toBeNull();
  });

  it("should transition through init lifecycle", async () => {
    const states: string[] = [];
    stateMachine.subscribe((state) => states.push(state.phase));

    vi.mocked(mockClient.createInstance).mockResolvedValue(mockPayload);

    await stateMachine.init("deploy-1", "recipe-1");

    expect(states).toContain("loading");
    expect(states).toContain("ready");
    expect(stateMachine.getState().runtime).toEqual(mockPayload);
  });

  it("should handle init error", async () => {
    const states: string[] = [];
    stateMachine.subscribe((state) => states.push(state.phase));

    vi.mocked(mockClient.createInstance).mockRejectedValue(
      new Error("Network error"),
    );

    await stateMachine.init("deploy-1", "recipe-1");

    expect(states).toContain("loading");
    expect(states).toContain("error");
    expect(stateMachine.getState().error).toBe("Network error");
  });

  it("should transition through resume lifecycle", async () => {
    const states: string[] = [];
    stateMachine.subscribe((state) => states.push(state.phase));

    vi.mocked(mockClient.getInstance).mockResolvedValue(mockPayload);

    await stateMachine.resume("app-123");

    expect(states).toContain("loading");
    expect(states).toContain("ready");
    expect(stateMachine.getState().runtime).toEqual(mockPayload);
  });

  it("should handle resume error", async () => {
    vi.mocked(mockClient.getInstance).mockRejectedValue(new Error("Not found"));

    await stateMachine.resume("app-123");

    expect(stateMachine.getState().phase).toBe("error");
    expect(stateMachine.getState().error).toBe("Not found");
  });

  it("should dispatch event after init", async () => {
    vi.mocked(mockClient.createInstance).mockResolvedValue(mockPayload);
    vi.mocked(mockClient.sendEvent).mockResolvedValue({
      ...mockPayload,
      state_version: 2,
      state: { count: 6 },
    });

    await stateMachine.init("deploy-1", "recipe-1");

    const states: string[] = [];
    stateMachine.subscribe((state) => states.push(state.phase));

    await stateMachine.dispatchEvent("increment", { value: 1 });

    expect(states).toContain("sending");
    expect(states).toContain("ready");
    expect(stateMachine.getState().runtime?.state_version).toBe(2);
  });

  it("should include expected_state_version in event dispatch", async () => {
    vi.mocked(mockClient.createInstance).mockResolvedValue(mockPayload);
    vi.mocked(mockClient.sendEvent).mockResolvedValue(mockPayload);

    await stateMachine.init("deploy-1", "recipe-1");
    await stateMachine.dispatchEvent("test", {});

    const call = vi.mocked(mockClient.sendEvent).mock.calls[0];
    expect(call[2].expected_state_version).toBe(1);
  });

  it("should handle dispatch event error", async () => {
    vi.mocked(mockClient.createInstance).mockResolvedValue(mockPayload);
    vi.mocked(mockClient.sendEvent).mockRejectedValue(
      new Error("Dispatch failed"),
    );

    await stateMachine.init("deploy-1", "recipe-1");
    await stateMachine.dispatchEvent("test", {});

    expect(stateMachine.getState().phase).toBe("error");
    expect(stateMachine.getState().error).toBe("Dispatch failed");
  });

  it("should throw if dispatch without initialization", async () => {
    try {
      await stateMachine.dispatchEvent("test", {});
      expect.fail("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe("Viewer not initialized");
    }
  });

  it("should support multiple subscribers", async () => {
    const calls1: string[] = [];
    const calls2: string[] = [];

    stateMachine.subscribe((state) => calls1.push(state.phase));
    stateMachine.subscribe((state) => calls2.push(state.phase));

    vi.mocked(mockClient.createInstance).mockResolvedValue(mockPayload);
    await stateMachine.init("deploy-1", "recipe-1");

    expect(calls1.length).toBeGreaterThan(0);
    expect(calls2.length).toBeGreaterThan(0);
  });

  it("should unsubscribe listener", async () => {
    const calls: string[] = [];
    const unsubscribe = stateMachine.subscribe((state) =>
      calls.push(state.phase),
    );

    vi.mocked(mockClient.createInstance).mockResolvedValue(mockPayload);
    await stateMachine.init("deploy-1", "recipe-1");

    const initialLength = calls.length;
    unsubscribe();

    vi.mocked(mockClient.sendEvent).mockResolvedValue(mockPayload);
    await stateMachine.dispatchEvent("test", {});

    expect(calls.length).toBe(initialLength);
  });

  it("should clear error on new action", async () => {
    vi.mocked(mockClient.createInstance).mockRejectedValue(
      new Error("Error 1"),
    );
    await stateMachine.init("deploy-1", "recipe-1");
    expect(stateMachine.getState().error).toBe("Error 1");

    vi.mocked(mockClient.getInstance).mockResolvedValue(mockPayload);
    await stateMachine.resume("app-123");
    expect(stateMachine.getState().error).toBeNull();
  });

  it("should pass form data to sendEvent", async () => {
    vi.mocked(mockClient.createInstance).mockResolvedValue(mockPayload);
    vi.mocked(mockClient.sendEvent).mockResolvedValue(mockPayload);

    await stateMachine.init("deploy-1", "recipe-1");
    await stateMachine.dispatchEvent(
      "submit",
      { action: "save" },
      { name: "John" },
    );

    const call = vi.mocked(mockClient.sendEvent).mock.calls[0];
    expect(call[2].form_data).toEqual({ name: "John" });
  });

  it("should support initialize() with constructor defaults", async () => {
    const machine = new ViewerStateMachine(
      mockClient as unknown as ViewerAPIClient,
      "deploy-1",
      "recipe-1",
      { foo: "bar" },
    );
    vi.mocked(mockClient.createInstance).mockResolvedValue(mockPayload);

    await machine.initialize();

    expect(vi.mocked(mockClient.createInstance)).toHaveBeenCalledWith(
      "deploy-1",
      "recipe-1",
      { seedState: { foo: "bar" } },
    );
  });

  it("destroy() clears listeners", async () => {
    const calls: string[] = [];
    stateMachine.subscribe((state) => calls.push(state.phase));
    stateMachine.destroy();
    vi.mocked(mockClient.createInstance).mockResolvedValue(mockPayload);
    await stateMachine.init("deploy-1", "recipe-1");
    expect(calls).toHaveLength(0);
  });
});
