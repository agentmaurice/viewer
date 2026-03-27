import React from "react";
import type { ViewerAuthMode } from "@agent-maurice/viewer-core";

export interface AuthScreenProps {
  title: string;
  authMode: ViewerAuthMode;
  onAuthenticate: () => void;
  loading?: boolean;
  error?: string;
  logoUrl?: string;
  primaryColor?: string;
}

const AUTH_LABELS: Record<string, string> = {
  api_key: "",
  firebase: "Google",
  supabase: "Supabase",
  oidc: "SSO",
  external: "SSO",
};

export function AuthScreen({
  title,
  authMode,
  onAuthenticate,
  loading = false,
  error,
  logoUrl,
  primaryColor = "#7C3AED",
}: AuthScreenProps): React.ReactElement | null {
  if (authMode === "api_key") return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "300px",
        padding: "32px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt=""
          style={{
            width: "64px",
            height: "64px",
            marginBottom: "16px",
            borderRadius: "12px",
          }}
        />
      ) : null}
      <h2
        style={{ margin: "0 0 24px 0", fontSize: "1.5rem", color: "#1E1B4B" }}
      >
        {title}
      </h2>
      {error ? (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: "16px",
            backgroundColor: "#FEF2F2",
            color: "#DC2626",
            borderRadius: "8px",
            fontSize: "0.875rem",
          }}
        >
          {error}
        </div>
      ) : null}
      {loading ? (
        <div style={{ color: "#6B7280", fontSize: "0.875rem" }}>
          Loading...
        </div>
      ) : (
        <button
          onClick={onAuthenticate}
          style={{
            padding: "12px 24px",
            backgroundColor: primaryColor,
            color: "#FFFFFF",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Sign in with {AUTH_LABELS[authMode] ?? "SSO"}
        </button>
      )}
    </div>
  );
}
