import { describe, expect, it } from 'vitest'
import {
  normalizeActionBindingsMap,
  normalizeEffects,
  normalizeFormsMap,
} from './runtime-contract-normalizer'

describe('runtime-contract-normalizer', () => {
  it('normalizes forms and field aliases', () => {
    expect(
      normalizeFormsMap({
        review: {
          id: 'review',
          title: 'Review',
          fields: [
            { name: 'choice', type: 'combobox', options: [{ value: 'a', label: 'A' }] },
            { type: 'text' },
          ],
        },
      }),
    ).toEqual({
      review: {
        id: 'review',
        title: 'Review',
        fields: [
          {
            name: 'choice',
            type: 'select',
            required: false,
            description: undefined,
            default: undefined,
            options: [{ value: 'a', label: 'A' }],
            accept: undefined,
            max_size_mb: undefined,
            auto_fill: undefined,
            hidden_if_auto_filled: undefined,
          },
        ],
        next: undefined,
        actions_on_submit: undefined,
      },
    })
  })

  it('normalizes action bindings', () => {
    expect(
      normalizeActionBindingsMap({
        refresh: { event_id: 'refresh_budget', payload_template: { period: '{{action.value}}' } },
        broken: { payload_template: {} },
      }),
    ).toEqual({
      refresh: {
        event_id: 'refresh_budget',
        payload_template: { period: '{{action.value}}' },
      },
    })
  })

  it('normalizes effects', () => {
    expect(
      normalizeEffects([
        { type: 'toast', payload: { message: 'ok' } },
        { type: 'open_form', payload: null },
        { payload: {} },
      ]),
    ).toEqual([
      { type: 'toast', payload: { message: 'ok' } },
      { type: 'open_form', payload: undefined },
    ])
  })
})
