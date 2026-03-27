import type { AppFieldDefinition } from '../types/forms'

const TYPE_ALIASES: Record<string, string> = { file_upload: 'file', combobox: 'select', boolean: 'checkbox' }
const KNOWN_TYPES = new Set(['text', 'email', 'textarea', 'select', 'file', 'date', 'number', 'checkbox', 'url'])

export function normalizeFieldType(type: string): string {
  const aliased = TYPE_ALIASES[type] ?? type
  return KNOWN_TYPES.has(aliased) ? aliased : 'text'
}

export function isFieldVisible(field: Pick<AppFieldDefinition, 'auto_fill' | 'hidden_if_auto_filled'> & Record<string, unknown>): boolean {
  if (field.auto_fill && field.hidden_if_auto_filled) return false
  return true
}
