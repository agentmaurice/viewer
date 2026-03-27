import { APP_INSTANCE_STATUSES, APP_RUNTIME_CONTRACT } from '../generated/chatserver-schemas'
import type { AppInstanceStatus, MiniAppRuntimePayload } from '../types/protocol'
import {
  normalizeActionBindingsMap,
  normalizeEffects,
  normalizeFormsMap,
} from './runtime-contract-normalizer'
import { normalizeAppUIRender } from './ui-normalizer'

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

const EXTRA_APP_INSTANCE_STATUSES = ['waiting_for_form'] as const

export function isAppInstanceStatus(value: unknown): value is AppInstanceStatus {
  return (
    typeof value === 'string' &&
    (APP_INSTANCE_STATUSES.includes(value as (typeof APP_INSTANCE_STATUSES)[number]) ||
      EXTRA_APP_INSTANCE_STATUSES.includes(value as (typeof EXTRA_APP_INSTANCE_STATUSES)[number]))
  )
}

export function normalizeMiniAppRuntimePayload(payload: unknown): MiniAppRuntimePayload | null {
  if (!isRecord(payload)) {
    return null
  }

  const ui = normalizeAppUIRender(payload.ui)
  if (typeof payload.app_instance_id !== 'string' || !ui) {
    return null
  }

  const normalizedStatus = (
    isAppInstanceStatus(payload.status) ? payload.status : 'active'
  ) as MiniAppRuntimePayload['status']

  return {
    contract: payload.contract === APP_RUNTIME_CONTRACT ? payload.contract : APP_RUNTIME_CONTRACT,
    app_instance_id: payload.app_instance_id,
    workspace_id: typeof payload.workspace_id === 'string' ? payload.workspace_id : undefined,
    recipe_id: typeof payload.recipe_id === 'string' ? payload.recipe_id : '',
    recipe_version: typeof payload.recipe_version === 'string' ? payload.recipe_version : undefined,
    status: normalizedStatus,
    state: isRecord(payload.state) ? payload.state : {},
    state_version: typeof payload.state_version === 'number' ? payload.state_version : 1,
    ui,
    action_bindings: normalizeActionBindingsMap(payload.action_bindings),
    forms: normalizeFormsMap(payload.forms),
    effects: normalizeEffects(payload.effects),
  }
}
