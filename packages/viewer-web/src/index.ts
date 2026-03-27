// Components
export { ViewerRoot } from "./components/ViewerRoot";
export type { ViewerRootProps } from "./components/ViewerRoot";
export { AgentMauriceViewer } from "./components/AgentMauriceViewer";
export type { AgentMauriceViewerProps } from "./components/AgentMauriceViewer";
export { AuthScreen } from "./components/AuthScreen";
export type { AuthScreenProps } from "./components/AuthScreen";

export { ScreenRenderer } from "./components/ScreenRenderer";
export type { ScreenRendererProps } from "./components/ScreenRenderer";

export { FormRenderer } from "./components/FormRenderer";
export type { FormRendererProps } from "./components/FormRenderer";

// Node components
export {
  TextNodeComponent,
  type TextNodeProps,
  ButtonNodeComponent,
  type ButtonNodeProps,
  StatNodeComponent,
  type StatNodeProps,
  ListNodeComponent,
  type ListNodeProps,
  CalloutNodeComponent,
  type CalloutNodeProps,
  TableNodeComponent,
  type TableNodeProps,
  SectionNodeComponent,
  type SectionNodeProps,
  CardNodeComponent,
  type CardNodeProps,
  FormLinkNodeComponent,
  type FormLinkNodeProps,
  defaultWebRegistry,
} from "./components/nodes";

// Hooks
export { useViewer, useViewerEvent } from "./hooks";

// Context
export { ViewerContext, useViewerContext } from "./context";
export type { ViewerContextValue } from "./context";

// Theme
export { defaultTheme } from "./theme";
export type { ViewerTheme } from "./theme";
