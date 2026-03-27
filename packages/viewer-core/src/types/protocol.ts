import {
  APP_RUNTIME_CONTRACT,
  type GeneratedAppInstanceStatus,
  type GeneratedAppNode,
  type GeneratedAppUICalloutTone,
  type GeneratedAppUILayout,
  type GeneratedAppUIRender,
  type GeneratedButtonNode,
  type GeneratedCalloutNode,
  type GeneratedCardNode,
  type GeneratedChartNode,
  type GeneratedBadgeRowNode,
  type GeneratedEmptyStateNode,
  type GeneratedActionBarNode,
  type GeneratedFilterBarNode,
  type GeneratedFormLinkNode,
  type GeneratedGroupNode,
  type GeneratedKPIGridNode,
  type GeneratedListNode,
  type GeneratedMiniAppRuntimePayload,
  type GeneratedSectionNode,
  type GeneratedStatNode,
  type GeneratedTableNode,
  type GeneratedTextNode,
} from '../generated/chatserver-schemas'
import type { AppActionBinding, AppEffect } from './events'
import type { AppFormDefinition } from './forms'

/** Runtime version contract */
export const RUNTIME_CONTRACT_V1 = APP_RUNTIME_CONTRACT

/** Possible mini-app instance statuses */
export type AppInstanceStatus = GeneratedAppInstanceStatus | 'waiting_for_form'
export type AppUILayout = GeneratedAppUILayout
export type AppUICalloutTone = GeneratedAppUICalloutTone

export type TextNode = GeneratedTextNode
export type ButtonNode = GeneratedButtonNode
export type StatNode = GeneratedStatNode
export type KPIGridNode = GeneratedKPIGridNode
export type ListNode = GeneratedListNode
export type FilterBarNode = GeneratedFilterBarNode
export type ActionBarNode = GeneratedActionBarNode
export type BadgeRowNode = GeneratedBadgeRowNode
export type CalloutNode = GeneratedCalloutNode
export type EmptyStateNode = GeneratedEmptyStateNode
export type ChartNode = GeneratedChartNode & { data: Array<Record<string, unknown> | unknown[]> }
export type TableNode = GeneratedTableNode & { rows: Array<Record<string, unknown> | unknown[]> }
export type SectionNode = GeneratedSectionNode | GeneratedCardNode
export type FormLinkNode = GeneratedFormLinkNode
export type GenericNode = GeneratedGroupNode & { type?: string }

export type AppNode = GeneratedAppNode

export type AppUIRender = GeneratedAppUIRender

export type MiniAppRuntimePayload = {
  contract: GeneratedMiniAppRuntimePayload['contract']
  app_instance_id: string
  workspace_id?: string
  recipe_id: string
  recipe_version?: string
  status: AppInstanceStatus
  state: Record<string, unknown>
  state_version: number
  ui?: AppUIRender | null
  action_bindings?: Record<string, AppActionBinding>
  forms?: Record<string, AppFormDefinition>
  effects?: AppEffect[]
  [key: string]: unknown
}
