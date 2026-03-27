export interface DemoScenario {
  id: string
  title: string
  summary: string
  routeLabel: string
  href: string
  patterns: string[]
  kind: 'slug' | 'deployment'
  category?: string
  audience?: string
}

export interface DemoScenarioConfigInput {
  slug?: string
  deploymentId?: string
  title?: string
  summary?: string
  patterns?: string[]
  category?: string
  audience?: string
}

const PRESET_SCENARIOS: Array<{
  match: RegExp
  title: string
  summary: string
  patterns: string[]
}> = [
  {
    match: /(sales|revenue|pipeline|cockpit)/i,
    title: 'Sales cockpit',
    summary: 'KPI view with filters and reporting to showcase a dense, control-oriented OpenUI dashboard.',
    patterns: ['kpi_grid', 'tabs', 'chart', 'filter_bar'],
  },
  {
    match: /(ops|operations|review|triage|queue)/i,
    title: 'Operations review',
    summary: 'Triage workspace with an actionable table, master-detail flow, and follow-up from the current selection.',
    patterns: ['table', 'master_detail', 'action_bar', 'badge_row'],
  },
  {
    match: /(finance|budget|forecast|variance)/i,
    title: 'Finance analysis',
    summary: 'Analytical reporting demo with summary, breakdowns, and time-based charts.',
    patterns: ['kpi_grid', 'chart', 'table', 'callout'],
  },
  {
    match: /(support|ticket|incident|alert|claim)/i,
    title: 'Support control center',
    summary: 'Processing-oriented view with statuses, severity, and contextual selection.',
    patterns: ['filter_bar', 'table', 'badge_row', 'action_bar'],
  },
]

const DEFAULT_SHOWCASE_SCENARIOS: DemoScenarioConfigInput[] = [
  {
    slug: 'demo-sales-cockpit',
    title: 'Sales cockpit',
    summary: 'Viewer demo with KPIs, tabs, filters, and sales reporting.',
    patterns: ['kpi_grid', 'tabs', 'chart', 'filter_bar'],
    category: 'Executive dashboard',
    audience: 'Sales leadership',
  },
  {
    slug: 'demo-operations-review',
    title: 'Operations review',
    summary: 'Workspace demo with a clickable table, selected detail panel, and contextual actions.',
    patterns: ['table', 'master_detail', 'badge_row', 'action_bar'],
    category: 'Operations workspace',
    audience: 'Ops managers',
  },
  {
    slug: 'demo-support-center',
    title: 'Support control center',
    summary: 'Incidents and alerts demo with statuses, severity, and empty states.',
    patterns: ['filter_bar', 'table', 'badge_row', 'action_bar', 'empty_state'],
    category: 'Support cockpit',
    audience: 'Support leads',
  },
]

function prettifyLabel(raw: string): string {
  return raw
    .replace(/^d\//, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function resolvePreset(value: string): {
  title: string
  summary: string
  patterns: string[]
  category?: string
} {
  const preset = PRESET_SCENARIOS.find((candidate) => candidate.match.test(value))
  if (preset) {
    return {
      title: preset.title,
      summary: preset.summary,
      patterns: preset.patterns,
      category: preset.title,
    }
  }

  return {
    title: prettifyLabel(value),
    summary: 'Generic viewer scenario used to demonstrate OpenUI bootstrap on a real mini-app.',
    patterns: ['openui', 'forms', 'events'],
    category: 'Generic demo',
  }
}

export function buildScenarioGallery(
  slugs: string[],
  deploymentIds: string[],
  explicitScenarios: DemoScenarioConfigInput[] = [],
): DemoScenario[] {
  const sources =
    explicitScenarios.length > 0 || slugs.length > 0 || deploymentIds.length > 0
      ? explicitScenarios
      : DEFAULT_SHOWCASE_SCENARIOS
  const scenarios: DemoScenario[] = []
  const seen = new Set<string>()

  for (const input of sources) {
    const slug = input.slug?.trim()
    const deploymentId = input.deploymentId?.trim()
    if (!slug && !deploymentId) {
      continue
    }

    const rawValue = slug ?? deploymentId!
    const kind: 'slug' | 'deployment' = slug ? 'slug' : 'deployment'
    const preset = resolvePreset(rawValue)
    const href = slug ? `/${slug}` : `/d/${deploymentId}`
    const routeLabel = slug ? `/${slug}` : `/d/${deploymentId}`
    const id = `${kind}:${rawValue}`
    if (seen.has(id)) {
      continue
    }
    seen.add(id)

    scenarios.push({
      id,
      title: input.title?.trim() || preset.title,
      summary: input.summary?.trim() || preset.summary,
      routeLabel,
      href,
      patterns: input.patterns?.filter(Boolean) ?? preset.patterns,
      kind,
      category: input.category?.trim() || preset.category,
      audience: input.audience?.trim(),
    })
  }

  for (const slug of slugs) {
    const id = `slug:${slug}`
    if (seen.has(id)) {
      continue
    }
    const preset = resolvePreset(slug)
    scenarios.push({
      id,
      title: preset.title,
      summary: preset.summary,
      routeLabel: `/${slug}`,
      href: `/${slug}`,
      patterns: preset.patterns,
      kind: 'slug',
      category: preset.category,
    })
  }

  for (const deploymentId of deploymentIds) {
    const id = `deployment:${deploymentId}`
    if (seen.has(id)) {
      continue
    }
    const preset = resolvePreset(deploymentId)
    scenarios.push({
      id,
      title: preset.title,
      summary: `${preset.summary} Direct access by deployment ID for internal demo environments.`,
      routeLabel: `/d/${deploymentId}`,
      href: `/d/${deploymentId}`,
      patterns: preset.patterns,
      kind: 'deployment',
      category: preset.category,
    })
  }

  return scenarios
}
