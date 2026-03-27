import React, { useMemo } from 'react'
import {
  APP_RUNTIME_CONTRACT,
  ComponentRegistry,
  type AppFormDefinition,
  type AppNode,
  type MiniAppRuntimePayload,
  type ViewerState,
  type ViewerStateController,
  type ViewerStateListener,
} from '@agent-maurice/viewer-core'
import { ViewerRoot, defaultWebRegistry } from '@agent-maurice/viewer-web'
import type { DemoScenario } from './scenarios.js'

type DemoFlavor = 'sales' | 'operations' | 'finance' | 'support' | 'generic'

type DemoRow = {
  id: string
  title: string
  status: string
  owner: string
  priority: string
  summary: string
}

type MockState = {
  segment: string
  filter: string
  note: string
  selectedId: string | null
  empty: boolean
  version: number
}

type MockDataset = {
  segments: string[]
  filters: string[]
  metrics: Array<{ label: string; value: string | number; tone?: 'info' | 'success' | 'warning' | 'error' }>
  chartTitle: string
  chartType: 'bar' | 'line'
  chartData: Array<Record<string, string | number>>
  rows: DemoRow[]
  emptyTitle: string
  emptyDescription: string
  subtitle: string
}

function detectFlavor(scenario: DemoScenario): DemoFlavor {
  const source = `${scenario.title} ${scenario.summary} ${scenario.category ?? ''} ${scenario.patterns.join(' ')}`
  if (/(sales|commercial|pipeline|revenue|cockpit)/i.test(source)) return 'sales'
  if (/(finance|budget|forecast|variance)/i.test(source)) return 'finance'
  if (/(support|incident|alert|claim|ticket)/i.test(source)) return 'support'
  if (/(operations|review|triage|queue|workspace)/i.test(source)) return 'operations'
  return 'generic'
}

