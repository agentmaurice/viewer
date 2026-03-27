export interface AuthUser {
  id: string;
  displayName?: string;
  email?: string;
  avatarUrl?: string;
}

export interface AuthResult {
  user: AuthUser;
  token: string;
}

export type AuthStateCallback = (user: AuthUser | null) => void;

export interface AuthAdapter {
  authenticate(): Promise<AuthResult>;
  getToken(): Promise<string>;
  logout(): Promise<void>;
  onAuthStateChange(callback: AuthStateCallback): () => void;
}
