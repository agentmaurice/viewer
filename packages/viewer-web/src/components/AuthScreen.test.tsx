import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AuthScreen } from "./AuthScreen";

describe("AuthScreen", () => {
  it("renders title from bootstrap config", () => {
    render(
      <AuthScreen
        title="My App"
        authMode="firebase"
        onAuthenticate={vi.fn()}
      />,
    );
    expect(screen.getByText("My App")).toBeDefined();
  });

  it("shows login button for firebase mode", () => {
    render(
      <AuthScreen title="App" authMode="firebase" onAuthenticate={vi.fn()} />,
    );
    expect(screen.getByRole("button", { name: /sign in/i })).toBeDefined();
  });

  it("calls onAuthenticate when login button clicked", () => {
    const onAuth = vi.fn();
    render(
      <AuthScreen title="App" authMode="firebase" onAuthenticate={onAuth} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(onAuth).toHaveBeenCalledOnce();
  });

  it("shows loading state while authenticating", () => {
    render(
      <AuthScreen
        title="App"
        authMode="firebase"
        onAuthenticate={vi.fn()}
        loading
      />,
    );
    expect(screen.getByText(/loading/i)).toBeDefined();
  });

  it("shows error message when provided", () => {
    render(
      <AuthScreen
        title="App"
        authMode="firebase"
        onAuthenticate={vi.fn()}
        error="Auth failed"
      />,
    );
    expect(screen.getByText("Auth failed")).toBeDefined();
  });

  it("does not render for api_key mode", () => {
    const { container } = render(
      <AuthScreen title="App" authMode="api_key" onAuthenticate={vi.fn()} />,
    );
    expect(container.children.length).toBe(0);
  });
});
