/**
 * whitelist.test.ts
 *
 * WHAT WE ARE TESTING
 * -------------------
 * whitelist.ts exports a single function — isEmailWhitelisted — that checks a
 * Firestore `whitelist` collection. It is a standalone utility used by the web
 * app's auth flow.
 *
 * MOCKING STRATEGY
 * ----------------
 * This module directly imports `db` from `./firebase`. We mock that module so
 * no real Firebase connection is made. We also mock `firebase/firestore` so
 * that `doc` and `getDoc` are controllable spies.
 *
 * KEY CONCEPTS DEMONSTRATED
 * -------------------------
 * - Testing the "error swallowing" pattern: the function catches Firestore
 *   errors, logs them, and returns false. We assert that (a) the return value
 *   is false, (b) logger.error (console.error) WAS called (we don't want silent failures).
 * - Testing email normalisation (trim + lowercase) via the `doc` call args.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { doc, getDoc } from 'firebase/firestore';
import { isEmailWhitelisted } from '../lib/whitelist';

// ─── Module mocks ─────────────────────────────────────────────────────────────
// Mock the firebase/firestore SDK — doc and getDoc become vi.fn() spies
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
}));

// Mock the firebase initialisation module so no env-var reading or SDK
// initialisation happens when whitelist.ts imports it.
vi.mock('../lib/firebase', () => ({
  db: {},
}));

// ─── beforeEach ───────────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(doc).mockReturnValue({} as any);
});

// ═════════════════════════════════════════════════════════════════════════════
describe('isEmailWhitelisted', () => {
  it('returns false when the document does not exist in the whitelist collection', async () => {
    vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as any);

    const result = await isEmailWhitelisted('unknown@example.com');

    expect(result).toBe(false);
  });

  it('returns true when the document exists and approved is true', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({ approved: true }),
    } as any);

    const result = await isEmailWhitelisted('approved@example.com');

    expect(result).toBe(true);
  });

  it('returns false when the document exists but approved is false', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({ approved: false }),
    } as any);

    const result = await isEmailWhitelisted('pending@example.com');

    expect(result).toBe(false);
  });

  it('returns false when the document exists but approved field is missing', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({}),
    } as any);

    const result = await isEmailWhitelisted('user@example.com');

    expect(result).toBe(false);
  });

  it('normalises the email to lowercase and trimmed before the Firestore lookup', async () => {
    vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as any);

    await isEmailWhitelisted('  ADMIN@EXAMPLE.COM  ');

    // The second argument to doc() is the collection name, the third is the
    // document ID — which should be the normalised email.
    expect(doc).toHaveBeenCalledWith(expect.anything(), 'whitelist', 'admin@example.com');
  });

  it('returns false and logs error via logger.error when Firestore throws', async () => {
    vi.mocked(getDoc).mockRejectedValue(new Error('Network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const result = await isEmailWhitelisted('user@example.com');

    expect(result).toBe(false);
    // The error is logged (for debugging) but NOT re-thrown to the caller
    expect(consoleSpy).toHaveBeenCalledOnce();
    consoleSpy.mockRestore();
  });
});
