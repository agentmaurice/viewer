import { describe, it, expect } from 'vitest'
import { isVersionConflict, canRetryAfterConflict } from './version-check'

describe('Version Check', () => {
  describe('isVersionConflict', () => {
    it('should detect conflict when versions differ', () => {
      expect(isVersionConflict(1, 2)).toBe(true)
    })

    it('should not detect conflict when versions match', () => {
      expect(isVersionConflict(1, 1)).toBe(false)
    })

    it('should detect conflict with higher client version', () => {
      expect(isVersionConflict(5, 3)).toBe(true)
    })

    it('should not detect conflict with zero versions', () => {
      expect(isVersionConflict(0, 0)).toBe(false)
    })

    it('should detect conflict with different zero versions', () => {
      expect(isVersionConflict(0, 1)).toBe(true)
    })
  })

  describe('canRetryAfterConflict', () => {
    it('should allow retry when server version is higher', () => {
      expect(canRetryAfterConflict(1, 2)).toBe(true)
    })

    it('should not allow retry when server version is lower', () => {
      expect(canRetryAfterConflict(2, 1)).toBe(false)
    })

    it('should not allow retry when versions match', () => {
      expect(canRetryAfterConflict(1, 1)).toBe(false)
    })

    it('should allow retry with zero to one transition', () => {
      expect(canRetryAfterConflict(0, 1)).toBe(true)
    })

    it('should handle large version numbers', () => {
      expect(canRetryAfterConflict(1000, 1001)).toBe(true)
      expect(canRetryAfterConflict(1001, 1000)).toBe(false)
    })
  })
})
