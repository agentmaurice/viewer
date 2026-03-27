import type {
  AuthAdapter,
  AuthResult,
  AuthStateCallback,
  AuthUser,
} from '@agent-maurice/viewer-core'
import type { AuthChangeEvent, Session, SupabaseClient } from '@supabase/supabase-js'

function mapUser(user: any): AuthUser {
  return {
    id: user.id,
    displayName:
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email ??
      'Supabase user',
    email: user.email ?? undefined,
    avatarUrl: user.user_metadata?.avatar_url ?? undefined,
  }
}

export class SupabaseViewerAuthAdapter implements AuthAdapter {
  constructor(private readonly client: SupabaseClient) {}

  async authenticate(): Promise<AuthResult> {
    const {
      data: { session },
      error,
    } = await this.client.auth.getSession()

    if (error) {
      throw error
    }
    if (!session?.access_token || !session.user) {
      throw new Error('No Supabase session available')
    }

    return {
      user: mapUser(session.user),
      token: session.access_token,
    }
  }

  async getToken(): Promise<string> {
    const {
      data: { session },
      error,
    } = await this.client.auth.getSession()

    if (error) {
      throw error
    }
    if (!session?.access_token) {
      throw new Error('No Supabase access token available')
    }
    return session.access_token
  }

  async logout(): Promise<void> {
    const { error } = await this.client.auth.signOut()
    if (error) {
      throw error
    }
  }

  onAuthStateChange(callback: AuthStateCallback): () => void {
    const {
      data: { subscription },
    } = this.client.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      callback(session?.user ? mapUser(session.user) : null)
    })

    void this.client.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      callback(data.session?.user ? mapUser(data.session.user) : null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }
}
