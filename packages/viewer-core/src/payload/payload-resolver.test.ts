import { describe, it, expect } from 'vitest'
import { resolvePayloadTemplate } from './payload-resolver'

describe('Payload Resolver', () => {
  describe('resolvePayloadTemplate', () => {
    it('should resolve action.value template', () => {
      const template = { action_id: '{{action.value}}' }
      const actionPayload = { value: 'test-value' }
      const result = resolvePayloadTemplate(template, actionPayload)

      expect(result.action_id).toBe('test-value')
    })

    it('should resolve action.index template', () => {
      const template = { item_index: '{{action.index}}' }
      const actionPayload = { index: 5 }
      const result = resolvePayloadTemplate(template, actionPayload)

      expect(result.item_index).toBe(5)
    })

    it('should resolve action.item template', () => {
      const template = { selected_item: '{{action.item}}' }
      const actionPayload = { item: { id: '123', name: 'Test' } }
      const result = resolvePayloadTemplate(template, actionPayload)

      expect(result.selected_item).toEqual({ id: '123', name: 'Test' })
    })

    it('should resolve nested action templates', () => {
      const template = { nested: { value: '{{action.data}}' } }
      const actionPayload = { data: 'nested-value' }
      const result = resolvePayloadTemplate(template, actionPayload)

      expect(result.nested.value).toBe('nested-value')
    })

    it('should resolve arrays with action templates', () => {
      const template = { items: ['{{action.first}}', '{{action.second}}'] }
      const actionPayload = { first: 'a', second: 'b' }
      const result = resolvePayloadTemplate(template, actionPayload)

      expect(result.items).toEqual(['a', 'b'])
    })

    it('should preserve unresolved templates', () => {
      const template = { value: '{{action.missing}}' }
      const actionPayload = { other: 'value' }
      const result = resolvePayloadTemplate(template, actionPayload)

      expect(result.value).toBe('{{action.missing}}')
    })

    it('should handle undefined template', () => {
      const result = resolvePayloadTemplate(undefined, { value: 'test' })
      expect(result).toEqual({})
    })

    it('should handle null template', () => {
      const result = resolvePayloadTemplate(null, { value: 'test' })
      expect(result).toEqual({})
    })

    it('should handle non-object template', () => {
      const result = resolvePayloadTemplate('string', { value: 'test' })
      expect(result).toEqual({})
    })

    it('should resolve primitive action payloads', () => {
      const template = { id: '{{action.id}}' }
      const actionPayload = { id: 42 }
      const result = resolvePayloadTemplate(template, actionPayload)

      expect(result.id).toBe(42)
    })

    it('should handle arrays of objects with templates', () => {
      const template = { items: [{ id: '{{action.first_id}}' }] }
      const actionPayload = { first_id: 'xyz' }
      const result = resolvePayloadTemplate(template, actionPayload)

      expect(result.items[0].id).toBe('xyz')
    })

    it('should not resolve partial action templates', () => {
      const template = { value: 'prefix-{{action.val}}' }
      const actionPayload = { val: 'test' }
      const result = resolvePayloadTemplate(template, actionPayload)

      expect(result.value).toBe('prefix-{{action.val}}')
    })

    it('should handle deeply nested structures', () => {
      const template = {
        level1: {
          level2: {
            level3: {
              value: '{{action.deep}}',
            },
          },
        },
      }
      const actionPayload = { deep: 'nested' }
      const result = resolvePayloadTemplate(template, actionPayload)

      expect(result.level1.level2.level3.value).toBe('nested')
    })

    it('should preserve mixed content', () => {
      const template = {
        static: 'unchanged',
        dynamic: '{{action.value}}',
        number: 42,
        nested: { static_field: 'value' },
      }
      const actionPayload = { value: 'dynamic-value' }
      const result = resolvePayloadTemplate(template, actionPayload)

      expect(result.static).toBe('unchanged')
      expect(result.dynamic).toBe('dynamic-value')
      expect(result.number).toBe(42)
      expect(result.nested.static_field).toBe('value')
    })
  })
})
