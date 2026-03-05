/**
 * firebaseConfig.test.ts
 *
 * WHAT WE ARE TESTING
 * -------------------
 * firebaseConfig.ts implements a singleton pattern using module-level variables
 * (`let app`, `let auth`, `let db`). Once initialized, subsequent calls to
 * initializeFirebase() are no-ops. The getter functions throw a descriptive
 * error if called before initialization.
 *
 * THE SINGLETON PROBLEM IN TESTS
 * --------------------------------
 * Module-level state persists for the entire lifetime of the test process.
 * If test A calls initializeFirebase(), the `app` variable is set and never
 * reset — so test B that expects "not initialized" would see stale state.
 *
 * SOLUTION: vi.resetModules() + dynamic import()
 * -----------------------------------------------
 * `vi.resetModules()` clears Node's module cache for ALL modules. After calling
 * it, any `await import(...)` retrieves a brand-new copy of the module with
 * freshly declared (undefined) variables. This is the standard way to test
 * singleton modules without cross-test contamination.
 *
 * NOTE: Because we use dynamic imports, vi.mock() declarations still apply
 * to the re-imported modules (the mock registry is not cleared by resetModules).
 * We set up mock implementations INSIDE each test, after the dynamic import.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Declare mocks BEFORE any imports. Vitest hoists vi.mock() to the top.
vi.mock('firebase/app');
vi.mock('firebase/auth');
vi.mock('firebase/firestore');

// ─── Fixtures ────────────────────────────────────────────────────────────────
const mockConfig = {
  apiKey: 'test-api-key',
  authDomain: 'test.firebaseapp.com',
  projectId: 'test-project',
  storageBucket: 'test.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123:web:abc',
};

const mockApp = { name: '[DEFAULT]' } as any;
const mockAuth = { currentUser: null } as any;
const mockDb = { type: 'firestore' } as any;

// ─── beforeEach ───────────────────────────────────────────────────────────────
// Every test gets a completely fresh firebaseConfig module with
// no prior initialization.
beforeEach(async () => {
  // vi.clearAllMocks() resets call history on every spy — including auto-mock
  // vi.fn() instances that live in the mock registry (NOT the module cache).
  // vi.resetModules() only clears the module cache, so auto-mocked functions
  // would accumulate call counts across tests without this call.
  vi.clearAllMocks();
  vi.resetModules();

  // After resetting, re-import the mocked Firebase SDK modules to configure
  // the implementations for this specific test. Dynamic import is required
  // because the module cache was just cleared.
  const { initializeApp, getApps } = await import('firebase/app');
  const { getAuth } = await import('firebase/auth');
  const { getFirestore } = await import('firebase/firestore');

  vi.mocked(getApps).mockReturnValue([]);
  vi.mocked(initializeApp).mockReturnValue(mockApp);
  vi.mocked(getAuth).mockReturnValue(mockAuth);
  vi.mocked(getFirestore).mockReturnValue(mockDb);
});

// ═════════════════════════════════════════════════════════════════════════════
describe('getAuthInstance / getDbInstance / getAppInstance', () => {
  it('throws a descriptive error when called before initializeFirebase', async () => {
    const { getAuthInstance, getDbInstance, getAppInstance } = await import('../firebaseConfig');

    expect(() => getAuthInstance()).toThrow('Firebase not initialized');
    expect(() => getDbInstance()).toThrow('Firebase not initialized');
    expect(() => getAppInstance()).toThrow('Firebase not initialized');
  });

  it('returns the correct instances after initialization', async () => {
    const { initializeFirebase, getAuthInstance, getDbInstance, getAppInstance } =
      await import('../firebaseConfig');

    initializeFirebase(mockConfig);

    expect(getAuthInstance()).toBe(mockAuth);
    expect(getDbInstance()).toBe(mockDb);
    expect(getAppInstance()).toBe(mockApp);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('initializeFirebase', () => {
  it('initializes the Firebase app and returns auth, db, and app', async () => {
    const { initializeFirebase } = await import('../firebaseConfig');

    const result = initializeFirebase(mockConfig);

    expect(result.app).toBe(mockApp);
    expect(result.auth).toBe(mockAuth);
    expect(result.db).toBe(mockDb);
  });

  it('calls initializeApp with the provided config', async () => {
    const { initializeFirebase } = await import('../firebaseConfig');
    const { initializeApp } = await import('firebase/app');

    initializeFirebase(mockConfig);

    expect(initializeApp).toHaveBeenCalledWith(mockConfig);
  });

  it('is a singleton — initializeApp is only called once across multiple calls', async () => {
    const { initializeFirebase } = await import('../firebaseConfig');
    const { initializeApp, getApps } = await import('firebase/app');

    // First call: no existing apps
    initializeFirebase(mockConfig);

    // Second call: simulate app already registered
    vi.mocked(getApps).mockReturnValue([mockApp]);
    initializeFirebase(mockConfig);

    expect(initializeApp).toHaveBeenCalledTimes(1);
  });

  it('uses a custom initAuth function when provided via options', async () => {
    const { initializeFirebase } = await import('../firebaseConfig');

    const customAuth = { persistence: 'AsyncStorage' } as any;
    const customInitAuth = vi.fn().mockReturnValue(customAuth);

    const result = initializeFirebase(mockConfig, { initAuth: customInitAuth });

    // Custom initializer was called with the Firebase app
    expect(customInitAuth).toHaveBeenCalledWith(mockApp);
    // The returned auth instance is the one from the custom initializer
    expect(result.auth).toBe(customAuth);
  });

  it('falls back to getAuth when no custom initAuth is provided', async () => {
    const { initializeFirebase } = await import('../firebaseConfig');
    const { getAuth } = await import('firebase/auth');

    initializeFirebase(mockConfig);

    expect(getAuth).toHaveBeenCalledWith(mockApp);
  });
});
