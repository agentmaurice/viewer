import { describe, it, expect } from 'vitest'
import { ComponentRegistry } from './component-registry'

describe('ComponentRegistry', () => {
  it('should register and retrieve component', () => {
    const registry = new ComponentRegistry<string>()
    registry.register('button', 'ButtonComponent')

    expect(registry.get('button')).toBe('ButtonComponent')
  })

  it('should return undefined for unregistered component', () => {
    const registry = new ComponentRegistry<string>()
    expect(registry.get('unknown')).toBeUndefined()
  })

  it('should have registered type', () => {
    const registry = new ComponentRegistry<string>()
    registry.register('button', 'ButtonComponent')

    expect(registry.has('button')).toBe(true)
    expect(registry.has('unknown')).toBe(false)
  })

  it('should list all registered types', () => {
    const registry = new ComponentRegistry<string>()
    registry.register('button', 'ButtonComponent')
    registry.register('text', 'TextComponent')
    registry.register('form', 'FormComponent')

    const types = registry.types()
    expect(types).toContain('button')
    expect(types).toContain('text')
    expect(types).toContain('form')
    expect(types.length).toBe(3)
  })

  it('should support method chaining', () => {
    const registry = new ComponentRegistry<string>()
    const result = registry
      .register('button', 'ButtonComponent')
      .register('text', 'TextComponent')

    expect(result).toBe(registry)
    expect(registry.has('button')).toBe(true)
  })

  it('should create child registry with extend', () => {
    const parent = new ComponentRegistry<string>()
    parent.register('button', 'ButtonComponent')

    const child = parent.extend()
    expect(child.get('button')).toBe('ButtonComponent')
  })

  it('should allow child to override parent component', () => {
    const parent = new ComponentRegistry<string>()
    parent.register('button', 'ButtonComponent')

    const child = parent.extend()
    child.register('button', 'CustomButtonComponent')

    expect(child.get('button')).toBe('CustomButtonComponent')
    expect(parent.get('button')).toBe('ButtonComponent')
  })

  it('should inherit from parent registry', () => {
    const parent = new ComponentRegistry<string>()
    parent.register('button', 'ButtonComponent')
    parent.register('text', 'TextComponent')

    const child = parent.extend()
    child.register('form', 'FormComponent')

    expect(child.has('button')).toBe(true)
    expect(child.has('text')).toBe(true)
    expect(child.has('form')).toBe(true)
  })

  it('should list parent types in child', () => {
    const parent = new ComponentRegistry<string>()
    parent.register('button', 'ButtonComponent')
    parent.register('text', 'TextComponent')

    const child = parent.extend()
    child.register('form', 'FormComponent')

    const types = child.types()
    expect(types).toContain('button')
    expect(types).toContain('text')
    expect(types).toContain('form')
  })

  it('should avoid duplicate types in list', () => {
    const parent = new ComponentRegistry<string>()
    parent.register('button', 'ButtonComponent')

    const child = parent.extend()
    child.register('button', 'CustomButtonComponent')

    const types = child.types()
    const buttonCount = types.filter((t) => t === 'button').length
    expect(buttonCount).toBe(1)
  })

  it('should work with different generic types', () => {
    interface Component {
      render: () => string
    }

    const registry = new ComponentRegistry<Component>()
    const comp: Component = { render: () => 'output' }
    registry.register('text', comp)

    expect(registry.get('text')?.render()).toBe('output')
  })
})