function buildDataset(flavor: DemoFlavor): MockDataset {
  switch (flavor) {
    case 'sales':
      return {
        segments: ['Enterprise', 'Mid-market', 'SMB'],
        filters: ['New', 'In progress', 'At risk'],
        metrics: [
          { label: 'Pipeline', value: '12,4 M€', tone: 'success' },
          { label: 'Win rate', value: '37 %', tone: 'info' },
          { label: 'Risk', value: '4 deals', tone: 'warning' },
        ],
        chartTitle: 'Pipeline by month',
        chartType: 'bar',
        chartData: [
          { label: 'Jan', value: 3.2 },
          { label: 'Feb', value: 4.1 },
          { label: 'Mar', value: 5.6 },
          { label: 'Apr', value: 6.4 },
        ],
        rows: [
          { id: 'deal-104', title: 'Orange Expansion', status: 'In progress', owner: 'Lucie', priority: 'High', summary: 'Multi-country renewal to secure before quarter end.' },
          { id: 'deal-118', title: 'Retail Europe', status: 'New', owner: 'Hugo', priority: 'Medium', summary: 'New partner pipeline with a need for fast framing.' },
          { id: 'deal-126', title: 'Telecom Migration', status: 'At risk', owner: 'Salome', priority: 'High', summary: 'Tight deadlines and dependency on a security approval.' },
        ],
        emptyTitle: 'No deals in this segment',
        emptyDescription: 'Reload the view or choose another filter to continue the demo.',
        subtitle: 'KPI cockpit, monthly reporting, and contextual selection',
      }
    case 'finance':
      return {
        segments: ['30 days', '90 days', 'YTD'],
        filters: ['Budget', 'Forecast', 'Variance'],
        metrics: [
          { label: 'Budget', value: '4,9 M€', tone: 'info' },
          { label: 'Variance', value: '-3,2 %', tone: 'warning' },
          { label: 'Savings', value: '410 k€', tone: 'success' },
        ],
        chartTitle: 'Variance trend',
        chartType: 'line',
        chartData: [
          { label: 'S1', value: 2.1 },
          { label: 'S2', value: 1.4 },
          { label: 'S3', value: -0.8 },
          { label: 'S4', value: -3.2 },
        ],
        rows: [
          { id: 'budget-1', title: 'Marketing EMEA', status: 'Forecast', owner: 'Eva', priority: 'Medium', summary: 'Marketing spend tracking with end-of-quarter correction.' },
          { id: 'budget-2', title: 'Cloud Platform', status: 'Budget', owner: 'Noah', priority: 'High', summary: 'Infrastructure costs under watch after a traffic increase.' },
          { id: 'budget-3', title: 'Services Pro', status: 'Variance', owner: 'Chloe', priority: 'High', summary: 'Significant margin gap on service delivery with arbitration to plan.' },
        ],
        emptyTitle: 'No budget lines',
        emptyDescription: 'This preview simulates an empty state to illustrate OpenUI reporting interfaces.',
        subtitle: 'Finance summary, time series, and analytical table',
      }
    case 'support':
      return {
        segments: ['Today', 'This week', 'This month'],
        filters: ['New', 'In progress', 'Blocked'],
        metrics: [
          { label: 'Incidents', value: 18, tone: 'warning' },
          { label: 'MTTR', value: '42 min', tone: 'info' },
          { label: 'SLA breaches', value: 2, tone: 'error' },
        ],
        chartTitle: 'Open incidents',
        chartType: 'bar',
        chartData: [
          { label: 'Mon', value: 4 },
          { label: 'Tue', value: 7 },
          { label: 'Wed', value: 6 },
          { label: 'Thu', value: 5 },
        ],
        rows: [
          { id: 'alert-204', title: 'API latency spike', status: 'Blocked', owner: 'Nina', priority: 'Critical', summary: 'Sharp latency increase observed in the EMEA region.' },
          { id: 'alert-219', title: 'Webhook backlog', status: 'In progress', owner: 'Rayan', priority: 'High', summary: 'Event backlog to reduce before customer impact worsens.' },
          { id: 'alert-233', title: 'SSO callback failures', status: 'New', owner: 'Zoe', priority: 'High', summary: 'Callback errors rising after secret rotation.' },
        ],
        emptyTitle: 'No alerts for this filter',
        emptyDescription: 'The empty-state panel lets you show OpenUI rendering without active data.',
        subtitle: 'Support control center with statuses, severity, and follow-up actions',
      }
    case 'operations':
      return {
        segments: ['Today', 'This week', 'This month'],
        filters: ['Needs review', 'Waiting', 'Validated'],
        metrics: [
          { label: 'Backlog', value: 24, tone: 'info' },
          { label: 'Blocked', value: 3, tone: 'warning' },
          { label: 'Processed', value: 41, tone: 'success' },
        ],
        chartTitle: 'Processing flow',
        chartType: 'line',
        chartData: [
          { label: '08h', value: 3 },
          { label: '10h', value: 9 },
          { label: '12h', value: 7 },
          { label: '14h', value: 5 },
        ],
        rows: [
          { id: 'run-001', title: 'Partner validation', status: 'Needs review', owner: 'Camille', priority: 'High', summary: 'One validation batch is waiting for an operational decision.' },
          { id: 'run-002', title: 'Compliance check', status: 'Waiting', owner: 'Yanis', priority: 'Medium', summary: 'Deferred verification while supporting documents are pending.' },
          { id: 'run-003', title: 'Escalation review', status: 'Validated', owner: 'Mila', priority: 'Low', summary: 'The morning batch closed with no notable incident.' },
        ],
        emptyTitle: 'No items to process',
        emptyDescription: 'Enable another filter or reload the stream to show the empty state of your workspace.',
        subtitle: 'Review workspace with selected detail and quick actions',
      }
    default:
      return {
        segments: ['Primary', 'Detail', 'Summary'],
        filters: ['Active', 'Watched', 'Archived'],
        metrics: [
          { label: 'Items', value: 12, tone: 'info' },
          { label: 'Attention', value: 3, tone: 'warning' },
          { label: 'Closed', value: 18, tone: 'success' },
        ],
        chartTitle: 'Demo overview',
        chartType: 'bar',
        chartData: [
          { label: 'A', value: 2 },
          { label: 'B', value: 4 },
          { label: 'C', value: 3 },
          { label: 'D', value: 5 },
        ],
        rows: [
          { id: 'item-1', title: 'Primary item', status: 'Active', owner: 'Team A', priority: 'Medium', summary: 'Generic scenario used to present the structure of the interface.' },
          { id: 'item-2', title: 'Secondary item', status: 'Watched', owner: 'Team B', priority: 'Low', summary: 'Content variation used to show the master-detail pattern.' },
        ],
        emptyTitle: 'No content to display',
        emptyDescription: 'This offline preview illustrates the behavior of an OpenUI empty state.',
        subtitle: 'Generic scenario used to demonstrate viewer building blocks',
      }
  }
}

