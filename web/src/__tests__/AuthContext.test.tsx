/**
 * AuthContext.test.tsx
 *
 * WHAT WE ARE TESTING
 * -------------------
 * AuthContext.tsx contains two things:
 *   1. AuthProvider — a React context provider that manages auth state and
 *      exposes signIn/signUp/signOut/resetPassword methods.
 *   2. AuthContext — the context object used by useAuth.
 * We also test the useAuth hook from useAuth.ts here since they're tightly
 * coupled.
 *
 * KEY CONCEPTS DEMONSTRATED
 * -------------------------
 * - Capturing async callbacks: onAuthStateChange receives a callback; we
 *   capture it in the mock so we can "fire" auth state changes in tests.
 * - act(): wraps code that causes React state updates. Without it, React
 *   would warn about state updates outside of its rendering cycle.
 * - waitFor(): polls an assertion until it passes or times out. Used when
 *   state updates happen asynchronously (after a Promise resolves).
 * - Testing React context: render a consumer component inside the provider,
 *   then assert on what the consumer renders.
 * - Testing error handling: assert the context sets `error` state when an
 *   action throws, and clears it before the next action.
 *
 * MOCKING STRATEGY
 * ----------------
 * - `../lib/firebase` is mocked as an empty object (side-effect-only import)
 * - `@shared/authService` is fully mocked so no Firebase calls happen
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from '../lib/AuthContext';
import { useAuth } from '../lib/useAuth';
import {
  onAuthStateChange,
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  resetPassword as authResetPassword,
} from '@shared/authService';

// ─── Module mocks ─────────────────────────────────────────────────────────────
vi.mock('../lib/firebase', () => ({}));

vi.mock('@shared/authService', () => ({
  onAuthStateChange: vi.fn(),
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  resetPassword: vi.fn(),
}));

// ─── Fake Firebase users ──────────────────────────────────────────────────────
const fakeFirebaseUser = {
  uid: 'uid-abc-123',
  email: 'alice@example.com',
  displayName: 'Alice',
} as any;

// ─── Test consumer ────────────────────────────────────────────────────────────
// A helper component that reads from AuthContext and renders state values as
// text nodes. We can then use getByTestId() to assert on state values without
// coupling the test to any specific UI component.
function TestConsumer() {
  const ctx = useContext(AuthContext);
  if (!ctx) return <div>no context</div>;
  return (
    <div>
      <span data-testid="loading">{String(ctx.loading)}</span>
      <span data-testid="user">{ctx.user?.email ?? 'null'}</span>
      <span data-testid="error">{ctx.error?.message ?? 'null'}</span>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Capture the callback passed to onAuthStateChange so tests can fire auth
// state transitions at will.
let capturedAuthCallback: ((user: any) => void) | null = null;
let mockUnsubscribe: ReturnType<typeof vi.fn>;

function renderProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>,
  );
}

// ─── beforeEach ───────────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  capturedAuthCallback = null;
  mockUnsubscribe = vi.fn();

  vi.mocked(onAuthStateChange).mockImplementation((callback) => {
    capturedAuthCallback = callback;
    return mockUnsubscribe;
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('AuthProvider — initial state', () => {
  it('starts with loading: true and user: null', () => {
    renderProvider();

    expect(screen.getByTestId('loading').textContent).toBe('true');
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('subscribes to auth state changes on mount', () => {
    renderProvider();

    expect(onAuthStateChange).toHaveBeenCalledTimes(1);
  });

  it('unsubscribes when the component unmounts', () => {
    const { unmount } = renderProvider();

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('AuthProvider — auth state transitions', () => {
  it('sets user and clears loading when a Firebase user is received', async () => {
    renderProvider();

    act(() => {
      capturedAuthCallback!(fakeFirebaseUser);
    });

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
      expect(screen.getByTestId('user').textContent).toBe('alice@example.com');
    });
  });

  it('sets user to null and clears loading when null is received (signed out)', async () => {
    renderProvider();

    act(() => {
      capturedAuthCallback!(null);
    });

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
      expect(screen.getByTestId('user').textContent).toBe('null');
    });
  });

  it('maps uid, email, and displayName from the Firebase user to the app User type', async () => {
    // A consumer that shows all mapped fields
    function DetailedConsumer() {
      const ctx = useContext(AuthContext);
      if (!ctx?.user) return <div data-testid="no-user" />;
      return (
        <div>
          <span data-testid="uid">{ctx.user.uid}</span>
          <span data-testid="displayName">{ctx.user.displayName ?? 'null'}</span>
        </div>
      );
    }

    render(
      <AuthProvider>
        <DetailedConsumer />
      </AuthProvider>,
    );

    act(() => {
      capturedAuthCallback!(fakeFirebaseUser);
    });

    await waitFor(() => {
      expect(screen.getByTestId('uid').textContent).toBe('uid-abc-123');
      expect(screen.getByTestId('displayName').textContent).toBe('Alice');
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('AuthProvider — signIn action', () => {
  it('calls authSignIn with email and password', async () => {
    vi.mocked(authSignIn).mockResolvedValue(undefined as any);
    renderProvider();

    // Obtain the signIn function from context
    let contextSignIn: ((email: string, password: string) => Promise<void>) | undefined;
    function CaptureContext() {
      const ctx = useContext(AuthContext);
      contextSignIn = ctx?.signIn;
      return null;
    }
    render(
      <AuthProvider>
        <CaptureContext />
      </AuthProvider>,
    );

    await act(async () => {
      await contextSignIn!('user@example.com', 'secret123');
    });

    expect(authSignIn).toHaveBeenCalledWith('user@example.com', 'secret123');
  });

  it('sets error state when signIn throws', async () => {
    const authError = { code: 'auth/wrong-password', message: 'Wrong password.' };
    vi.mocked(authSignIn).mockRejectedValue(authError);

    let contextSignIn: ((email: string, password: string) => Promise<void>) | undefined;
    function CaptureContext() {
      const ctx = useContext(AuthContext);
      contextSignIn = ctx?.signIn;
      return null;
    }
    render(
      <AuthProvider>
        <TestConsumer />
        <CaptureContext />
      </AuthProvider>,
    );

    await act(async () => {
      await contextSignIn!('bad@example.com', 'wrong');
    });

    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBe('Incorrect password. Please try again.');
    });
  });

  it('clears a previous error before a new signIn attempt', async () => {
    const firstError = { code: 'auth/wrong-password', message: 'Wrong password.' };
    vi.mocked(authSignIn).mockRejectedValueOnce(firstError).mockResolvedValueOnce(undefined as any);

    let contextSignIn: ((email: string, password: string) => Promise<boolean>) | undefined;
    function CaptureContext() {
      const ctx = useContext(AuthContext);
      contextSignIn = ctx?.signIn;
      return null;
    }
    render(
      <AuthProvider>
        <TestConsumer />
        <CaptureContext />
      </AuthProvider>,
    );

    // First call — fails and sets error
    await act(async () => {
      await contextSignIn!('user@example.com', 'wrong');
    });
    await waitFor(() => {
      expect(screen.getAllByTestId('error')[0].textContent).toBe('Incorrect password. Please try again.');
    });

    // Second call — succeeds; error should be cleared
    await act(async () => {
      await contextSignIn!('user@example.com', 'correct');
    });
    await waitFor(() => {
      expect(screen.getAllByTestId('error')[0].textContent).toBe('null');
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('AuthProvider — signUp, signOut, resetPassword actions', () => {
  // Helper: render a provider and expose a named auth action from context
  function useProviderAction(
    actionKey: 'signUp' | 'signOut' | 'resetPassword',
  ) {
    let capturedAction: ((...args: any[]) => Promise<void>) | undefined;
    function CaptureContext() {
      const ctx = useContext(AuthContext);
      capturedAction = ctx?.[actionKey] as any;
      return null;
    }
    render(
      <AuthProvider>
        <CaptureContext />
      </AuthProvider>,
    );
    return () => capturedAction;
  }

  it('calls authSignUp with email and password', async () => {
    vi.mocked(authSignUp).mockResolvedValue(undefined as any);
    const getAction = useProviderAction('signUp');

    await act(async () => {
      await getAction()!('new@example.com', 'pass123');
    });

    expect(authSignUp).toHaveBeenCalledWith('new@example.com', 'pass123');
  });

  it('shows the whitelist message when signUp throws auth/not-whitelisted', async () => {
    const whitelistError = {
      code: 'auth/not-whitelisted',
      message: 'This email is not authorized. Registration is available by invitation only.',
    };
    vi.mocked(authSignUp).mockRejectedValueOnce(whitelistError);

    let contextSignUp: ((email: string, password: string) => Promise<boolean>) | undefined;
    function CaptureContext() {
      const ctx = useContext(AuthContext);
      contextSignUp = ctx?.signUp;
      return null;
    }
    render(
      <AuthProvider>
        <TestConsumer />
        <CaptureContext />
      </AuthProvider>,
    );

    await act(async () => {
      const result = await contextSignUp!('not-allowed@example.com', 'pass123');
      expect(result).toBe(false);
    });

    await waitFor(() => {
      expect(screen.getAllByTestId('error')[0].textContent).toBe(
        'This email is not authorized. Registration is available by invitation only.',
      );
    });
  });

  it('shows the whitelist message when signIn throws auth/not-whitelisted', async () => {
    const whitelistError = {
      code: 'auth/not-whitelisted',
      message: 'Your account does not have access to this application.',
    };
    vi.mocked(authSignIn).mockRejectedValueOnce(whitelistError);

    let contextSignIn: ((email: string, password: string) => Promise<boolean>) | undefined;
    function CaptureContext() {
      const ctx = useContext(AuthContext);
      contextSignIn = ctx?.signIn;
      return null;
    }
    render(
      <AuthProvider>
        <TestConsumer />
        <CaptureContext />
      </AuthProvider>,
    );

    await act(async () => {
      const result = await contextSignIn!('blocked@example.com', 'pass123');
      expect(result).toBe(false);
    });

    await waitFor(() => {
      expect(screen.getAllByTestId('error')[0].textContent).toBe(
        'Your account does not have access to this application.',
      );
    });
  });

  it('calls authSignOut', async () => {
    vi.mocked(authSignOut).mockResolvedValue(undefined);
    const getAction = useProviderAction('signOut');

    await act(async () => {
      await getAction()!();
    });

    expect(authSignOut).toHaveBeenCalledTimes(1);
  });

  it('calls authResetPassword with email', async () => {
    vi.mocked(authResetPassword).mockResolvedValue(undefined);
    const getAction = useProviderAction('resetPassword');

    await act(async () => {
      await getAction()!('user@example.com');
    });

    expect(authResetPassword).toHaveBeenCalledWith('user@example.com');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
describe('useAuth hook', () => {
  it('returns the AuthContext value when used inside AuthProvider', () => {
    function ConsumerComponent() {
      const auth = useAuth();
      return <span data-testid="has-context">{String(auth !== null)}</span>;
    }

    render(
      <AuthProvider>
        <ConsumerComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId('has-context').textContent).toBe('true');
  });

  it('throws an error when used outside AuthProvider', () => {
    // Suppress the error boundary console output during this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    function BareConsumer() {
      useAuth();
      return null;
    }

    expect(() => render(<BareConsumer />)).toThrow(
      'useAuth must be used inside <AuthProvider>',
    );

    consoleSpy.mockRestore();
  });
});
