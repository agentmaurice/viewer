export class ComponentRegistry<T> {
  private components = new Map<string, T>()
  private parent?: ComponentRegistry<T>

  constructor(parent?: ComponentRegistry<T>) {
    this.parent = parent
  }

  register(nodeType: string, component: T): this {
    this.components.set(nodeType, component)
    return this
  }

  get(nodeType: string): T | undefined {
    return this.components.get(nodeType) ?? this.parent?.get(nodeType)
  }

  has(nodeType: string): boolean {
    return this.components.has(nodeType) || (this.parent?.has(nodeType) ?? false)
  }

  types(): string[] {
    const parentTypes = this.parent?.types() ?? []
    return [...new Set([...parentTypes, ...Array.from(this.components.keys())])]
  }

  extend(): ComponentRegistry<T> {
    return new ComponentRegistry<T>(this)
  }
}
