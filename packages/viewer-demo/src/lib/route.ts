export type DemoRoute =
  | { kind: 'home' }
  | { kind: 'preview'; scenarioId: string }
  | { kind: 'slug'; slug: string }
  | { kind: 'deployment'; deploymentId: string }

export function parseDemoRoute(pathname: string): DemoRoute {
  const path = pathname.replace(/^\//, '').replace(/\/$/, '')
  if (!path) return { kind: 'home' }
  if (path.startsWith('preview/')) {
    return { kind: 'preview', scenarioId: decodeURIComponent(path.slice('preview/'.length)) }
  }
  if (path.startsWith('d/')) {
    return { kind: 'deployment', deploymentId: path.slice(2) }
  }
  return { kind: 'slug', slug: path }
}

export function getDemoRoutePath(route: DemoRoute): string {
  if (route.kind === 'home') return '/'
  if (route.kind === 'deployment') return `/d/${route.deploymentId}`
  if (route.kind === 'preview') return `/preview/${encodeURIComponent(route.scenarioId)}`
  return `/${route.slug}`
}

export function goToDemoRoute(route: DemoRoute): void {
  const nextPath = getDemoRoutePath(route)
  window.history.pushState({}, '', nextPath)
  window.dispatchEvent(new PopStateEvent('popstate'))
}
