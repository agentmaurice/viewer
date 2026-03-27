import React from "react";
import type { AppNode, SectionNode } from "@agent-maurice/viewer-core";
import { useViewerContext } from "../context";

export interface ScreenRendererProps {
  node: AppNode;
  onEvent?: (eventId: string, payload?: Record<string, unknown>) => void;
  onOpenForm?: (formId: string, submitEvent?: string) => void;
}

export function ScreenRenderer({
  node,
  onEvent,
  onOpenForm,
}: ScreenRendererProps) {
  const { registry } = useViewerContext();
  const nodeType = typeof node.type === "string" ? node.type : "";

  if (!nodeType) {
    return null;
  }

  // For nodes with children (section, card), render recursively
  if (nodeType === "section" || nodeType === "card") {
    const Component = registry.get(nodeType);
    if (!Component) return null;

    const sectionNode = node as SectionNode;
    return (
      <Component {...sectionNode}>
        {sectionNode.children && sectionNode.children.length > 0
          ? sectionNode.children.map((child, index) => (
              <ScreenRenderer
                key={index}
                node={child}
                onEvent={onEvent}
                onOpenForm={onOpenForm}
              />
            ))
          : null}
      </Component>
    );
  }

  // For leaf nodes, render directly
  const Component = registry.get(nodeType);
  if (!Component) return null;

  const componentProps = {
    ...node,
    onEvent: onEvent,
    onOpenForm: onOpenForm,
  };

  return <Component {...componentProps} />;
}
