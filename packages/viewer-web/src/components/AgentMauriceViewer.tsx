import React, { useEffect, useMemo, useState } from "react";
import type {
  ViewerBootstrapConfig,
  ViewerInstance,
  ViewerStateController,
} from "@agent-maurice/viewer-core";
import { ViewerBootstrap } from "@agent-maurice/viewer-core";
import { defaultWebRegistry } from "./nodes";
import { ViewerRoot } from "./ViewerRoot";
import { AuthScreen } from "./AuthScreen";

export interface AgentMauriceViewerProps extends ViewerBootstrapConfig {
  className?: string;
}

function createStateController(
  instance: ViewerInstance,
): ViewerStateController {
  return {
    getState: () => instance.state,
    subscribe: (listener) => instance.subscribe(listener),
    dispatchEvent: (eventId, payload, formData) =>
      instance.sendEvent(eventId, payload, formData),
  };
}

export function AgentMauriceViewer(
  props: AgentMauriceViewerProps,
): React.ReactElement {
  const [instance, setInstance] = useState<ViewerInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authPending, setAuthPending] = useState(false);

  useEffect(() => {
    let mounted = true;
    let currentInstance: ViewerInstance | null = null;

    setLoading(true);
    setError(null);

    ViewerBootstrap.init({
      ...props,
      onReady: undefined,
      onError: undefined,
    })
      .then((nextInstance) => {
        if (!mounted) {
          nextInstance.destroy();
          return;
        }
        currentInstance = nextInstance;
        setInstance(nextInstance);
        setLoading(false);
      })
      .catch((nextError) => {
        if (!mounted) return;
        setError(
          nextError instanceof Error ? nextError.message : String(nextError),
        );
        setLoading(false);
      });

    return () => {
      mounted = false;
      currentInstance?.destroy();
    };
  }, [
    props.apiBaseUrl,
    props.authAdapter,
    props.deploymentId,
    props.recipeId,
    props.seedState,
    props.slug,
  ]);

  const stateController = useMemo(() => {
    if (!instance) return null;
    return createStateController(instance);
  }, [instance]);

  const authMode = instance?.bootstrapResponse.config.auth_mode;
  const title =
    instance?.bootstrapResponse.config.title ?? "AgentMaurice Viewer";

  if (loading) {
    return <div className={props.className}>Chargement...</div>;
  }

  if (error) {
    if (authMode && authMode !== "api_key") {
      return (
        <AuthScreen
          title={title}
          authMode={authMode}
          onAuthenticate={() => setAuthPending(true)}
          loading={authPending}
          error={error}
        />
      );
    }
    return <div className={props.className}>Erreur: {error}</div>;
  }

  if (!stateController) {
    return <div className={props.className}>Aucune instance viewer</div>;
  }

  return (
    <ViewerRoot
      stateMachine={stateController}
      registry={defaultWebRegistry}
      className={props.className}
    />
  );
}
