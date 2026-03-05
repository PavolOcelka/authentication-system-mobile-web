/**
 * firebase.test.ts
 *
 * Verifies that App Check initialization is called when conditions are met
 * (browser env, site key present). We mock @shared/firebaseConfig to avoid
 * real Firebase and capture the initialization flow.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockInitializeFirebase = vi.fn(() => ({ auth: {}, db: {} }));
const mockInitializeWebAppCheck = vi.fn();

vi.mock('@shared/firebaseConfig', () => ({
  initializeFirebase: (...args: unknown[]) => mockInitializeFirebase(...args),
  initializeWebAppCheck: (...args: unknown[]) => mockInitializeWebAppCheck(...args),
}));

describe('Firebase initialization', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_API_KEY: 'test-api-key',
      NEXT_PUBLIC_PROJECT_ID: 'test-project',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('calls initializeWebAppCheck when site key is set (client-side)', async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = 'test-site-key-123';

    await import('../lib/firebase');

    expect(mockInitializeFirebase).toHaveBeenCalled();
    expect(mockInitializeWebAppCheck).toHaveBeenCalledWith('test-site-key-123');
  });

  it('does not call initializeWebAppCheck when site key is missing', async () => {
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    await import('../lib/firebase');

    expect(mockInitializeFirebase).toHaveBeenCalled();
    expect(mockInitializeWebAppCheck).not.toHaveBeenCalled();
  });

  it('sets debug token flag when NEXT_PUBLIC_APP_CHECK_DEBUG is true', async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = 'test-site-key';
    process.env.NEXT_PUBLIC_APP_CHECK_DEBUG = 'true';

    const selfBefore = (globalThis as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean })
      .FIREBASE_APPCHECK_DEBUG_TOKEN;

    await import('../lib/firebase');

    expect(mockInitializeWebAppCheck).toHaveBeenCalledWith('test-site-key');
    expect(
      (globalThis as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean }).FIREBASE_APPCHECK_DEBUG_TOKEN
    ).toBe(true);

    if (selfBefore === undefined) {
      delete (globalThis as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean })
        .FIREBASE_APPCHECK_DEBUG_TOKEN;
    }
  });
});
