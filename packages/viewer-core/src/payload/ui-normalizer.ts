import type { AppNode, AppUIRender } from '../types/protocol'

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizeChildren(value: unknown): AppNode[] | undefined {
  if (!Array.isArray(value)) {
    return undefined
  }

  const children = value
    .map((child) => normalizeAppNode(child))
    .filter((child): child is AppNode => child !== null)

  return children
}

export function normalizeAppNode(value: unknown): AppNode | null {
  if (!isRecord(value)) {
    return null
  }

  const type = typeof value.type === 'string' ? value.type : undefined

  if (!type) {
    const children = normalizeChildren(value.children)
    if (!children || children.length === 0) {
      return null
    }
    return {
      ...value,
      children,
      layout: value.layout === 'row' ? 'row' : value.layout === 'column' ? 'column' : undefined,
    }
  }

  switch (type) {
    case 'text':
      return typeof value.value === 'string' ? { ...value, type, value: value.value } : null
    case 'button':
      return typeof value.label === 'string' && typeof value.on_click === 'string'
        ? { ...value, type, label: value.label, on_click: value.on_click }
        : null
    case 'stat':
      return typeof value.label === 'string' &&
        (typeof value.value === 'string' || typeof value.value === 'number')
        ? { ...value, type, label: value.label, value: value.value }
        : null
    case 'kpi_grid': {
      if (!Array.isArray(value.items)) {
        return null
      }
      const items = value.items
        .map((item) => {
          if (!isRecord(item) || typeof item.label !== 'string') {
            return null
          }
          if (typeof item.value !== 'string' && typeof item.value !== 'number') {
            return null
          }
          const tone: 'info' | 'success' | 'warning' | 'error' | undefined =
            item.tone === 'info' ||
            item.tone === 'success' ||
            item.tone === 'warning' ||
            item.tone === 'error'
              ? item.tone
              : undefined
          return {
            ...item,
            label: item.label,
            value: item.value,
            tone,
          }
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
      return {
        ...value,
        type,
        items,
      }
    }
    case 'list': {
      if (!Array.isArray(value.source)) {
        return null
      }
      const itemTemplate = normalizeAppNode(value.item_template)
      if (!itemTemplate) {
        return null
      }
      return {
        ...value,
        type,
        source: value.source,
        item_template: itemTemplate,
        on_item_click: typeof value.on_item_click === 'string' ? value.on_item_click : undefined,
      }
    }
    case 'tabs': {
      if (!Array.isArray(value.items) || typeof value.on_tab_click !== 'string') {
        return null
      }
      return {
        ...value,
        type,
        items: value.items.filter((item): item is string => typeof item === 'string'),
        active: typeof value.active === 'string' ? value.active : undefined,
        on_tab_click: value.on_tab_click,
      }
    }
    case 'filter_bar': {
      if (!Array.isArray(value.filters)) {
        return null
      }
      const filters = value.filters
        .map((filter) => {
          if (
            !isRecord(filter) ||
            typeof filter.label !== 'string' ||
            typeof filter.value !== 'string' ||
            typeof filter.on_click !== 'string'
          ) {
            return null
          }
          return {
            ...filter,
            label: filter.label,
            value: filter.value,
            on_click: filter.on_click,
            active: typeof filter.active === 'boolean' ? filter.active : undefined,
          }
        })
        .filter((filter): filter is NonNullable<typeof filter> => filter !== null)
      return filters.length > 0
        ? {
            ...value,
            type,
            filters,
          }
        : null
    }
    case 'action_bar': {
      if (!Array.isArray(value.actions)) {
        return null
      }
      const actions = value.actions
        .map((action) => {
          if (!isRecord(action) || typeof action.label !== 'string') {
            return null
          }
          const onClick = typeof action.on_click === 'string' ? action.on_click : undefined
          const formId = typeof action.form_id === 'string' ? action.form_id : undefined
          const variant: 'primary' | 'secondary' | undefined =
            action.variant === 'primary' || action.variant === 'secondary'
              ? action.variant
              : undefined
          if (!onClick && !formId) {
            return null
          }
          return {
            ...action,
            label: action.label,
            variant,
            on_click: onClick,
            form_id: formId,
            submit_event: typeof action.submit_event === 'string' ? action.submit_event : undefined,
          }
        })
        .filter((action): action is NonNullable<typeof action> => action !== null)
      return actions.length > 0
        ? {
            ...value,
            type,
            actions,
          }
        : null
    }
    case 'badge_row': {
      if (!Array.isArray(value.items)) {
        return null
      }
      const items = value.items
        .map((item) => {
          if (
            !isRecord(item) ||
            typeof item.label !== 'string' ||
            typeof item.value !== 'string'
          ) {
            return null
          }
          const tone: 'info' | 'success' | 'warning' | 'error' | undefined =
            item.tone === 'info' ||
            item.tone === 'success' ||
            item.tone === 'warning' ||
            item.tone === 'error'
              ? item.tone
              : undefined
          return {
            ...item,
            label: item.label,
            value: item.value,
            tone,
          }
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
      return items.length > 0
        ? {
            ...value,
            type,
            items,
          }
        : null
    }
    case 'callout':
      return typeof value.value === 'string'
        ? {
            ...value,
            type,
            value: value.value,
            title: typeof value.title === 'string' ? value.title : undefined,
            tone:
              value.tone === 'info' ||
              value.tone === 'success' ||
              value.tone === 'warning' ||
              value.tone === 'error'
                ? value.tone
                : undefined,
          }
        : null
    case 'empty_state':
      return typeof value.title === 'string' && typeof value.description === 'string'
        ? {
            ...value,
            type,
            title: value.title,
            description: value.description,
            action_label: typeof value.action_label === 'string' ? value.action_label : undefined,
            on_click: typeof value.on_click === 'string' ? value.on_click : undefined,
          }
        : null
    case 'chart':
      return Array.isArray(value.data) &&
        (value.chart_type === 'bar' || value.chart_type === 'line') &&
        typeof value.x_key === 'string' &&
        typeof value.y_key === 'string'
        ? {
            ...value,
            type,
            chart_type: value.chart_type,
            data: value.data,
            x_key: value.x_key,
            y_key: value.y_key,
            title: typeof value.title === 'string' ? value.title : undefined,
          }
        : null
    case 'table':
      return Array.isArray(value.columns) && Array.isArray(value.rows)
        ? {
            ...value,
            type,
            columns: value.columns.filter((column): column is string => typeof column === 'string'),
            rows: value.rows,
          }
        : null
    case 'section':
    case 'card': {
      const children = normalizeChildren(value.children)
      if (!children || children.length === 0) {
        return null
      }
      return {
        ...value,
        type,
        children,
        title: typeof value.title === 'string' ? value.title : undefined,
        subtitle: typeof value.subtitle === 'string' ? value.subtitle : undefined,
        layout: value.layout === 'row' ? 'row' : value.layout === 'column' ? 'column' : undefined,
      }
    }
    case 'form_link':
      return typeof value.label === 'string' && typeof value.form_id === 'string'
        ? {
            ...value,
            type,
            label: value.label,
            form_id: value.form_id,
            submit_event: typeof value.submit_event === 'string' ? value.submit_event : undefined,
          }
        : null
    default: {
      const children = normalizeChildren(value.children)
      if (children && children.length > 0) {
        return {
          ...value,
          type,
          children,
          layout: value.layout === 'row' ? 'row' : value.layout === 'column' ? 'column' : undefined,
        }
      }
      return {
        ...value,
        type,
      } as AppNode
    }
  }
}

export function normalizeAppUIRender(value: unknown): AppUIRender | null {
  if (!isRecord(value) || typeof value.view !== 'string') {
    return null
  }

  const tree = value.tree === undefined ? undefined : normalizeAppNode(value.tree)
  const fallbackTree =
    value.fallback_tree === undefined ? undefined : normalizeAppNode(value.fallback_tree)

  return {
    view: value.view,
    tree: tree ?? undefined,
    format: typeof value.format === 'string' ? value.format : undefined,
    library: typeof value.library === 'string' ? value.library : undefined,
    program: typeof value.program === 'string' ? value.program : undefined,
    initial_state: isRecord(value.initial_state) ? value.initial_state : undefined,
    fallback_tree: fallbackTree ?? undefined,
  }
}
