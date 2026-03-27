import React, { useEffect, useMemo, useState } from 'react'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { AgentMauriceViewer } from '@agent-maurice/viewer-web'
import { SupabaseViewerAuthAdapter } from './auth/SupabaseViewerAuthAdapter.js'
import {
  demoDeploymentIds,
  demoScenarioConfig,
  demoSlugs,
  hasSupabaseEnv,
  supabase,
  supabaseMagicRedirectUrl,
  supabaseOAuthProvider,
  viewerApiBaseUrl,
} from './lib/supabase.js'
import { getDemoRoutePath, goToDemoRoute, parseDemoRoute, type DemoRoute } from './lib/route.js'
import { buildScenarioGallery } from './lib/scenarios.js'
import { MockViewerPreview } from './lib/mockViewer.js'

type AuthState = 'loading' | 'anonymous' | 'authenticated'
type GalleryMode = 'all' | 'preview' | 'backend'

function useRoute(): DemoRoute {
  const [route, setRoute] = useState<DemoRoute>(() =>
    parseDemoRoute(window.location.pathname),
  )

  useEffect(() => {
    const onPopState = () => setRoute(parseDemoRoute(window.location.pathname))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  return route
}

export function App(): React.ReactElement {
  const route = useRoute()
  const [authState, setAuthState] = useState<AuthState>(
    hasSupabaseEnv ? 'loading' : 'anonymous',
  )
  const [session, setSession] = useState<Session | null>(null)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [galleryMode, setGalleryMode] = useState<GalleryMode>('all')

  useEffect(() => {
    if (!supabase) {
      return
    }

    let active = true
    void supabase.auth.getSession().then(({ data, error: sessionError }: {
      data: { session: Session | null }
      error: Error | null
    }) => {
      if (!active) return
      if (sessionError) {
        setError(sessionError.message)
        setAuthState('anonymous')
        return
      }
      setSession(data.session)
      setAuthState(data.session ? 'authenticated' : 'anonymous')
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, nextSession: Session | null) => {
      setSession(nextSession)
      setAuthState(nextSession ? 'authenticated' : 'anonymous')
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const authAdapter = useMemo(() => {
    if (!supabase || !session) return undefined
    return new SupabaseViewerAuthAdapter(supabase)
  }, [session])
  const hasAuthenticatedViewer = Boolean(session && authAdapter)
  const scenarios = useMemo(
    () => buildScenarioGallery(demoSlugs, demoDeploymentIds, demoScenarioConfig),
    [],
  )
  const matchedScenario = useMemo(() => {
    if (route.kind === 'preview') {
      return scenarios.find((scenario) => scenario.id === route.scenarioId)
    }
    if (route.kind === 'slug') {
      return scenarios.find((scenario) => scenario.kind === 'slug' && scenario.href === `/${route.slug}`)
    }
    if (route.kind === 'deployment') {
      return scenarios.find((scenario) => scenario.kind === 'deployment' && scenario.href === `/d/${route.deploymentId}`)
    }
    return undefined
  }, [route, scenarios])
  const filteredScenarios = useMemo(() => {
    if (galleryMode === 'preview') {
      return scenarios
    }
    if (galleryMode === 'backend') {
      return hasAuthenticatedViewer ? scenarios : []
    }
    return scenarios
  }, [galleryMode, hasAuthenticatedViewer, scenarios])

  async function handleSendMagicLink(): Promise<void> {
    if (!supabase) return
    if (!email.trim()) {
      setError('Enter an email address to send a magic link.')
      return
    }

    setPending(true)
    setError(null)
    setMessage(null)
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: supabaseMagicRedirectUrl,
      },
    })
    setPending(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    setMessage('Sign-in link sent. Open your inbox to complete authentication.')
  }

  async function handleOAuthSignIn(): Promise<void> {
    if (!supabase || !supabaseOAuthProvider) return
    setPending(true)
    setError(null)
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: supabaseOAuthProvider as any,
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (signInError) {
      setPending(false)
      setError(signInError.message)
    }
  }

  async function handleLogout(): Promise<void> {
    if (!supabase) return
    setPending(true)
    const { error: signOutError } = await supabase.auth.signOut()
    setPending(false)
    if (signOutError) {
      setError(signOutError.message)
      return
    }
    goToDemoRoute({ kind: 'home' })
  }

  if (authState === 'loading') {
    return (
      <Shell>
        <PanelTitle
          eyebrow="Viewer Demo"
          title="Connecting to Supabase"
          description="Initializing the demo session."
        />
      </Shell>
    )
  }

  if (route.kind === 'home') {
    return (
      <Shell>
        <header style={headerRowStyle}>
          <PanelTitle
            eyebrow="Viewer Demo"
            title="Demo gallery"
            description={
              hasAuthenticatedViewer
                ? 'Choose a viewer slug or deployment ID to open a Supabase-protected OpenUI mini-app.'
                : 'Try viewer scenarios directly from this interface. Supabase sign-in remains optional for real backend routes.'
            }
          />
          {hasAuthenticatedViewer ? (
            <button onClick={handleLogout} disabled={pending} style={secondaryButtonStyle}>
              Sign out
            </button>
          ) : null}
        </header>

        <div style={gridStyle}>
          <section style={cardStyle}>
            <h2 style={sectionTitleStyle}>
              {hasSupabaseEnv ? 'Supabase sign-in' : 'Preview mode without Supabase'}
            </h2>
            {!hasSupabaseEnv || !supabase ? (
              <>
                <p style={mutedStyle}>
                  No Supabase configuration detected. The gallery remains fully playable in local preview mode.
                </p>
                <CodeBlock
                  value={`VITE_VIEWER_API_BASE_URL=${viewerApiBaseUrl}
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_SUPABASE_OAUTH_PROVIDER=google
VITE_SUPABASE_MAGIC_REDIRECT_URL=${window.location.origin}`}
                />
              </>
            ) : hasAuthenticatedViewer ? (
              <>
                <p style={mutedStyle}>
                  Active session for {session?.user.email ?? session?.user.id}. Real viewer routes are available.
                </p>
                <CodeBlock value={`API: ${viewerApiBaseUrl}\nSession: ${session?.user.email ?? session?.user.id}`} />
              </>
            ) : (
              <div style={{ display: 'grid', gap: 12, marginTop: 20 }}>
                <p style={mutedStyle}>
                  Sign in to test real backend bootstrap. Without authentication, every scenario still works in local preview mode.
                </p>
                <label style={labelStyle}>
                  Email
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="demo@agentmaurice.dev"
                    style={inputStyle}
                  />
                </label>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button onClick={handleSendMagicLink} disabled={pending} style={primaryButtonStyle}>
                    Send magic link
                  </button>
                  {supabaseOAuthProvider ? (
                    <button onClick={handleOAuthSignIn} disabled={pending} style={secondaryButtonStyle}>
                      Continue with {supabaseOAuthProvider}
                    </button>
                  ) : null}
                </div>
                {message ? <p style={successStyle}>{message}</p> : null}
                {error ? <p style={errorStyle}>{error}</p> : null}
              </div>
            )}
          </section>

          <section style={cardStyle}>
            <h2 style={sectionTitleStyle}>Demo flow</h2>
            <ul style={listStyle}>
              <li>1. Open a local preview to test the viewer without external dependencies</li>
              <li>2. Optionally sign in with Supabase to test real backend bootstrap</li>
              <li>3. Switch between local preview and viewer routes from the gallery</li>
              <li>4. Show OpenUI interfaces in both modes</li>
            </ul>
          </section>

          <section style={cardStyle}>
            <h2 style={sectionTitleStyle}>Embed without React</h2>
            <p style={mutedStyle}>
              A standalone HTML page shows how to import the web component in the header and embed several mocked mini-apps.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
              <a href="/embed-showcase.html" style={scenarioPrimaryLinkStyle}>
                Open embed page
              </a>
              <a href="/embed-showcase.html#code" style={scenarioSecondaryLinkStyle}>
                View snippet
              </a>
            </div>
          </section>

          <section style={cardStyle}>
            <h2 style={sectionTitleStyle}>Demos by slug</h2>
            {demoSlugs.length > 0 ? (
              <div style={chipListStyle}>
                {demoSlugs.map((slug: string) => (
                  <a key={slug} href={`/${slug}`} style={chipStyle}>
                    /{slug}
                  </a>
                ))}
              </div>
            ) : (
              <p style={mutedStyle}>
                Add `VITE_VIEWER_DEMO_SLUGS=slug-a,slug-b` to show shortcuts here.
              </p>
            )}
          </section>

          <section style={cardStyle}>
            <h2 style={sectionTitleStyle}>Demos by deployment ID</h2>
            {demoDeploymentIds.length > 0 ? (
              <div style={chipListStyle}>
                {demoDeploymentIds.map((deploymentId: string) => (
                  <a key={deploymentId} href={`/d/${deploymentId}`} style={chipStyle}>
                    /d/{deploymentId}
                  </a>
                ))}
              </div>
            ) : (
              <p style={mutedStyle}>
                Add `VITE_VIEWER_DEMO_DEPLOYMENTS=id-a,id-b` to show shortcuts here.
              </p>
            )}
          </section>
        </div>

        <section style={{ marginTop: 24 }}>
          <div style={galleryHeaderStyle}>
            <div>
              <h2 style={sectionTitleStyle}>OpenUI scenarios</h2>
              <p style={{ ...mutedStyle, marginBottom: 0 }}>
                This gallery offers a more product-oriented entry point than plain routes. Each card maps to an OpenUI
                interface style you can showcase in a demo.
              </p>
            </div>
            <div style={galleryModeRowStyle}>
              <button
                type="button"
                style={galleryMode === 'all' ? activeGalleryFilterStyle : galleryFilterStyle}
                onClick={() => setGalleryMode('all')}
              >
                All
              </button>
              <button
                type="button"
                style={galleryMode === 'preview' ? activeGalleryFilterStyle : galleryFilterStyle}
                onClick={() => setGalleryMode('preview')}
              >
                Local preview
              </button>
              <button
                type="button"
                style={galleryMode === 'backend' ? activeGalleryFilterStyle : galleryFilterStyle}
                onClick={() => setGalleryMode('backend')}
              >
                Viewer backend
              </button>
            </div>
          </div>
          {filteredScenarios.length > 0 ? (
            <div style={scenarioGridStyle}>
              {filteredScenarios.map((scenario) => (
                <div key={scenario.id} style={scenarioCardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <div style={scenarioKindStyle}>
                          {scenario.kind === 'slug' ? 'Slug' : 'Deployment'}
                        </div>
                        {scenario.category ? (
                          <div style={scenarioCategoryStyle}>{scenario.category}</div>
                        ) : null}
                        <div style={scenarioAvailableStyle}>Local preview available</div>
                        <div style={hasAuthenticatedViewer ? scenarioBackendReadyStyle : scenarioBackendPendingStyle}>
                          {hasAuthenticatedViewer ? 'Viewer backend available' : 'Viewer backend requires sign-in'}
                        </div>
                      </div>
                      <h3 style={{ margin: '10px 0 8px', fontSize: 20, lineHeight: 1.1 }}>
                        {scenario.title}
                      </h3>
                    </div>
                    <code style={routeCodeStyle}>{scenario.routeLabel}</code>
                  </div>
                  <p style={{ ...mutedStyle, marginTop: 0 }}>{scenario.summary}</p>
                  {scenario.audience ? (
                    <p style={scenarioAudienceStyle}>Audience: {scenario.audience}</p>
                  ) : null}
                  <p style={scenarioAvailabilityCopyStyle}>
                    {hasAuthenticatedViewer
                      ? 'This scenario can be played locally or opened against the viewer backend.'
                      : 'This scenario is immediately playable locally. Sign in to test the real backend bootstrap afterwards.'}
                  </p>
                  <div style={patternListStyle}>
                    {scenario.patterns.map((pattern) => (
                      <span key={pattern} style={patternChipStyle}>
                        {pattern}
                      </span>
                    ))}
                  </div>
                  <div style={scenarioActionsStyle}>
                    <a
                      href={
                        hasAuthenticatedViewer
                          ? scenario.href
                          : getDemoRoutePath({ kind: 'preview', scenarioId: scenario.id })
                      }
                      style={scenarioPrimaryLinkStyle}
                    >
                      {hasAuthenticatedViewer ? 'Open viewer' : 'Play demo'}
                    </a>
                    <a
                      href={getDemoRoutePath({ kind: 'preview', scenarioId: scenario.id })}
                      style={scenarioSecondaryLinkStyle}
                    >
                      Offline preview
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={cardStyle}>
              <p style={mutedStyle}>
                {galleryMode === 'backend'
                  ? 'Sign in with Supabase to display backend scenarios, or switch back to local preview mode.'
                  : 'Add `VITE_VIEWER_DEMO_SLUGS` or `VITE_VIEWER_DEMO_DEPLOYMENTS` to populate the gallery automatically.'}
              </p>
            </div>
          )}
        </section>

        {hasAuthenticatedViewer ? (
          <section style={{ ...cardStyle, marginTop: 24 }}>
            <h2 style={sectionTitleStyle}>Current route</h2>
            <CodeBlock value={`API: ${viewerApiBaseUrl}\nSession: ${session?.user.email ?? session?.user.id}`} />
          </section>
        ) : null}
      </Shell>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={viewerHeaderStyle}>
        <div>
          <div style={eyebrowStyle}>Viewer Demo</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            {route.kind === 'deployment'
              ? `Deployment ${route.deploymentId}`
              : route.kind === 'preview'
                ? `Preview ${matchedScenario?.title ?? route.scenarioId}`
                : `Slug ${route.slug}`}
          </div>
          <div style={viewerModeCopyStyle}>
            {route.kind === 'preview' || !hasAuthenticatedViewer
              ? 'Local preview mode'
              : 'Viewer backend mode'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {route.kind !== 'preview' && matchedScenario ? (
            <a
              href={getDemoRoutePath({ kind: 'preview', scenarioId: matchedScenario.id })}
              style={viewerHeaderLinkStyle}
            >
              Offline preview
            </a>
          ) : null}
          {route.kind === 'preview' && matchedScenario && hasAuthenticatedViewer ? (
            <a href={matchedScenario.href} style={viewerHeaderLinkStyle}>
              Open viewer
            </a>
          ) : null}
          <a href="/" style={viewerHeaderLinkStyle}>
            Back to gallery
          </a>
          {hasAuthenticatedViewer ? (
            <button onClick={handleLogout} disabled={pending} style={secondaryButtonStyle}>
              Sign out
            </button>
          ) : null}
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        {route.kind === 'preview' ? (
          matchedScenario ? (
            <MockViewerPreview scenario={matchedScenario} />
          ) : (
            <Shell>
              <PanelTitle
                eyebrow="Viewer Demo"
                title="Preview not found"
                description="This scenario does not exist in the current gallery."
              />
            </Shell>
          )
        ) : !hasAuthenticatedViewer && matchedScenario ? (
          <MockViewerPreview scenario={matchedScenario} />
        ) : (
          <AgentMauriceViewer
            apiBaseUrl={viewerApiBaseUrl}
            authAdapter={authAdapter}
            deploymentId={route.kind === 'deployment' ? route.deploymentId : undefined}
            slug={route.kind === 'slug' ? route.slug : undefined}
            className="viewer-demo-root"
          />
        )}
      </div>
    </div>
  )
}

function Shell({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <main
      style={{
        maxWidth: 1120,
        margin: '0 auto',
        padding: '56px 24px 72px',
      }}
    >
      {children}
    </main>
  )
}

function PanelTitle(props: {
  eyebrow: string
  title: string
  description: string
}): React.ReactElement {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={eyebrowStyle}>{props.eyebrow}</div>
      <h1
        style={{
          margin: '8px 0 12px',
          fontSize: 'clamp(2rem, 4vw, 3.5rem)',
          lineHeight: 1,
          letterSpacing: '-0.04em',
        }}
      >
        {props.title}
      </h1>
      <p style={{ ...mutedStyle, maxWidth: 760, fontSize: 18 }}>
        {props.description}
      </p>
    </div>
  )
}

function CodeBlock({ value }: { value: string }): React.ReactElement {
  return (
    <pre
      style={{
        margin: 0,
        padding: 20,
        borderRadius: 18,
        background: '#111827',
        color: '#F9FAFB',
        overflowX: 'auto',
        fontSize: 13,
        lineHeight: 1.6,
      }}
    >
      <code>{value}</code>
    </pre>
  )
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gap: 20,
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
}

const cardStyle: React.CSSProperties = {
  borderRadius: 24,
  padding: 24,
  background: 'rgba(255,255,255,0.82)',
  boxShadow: '0 18px 60px rgba(15, 23, 42, 0.08)',
  border: '1px solid rgba(15, 23, 42, 0.08)',
  backdropFilter: 'blur(12px)',
}

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 20,
  fontWeight: 700,
}

const mutedStyle: React.CSSProperties = {
  margin: '8px 0 0',
  color: '#6B7280',
  lineHeight: 1.6,
}

const labelStyle: React.CSSProperties = {
  display: 'grid',
  gap: 8,
  fontSize: 14,
  fontWeight: 600,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: 14,
  border: '1px solid rgba(15, 23, 42, 0.16)',
  padding: '14px 16px',
  fontSize: 15,
  background: '#FFFFFF',
}

const primaryButtonStyle: React.CSSProperties = {
  border: 'none',
  borderRadius: 999,
  padding: '12px 18px',
  background: '#0F766E',
  color: '#FFFFFF',
  fontWeight: 700,
  cursor: 'pointer',
}

const secondaryButtonStyle: React.CSSProperties = {
  border: '1px solid rgba(15, 23, 42, 0.12)',
  borderRadius: 999,
  padding: '12px 18px',
  background: '#FFFFFF',
  color: '#111827',
  fontWeight: 700,
  cursor: 'pointer',
}

const chipListStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12,
  marginTop: 20,
}

const scenarioGridStyle: React.CSSProperties = {
  display: 'grid',
  gap: 16,
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
}

const galleryHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  alignItems: 'flex-end',
  flexWrap: 'wrap',
  marginBottom: 16,
}

const galleryModeRowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 10,
}

const galleryFilterStyle: React.CSSProperties = {
  borderRadius: 999,
  border: '1px solid rgba(15, 23, 42, 0.12)',
  padding: '10px 14px',
  background: '#FFFFFF',
  color: '#334155',
  fontWeight: 700,
  cursor: 'pointer',
}

const activeGalleryFilterStyle: React.CSSProperties = {
  ...galleryFilterStyle,
  background: '#0F172A',
  color: '#FFFFFF',
  border: 'none',
}

const scenarioCardStyle: React.CSSProperties = {
  ...cardStyle,
  display: 'grid',
  gap: 16,
}

const scenarioActionsStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 10,
}

const scenarioPrimaryLinkStyle: React.CSSProperties = {
  ...primaryButtonStyle,
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
}

const scenarioSecondaryLinkStyle: React.CSSProperties = {
  ...secondaryButtonStyle,
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
}

const scenarioKindStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: 999,
  padding: '6px 10px',
  background: '#E0F2FE',
  color: '#075985',
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}

const scenarioCategoryStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: 999,
  padding: '6px 10px',
  background: '#ECFCCB',
  color: '#3F6212',
  fontSize: 12,
  fontWeight: 700,
}

const routeCodeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: 999,
  background: '#F8FAFC',
  padding: '8px 10px',
  fontSize: 12,
  fontWeight: 700,
  color: '#334155',
}

const patternListStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
}

const scenarioAudienceStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: '#475569',
  fontWeight: 600,
}

const scenarioAvailabilityCopyStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: '#334155',
  lineHeight: 1.5,
}

const scenarioAvailableStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: 999,
  padding: '6px 10px',
  background: '#DCFCE7',
  color: '#166534',
  fontSize: 12,
  fontWeight: 700,
}

const scenarioBackendReadyStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: 999,
  padding: '6px 10px',
  background: '#E0F2FE',
  color: '#075985',
  fontSize: 12,
  fontWeight: 700,
}

const scenarioBackendPendingStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: 999,
  padding: '6px 10px',
  background: '#FEF3C7',
  color: '#92400E',
  fontSize: 12,
  fontWeight: 700,
}

const patternChipStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: 999,
  background: '#FEF3C7',
  color: '#92400E',
  padding: '6px 10px',
  fontSize: 12,
  fontWeight: 700,
}

const chipStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: 999,
  padding: '10px 14px',
  textDecoration: 'none',
  background: '#F8FAFC',
  border: '1px solid rgba(15, 23, 42, 0.08)',
  fontWeight: 600,
}

const listStyle: React.CSSProperties = {
  margin: '20px 0 0',
  paddingLeft: 18,
  color: '#374151',
  lineHeight: 1.8,
}

const successStyle: React.CSSProperties = {
  margin: 0,
  color: '#047857',
  fontSize: 14,
}

const errorStyle: React.CSSProperties = {
  margin: 0,
  color: '#B91C1C',
  fontSize: 14,
}

const eyebrowStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '6px 10px',
  borderRadius: 999,
  background: '#FFF1CF',
  color: '#9A6700',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
}

const headerRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 20,
  alignItems: 'flex-start',
  flexWrap: 'wrap',
}

const viewerHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 20,
  alignItems: 'center',
  padding: '18px 24px',
  borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
  background: 'rgba(255,255,255,0.82)',
  backdropFilter: 'blur(12px)',
}

const viewerHeaderLinkStyle: React.CSSProperties = {
  textDecoration: 'none',
  fontWeight: 600,
}

const viewerModeCopyStyle: React.CSSProperties = {
  marginTop: 6,
  fontSize: 13,
  color: '#64748B',
  fontWeight: 600,
}
