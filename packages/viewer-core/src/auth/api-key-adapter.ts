import type {
  AuthAdapter,
  AuthResult,
  AuthStateCallback,
  AuthUser,
} from "./auth-adapter";

function generateAnonymousId(): string {
  const randomUUID = globalThis.crypto?.randomUUID?.bind(globalThis.crypto);
  if (randomUUID) {
    return `anon_${randomUUID().slice(0, 8)}`;
  }
  return `anon_${Math.random().toString(36).slice(2, 10)}`;
}

export class APIKeyAuthAdapter implements AuthAdapter {
  private readonly apiKey: string;
  private readonly user: AuthUser;
  private readonly listeners = new Set<AuthStateCallback>();

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.user = {
      id: generateAnonymousId(),
      displayName: "Anonymous",
    };
  }

  async authenticate(): Promise<AuthResult> {
    return { user: this.user, token: this.apiKey };
  }

  async getToken(): Promise<string> {
    return this.apiKey;
  }

  async logout(): Promise<void> {
    for (const listener of this.listeners) {
      listener(null);
    }
  }

  onAuthStateChange(callback: AuthStateCallback): () => void {
    this.listeners.add(callback);
    callback(this.user);
    return () => {
      this.listeners.delete(callback);
    };
  }
}