function createForms(dataset: MockDataset): Record<string, AppFormDefinition> {
  return {
    adjust_focus: {
      id: 'adjust_focus',
      title: 'Adjust the demo',
      fields: [
        {
          name: 'segment',
          type: 'select',
          description: 'Segment or period to highlight',
          options: dataset.segments.map((value) => ({ value, label: value })),
        },
        {
          name: 'comment',
          type: 'textarea',
          description: 'Context message to inject into the demo',
        },
      ],
    },
  }
}

function buildChartNode(dataset: MockDataset): AppNode {
  return {
    type: 'card',
    title: dataset.chartTitle,
    subtitle: 'Offline OpenUI preview',
    children: [
      {
        type: 'chart',
        chart_type: dataset.chartType,
        data: dataset.chartData,
        x_key: 'label',
        y_key: 'value',
      },
    ],
  }
}

function buildRuntime(scenario: DemoScenario, draft: MockState): MiniAppRuntimePayload {
  const dataset = buildDataset(detectFlavor(scenario))
  const selectedRow =
    dataset.rows.find((row) => row.id === draft.selectedId) ?? dataset.rows[0] ?? null

  const children: AppNode[] = [
    {
      type: 'callout',
      title: 'Offline preview',
      value: draft.note,
      tone: 'info',
    },
  ]

  if (scenario.patterns.includes('tabs')) {
    children.push({
      type: 'tabs',
      items: dataset.segments,
      active: draft.segment,
      on_tab_click: 'select_segment',
    })
  }

  if (scenario.patterns.includes('filter_bar')) {
    children.push({
      type: 'filter_bar',
      filters: dataset.filters.map((value) => ({
        label: value,
        value,
        on_click: 'select_filter',
        active: draft.filter === value,
      })),
    })
  }

  if (draft.empty) {
      children.push({
        type: 'empty_state',
        title: dataset.emptyTitle,
        description: dataset.emptyDescription,
        action_label: 'Reload',
        on_click: 'reset_empty',
      })
  } else {
    if (scenario.patterns.includes('kpi_grid')) {
      children.push({
        type: 'section',
        title: 'Key metrics',
        subtitle: dataset.subtitle,
        children: [
          {
            type: 'kpi_grid',
            items: dataset.metrics,
          },
        ],
      })
    }

    if (scenario.patterns.includes('chart')) {
      children.push(buildChartNode(dataset))
    }

    if (scenario.patterns.includes('table') || scenario.patterns.includes('master_detail')) {
      children.push({
        type: 'section',
        title: 'Items',
        subtitle: 'Contextual selection to show viewer interactions',
        children: [
          {
            type: 'table',
            columns: ['title', 'status', 'owner'],
            column_labels: {
              title: 'Item',
              status: 'Status',
              owner: 'Owner',
            },
            rows: dataset.rows.map((row) => ({
              id: row.id,
              title: row.title,
              status: row.status,
              owner: row.owner,
              priority: row.priority,
              summary: row.summary,
            })),
            on_row_click: 'select_row',
          },
        ],
      })
    }

    if (selectedRow && (scenario.patterns.includes('master_detail') || scenario.patterns.includes('badge_row') || scenario.patterns.includes('action_bar'))) {
      const detailChildren: AppNode[] = []
      if (scenario.patterns.includes('badge_row')) {
        detailChildren.push({
          type: 'badge_row',
          items: [
            { label: 'Status', value: selectedRow.status, tone: 'info' },
            {
              label: 'Priority',
              value: selectedRow.priority,
              tone: selectedRow.priority === 'Critical' || selectedRow.priority === 'High' ? 'warning' : 'success',
            },
            { label: 'Owner', value: selectedRow.owner, tone: 'info' },
          ],
        })
      }
      detailChildren.push({
        type: 'text',
        value: selectedRow.summary,
      })
      if (scenario.patterns.includes('action_bar')) {
        detailChildren.push({
          type: 'action_bar',
          actions: [
            { label: 'Configure', variant: 'primary', form_id: 'adjust_focus' },
            { label: 'Refresh', variant: 'secondary', on_click: 'refresh_preview' },
            { label: 'Empty state', variant: 'secondary', on_click: 'toggle_empty' },
          ],
        })
      } else {
        detailChildren.push({
          type: 'form_link',
          label: 'Configure this demo',
          form_id: 'adjust_focus',
        })
      }

      children.push({
        type: 'card',
        title: selectedRow.title,
        subtitle: `${selectedRow.status} • ${selectedRow.owner}`,
        children: detailChildren,
      })
    }
  }

  return {
    contract: APP_RUNTIME_CONTRACT,
    app_instance_id: `mock-${scenario.id}`,
    recipe_id: scenario.id,
    status: 'active',
    state: {
      selected_id: draft.selectedId,
      segment: draft.segment,
      filter: draft.filter,
      empty: draft.empty,
    },
    state_version: draft.version,
    ui: {
      view: 'main',
      tree: {
        type: 'section',
        title: scenario.title,
        subtitle: scenario.audience ? `${scenario.category ?? 'Preview'} • ${scenario.audience}` : scenario.summary,
        children,
      },
      fallback_tree: {
        type: 'section',
        title: scenario.title,
        children: [
          {
            type: 'text',
            value: draft.note,
          },
        ],
      },
    },
    forms: createForms(dataset),
    effects: [],
  }
}

