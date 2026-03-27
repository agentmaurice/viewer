export type TemplateContext = Record<string, unknown>
const TEMPLATE_REGEX = /\{\{\s*([\w.]+)\s*\}\}/g

function getNestedValue(obj: unknown, path: string): unknown {
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

export function resolveTemplate(template: string, context: TemplateContext): string {
  return template.replace(TEMPLATE_REGEX, (_match, path: string) => {
    const value = getNestedValue(context, path)
    if (value === undefined || value === null) return ''
    return String(value)
  })
}

export function resolveTemplateInTree<T extends Record<string, unknown>>(node: T, context: TemplateContext): T {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(node)) {
    if (typeof value === 'string') {
      result[key] = resolveTemplate(value, context)
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) => {
        if (typeof item === 'string') return resolveTemplate(item, context)
        if (typeof item === 'object' && item !== null)
          return resolveTemplateInTree(item as Record<string, unknown>, context)
        return item
      })
    } else if (typeof value === 'object' && value !== null) {
      result[key] = resolveTemplateInTree(value as Record<string, unknown>, context)
    } else {
      result[key] = value
    }
  }
  return result as T
}
