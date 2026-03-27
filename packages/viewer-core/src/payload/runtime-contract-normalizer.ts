import type {
  AppActionBinding,
  AppEffect,
} from '../types/events'
import type {
  AppFieldDefinition,
  AppFieldOption,
  AppFormDefinition,
} from '../types/forms'
import { normalizeFieldType } from './form-normalizer'

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizeFieldOption(value: unknown): AppFieldOption | null {
  if (!isRecord(value)) {
    return null
  }

  if (typeof value.value !== 'string' || typeof value.label !== 'string') {
    return null
  }

  return {
    value: value.value,
    label: value.label,
  }
}

function normalizeFieldDefinition(value: unknown): AppFieldDefinition | null {
  if (!isRecord(value) || typeof value.name !== 'string') {
    return null
  }

  const options = Array.isArray(value.options)
    ? value.options
        .map((option) => normalizeFieldOption(option))
        .filter((option): option is AppFieldOption => option !== null)
    : undefined

  return {
    name: value.name,
    type: normalizeFieldType(typeof value.type === 'string' ? value.type : 'text'),
    required: Boolean(value.required),
    description: typeof value.description === 'string' ? value.description : undefined,
    default: value.default,
    options,
    accept: typeof value.accept === 'string' ? value.accept : undefined,
    max_size_mb: typeof value.max_size_mb === 'number' ? value.max_size_mb : undefined,
    auto_fill: typeof value.auto_fill === 'string' ? value.auto_fill : undefined,
    hidden_if_auto_filled:
      typeof value.hidden_if_auto_filled === 'boolean'
        ? value.hidden_if_auto_filled
        : undefined,
  }
}

function normalizeFormDefinition(value: unknown): AppFormDefinition | null {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.title !== 'string') {
    return null
  }

  if (!Array.isArray(value.fields)) {
    return null
  }

  const fields = value.fields
    .map((field) => normalizeFieldDefinition(field))
    .filter((field): field is AppFieldDefinition => field !== null)

  return {
    id: value.id,
    title: value.title,
    fields,
    next: typeof value.next === 'string' ? value.next : undefined,
    actions_on_submit: Array.isArray(value.actions_on_submit)
      ? value.actions_on_submit.filter((action): action is string => typeof action === 'string')
      : undefined,
  }
}

export function normalizeFormsMap(value: unknown): Record<string, AppFormDefinition> | undefined {
  if (!isRecord(value)) {
    return undefined
  }

  const entries = Object.entries(value)
    .map(([key, form]) => {
      const normalized = normalizeFormDefinition(form)
      return normalized ? [key, normalized] : null
    })
    .filter((entry): entry is [string, AppFormDefinition] => entry !== null)

  return entries.length > 0 ? Object.fromEntries(entries) : undefined
}

function normalizeActionBinding(value: unknown): AppActionBinding | null {
  if (!isRecord(value) || typeof value.event_id !== 'string') {
    return null
  }

  return {
    event_id: value.event_id,
    payload_template: isRecord(value.payload_template)
      ? value.payload_template
      : undefined,
  }
}

export function normalizeActionBindingsMap(value: unknown): Record<string, AppActionBinding> | undefined {
  if (!isRecord(value)) {
    return undefined
  }

  const entries = Object.entries(value)
    .map(([key, binding]) => {
      const normalized = normalizeActionBinding(binding)
      return normalized ? [key, normalized] : null
    })
    .filter((entry): entry is [string, AppActionBinding] => entry !== null)

  return entries.length > 0 ? Object.fromEntries(entries) : undefined
}

function normalizeEffect(value: unknown): AppEffect | null {
  if (!isRecord(value) || typeof value.type !== 'string') {
    return null
  }

  return {
    type: value.type,
    payload: isRecord(value.payload) ? value.payload : undefined,
  }
}

export function normalizeEffects(value: unknown): AppEffect[] | undefined {
  if (!Array.isArray(value)) {
    return undefined
  }

  const effects = value
    .map((entry) => normalizeEffect(entry))
    .filter((entry): entry is AppEffect => entry !== null)

  return effects.length > 0 ? effects : undefined
}
