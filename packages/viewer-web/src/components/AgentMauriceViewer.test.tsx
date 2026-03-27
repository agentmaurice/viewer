import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import type { ViewerInstance } from "@agent-maurice/viewer-core";
import { AgentMauriceViewer } from "./AgentMauriceViewer";

vi.mock("@agent-maurice/viewer-core", async () => {
  const actual = await vi.importActual<
    typeof import("@agent-maurice/viewer-core")
  >("@agent-maurice/viewer-core");
  return {
    ...actual,
    ViewerBootstrap: {
      init: vi.fn(),
    },
  };
});

import { ViewerBootstrap } from "@agent-maurice/viewer-core";

function createMockInstance(): ViewerInstance {
  const state = {
    phase: "ready",
    runtime: {
      app_instance_id: "app-1",
      recipe_id: "recipe-1",
      state_version: 1,
      state: {},
      ui: { tree: { type: "text", value: "Hello viewer" } },
      status: "active",
      forms: {},
      contract: "agentmaurice-ui-runtime-v1",
    },
    error: null,
  };

  return {
    get state() {
      return state as any;
    },
    bootstrapResponse: {
      deployment_id: "dep-1",
      api_base_url: "https://api.test.com",
      config: {
        auth_mode: "api_key",
        enabled: true,
        title: "Viewer",
      },
    } as any,
    subscribe: vi.fn(() => () => {}),
    sendEvent: vi.fn(async () => undefined),
    sendAction: vi.fn(async () => undefined),
    destroy: vi.fn(),
  };
}

describe("AgentMauriceViewer", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders loading before bootstrap resolves", () => {
    vi.mocked(ViewerBootstrap.init).mockReturnValue(
      new Promise(() => {}) as any,
    );
    render(<AgentMauriceViewer deploymentId="dep-1" />);
    expect(screen.getByText(/chargement/i)).toBeTruthy();
  });

  it("renders viewer content after bootstrap", async () => {
    vi.mocked(ViewerBootstrap.init).mockResolvedValue(createMockInstance());
    render(<AgentMauriceViewer deploymentId="dep-1" />);
    await waitFor(() => expect(screen.getByText("Hello viewer")).toBeTruthy());
  });

  it("renders error state on bootstrap failure", async () => {
    vi.mocked(ViewerBootstrap.init).mockRejectedValue(
      new Error("Bootstrap failed"),
    );
    render(<AgentMauriceViewer deploymentId="dep-1" />);
    await waitFor(() =>
      expect(screen.getByText(/bootstrap failed/i)).toBeTruthy(),
    );
  });
});
