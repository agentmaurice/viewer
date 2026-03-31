import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type {
  MiniAppRuntimePayload,
  ViewerState,
  ViewerStateController,
} from "@agent-maurice/viewer-core";
import { defaultWebRegistry } from "./nodes";
import { ViewerRoot } from "./ViewerRoot";

function createRuntime(): MiniAppRuntimePayload {
  return {
    contract: "agentmaurice-ui-runtime-v1",
    app_instance_id: "app-123",
    recipe_id: "validation_appels_d_offre",
    status: "active",
    state: {},
    state_version: 1,
    ui: {
      format: "openui_lang",
      tree: {
        type: "section",
        children: [
          {
            type: "form_link",
            label: "Configurer et lancer",
            form_id: "main_form",
            submit_event: "submit_main_form",
          },
        ],
      },
    },
    forms: {
      main_form: {
        id: "main_form",
        fields: [
          {
            name: "cahier_des_charges",
            type: "textarea",
            required: true,
          },
        ],
      },
    },
  };
}

function createStateMachine(
  state: ViewerState,
): ViewerStateController & { dispatchEvent: ReturnType<typeof vi.fn> } {
  return {
    getState: () => state,
    subscribe: () => () => {},
    dispatchEvent: vi.fn().mockResolvedValue(undefined),
  };
}

describe("ViewerRoot", () => {
  it("submits the configured form event with form data", () => {
    const stateMachine = createStateMachine({
      phase: "ready",
      runtime: createRuntime(),
      error: null,
    });

    render(
      <ViewerRoot stateMachine={stateMachine} registry={defaultWebRegistry} />,
    );

    fireEvent.click(screen.getByText("Configurer et lancer"));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Spec client" },
    });
    fireEvent.click(screen.getByText("Submit"));

    expect(stateMachine.dispatchEvent).toHaveBeenCalledWith(
      "submit_main_form",
      { form_id: "main_form" },
      { cahier_des_charges: "Spec client" },
    );
  });

  it("falls back to form_submit when no explicit submit_event is provided", () => {
    const runtime = createRuntime();
    const formLink = runtime.ui?.tree.children?.[0];
    if (formLink && typeof formLink === "object" && "submit_event" in formLink) {
      delete formLink.submit_event;
    }

    const stateMachine = createStateMachine({
      phase: "ready",
      runtime,
      error: null,
    });

    render(
      <ViewerRoot stateMachine={stateMachine} registry={defaultWebRegistry} />,
    );

    fireEvent.click(screen.getByText("Configurer et lancer"));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Spec client" },
    });
    fireEvent.click(screen.getByText("Submit"));

    expect(stateMachine.dispatchEvent).toHaveBeenCalledWith(
      "form_submit",
      { form_id: "main_form" },
      { cahier_des_charges: "Spec client" },
    );
  });
});
