import { describe, it, expect } from 'vitest'
import { normalizeFieldType, isFieldVisible } from './form-normalizer'

describe('Form Normalizer', () => {
  describe('normalizeFieldType', () => {
    it('should preserve known types', () => {
      expect(normalizeFieldType('text')).toBe('text')
      expect(normalizeFieldType('email')).toBe('email')
      expect(normalizeFieldType('textarea')).toBe('textarea')
      expect(normalizeFieldType('select')).toBe('select')
      expect(normalizeFieldType('file')).toBe('file')
      expect(normalizeFieldType('date')).toBe('date')
      expect(normalizeFieldType('number')).toBe('number')
      expect(normalizeFieldType('checkbox')).toBe('checkbox')
      expect(normalizeFieldType('url')).toBe('url')
    })

    it('should alias file_upload to file', () => {
      expect(normalizeFieldType('file_upload')).toBe('file')
    })

    it('should alias combobox to select', () => {
      expect(normalizeFieldType('combobox')).toBe('select')
    })

    it('should alias boolean to checkbox', () => {
      expect(normalizeFieldType('boolean')).toBe('checkbox')
    })

    it('should fallback unknown types to text', () => {
      expect(normalizeFieldType('custom')).toBe('text')
      expect(normalizeFieldType('unknown')).toBe('text')
      expect(normalizeFieldType('random-type')).toBe('text')
    })

    it('should be case-sensitive', () => {
      expect(normalizeFieldType('TEXT')).toBe('text')
      expect(normalizeFieldType('Text')).toBe('text')
    })
  })

  describe('isFieldVisible', () => {
    it('should be visible by default', () => {
      const field = { name: 'test' }
      expect(isFieldVisible(field)).toBe(true)
    })

    it('should be hidden when auto_fill and hidden_if_auto_filled', () => {
      const field = { name: 'test', auto_fill: 'value', hidden_if_auto_filled: true }
      expect(isFieldVisible(field)).toBe(false)
    })

    it('should be visible when auto_fill but not hidden_if_auto_filled', () => {
      const field = { name: 'test', auto_fill: 'value', hidden_if_auto_filled: false }
      expect(isFieldVisible(field)).toBe(true)
    })

    it('should be visible when hidden_if_auto_filled but no auto_fill', () => {
      const field = { name: 'test', hidden_if_auto_filled: true }
      expect(isFieldVisible(field)).toBe(true)
    })

    it('should be visible when auto_fill is empty string', () => {
      const field = { name: 'test', auto_fill: '', hidden_if_auto_filled: true }
      expect(isFieldVisible(field)).toBe(true)
    })

    it('should handle only auto_fill property', () => {
      const field = { name: 'test', auto_fill: 'value' }
      expect(isFieldVisible(field)).toBe(true)
    })

    it('should handle only hidden_if_auto_filled property', () => {
      const field = { name: 'test', hidden_if_auto_filled: true }
      expect(isFieldVisible(field)).toBe(true)
    })
  })
})
