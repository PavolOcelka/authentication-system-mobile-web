import { describe, it, expect } from 'vitest';
import { friendlyMessages, toAuthError, mapFirebaseUser } from '../authHelpers';
import type { User as FirebaseUser } from 'firebase/auth';

describe('friendlyMessages', () => {
  it('maps auth/wrong-password to a generic login failure message', () => {
    expect(friendlyMessages['auth/wrong-password']).toBe('Invalid email or password.');
  });

  it('maps auth/not-whitelisted to a vague message that hides whitelist status', () => {
    expect(friendlyMessages['auth/not-whitelisted']).toBe(
      'Unable to create account. The email may not be authorized or may already be in use.',
    );
  });

  it('uses the same message for auth/not-whitelisted and auth/email-already-in-use', () => {
    expect(friendlyMessages['auth/not-whitelisted']).toBe(
      friendlyMessages['auth/email-already-in-use'],
    );
  });
});

describe('toAuthError', () => {
  it('returns the friendly message for a known error code', () => {
    const err = { code: 'auth/wrong-password', message: 'Firebase: ...' };
    const result = toAuthError(err);

    expect(result.code).toBe('auth/wrong-password');
    expect(result.message).toBe('Invalid email or password.');
  });

  it('falls back to the original message for an unknown code when it is not a raw Firebase string', () => {
    const err = { code: 'auth/custom-error', message: 'Something specific happened.' };
    const result = toAuthError(err);

    expect(result.code).toBe('auth/custom-error');
    expect(result.message).toBe('Something specific happened.');
  });

  it('falls back to a generic message when the original message starts with "Firebase:"', () => {
    const err = { code: 'auth/unknown-code', message: 'Firebase: Something internal (auth/unknown-code).' };
    const result = toAuthError(err);

    expect(result.message).toBe('Something went wrong. Please try again.');
  });

  it('falls back to a generic message when no code or message is provided', () => {
    const result = toAuthError({});

    expect(result.code).toBe('auth/unknown');
    expect(result.message).toBe('Something went wrong. Please try again.');
  });

  it('handles non-object errors gracefully', () => {
    const result = toAuthError('string error');

    expect(result.code).toBe('auth/unknown');
  });
});

describe('mapFirebaseUser', () => {
  it('maps uid, email, and displayName from a Firebase user', () => {
    const firebaseUser = {
      uid: 'uid-123',
      email: 'alice@example.com',
      displayName: 'Alice',
    } as FirebaseUser;

    const result = mapFirebaseUser(firebaseUser);

    expect(result).toEqual({
      uid: 'uid-123',
      email: 'alice@example.com',
      displayName: 'Alice',
    });
  });

  it('maps null displayName when the Firebase user has none', () => {
    const firebaseUser = {
      uid: 'uid-456',
      email: 'bob@example.com',
      displayName: null,
    } as FirebaseUser;

    const result = mapFirebaseUser(firebaseUser);

    expect(result.displayName).toBeNull();
  });
});
