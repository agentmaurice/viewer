import type {
  AuthAdapter,
  AuthResult,
  AuthStateCallback,
  AuthUser,
} from "./auth-adapter";

export interface ExternalAuthConfig {
  user: AuthUser;
  getToken: () => Promise<string>;
  onLogout?: () => void | Promise<void>;
}

export class ExternalAuthAdapter implements AuthAdapter {
  private readonly config: ExternalAuthConfig;
  private readonly listeners = new Set<AuthStateCallback>();

  constructor(config: ExternalAuthConfig) {
    this.config = config;
  }

  async authenticate(): Promise<AuthResult> {
    const token = await this.config.getToken();
    return { user: this.config.user, token };
  }

  async getToken(): Promise<string> {
    return this.config.getToken();
  }

  async logout(): Promise<void> {
    await this.config.onLogout?.();
    for (const listener of this.listeners) {
      listener(null);
    }
  }

  onAuthStateChange(callback: AuthStateCallback): () => void {
    this.listeners.add(callback);
    callback(this.config.user);
    return () => {
      this.listeners.delete(callback);
    };
  }
}
