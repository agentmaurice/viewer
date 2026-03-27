import { createClient } from '@supabase/supabase-js'
import type { DemoScenarioConfigInput } from './scenarios.js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = hasSupabaseEnv
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export const viewerApiBaseUrl =
  import.meta.env.VITE_VIEWER_API_BASE_URL ?? 'http://localhost:8080/api'

export const supabaseOAuthProvider =
  import.meta.env.VITE_SUPABASE_OAUTH_PROVIDER ?? ''

export const supabaseMagicRedirectUrl =
  import.meta.env.VITE_SUPABASE_MAGIC_REDIRECT_URL ?? window.location.origin

function parseList(raw: string | undefined): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
}

export const demoSlugs = parseList(import.meta.env.VITE_VIEWER_DEMO_SLUGS)
export const demoDeploymentIds = parseList(import.meta.env.VITE_VIEWER_DEMO_DEPLOYMENTS)

function parseScenarioConfig(raw: string | undefined): DemoScenarioConfigInput[] {
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed
      .filter((item): item is DemoScenarioConfigInput => Boolean(item) && typeof item === 'object')
      .map((item) => ({
        slug: typeof item.slug === 'string' ? item.slug : undefined,
        deploymentId: typeof item.deploymentId === 'string' ? item.deploymentId : undefined,
        title: typeof item.title === 'string' ? item.title : undefined,
        summary: typeof item.summary === 'string' ? item.summary : undefined,
        patterns: Array.isArray(item.patterns)
          ? item.patterns.filter((pattern): pattern is string => typeof pattern === 'string')
          : undefined,
        category: typeof item.category === 'string' ? item.category : undefined,
        audience: typeof item.audience === 'string' ? item.audience : undefined,
      }))
  } catch {
    return []
  }
}

export const demoScenarioConfig = parseScenarioConfig(import.meta.env.VITE_VIEWER_DEMO_SCENARIOS)
