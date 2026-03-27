import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScreenRenderer } from "./ScreenRenderer";
import { defaultWebRegistry } from "./nodes";
import { ViewerContext } from "../context";
import type { ViewerStateController } from "@agent-maurice/viewer-core";

const mockStateMachine = {
  subscribe: () => () => {},
  dispatchEvent: () => {},
  getState: () => ({}),
} as unknown as ViewerStateController;

describe("ScreenRenderer", () => {
  const renderWithContext = (element: React.ReactElement) => {
    return render(
      <ViewerContext.Provider
        value={{ stateMachine: mockStateMachine, registry: defaultWebRegistry }}
      >
        {element}
      </ViewerContext.Provider>,
    );
  };

  it("renders text node", () => {
    const node = {
      type: "text" as const,
      value: "Hello",
    };
    renderWithContext(<ScreenRenderer node={node as any} />);
    expect(screen.getByText("Hello")).toBeTruthy();
  });

  it("renders nested section with children", () => {
    const node = {
      type: "section" as const,
      title: "Test Section",
      children: [
        {
          type: "text" as const,
          value: "Child text",
        },
      ],
    };
    renderWithContext(<ScreenRenderer node={node as any} />);
    expect(screen.getByText("Test Section")).toBeTruthy();
    expect(screen.getByText("Child text")).toBeTruthy();
  });

  it("returns null for unknown node type", () => {
    const node = {
      type: "unknown_type" as any,
      props: {},
    };
    const { container } = renderWithContext(
      <ScreenRenderer node={node as any} />,
    );
    expect(container.firstChild).toBeFalsy();
  });

  it("renders card with multiple children", () => {
    const node = {
      type: "card" as const,
      title: "Card",
      children: [
        { type: "text" as const, value: "Item 1" },
        { type: "text" as const, value: "Item 2" },
      ],
    };
    renderWithContext(<ScreenRenderer node={node as any} />);
    expect(screen.getByText("Card")).toBeTruthy();
    expect(screen.getByText("Item 1")).toBeTruthy();
    expect(screen.getByText("Item 2")).toBeTruthy();
  });
});
