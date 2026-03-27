import React, { useMemo } from 'react'
import { AgentMauriceViewer } from '@agent-maurice/viewer-web'

function parseRoute(): { slug?: string; deploymentId?: string } {
  const path = window.location.pathname.replace(/^\//, '').replace(/\/$/, '')
  if (!path) return {}
  if (path.startsWith('d/')) {
    return { deploymentId: path.slice(2) }
  }
  return { slug: path }
}

export function App(): React.ReactElement {
  const route = useMemo(() => parseRoute(), [])

  if (!route.slug && !route.deploymentId) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ color: '#6B7280', fontSize: '1.125rem' }}>
          No viewer configured. Open a URL such as /my-slug or /d/deployment-id.
        </p>
      </div>
    )
  }

  return (
    <AgentMauriceViewer
      deploymentId={route.deploymentId}
      slug={route.slug}
      className="viewer-fullscreen"
    />
  )
}
