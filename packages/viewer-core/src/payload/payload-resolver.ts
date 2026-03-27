const ACTION_TEMPLATE_REGEX = /^\{\{action\.(\w+)\}\}$/

export function resolvePayloadTemplate(template: unknown, actionPayload: Record<string, unknown>): Record<string, unknown> {
  if (!template || typeof template !== 'object') return {}
  return resolveValue(template, actionPayload) as Record<string, unknown>
}

function resolveValue(value: unknown, actionPayload: Record<string, unknown>): unknown {
  if (typeof value === 'string') {
    const match = value.match(ACTION_TEMPLATE_REGEX)
    if (match) return actionPayload[match[1]] ?? value
    return value
  }
  if (Array.isArray(value)) return value.map((item) => resolveValue(item, actionPayload))
  if (typeof value === 'object' && value !== null) {
    const result: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) {
      result[k] = resolveValue(v, actionPayload)
    }
    return result
  }
  return value
}
