/**
 * User interface - represents an authenticated user
 */
export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
  createdAt?: Date;
}

/**
 * Whitelist entry - represents an email in the whitelist
 */
export interface WhitelistEntry {
  email: string;
  approved: boolean;
  addedAt: Date;
  addedBy?: string;
}

/**
 * Auth error interface
 */
export interface AuthError {
  code: string;
  message: string;
}