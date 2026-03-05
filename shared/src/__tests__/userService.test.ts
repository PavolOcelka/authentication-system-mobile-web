/**
 * userService.test.ts
 *
 * WHAT WE ARE TESTING
 * -------------------
 * userService.ts owns all Firestore operations on the `users` collection:
 * createUserProfile, getUserProfile, and updateUserProfile.
 *
 * KEY CONCEPTS DEMONSTRATED
 * -------------------------
 * - Mocking Firestore `DocumentSnapshot` (exists, data, timestamps)
 * - Testing data transformation (email normalisation, timestamp → Date)
 * - Testing the "does not exist" path (null return)
 * - Asserting on exact arguments passed to Firestore write functions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getDbInstance } from '../firebaseConfig';
import { createUserProfile, getUserProfile, updateUserProfile } from '../userService';

// ─── Module mocks ─────────────────────────────────────────────────────────────
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  serverTimestamp: vi.fn(),
}));

vi.mock('../firebaseConfig', () => ({
  getDbInstance: vi.fn(),
}));

// ─── Fixtures ────────────────────────────────────────────────────────────────
const mockDb = {} as ReturnType<typeof getDbInstance>;
const mockDocRef = {} as any;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getDbInstance).mockReturnValue(mockDb);
  vi.mocked(doc).mockReturnValue(mockDocRef);
  // serverTimestamp() returns a sentinel value that Firestore resolves on the
  // server. We mock it with a string token so we can assert it was passed.
  vi.mocked(serverTimestamp).mockReturnValue('SERVER_TIMESTAMP' as any);
});

// ═════════════════════════════════════════════════════════════════════════════
describe('createUserProfile', () => {
  it('writes a document to users/{uid} with normalised email and server timestamp', async () => {
    vi.mocked(setDoc).mockResolvedValue(undefined);

    await createUserProfile('uid-001', '  Hello@Example.COM  ');

    expect(doc).toHaveBeenCalledWith(mockDb, 'users', 'uid-001');
    expect(setDoc).toHaveBeenCalledWith(mockDocRef, {
      uid: 'uid-001',
      email: 'hello@example.com',  // trimmed + lowercased
      displayName: null,
      createdAt: 'SERVER_TIMESTAMP',
    });
  });

  it('includes displayName in the document when provided', async () => {
    vi.mocked(setDoc).mockResolvedValue(undefined);

    await createUserProfile('uid-002', 'user@example.com', 'Jane Doe');

    expect(setDoc).toHaveBeenCalledWith(
      mockDocRef,
      expect.objectContaining({ displayName: 'Jane Doe' }),
    );
  });

  it('sets displayName to null when not provided', async () => {
    vi.mocked(setDoc).mockResolvedValue(undefined);

    await createUserProfile('uid-003', 'user@example.com');

    expect(setDoc).toHaveBeenCalledWith(
      mockDocRef,
      expect.objectContaining({ displayName: null }),
    );
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('getUserProfile', () => {
  it('returns null when the user document does not exist in Firestore', async () => {
    vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as any);

    const result = await getUserProfile('nonexistent-uid');

    expect(result).toBeNull();
  });

  it('returns a mapped User object when the document exists', async () => {
    const mockDate = new Date('2024-06-01T00:00:00.000Z');
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({
        uid: 'uid-001',
        email: 'user@example.com',
        displayName: 'Alice',
        // Firestore timestamps have a .toDate() method — we mock that here
        createdAt: { toDate: () => mockDate },
      }),
    } as any);

    const result = await getUserProfile('uid-001');

    expect(result).toEqual({
      uid: 'uid-001',
      email: 'user@example.com',
      displayName: 'Alice',
      createdAt: mockDate,
    });
  });

  it('returns undefined for createdAt when the timestamp field is null', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({
        uid: 'uid-002',
        email: 'user@example.com',
        displayName: null,
        createdAt: null,
      }),
    } as any);

    const result = await getUserProfile('uid-002');

    // null?.toDate() is undefined, matching the optional field on the User type
    expect(result?.createdAt).toBeUndefined();
  });

  it('returns null displayName when the field is absent from Firestore', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({
        uid: 'uid-003',
        email: 'user@example.com',
        displayName: undefined,
        createdAt: null,
      }),
    } as any);

    const result = await getUserProfile('uid-003');

    expect(result?.displayName).toBeNull();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('updateUserProfile', () => {
  it('calls updateDoc on the correct document reference with the provided fields', async () => {
    vi.mocked(updateDoc).mockResolvedValue(undefined);

    await updateUserProfile('uid-001', { displayName: 'Bob' });

    expect(doc).toHaveBeenCalledWith(mockDb, 'users', 'uid-001');
    expect(updateDoc).toHaveBeenCalledWith(mockDocRef, { displayName: 'Bob' });
  });

  it('passes an empty object when no fields are provided', async () => {
    vi.mocked(updateDoc).mockResolvedValue(undefined);

    await updateUserProfile('uid-001', {});

    expect(updateDoc).toHaveBeenCalledWith(mockDocRef, {});
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('Firestore error propagation', () => {
  const firestoreError = new Error('Firestore unavailable');

  it('createUserProfile propagates Firestore setDoc errors', async () => {
    vi.mocked(setDoc).mockRejectedValue(firestoreError);

    await expect(createUserProfile('uid-err', 'a@b.com')).rejects.toThrow('Firestore unavailable');
  });

  it('getUserProfile propagates Firestore getDoc errors', async () => {
    vi.mocked(getDoc).mockRejectedValue(firestoreError);

    await expect(getUserProfile('uid-err')).rejects.toThrow('Firestore unavailable');
  });

  it('updateUserProfile propagates Firestore updateDoc errors', async () => {
    vi.mocked(updateDoc).mockRejectedValue(firestoreError);

    await expect(updateUserProfile('uid-err', { displayName: 'X' })).rejects.toThrow('Firestore unavailable');
  });
});
