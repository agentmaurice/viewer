import type { MiniAppRuntimePayload } from '../types/protocol'
import { normalizeActionBindingsMap, normalizeEffects, normalizeFormsMap } from './runtime-contract-normalizer'
import { isAppInstanceStatus } from './runtime-normalizer'
import { normalizeAppUIRender } from './ui-normalizer'

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export type ConflictRuntimeResolution = {
  runtime: MiniAppRuntimePayload
  hasNewerVersion: boolean
}

export function reconcileConflictRuntime(
  runtime: MiniAppRuntimePayload,
  details: unknown,
): ConflictRuntimeResolution {
  const normalizedDetails = isRecord(details) ? details : {}
  const nextVersion =
    typeof normalizedDetails.current_state_version === 'number'
      ? normalizedDetails.current_state_version
      : runtime.state_version

  return {
    runtime: {
      contract: runtime.contract,
      app_instance_id: runtime.app_instance_id,
      workspace_id: runtime.workspace_id,
      recipe_id: runtime.recipe_id,
      recipe_version: runtime.recipe_version,
      status: isAppInstanceStatus(normalizedDetails.status)
        ? normalizedDetails.status
        : runtime.status,
      state: isRecord(normalizedDetails.state)
        ? normalizedDetails.state
        : runtime.state,
      state_version: nextVersion,
      ui: normalizeAppUIRender(normalizedDetails.ui) ?? runtime.ui,
      action_bindings:
        normalizeActionBindingsMap(normalizedDetails.action_bindings) ?? runtime.action_bindings,
      forms: normalizeFormsMap(normalizedDetails.forms) ?? runtime.forms,
      effects: normalizeEffects(normalizedDetails.effects) ?? runtime.effects,
    },
    hasNewerVersion: nextVersion > runtime.state_version,
  }
}
