import { describe, it, expect } from 'vitest'
import { resolveTemplate, resolveTemplateInTree } from './resolver'

describe('Template Resolver', () => {
  describe('resolveTemplate', () => {
    it('should resolve simple template', () => {
      const result = resolveTemplate('Hello {{name}}', { name: 'World' })
      expect(result).toBe('Hello World')
    })

    it('should resolve multiple templates', () => {
      const result = resolveTemplate('{{first}} {{last}}', { first: 'John', last: 'Doe' })
      expect(result).toBe('John Doe')
    })

    it('should resolve nested paths', () => {
      const result = resolveTemplate('User: {{user.name}}', { user: { name: 'Alice' } })
      expect(result).toBe('User: Alice')
    })

    it('should resolve deeply nested paths', () => {
      const result = resolveTemplate('{{a.b.c.d}}', { a: { b: { c: { d: 'value' } } } })
      expect(result).toBe('value')
    })

    it('should handle missing values as empty string', () => {
      const result = resolveTemplate('Hello {{missing}}', { name: 'World' })
      expect(result).toBe('Hello ')
    })

    it('should handle null values as empty string', () => {
      const result = resolveTemplate('Value: {{val}}', { val: null })
      expect(result).toBe('Value: ')
    })

    it('should handle undefined values as empty string', () => {
      const result = resolveTemplate('Value: {{val}}', { val: undefined })
      expect(result).toBe('Value: ')
    })

    it('should convert numbers to strings', () => {
      const result = resolveTemplate('Count: {{count}}', { count: 42 })
      expect(result).toBe('Count: 42')
    })

    it('should convert booleans to strings', () => {
      const result = resolveTemplate('Active: {{active}}', { active: true })
      expect(result).toBe('Active: true')
    })

    it('should handle whitespace in templates', () => {
      const result = resolveTemplate('Value: {{ name }}', { name: 'John' })
      expect(result).toBe('Value: John')
    })

    it('should not resolve partial templates', () => {
      const result = resolveTemplate('{{incomplete', { incomplete: 'value' })
      expect(result).toBe('{{incomplete')
    })
  })

  describe('resolveTemplateInTree', () => {
    it('should resolve templates in string values', () => {
      const tree = { message: 'Hello {{name}}' }
      const result = resolveTemplateInTree(tree, { name: 'World' })
      expect(result.message).toBe('Hello World')
    })

    it('should not mutate original tree', () => {
      const original = { message: 'Hello {{name}}' }
      const tree = { ...original }
      resolveTemplateInTree(tree, { name: 'World' })
      expect(tree).toEqual(original)
    })

    it('should preserve non-string values', () => {
      const tree = { count: 42, active: true, value: null }
      const result = resolveTemplateInTree(tree, {})
      expect(result.count).toBe(42)
      expect(result.active).toBe(true)
      expect(result.value).toBeNull()
    })

    it('should handle nested objects', () => {
      const tree = { user: { name: 'Hello {{firstName}}' } }
      const result = resolveTemplateInTree(tree, { firstName: 'John' })
      expect(result.user.name).toBe('Hello John')
    })

    it('should handle arrays of strings', () => {
      const tree = { items: ['{{a}}', '{{b}}'] }
      const result = resolveTemplateInTree(tree, { a: 'first', b: 'second' })
      expect(result.items).toEqual(['first', 'second'])
    })

    it('should handle arrays of objects', () => {
      const tree = { items: [{ name: '{{item}}' }] }
      const result = resolveTemplateInTree(tree, { item: 'value' })
      expect(result.items[0].name).toBe('value')
    })

    it('should handle deeply nested structures', () => {
      const tree = {
        level1: {
          level2: {
            level3: {
              text: 'Value: {{deep}}',
            },
          },
        },
      }
      const result = resolveTemplateInTree(tree, { deep: 'nested' })
      expect(result.level1.level2.level3.text).toBe('Value: nested')
    })

    it('should handle mixed arrays with objects and primitives', () => {
      const tree = { mixed: [{ text: '{{val}}' }, 'static', 42] }
      const result = resolveTemplateInTree(tree, { val: 'dynamic' })
      expect(result.mixed[0].text).toBe('dynamic')
      expect(result.mixed[1]).toBe('static')
      expect(result.mixed[2]).toBe(42)
    })
  })
})