class MockViewerController implements ViewerStateController {
  private readonly listeners = new Set<ViewerStateListener>()
  private readonly dataset: MockDataset
  private state: ViewerState
  private draft: MockState

  constructor(private readonly scenario: DemoScenario) {
    this.dataset = buildDataset(detectFlavor(scenario))
    this.draft = {
      segment: this.dataset.segments[0] ?? 'Primary',
      filter: this.dataset.filters[0] ?? 'Active',
      note: `Offline preview for "${scenario.title}". Use the interactions to show OpenUI building blocks without a backend.`,
      selectedId: this.dataset.rows[0]?.id ?? null,
      empty: false,
      version: 1,
    }
    this.state = {
      phase: 'ready',
      runtime: buildRuntime(this.scenario, this.draft),
      error: null,
    }
  }

  getState(): ViewerState {
    return this.state
  }

  subscribe(listener: ViewerStateListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  async dispatchEvent(eventId: string, payload: Record<string, unknown>): Promise<void> {
    switch (eventId) {
      case 'select_segment':
        this.draft.segment = String(payload.item ?? payload.value ?? this.draft.segment)
        this.draft.note = `Active segment: ${this.draft.segment}. The demo remains local and reactive.`
        break
      case 'select_filter':
        this.draft.filter = String(payload.value ?? payload.label ?? this.draft.filter)
        this.draft.note = `Active filter: ${this.draft.filter}. Use this behavior to demonstrate an OpenUI filter bar.`
        break
      case 'select_row': {
        const rowId =
          typeof payload.id === 'string'
            ? payload.id
            : typeof payload.index === 'number'
              ? this.dataset.rows[payload.index]?.id
              : undefined
        this.draft.selectedId = rowId ?? this.draft.selectedId
        const selectedRow = this.dataset.rows.find((row) => row.id === this.draft.selectedId)
        if (selectedRow) {
          this.draft.note = `Selected item: ${selectedRow.title}. The detail panel is updated locally.`
        }
        break
      }
      case 'refresh_preview':
        this.draft.note = `Simulated refresh on ${this.draft.segment} / ${this.draft.filter}.`
        break
      case 'toggle_empty':
        this.draft.empty = !this.draft.empty
        this.draft.note = this.draft.empty
          ? 'Empty state enabled to demonstrate the empty_state component.'
          : 'Empty state disabled. Demo data is back.'
        break
      case 'reset_empty':
        this.draft.empty = false
        this.draft.note = 'Empty state closed. Back to the full scenario.'
        break
      case 'form_submit': {
        const data =
          payload.data && typeof payload.data === 'object'
            ? (payload.data as Record<string, unknown>)
            : {}
        if (typeof data.segment === 'string' && data.segment.trim()) {
          this.draft.segment = data.segment
        }
        if (typeof data.comment === 'string' && data.comment.trim()) {
          this.draft.note = data.comment.trim()
        } else {
          this.draft.note = `Form submitted for ${this.draft.segment}. The viewer can simulate a product round trip without a backend.`
        }
        break
      }
      default:
        this.draft.note = `Event triggered: ${eventId}.`
        break
    }

    this.draft.version += 1
    this.state = {
      phase: 'ready',
      runtime: buildRuntime(this.scenario, this.draft),
      error: null,
    }
    for (const listener of this.listeners) {
      listener(this.state)
    }
  }
}

type NodeProps = Record<string, unknown> & {
  children?: React.ReactNode
  onEvent?: (eventId: string, payload?: Record<string, unknown>) => void
  onOpenForm?: (formId: string, submitEvent?: string) => void
}

function DemoSectionNode(props: NodeProps): React.ReactElement {
  return (
    <section style={sectionStyle}>
      {typeof props.title === 'string' ? <h3 style={sectionTitleStyle}>{props.title}</h3> : null}
      {typeof props.subtitle === 'string' ? <p style={sectionSubtitleStyle}>{props.subtitle}</p> : null}
      <div style={sectionContentStyle}>{props.children}</div>
    </section>
  )
}

function DemoCardNode(props: NodeProps): React.ReactElement {
  return (
    <section style={cardStyle}>
      {typeof props.title === 'string' ? <h3 style={sectionTitleStyle}>{props.title}</h3> : null}
      {typeof props.subtitle === 'string' ? <p style={sectionSubtitleStyle}>{props.subtitle}</p> : null}
      <div style={sectionContentStyle}>{props.children}</div>
    </section>
  )
}

function DemoKPIGridNode(props: NodeProps): React.ReactElement {
  const items = Array.isArray(props.items) ? props.items : []
  return (
    <div style={kpiGridStyle}>
      {items.map((rawItem, index) => {
        const item = (rawItem as Record<string, unknown>) ?? {}
        return (
          <div key={index} style={kpiCardStyle}>
            <div style={tinyLabelStyle}>{String(item.label ?? 'Metric')}</div>
            <div style={kpiValueStyle}>{String(item.value ?? '')}</div>
          </div>
        )
      })}
    </div>
  )
}

function DemoTabsNode(props: NodeProps): React.ReactElement {
  const items = Array.isArray(props.items) ? props.items : []
  const active = typeof props.active === 'string' ? props.active : ''
  return (
    <div style={tabRowStyle}>
      {items.map((item, index) => (
        <button
          key={`${String(item)}-${index}`}
          type="button"
          style={String(item) === active ? activeTabStyle : tabStyle}
          onClick={() => props.onEvent?.(String(props.on_tab_click ?? ''), { item, index })}
        >
          {String(item)}
        </button>
      ))}
    </div>
  )
}

function DemoFilterBarNode(props: NodeProps): React.ReactElement {
  const filters = Array.isArray(props.filters) ? props.filters : []
  return (
    <div style={filterRowStyle}>
      {filters.map((rawFilter, index) => {
        const filter = (rawFilter as Record<string, unknown>) ?? {}
        const active = Boolean(filter.active)
        return (
          <button
            key={`${String(filter.label ?? index)}-${index}`}
            type="button"
            style={active ? activeFilterStyle : filterStyle}
            onClick={() =>
              props.onEvent?.(String(filter.on_click ?? ''), {
                label: filter.label,
                value: filter.value,
                index,
              })
            }
          >
            {String(filter.label ?? filter.value ?? '')}
          </button>
        )
      })}
    </div>
  )
}

function DemoBadgeRowNode(props: NodeProps): React.ReactElement {
  const items = Array.isArray(props.items) ? props.items : []
  return (
    <div style={badgeRowStyle}>
      {items.map((rawItem, index) => {
        const item = (rawItem as Record<string, unknown>) ?? {}
        return (
          <span key={index} style={{ ...badgeStyle, ...toneStyle(String(item.tone ?? 'info')) }}>
            {String(item.label ?? '')}: {String(item.value ?? '')}
          </span>
        )
      })}
    </div>
  )
}

function DemoActionBarNode(props: NodeProps): React.ReactElement {
  const actions = Array.isArray(props.actions) ? props.actions : []
  return (
    <div style={actionBarStyle}>
      {actions.map((rawAction, index) => {
        const action = (rawAction as Record<string, unknown>) ?? {}
        const isPrimary = action.variant === 'primary'
        return (
          <button
            key={`${String(action.label ?? index)}-${index}`}
            type="button"
            style={isPrimary ? primaryActionStyle : secondaryActionStyle}
            onClick={() => {
              if (typeof action.form_id === 'string' && action.form_id) {
                props.onOpenForm?.(action.form_id, typeof action.submit_event === 'string' ? action.submit_event : undefined)
                return
              }
              props.onEvent?.(String(action.on_click ?? ''), { index })
            }}
          >
            {String(action.label ?? '')}
          </button>
        )
      })}
    </div>
  )
}

function DemoEmptyStateNode(props: NodeProps): React.ReactElement {
  return (
    <div style={emptyStateStyle}>
      <h3 style={{ margin: 0, fontSize: 24 }}>{String(props.title ?? 'No content')}</h3>
      <p style={{ margin: 0, color: '#64748B', lineHeight: 1.6 }}>{String(props.description ?? '')}</p>
      {typeof props.action_label === 'string' && typeof props.on_click === 'string' ? (
        <button type="button" style={primaryActionStyle} onClick={() => props.onEvent?.(props.on_click as string, {})}>
          {props.action_label as string}
        </button>
      ) : null}
    </div>
  )
}

function DemoChartNode(props: NodeProps): React.ReactElement {
  const data = Array.isArray(props.data) ? props.data : []
  const points = data.map((rawItem) => {
    const item = (rawItem as Record<string, unknown>) ?? {}
    const label = String(item[props.x_key as string] ?? '')
    const value = Number(item[props.y_key as string] ?? 0)
    return { label, value }
  })
  const maxValue = Math.max(...points.map((point) => point.value), 1)

  if (props.chart_type === 'line') {
    const width = 520
    const height = 180
    const step = points.length > 1 ? width / (points.length - 1) : width
    const polyline = points
      .map((point, index) => {
        const x = index * step
        const y = height - (point.value / maxValue) * (height - 24) - 12
        return `${x},${y}`
      })
      .join(' ')

    return (
      <div style={chartWrapperStyle}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 220 }}>
          <polyline fill="none" stroke="#0F766E" strokeWidth="4" points={polyline} />
          {points.map((point, index) => {
            const x = index * step
            const y = height - (point.value / maxValue) * (height - 24) - 12
            return <circle key={point.label} cx={x} cy={y} r="5" fill="#0F766E" />
          })}
        </svg>
        <div style={chartLegendStyle}>
          {points.map((point) => (
            <div key={point.label} style={chartLegendItemStyle}>
              <strong>{point.label}</strong>
              <span>{point.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={chartWrapperStyle}>
      {points.map((point) => (
        <div key={point.label} style={barRowStyle}>
          <div style={barLabelStyle}>{point.label}</div>
          <div style={barTrackStyle}>
            <div style={{ ...barFillStyle, width: `${(point.value / maxValue) * 100}%` }} />
          </div>
          <div style={barValueStyle}>{point.value}</div>
        </div>
      ))}
    </div>
  )
}

function DemoTableNode(props: NodeProps): React.ReactElement {
  const columns = Array.isArray(props.columns) ? props.columns.map(String) : []
  const columnLabels =
    props.column_labels && typeof props.column_labels === 'object'
      ? (props.column_labels as Record<string, string>)
      : {}
  const rows = Array.isArray(props.rows) ? props.rows : []
  const onRowClick = typeof props.on_row_click === 'string' ? props.on_row_click : undefined

  return (
    <div style={tableWrapperStyle}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} style={tableHeaderStyle}>
                {columnLabels[column] ?? column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((rawRow, index) => {
            const row = (rawRow as Record<string, unknown>) ?? {}
            return (
              <tr
                key={String(row.id ?? index)}
                style={onRowClick ? tableRowInteractiveStyle : tableRowStyle}
                onClick={() => onRowClick && props.onEvent?.(onRowClick, { ...row, index, id: row.id })}
              >
                {columns.map((column) => (
                  <td key={column} style={tableCellStyle}>
                    {String(row[column] ?? '')}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function toneStyle(tone: string): React.CSSProperties {
  switch (tone) {
    case 'success':
      return { background: '#DCFCE7', color: '#166534' }
    case 'warning':
      return { background: '#FEF3C7', color: '#92400E' }
    case 'error':
      return { background: '#FEE2E2', color: '#B91C1C' }
    default:
      return { background: '#E0F2FE', color: '#075985' }
  }
}

const demoRegistry = new ComponentRegistry<React.ComponentType<any>>(defaultWebRegistry)
  .register('section', DemoSectionNode)
  .register('card', DemoCardNode)
  .register('kpi_grid', DemoKPIGridNode)
  .register('tabs', DemoTabsNode)
  .register('filter_bar', DemoFilterBarNode)
  .register('badge_row', DemoBadgeRowNode)
  .register('action_bar', DemoActionBarNode)
  .register('empty_state', DemoEmptyStateNode)
  .register('chart', DemoChartNode)
  .register('table', DemoTableNode)

export function MockViewerPreview({ scenario }: { scenario: DemoScenario }): React.ReactElement {
  const stateMachine = useMemo(() => new MockViewerController(scenario), [scenario])

  return (
    <div style={previewShellStyle}>
      <div style={previewBannerStyle}>
        <div style={{ fontWeight: 700 }}>Local OpenUI preview</div>
        <div style={{ color: '#475569', fontSize: 14 }}>
          The viewer backend is not required for this demonstration.
        </div>
      </div>
      <ViewerRoot stateMachine={stateMachine} registry={demoRegistry} className="viewer-demo-root" />
    </div>
  )
}

const previewShellStyle: React.CSSProperties = {
  minHeight: '100%',
  background: 'linear-gradient(180deg, #F8FAFC 0%, #ECFEFF 100%)',
  padding: 24,
}

const previewBannerStyle: React.CSSProperties = {
  display: 'grid',
  gap: 4,
  marginBottom: 16,
  padding: '14px 16px',
  borderRadius: 18,
  background: 'rgba(255,255,255,0.9)',
  border: '1px solid rgba(15, 23, 42, 0.08)',
}

const sectionStyle: React.CSSProperties = {
  display: 'grid',
  gap: 14,
  padding: 20,
  borderRadius: 24,
  background: '#FFFFFF',
  border: '1px solid rgba(15, 23, 42, 0.08)',
  boxShadow: '0 16px 40px rgba(15, 23, 42, 0.06)',
}

const cardStyle: React.CSSProperties = {
  ...sectionStyle,
  background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
}

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 22,
  lineHeight: 1.1,
}

const sectionSubtitleStyle: React.CSSProperties = {
  margin: 0,
  color: '#64748B',
  lineHeight: 1.5,
}

const sectionContentStyle: React.CSSProperties = {
  display: 'grid',
  gap: 14,
}

const kpiGridStyle: React.CSSProperties = {
  display: 'grid',
  gap: 12,
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
}

const kpiCardStyle: React.CSSProperties = {
  borderRadius: 18,
  padding: 16,
  background: '#0F172A',
  color: '#F8FAFC',
  display: 'grid',
  gap: 8,
}

const tinyLabelStyle: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  opacity: 0.8,
}

const kpiValueStyle: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 800,
}

const tabRowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 10,
}

const tabStyle: React.CSSProperties = {
  borderRadius: 999,
  border: '1px solid rgba(15, 23, 42, 0.08)',
  padding: '10px 14px',
  background: '#FFFFFF',
  fontWeight: 700,
  cursor: 'pointer',
}

const activeTabStyle: React.CSSProperties = {
  ...tabStyle,
  background: '#0F766E',
  color: '#FFFFFF',
  border: 'none',
}

const filterRowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 10,
}

const filterStyle: React.CSSProperties = {
  ...tabStyle,
  background: '#F8FAFC',
}

const activeFilterStyle: React.CSSProperties = {
  ...activeTabStyle,
  background: '#1D4ED8',
}

const badgeRowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 10,
}

const badgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: 999,
  padding: '8px 12px',
  fontSize: 13,
  fontWeight: 700,
}

const actionBarStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 10,
}

const primaryActionStyle: React.CSSProperties = {
  border: 'none',
  borderRadius: 999,
  padding: '12px 16px',
  background: '#0F766E',
  color: '#FFFFFF',
  fontWeight: 700,
  cursor: 'pointer',
}

const secondaryActionStyle: React.CSSProperties = {
  border: '1px solid rgba(15, 23, 42, 0.12)',
  borderRadius: 999,
  padding: '12px 16px',
  background: '#FFFFFF',
  color: '#0F172A',
  fontWeight: 700,
  cursor: 'pointer',
}

const emptyStateStyle: React.CSSProperties = {
  display: 'grid',
  gap: 16,
  justifyItems: 'start',
  padding: 24,
  borderRadius: 24,
  border: '1px dashed rgba(15, 23, 42, 0.18)',
  background: '#FFFFFF',
}

const chartWrapperStyle: React.CSSProperties = {
  display: 'grid',
  gap: 12,
}

const chartLegendStyle: React.CSSProperties = {
  display: 'grid',
  gap: 8,
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
}

const chartLegendItemStyle: React.CSSProperties = {
  display: 'grid',
  gap: 4,
  padding: 10,
  borderRadius: 14,
  background: '#F8FAFC',
  fontSize: 13,
}

const barRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '80px 1fr 60px',
  gap: 12,
  alignItems: 'center',
}

const barLabelStyle: React.CSSProperties = {
  fontWeight: 700,
}

const barTrackStyle: React.CSSProperties = {
  height: 12,
  borderRadius: 999,
  background: '#E2E8F0',
  overflow: 'hidden',
}

const barFillStyle: React.CSSProperties = {
  height: '100%',
  borderRadius: 999,
  background: 'linear-gradient(90deg, #0F766E 0%, #14B8A6 100%)',
}

const barValueStyle: React.CSSProperties = {
  textAlign: 'right',
  fontWeight: 700,
}

const tableWrapperStyle: React.CSSProperties = {
  overflowX: 'auto',
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: 0,
}

const tableHeaderStyle: React.CSSProperties = {
  textAlign: 'left',
  fontSize: 13,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: '#64748B',
  padding: '0 0 12px',
}

const tableRowStyle: React.CSSProperties = {}

const tableRowInteractiveStyle: React.CSSProperties = {
  cursor: 'pointer',
}

const tableCellStyle: React.CSSProperties = {
  padding: '12px 0',
  borderTop: '1px solid rgba(15, 23, 42, 0.08)',
  color: '#0F172A',
}
