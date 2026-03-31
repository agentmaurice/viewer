import React, { useEffect, useState } from 'react'
import { AgentMauriceViewer } from '@agent-maurice/viewer-web'
import { viewerApiBaseUrl, deploymentId } from './lib/config.js'
import { CHECKLIST_ITEMS, formatChecklistForSubmission, getDomaineStats } from './lib/checklist.js'

type Route =
  | { kind: 'home' }
  | { kind: 'viewer' }

function parseRoute(pathname: string): Route {
  const path = pathname.replace(/^\//, '').replace(/\/$/, '')
  if (path === 'validation') return { kind: 'viewer' }
  return { kind: 'home' }
}

function navigateTo(route: Route) {
  const path = route.kind === 'viewer' ? '/validation' : '/'
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function App(): React.ReactElement {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.pathname))

  useEffect(() => {
    const onPopState = () => setRoute(parseRoute(window.location.pathname))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  if (route.kind === 'viewer') {
    return <ViewerPage />
  }

  return <HomePage />
}

function HomePage(): React.ReactElement {
  const domaineStats = getDomaineStats(CHECKLIST_ITEMS)
  const totalBloquants = CHECKLIST_ITEMS.filter((it) => it.criticite === 'Bloquant').length
  const totalMajeurs = CHECKLIST_ITEMS.filter((it) => it.criticite === 'Majeur').length
  const totalMineurs = CHECKLIST_ITEMS.filter((it) => it.criticite === 'Mineur').length

  return (
    <main style={shellStyle}>
      <header style={headerStyle}>
        <div style={logoRowStyle}>
          <div style={logoStyle}>Niji</div>
          <span style={taglineStyle}>Digital & Technology</span>
        </div>
      </header>

      <section style={heroStyle}>
        <div style={eyebrowStyle}>Powered by AgentMaurice</div>
        <h1 style={heroTitleStyle}>
          Validateur de Reponses<br />Appels d'Offre
        </h1>
        <p style={heroDescStyle}>
          Analysez automatiquement vos propositions commerciales et techniques
          contre le cahier des charges client et la checklist qualite interne Niji.
        </p>
        <button onClick={() => navigateTo({ kind: 'viewer' })} style={ctaButtonStyle}>
          Lancer la validation
        </button>
      </section>

      <section style={statsBarStyle}>
        <div style={statBoxStyle}>
          <div style={statValueStyle}>{CHECKLIST_ITEMS.length}</div>
          <div style={statLabelStyle}>Items checklist</div>
        </div>
        <div style={statBoxStyle}>
          <div style={{ ...statValueStyle, color: '#DC2626' }}>{totalBloquants}</div>
          <div style={statLabelStyle}>Bloquants</div>
        </div>
        <div style={statBoxStyle}>
          <div style={{ ...statValueStyle, color: '#D97706' }}>{totalMajeurs}</div>
          <div style={statLabelStyle}>Majeurs</div>
        </div>
        <div style={statBoxStyle}>
          <div style={{ ...statValueStyle, color: '#2563EB' }}>{totalMineurs}</div>
          <div style={statLabelStyle}>Mineurs</div>
        </div>
        <div style={statBoxStyle}>
          <div style={statValueStyle}>{domaineStats.size}</div>
          <div style={statLabelStyle}>Domaines</div>
        </div>
      </section>

      <section style={gridStyle}>
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Comment ca marche</h2>
          <ol style={stepListStyle}>
            <li style={stepItemStyle}>
              <strong>Collez le cahier des charges</strong> du client dans le formulaire
            </li>
            <li style={stepItemStyle}>
              <strong>Collez votre document de reponse</strong> (proposition commerciale et technique)
            </li>
            <li style={stepItemStyle}>
              La <strong>checklist Niji est pre-chargee</strong> automatiquement (55 items, 6 domaines)
            </li>
            <li style={stepItemStyle}>
              Ajoutez les <strong>profils requis</strong> et les <strong>CVs proposes</strong>
            </li>
            <li style={stepItemStyle}>
              L'IA analyse et produit un <strong>rapport de conformite complet</strong>
            </li>
          </ol>
        </div>

        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Domaines couverts</h2>
          <div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
            {Array.from(domaineStats.entries()).map(([domaine, stats]) => (
              <div key={domaine} style={domaineRowStyle}>
                <span style={domaineNameStyle}>{domaine}</span>
                <div style={domaineBadgesStyle}>
                  {stats.bloquant > 0 && (
                    <span style={badgeBloquantStyle}>{stats.bloquant} bloq.</span>
                  )}
                  {stats.majeur > 0 && (
                    <span style={badgeMajeurStyle}>{stats.majeur} maj.</span>
                  )}
                  {stats.mineur > 0 && (
                    <span style={badgeMineurStyle}>{stats.mineur} min.</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Analyses realisees</h2>
          <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
            <AnalysisCard
              number="1"
              title="Analyse CDC vs Reponse"
              desc="Extraction de toutes les exigences du cahier des charges et verification de leur couverture"
            />
            <AnalysisCard
              number="2"
              title="Validation Checklist"
              desc="Verification de chaque item de la checklist qualite interne"
            />
            <AnalysisCard
              number="3"
              title="Adequation CVs"
              desc="Evaluation de la correspondance entre profils requis et CVs proposes"
            />
            <AnalysisCard
              number="4"
              title="Synthese globale"
              desc="Score de conformite, statut global et recommandations prioritaires"
            />
          </div>
        </div>
      </section>

      <section style={{ marginTop: 32, textAlign: 'center' }}>
        <button onClick={() => navigateTo({ kind: 'viewer' })} style={ctaButtonStyle}>
          Demarrer la validation
        </button>
      </section>

      <footer style={footerStyle}>
        <span>Niji - Validateur AO</span>
        <span style={{ color: '#94A3B8' }}>Propulse par AgentMaurice</span>
      </footer>
    </main>
  )
}

function AnalysisCard(props: { number: string; title: string; desc: string }): React.ReactElement {
  return (
    <div style={analysisCardStyle}>
      <div style={analysisNumberStyle}>{props.number}</div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{props.title}</div>
        <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>{props.desc}</div>
      </div>
    </div>
  )
}

function ViewerPage(): React.ReactElement {
  const checklistText = formatChecklistForSubmission(CHECKLIST_ITEMS)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(checklistText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={viewerHeaderStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={logoStyle}>Niji</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Validateur Reponse Appel d'Offre</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
              {CHECKLIST_ITEMS.length} items de checklist pre-charges
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={handleCopy} style={secondaryButtonStyle}>
            {copied ? 'Copie !' : 'Copier la checklist'}
          </button>
          <a href="/" style={backLinkStyle} onClick={(e) => { e.preventDefault(); navigateTo({ kind: 'home' }) }}>
            Retour
          </a>
        </div>
      </div>

      <div style={checklistBannerStyle}>
        <span style={{ fontWeight: 600, fontSize: 13 }}>
          Checklist pre-chargee : collez-la dans le champ "checklist_items" du formulaire ci-dessous
        </span>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        {deploymentId ? (
          <AgentMauriceViewer
            apiBaseUrl={viewerApiBaseUrl}
            deploymentId={deploymentId}
            className="niji-viewer-root"
          />
        ) : (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <p style={{ color: '#64748B', fontSize: 18 }}>
              Configurez VITE_DEPLOYMENT_ID dans .env.local pour connecter le viewer.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Styles ──

const shellStyle: React.CSSProperties = {
  maxWidth: 1120,
  margin: '0 auto',
  padding: '0 24px 48px',
}

const headerStyle: React.CSSProperties = {
  padding: '24px 0',
}

const logoRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
}

const logoStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 48,
  height: 48,
  borderRadius: 14,
  background: '#E53E30',
  color: '#FFFFFF',
  fontWeight: 800,
  fontSize: 18,
  letterSpacing: '-0.02em',
}

const taglineStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: '#64748B',
}

const heroStyle: React.CSSProperties = {
  padding: '40px 0 32px',
}

const eyebrowStyle: React.CSSProperties = {
  display: 'inline-flex',
  padding: '6px 12px',
  borderRadius: 999,
  background: '#FEE2E2',
  color: '#DC2626',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase' as const,
  marginBottom: 16,
}

const heroTitleStyle: React.CSSProperties = {
  margin: '12px 0 16px',
  fontSize: 'clamp(2rem, 4vw, 3.2rem)',
  lineHeight: 1.05,
  letterSpacing: '-0.04em',
  fontWeight: 800,
}

const heroDescStyle: React.CSSProperties = {
  maxWidth: 640,
  color: '#475569',
  fontSize: 18,
  lineHeight: 1.6,
  margin: '0 0 24px',
}

const ctaButtonStyle: React.CSSProperties = {
  border: 'none',
  borderRadius: 999,
  padding: '14px 28px',
  background: '#E53E30',
  color: '#FFFFFF',
  fontWeight: 700,
  fontSize: 16,
  cursor: 'pointer',
  transition: 'transform 0.15s',
}

const statsBarStyle: React.CSSProperties = {
  display: 'flex',
  gap: 16,
  flexWrap: 'wrap',
  padding: '24px 0',
  borderTop: '1px solid rgba(0,0,0,0.06)',
  borderBottom: '1px solid rgba(0,0,0,0.06)',
  marginBottom: 32,
}

const statBoxStyle: React.CSSProperties = {
  flex: '1 1 100px',
  textAlign: 'center',
}

const statValueStyle: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 800,
  letterSpacing: '-0.02em',
}

const statLabelStyle: React.CSSProperties = {
  fontSize: 13,
  color: '#64748B',
  fontWeight: 600,
  marginTop: 4,
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gap: 20,
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
}

const cardStyle: React.CSSProperties = {
  borderRadius: 20,
  padding: 24,
  background: 'rgba(255,255,255,0.88)',
  boxShadow: '0 12px 40px rgba(0,0,0,0.06)',
  border: '1px solid rgba(0,0,0,0.06)',
}

const cardTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
}

const stepListStyle: React.CSSProperties = {
  margin: '16px 0 0',
  paddingLeft: 20,
  lineHeight: 1.8,
  color: '#374151',
}

const stepItemStyle: React.CSSProperties = {
  marginBottom: 4,
  fontSize: 14,
}

const domaineRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 12px',
  borderRadius: 12,
  background: '#F8FAFC',
}

const domaineNameStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  flex: 1,
}

const domaineBadgesStyle: React.CSSProperties = {
  display: 'flex',
  gap: 6,
}

const badgeBloquantStyle: React.CSSProperties = {
  padding: '3px 8px',
  borderRadius: 999,
  background: '#FEE2E2',
  color: '#DC2626',
  fontSize: 11,
  fontWeight: 700,
}

const badgeMajeurStyle: React.CSSProperties = {
  padding: '3px 8px',
  borderRadius: 999,
  background: '#FEF3C7',
  color: '#D97706',
  fontSize: 11,
  fontWeight: 700,
}

const badgeMineurStyle: React.CSSProperties = {
  padding: '3px 8px',
  borderRadius: 999,
  background: '#DBEAFE',
  color: '#2563EB',
  fontSize: 11,
  fontWeight: 700,
}

const analysisCardStyle: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  alignItems: 'flex-start',
  padding: '10px 12px',
  borderRadius: 12,
  background: '#F8FAFC',
}

const analysisNumberStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 999,
  background: '#E53E30',
  color: '#FFFFFF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 800,
  fontSize: 13,
  flexShrink: 0,
}

const viewerHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '14px 24px',
  borderBottom: '1px solid rgba(0,0,0,0.06)',
  background: 'rgba(255,255,255,0.92)',
  backdropFilter: 'blur(12px)',
}

const secondaryButtonStyle: React.CSSProperties = {
  border: '1px solid rgba(0,0,0,0.1)',
  borderRadius: 999,
  padding: '8px 16px',
  background: '#FFFFFF',
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
}

const backLinkStyle: React.CSSProperties = {
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: 13,
  color: '#475569',
}

const checklistBannerStyle: React.CSSProperties = {
  padding: '10px 24px',
  background: '#FEF3C7',
  color: '#92400E',
  textAlign: 'center',
}

const footerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '32px 0 0',
  fontSize: 13,
  color: '#64748B',
}
