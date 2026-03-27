import { describe, expect, it } from 'vitest'
import { APP_RUNTIME_CONTRACT } from '../generated/chatserver-schemas'
import { isAppInstanceStatus, normalizeMiniAppRuntimePayload } from './runtime-normalizer'

describe('runtime-normalizer', () => {
  it('detects valid app instance statuses', () => {
    expect(isAppInstanceStatus('active')).toBe(true)
    expect(isAppInstanceStatus('archived')).toBe(true)
    expect(isAppInstanceStatus('waiting_for_form')).toBe(true)
    expect(isAppInstanceStatus('pending')).toBe(false)
    expect(isAppInstanceStatus(null)).toBe(false)
  })

  it('normalizes a mini-app runtime payload', () => {
    const runtime = normalizeMiniAppRuntimePayload({
      app_instance_id: 'app-123',
      recipe_id: 'recipe-1',
      status: 'completed',
      state: { done: true },
      state_version: 4,
      ui: { view: 'main' },
      action_bindings: {
        refresh: { event_id: 'refresh_budget' },
        broken: {},
      },
      forms: {
        review: {
          id: 'review',
          title: 'Review',
          fields: [{ name: 'comment', type: 'combobox' }],
        },
      },
      effects: [{ type: 'toast', payload: { message: 'ok' } }],
    })

    expect(runtime).toEqual({
      contract: APP_RUNTIME_CONTRACT,
      app_instance_id: 'app-123',
      recipe_id: 'recipe-1',
      status: 'completed',
      state: { done: true },
      state_version: 4,
      ui: { view: 'main' },
      action_bindings: {
        refresh: { event_id: 'refresh_budget', payload_template: undefined },
      },
      forms: {
        review: {
          id: 'review',
          title: 'Review',
          fields: [
            {
              name: 'comment',
              type: 'select',
              required: false,
              description: undefined,
              default: undefined,
              options: undefined,
              accept: undefined,
              max_size_mb: undefined,
              auto_fill: undefined,
              hidden_if_auto_filled: undefined,
            },
          ],
          next: undefined,
          actions_on_submit: undefined,
        },
      },
      effects: [{ type: 'toast', payload: { message: 'ok' } }],
    })
  })

  it('falls back to contract, status, state, and version defaults', () => {
    const runtime = normalizeMiniAppRuntimePayload({
      contract: 'unexpected',
      app_instance_id: 'app-123',
      ui: { view: 'main' },
      status: 'pending',
      state: [],
      state_version: 'bad',
    })

    expect(runtime).toMatchObject({
      contract: APP_RUNTIME_CONTRACT,
      app_instance_id: 'app-123',
      recipe_id: '',
      status: 'active',
      state: {},
      state_version: 1,
    })
  })

  it('returns null for non mini-app payloads', () => {
    expect(normalizeMiniAppRuntimePayload(null)).toBeNull()
    expect(normalizeMiniAppRuntimePayload({ recipe_id: 'recipe-1' })).toBeNull()
    expect(normalizeMiniAppRuntimePayload({ app_instance_id: 'app-1', ui: null })).toBeNull()
  })
})
