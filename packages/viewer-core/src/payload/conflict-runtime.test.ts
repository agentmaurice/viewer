import { describe, expect, it } from 'vitest'
import type { MiniAppRuntimePayload } from '../types/protocol'
import { reconcileConflictRuntime } from './conflict-runtime'

const runtimeFixture: MiniAppRuntimePayload = {
  contract: 'agentmaurice-ui-runtime-v1',
  app_instance_id: 'app-123',
  workspace_id: 'workspace-1',
  recipe_id: 'recipe-1',
  recipe_version: '1.0.0',
  status: 'active',
  state: { selected_period: 'Q1' },
  state_version: 3,
  ui: {
    view: 'main',
    format: 'openui_lang',
    program: 'root = Root(null)',
  },
  action_bindings: {
    refresh_budget: { event_id: 'refresh_budget' },
  },
  forms: {
    review: {
      id: 'review',
      title: 'Review',
      fields: [{ name: 'comment', type: 'text' }],
    },
  },
}

describe('conflict-runtime', () => {
  it('reconciles runtime using authoritative conflict details', () => {
    const result = reconcileConflictRuntime(runtimeFixture, {
      current_state_version: 4,
      status: 'completed',
      state: { selected_period: 'Q2' },
      ui: {
        view: 'main',
        fallback_tree: { type: 'text', value: 'Q2' },
      },
      action_bindings: {
        refresh_budget: { event_id: 'refresh_budget' },
        broken: {},
      },
      forms: {
        review: {
          id: 'review',
          title: 'Review',
          fields: [{ name: 'comment', type: 'combobox' }],
        },
      },
      effects: [{ type: 'toast', payload: { message: 'updated' } }],
    })

    expect(result.hasNewerVersion).toBe(true)
    expect(result.runtime.state_version).toBe(4)
    expect(result.runtime.status).toBe('completed')
    expect(result.runtime.state).toEqual({ selected_period: 'Q2' })
    expect(result.runtime.ui?.fallback_tree).toEqual({ type: 'text', value: 'Q2' })
    expect(result.runtime.action_bindings).toEqual({
      refresh_budget: { event_id: 'refresh_budget', payload_template: undefined },
    })
    expect(result.runtime.forms?.review.fields[0]?.type).toBe('select')
    expect(result.runtime.effects).toEqual([{ type: 'toast', payload: { message: 'updated' } }])
  })

  it('keeps current runtime when details are missing or invalid', () => {
    const result = reconcileConflictRuntime(runtimeFixture, {
      current_state_version: 'bad',
      state: [],
      ui: null,
    })

    expect(result.hasNewerVersion).toBe(false)
    expect(result.runtime).toEqual(runtimeFixture)
  })
})
