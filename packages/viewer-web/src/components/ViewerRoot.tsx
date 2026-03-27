import React, { useState, useEffect } from "react";
import type {
  ViewerStateController,
  ComponentRegistry,
  ViewerState,
} from "@agent-maurice/viewer-core";
import { ViewerContext, ViewerContextValue } from "../context";
import { ScreenRenderer } from "./ScreenRenderer";
import { FormRenderer } from "./FormRenderer";

export interface ViewerRootProps {
  stateMachine: ViewerStateController;
  registry: ComponentRegistry<React.ComponentType<any>>;
  className?: string;
}

export function ViewerRoot({
  stateMachine,
  registry,
  className,
}: ViewerRootProps) {
  const [state, setState] = useState<ViewerState | null>(null);
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setState(stateMachine.getState());
    const unsubscribe = stateMachine.subscribe((newState) => {
      setState(newState);
      setError(null);
    });

    return () => {
      unsubscribe();
    };
  }, [stateMachine]);

  const contextValue: ViewerContextValue = {
    stateMachine,
    registry,
  };

  const handleEvent = (eventId: string, payload?: Record<string, unknown>) => {
    try {
      stateMachine.dispatchEvent(eventId, payload || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleOpenForm = (formId: string, submitEvent?: string) => {
    setActiveForm(formId);
  };

  const handleFormSubmit = (data: Record<string, unknown>) => {
    try {
      stateMachine.dispatchEvent("form_submit", {
        form_id: activeForm,
        data,
      });
      setActiveForm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Form submission failed");
    }
  };

  const handleFormCancel = () => {
    setActiveForm(null);
  };

  if (!state) {
    return (
      <div className={`am-viewer am-loading ${className || ""}`}>
        <div className="am-loading-spinner">Loading...</div>
      </div>
    );
  }

  const currentScreen = state.runtime?.ui?.tree;

  return (
    <ViewerContext.Provider value={contextValue}>
      <div className={`am-viewer ${className || ""}`}>
        {error && <div className="am-error-banner">{error}</div>}

        {currentScreen ? (
          <div className="am-screen">
            <ScreenRenderer
              node={currentScreen}
              onEvent={handleEvent}
              onOpenForm={handleOpenForm}
            />
          </div>
        ) : (
          <div className="am-no-screen">No screen available</div>
        )}

        {activeForm &&
          state.runtime?.forms &&
          state.runtime.forms[activeForm] && (
            <div className="am-form-overlay">
              <div className="am-form-modal">
                <FormRenderer
                  form={state.runtime.forms[activeForm]}
                  onSubmit={handleFormSubmit}
                  onCancel={handleFormCancel}
                />
              </div>
            </div>
          )}
      </div>
    </ViewerContext.Provider>
  );
}
