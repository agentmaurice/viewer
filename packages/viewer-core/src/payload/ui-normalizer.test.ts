import { describe, expect, it } from 'vitest'
import { normalizeAppNode, normalizeAppUIRender } from './ui-normalizer'

describe('ui-normalizer', () => {
  it('normalizes a valid text node', () => {
    expect(normalizeAppNode({ type: 'text', value: 'Hello' })).toEqual({
      type: 'text',
      value: 'Hello',
    })
  })

  it('drops invalid nodes', () => {
    expect(normalizeAppNode({ type: 'button', label: 'Click' })).toBeNull()
    expect(normalizeAppNode({ type: 'section', children: [] })).toBeNull()
  })

  it('normalizes nested group nodes', () => {
    expect(
      normalizeAppNode({
        layout: 'column',
        children: [
          { type: 'text', value: 'One' },
          { type: 'button', label: 'Go', on_click: 'go' },
          { type: 'button', label: 'Broken' },
        ],
      }),
    ).toEqual({
      layout: 'column',
      children: [
        { type: 'text', value: 'One' },
        { type: 'button', label: 'Go', on_click: 'go' },
      ],
    })
  })

  it('preserves section subtitle when provided', () => {
    expect(
      normalizeAppNode({
        type: 'section',
        title: 'Execution detail',
        subtitle: 'Owner: Mila • Priority: High',
        layout: 'column',
        children: [{ type: 'text', value: 'Ready' }],
      }),
    ).toEqual({
      type: 'section',
      title: 'Execution detail',
      subtitle: 'Owner: Mila • Priority: High',
      layout: 'column',
      children: [{ type: 'text', value: 'Ready' }],
    })
  })

  it('normalizes tabs nodes', () => {
    expect(
      normalizeAppNode({
        type: 'tabs',
        items: ['Q1', 'Q2', 3],
        active: 'Q2',
        on_tab_click: 'select_period',
      }),
    ).toEqual({
      type: 'tabs',
      items: ['Q1', 'Q2'],
      active: 'Q2',
      on_tab_click: 'select_period',
    })
  })

  it('normalizes filter bar nodes', () => {
    expect(
      normalizeAppNode({
        type: 'filter_bar',
        filters: [
          { label: 'Period', value: 'Q1', on_click: 'filter_period_q1' },
          { label: 'Team', value: 'Finance', on_click: 'filter_team_finance', active: true },
          { label: 'Broken' },
        ],
      }),
    ).toEqual({
      type: 'filter_bar',
      filters: [
        { label: 'Period', value: 'Q1', on_click: 'filter_period_q1', active: undefined },
        { label: 'Team', value: 'Finance', on_click: 'filter_team_finance', active: true },
      ],
    })
  })

  it('normalizes kpi grid nodes', () => {
    expect(
      normalizeAppNode({
        type: 'kpi_grid',
        items: [
          { label: 'Budget', value: '125000' },
          { label: 'Variance', value: '-8.4%', tone: 'warning' },
          { label: 'Broken' },
        ],
      }),
    ).toEqual({
      type: 'kpi_grid',
      items: [
        { label: 'Budget', value: '125000', tone: undefined },
        { label: 'Variance', value: '-8.4%', tone: 'warning' },
      ],
    })
  })

  it('normalizes empty state nodes', () => {
    expect(
      normalizeAppNode({
        type: 'empty_state',
        title: 'No data',
        description: 'No rows match the current filters.',
        action_label: 'Reload',
        on_click: 'reload_list',
      }),
    ).toEqual({
      type: 'empty_state',
      title: 'No data',
      description: 'No rows match the current filters.',
      action_label: 'Reload',
      on_click: 'reload_list',
    })
  })

  it('normalizes action bar nodes', () => {
    expect(
      normalizeAppNode({
        type: 'action_bar',
        actions: [
          { label: 'Analyze', variant: 'primary', form_id: 'analysis_form', submit_event: 'submit_analysis' },
          { label: 'Retry', variant: 'secondary', on_click: 'rerun_budget' },
          { label: 'Broken' },
        ],
      }),
    ).toEqual({
      type: 'action_bar',
      actions: [
        { label: 'Analyze', variant: 'primary', form_id: 'analysis_form', submit_event: 'submit_analysis', on_click: undefined },
        { label: 'Retry', variant: 'secondary', on_click: 'rerun_budget', form_id: undefined, submit_event: undefined },
      ],
    })
  })

  it('normalizes badge row nodes', () => {
    expect(
      normalizeAppNode({
        type: 'badge_row',
        items: [
          { label: 'Status', value: 'Open' },
          { label: 'Priority', value: 'High', tone: 'warning' },
          { label: 'Broken' },
        ],
      }),
    ).toEqual({
      type: 'badge_row',
      items: [
        { label: 'Status', value: 'Open', tone: undefined },
        { label: 'Priority', value: 'High', tone: 'warning' },
      ],
    })
  })

  it('normalizes a ui render payload', () => {
    expect(
      normalizeAppUIRender({
        view: 'main',
        tree: { type: 'text', value: 'Hello' },
        fallback_tree: { type: 'button', label: 'Broken' },
      }),
    ).toEqual({
      view: 'main',
      tree: { type: 'text', value: 'Hello' },
      fallback_tree: undefined,
    })
  })

  it('returns null for invalid ui renders', () => {
    expect(normalizeAppUIRender(null)).toBeNull()
    expect(normalizeAppUIRender({})).toBeNull()
    expect(normalizeAppUIRender({ view: 42 })).toBeNull()
  })
})
