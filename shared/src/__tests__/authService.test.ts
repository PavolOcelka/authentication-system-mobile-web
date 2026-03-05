/**
 * authService.test.ts
 *
 * WHAT WE ARE TESTING
 * -------------------
 * authService.ts is the core of your business logic. It owns signUp, signIn,
 * signOut, resetPassword, and onAuthStateChange. It also contains the private
 * whitelist check (checkWhitelist) that gates registration and login.
 *
 * MOCKING STRATEGY
 * ----------------
 * Firebase is an *external* dependency — we never hit real Firebase in unit
 * tests. We mock three things:
 *   1. firebase/auth  — all auth SDK functions become vi.fn() spies
 *   2. firebase/firestore — doc/getDoc become spies (used by checkWhitelist)
 *   3. ./firebaseConfig — getAuthInstance / getDbInstance return fake objects
 *   4. ./userService — createUserProfile is mocked so it doesn't touch Firestore
 *
 * This way every test runs in <1 ms and is 100% deterministic.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { getAuthInstance, getDbInstance } from '../firebaseConfig';
import { createUserProfile } from '../userService';
import { signUp, signIn, signOut, resetPassword, onAuthStateChange } from '../authService';

// ─── Module mocks ────────────────────────────────────────────────────────────
// vi.mock() calls are automatically hoisted to the top of the file by Vitest,
// so they always run before the imports above. This is the same as Jest's
// automatic hoisting behaviour.

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
}));

vi.mock('../firebaseConfig', () => ({
  getAuthInstance: vi.fn(),
  getDbInstance: vi.fn(),
}));

vi.mock('../userService', () => ({
  createUserProfile: vi.fn(),
}));

// ─── Shared test fixtures ─────────────────────────────────────────────────────
// Fake objects that stand in for real Firebase instances. They don't need real
// methods — they're just reference tokens we pass to our spies.
const mockAuth = {} as ReturnType<typeof getAuthInstance>;
const mockDb = {} as ReturnType<typeof getDbInstance>;
const mockFirebaseUser = {
  uid: 'uid-abc-123',
  email: 'user@example.com',
  displayName: null,
} as any;

// ─── beforeEach ───────────────────────────────────────────────────────────────
// vi.clearAllMocks() resets call history and return values on every spy before
// each test. Without this, a spy's call count from test N leaks into test N+1.
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getAuthInstance).mockReturnValue(mockAuth);
  vi.mocked(getDbInstance).mockReturnValue(mockDb);
  vi.mocked(doc).mockReturnValue({} as any);
  vi.mocked(createUserProfile).mockResolvedValue(undefined);
});

// ═════════════════════════════════════════════════════════════════════════════
describe('signUp', () => {
  // ── Whitelist ENABLED (default) ───────────────────────────────────────────
  describe('when whitelist is required (default)', () => {
    it('throws auth/not-whitelisted when email is not in the whitelist', async () => {
      // Simulate: document does not exist in Firestore
      vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as any);

      // rejects.toMatchObject lets us assert on a subset of the thrown object
      await expect(signUp('unknown@example.com', 'pass123')).rejects.toMatchObject({
        code: 'auth/not-whitelisted',
        message: expect.stringContaining('invitation only'),
      });

      // Critical: Firebase user creation must NOT be attempted
      expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
    });

    it('throws auth/not-whitelisted when email exists but approved is false', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ approved: false }),
      } as any);

      await expect(signUp('pending@example.com', 'pass123')).rejects.toMatchObject({
        code: 'auth/not-whitelisted',
      });
    });

    it('creates the user and their profile when email is approved', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ approved: true }),
      } as any);
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
        user: mockFirebaseUser,
      } as any);

      const result = await signUp('approved@example.com', 'pass123');

      // Firebase Auth called with correct args
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        mockAuth,
        'approved@example.com',
        'pass123',
      );
      // Firestore profile created for the new user
      expect(createUserProfile).toHaveBeenCalledWith(mockFirebaseUser.uid, 'approved@example.com');
      // Returns the Firebase user object
      expect(result).toBe(mockFirebaseUser);
    });

    it('normalizes email to lowercase + trimmed before the whitelist lookup', async () => {
      vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as any);

      await expect(signUp('  ADMIN@EXAMPLE.COM  ', 'pass123')).rejects.toMatchObject({
        code: 'auth/not-whitelisted',
      });

      // The doc() call should use the normalized email as the document ID
      expect(doc).toHaveBeenCalledWith(mockDb, 'whitelist', 'admin@example.com');
    });
  });

  // ── Whitelist DISABLED ────────────────────────────────────────────────────
  describe('when whitelist is disabled', () => {
    it('skips the whitelist check and creates the user directly', async () => {
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
        user: mockFirebaseUser,
      } as any);

      const result = await signUp('any@example.com', 'pass123', { requireWhitelist: false });

      // No Firestore call at all
      expect(getDoc).not.toHaveBeenCalled();
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, 'any@example.com', 'pass123');
      expect(result).toBe(mockFirebaseUser);
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('signIn', () => {
  // ── Whitelist ENABLED (default) ───────────────────────────────────────────
  describe('when whitelist is required (default)', () => {
    it('returns the user when credentials are correct and email is whitelisted', async () => {
      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({ user: mockFirebaseUser } as any);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ approved: true }),
      } as any);

      const result = await signIn('user@example.com', 'pass123');

      expect(result).toBe(mockFirebaseUser);
      // User should NOT be signed out
      expect(firebaseSignOut).not.toHaveBeenCalled();
    });

    it('signs the user back out and throws when email is not whitelisted', async () => {
      // Sign in itself succeeds...
      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({ user: mockFirebaseUser } as any);
      // ...but whitelist check fails
      vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as any);
      vi.mocked(firebaseSignOut).mockResolvedValue(undefined);

      await expect(signIn('blocked@example.com', 'pass123')).rejects.toMatchObject({
        code: 'auth/not-whitelisted',
        message: expect.stringContaining('does not have access'),
      });

      // Must sign out the user to prevent a logged-in-but-unauthorized state
      expect(firebaseSignOut).toHaveBeenCalledWith(mockAuth);
    });
  });

  // ── Whitelist DISABLED ────────────────────────────────────────────────────
  describe('when whitelist is disabled', () => {
    it('returns the user without checking Firestore', async () => {
      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({ user: mockFirebaseUser } as any);

      const result = await signIn('user@example.com', 'pass123', { requireWhitelist: false });

      expect(getDoc).not.toHaveBeenCalled();
      expect(result).toBe(mockFirebaseUser);
    });
  });

  it('propagates Firebase errors such as wrong-password without modification', async () => {
    const firebaseError = { code: 'auth/wrong-password', message: 'Wrong password.' };
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue(firebaseError);

    // We do not swallow Firebase's own errors — they bubble up as-is
    await expect(signIn('user@example.com', 'wrong')).rejects.toMatchObject({
      code: 'auth/wrong-password',
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('signOut', () => {
  it('delegates to Firebase signOut with the correct auth instance', async () => {
    vi.mocked(firebaseSignOut).mockResolvedValue(undefined);

    await signOut();

    expect(firebaseSignOut).toHaveBeenCalledTimes(1);
    expect(firebaseSignOut).toHaveBeenCalledWith(mockAuth);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('resetPassword', () => {
  it('sends a password reset email to the given address', async () => {
    vi.mocked(sendPasswordResetEmail).mockResolvedValue(undefined);

    await resetPassword('user@example.com');

    expect(sendPasswordResetEmail).toHaveBeenCalledWith(mockAuth, 'user@example.com');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('onAuthStateChange', () => {
  it('subscribes to Firebase auth state and returns the unsubscribe function', () => {
    const mockUnsubscribe = vi.fn();
    const mockCallback = vi.fn();
    vi.mocked(onAuthStateChanged).mockReturnValue(mockUnsubscribe as any);

    const unsubscribe = onAuthStateChange(mockCallback);

    expect(onAuthStateChanged).toHaveBeenCalledWith(mockAuth, mockCallback);
    // The caller receives the unsubscribe function to clean up their subscription
    expect(unsubscribe).toBe(mockUnsubscribe);
  });
});
