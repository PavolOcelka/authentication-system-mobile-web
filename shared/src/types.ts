export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
  createdAt?: Date;
}

export interface WhitelistEntry {
  email: string;
  approved: boolean;
  addedAt: Date;
  addedBy?: string;
}

export interface AuthError {
  code: string;
  message: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends SignInCredentials {}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
}