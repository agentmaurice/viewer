import { describe, it, expect } from 'vitest'
import type { MiniAppRuntimePayload, AppNode, AppUIRender } from './protocol'
import { RUNTIME_CONTRACT_V1 } from './protocol'
import {
  APP_INSTANCE_STATUSES,
  APP_RUNTIME_CONTRACT,
  APP_RUNTIME_SCHEMA,
  APP_UI_CALLOUT_TONES,
  APP_UI_LAYOUTS,
  APP_UI_NODE_TYPES,
  APP_UI_SCHEMA,
} from '../generated/chatserver-schemas'

describe('protocol types', () => {
  it('should define RUNTIME_CONTRACT_V1 constant', () => {
    expect(RUNTIME_CONTRACT_V1).toBe('agentmaurice-ui-runtime-v1')
    expect(RUNTIME_CONTRACT_V1).toBe(APP_RUNTIME_CONTRACT)
  })

  it('should expose generated chatserver runtime metadata', () => {
    expect(APP_INSTANCE_STATUSES).toEqual(['created', 'active', 'completed', 'archived', 'errored'])
    expect(APP_RUNTIME_SCHEMA.properties.contract.const).toBe(APP_RUNTIME_CONTRACT)
    expect(APP_RUNTIME_SCHEMA.properties.status.enum).toEqual([...APP_INSTANCE_STATUSES])
  })

  it('should expose generated chatserver ui metadata', () => {
    expect(APP_UI_LAYOUTS).toEqual(['column', 'row'])
    expect(APP_UI_CALLOUT_TONES).toEqual(['info', 'success', 'warning', 'error'])
    expect(APP_UI_NODE_TYPES).toEqual(['text', 'button', 'stat', 'kpi_grid', 'list', 'tabs', 'filter_bar', 'callout', 'action_bar', 'badge_row', 'empty_state', 'chart', 'table', 'section', 'card', 'form_link'])
    expect(APP_UI_SCHEMA.$defs.calloutNode.properties.tone.enum).toEqual([...APP_UI_CALLOUT_TONES])
  })

  it('should compile sample text node', () => {
    const node: AppNode = { type: 'text', value: 'Hello' }
    expect(node.type).toBe('text')
    expect(node.value).toBe('Hello')
  })

  it('should compile sample button node', () => {
    const node: AppNode = { type: 'button', label: 'Click me', on_click: 'event-1' }
    expect(node.type).toBe('button')
    expect(node.label).toBe('Click me')
  })

  it('should compile sample stat node', () => {
    const node: AppNode = { type: 'stat', label: 'Revenue', value: 1000 }
    expect(node.type).toBe('stat')
    expect(node.value).toBe(1000)
  })

  it('should compile sample kpi grid node', () => {
    const node: AppNode = {
      type: 'kpi_grid',
      items: [
        { label: 'Budget', value: '125000' },
        { label: 'Variance', value: '-8.4%', tone: 'warning' },
      ],
    }
    expect(node.type).toBe('kpi_grid')
    expect(node.items).toHaveLength(2)
  })

  it('should compile sample list node', () => {
    const node: AppNode = {
      type: 'list',
      source: [{ id: 1 }, { id: 2 }],
      item_template: { type: 'text', value: '{{item.id}}' },
      on_item_click: 'select-item',
    }
    expect(node.type).toBe('list')
    expect(Array.isArray(node.source)).toBe(true)
  })

  it('should compile sample tabs node', () => {
    const node: AppNode = {
      type: 'tabs',
      items: ['Q1', 'Q2', 'Q3'],
      active: 'Q2',
      on_tab_click: 'select_period',
    }
    expect(node.type).toBe('tabs')
    expect(node.items[1]).toBe('Q2')
  })

  it('should compile sample callout node', () => {
    const node: AppNode = { type: 'callout', title: 'Info', value: 'Important message', tone: 'warning' }
    expect(node.type).toBe('callout')
    expect(node.tone).toBe('warning')
  })

  it('should compile sample empty state node', () => {
    const node: AppNode = {
      type: 'empty_state',
      title: 'No data',
      description: 'No rows match the current filters.',
      action_label: 'Reload',
      on_click: 'reload_list',
    }
    expect(node.type).toBe('empty_state')
    expect(node.on_click).toBe('reload_list')
  })

  it('should compile sample action bar node', () => {
    const node: AppNode = {
      type: 'action_bar',
      actions: [
        { label: 'Analyze', variant: 'primary', form_id: 'analysis_form', submit_event: 'submit_analysis' },
        { label: 'Retry', variant: 'secondary', on_click: 'rerun_budget' },
      ],
    }
    expect(node.type).toBe('action_bar')
    expect(node.actions).toHaveLength(2)
  })

  it('should compile sample badge row node', () => {
    const node: AppNode = {
      type: 'badge_row',
      items: [
        { label: 'Status', value: 'Open' },
        { label: 'Priority', value: 'High', tone: 'warning' },
      ],
    }
    expect(node.type).toBe('badge_row')
    expect(node.items).toHaveLength(2)
  })

  it('should compile sample filter bar node', () => {
    const node: AppNode = {
      type: 'filter_bar',
      filters: [
        { label: 'Period', value: 'Q1', on_click: 'filter_period_q1' },
        { label: 'Team', value: 'Finance', on_click: 'filter_team_finance', active: true },
      ],
    }
    expect(node.type).toBe('filter_bar')
    expect(node.filters).toHaveLength(2)
  })

  it('should compile sample chart node', () => {
    const node: AppNode = {
      type: 'chart',
      chart_type: 'line',
      title: 'Budget trend',
      x_key: 'month',
      y_key: 'amount',
      data: [
        { month: 'Jan', amount: 1200 },
        { month: 'Feb', amount: 950 },
      ],
    }
    expect(node.type).toBe('chart')
    expect(node.chart_type).toBe('line')
  })

  it('should compile sample table node', () => {
    const node: AppNode = {
      type: 'table',
      columns: ['Name', 'Age'],
      rows: [
        { Name: 'Alice', Age: 30 },
        { Name: 'Bob', Age: 25 },
      ],
    }
    expect(node.type).toBe('table')
    expect(node.columns.length).toBe(2)
  })

  it('should compile sample section node', () => {
    const node: AppNode = {
      type: 'section',
      title: 'Main Section',
      layout: 'column',
      children: [{ type: 'text', value: 'Hello' }],
    }
    expect(node.type).toBe('section')
    expect(node.children.length).toBe(1)
  })

  it('should compile sample form_link node', () => {
    const node: AppNode = { type: 'form_link', label: 'Submit', form_id: 'form-1', submit_event: 'submit' }
    expect(node.type).toBe('form_link')
    expect(node.form_id).toBe('form-1')
  })

  it('should compile generic fallback node with children', () => {
    const node: AppNode = {
      children: [{ type: 'text', value: 'Nested fallback' }],
      layout: 'column',
      variant: 'custom-group',
    }
    expect(Array.isArray(node.children)).toBe(true)
    expect(node.layout).toBe('column')
  })

  it('should compile complete MiniAppRuntimePayload', () => {
    const payload: MiniAppRuntimePayload = {
      contract: RUNTIME_CONTRACT_V1,
      app_instance_id: 'app-123',
      recipe_id: 'recipe-1',
      status: 'active',
      state: { count: 5 },
      state_version: 1,
      ui: {
        view: 'main',
        tree: { type: 'text', value: 'Hello' },
      },
    }
    expect(payload.contract).toBe('agentmaurice-ui-runtime-v1')
    expect(payload.app_instance_id).toBe('app-123')
    expect(payload.state_version).toBe(1)
  })

  it('should compile AppUIRender with optional fields', () => {
    const render: AppUIRender = {
      view: 'dashboard',
      format: 'json',
      library: 'react',
      program: 'custom.ts',
      initial_state: { loaded: true },
    }
    expect(render.view).toBe('dashboard')
    expect(render.initial_state).toEqual({ loaded: true })
  })
})
