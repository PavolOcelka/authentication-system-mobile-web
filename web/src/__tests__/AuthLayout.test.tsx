/**
 * AuthLayout.test.tsx
 *
 * Tests for the (auth) layout component covering:
 * - Redirects authenticated users to /dashboard
 * - Renders children when user is NOT authenticated
 * - Renders nothing while loading
 * - Does not redirect during actionInProgress (e.g. signUp in progress)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// ─── Mocks ──────────────────────────────────────────────────────────────────
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: vi.fn() }),
}));

let mockUser: { uid: string; email: string } | null = null;
let mockLoading = true;
let mockActionInProgress = false;

vi.mock('../lib/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: mockLoading,
    actionInProgress: mockActionInProgress,
  }),
}));

vi.mock('../lib/firebase', () => ({}));

import AuthLayout from '../app/(auth)/layout';

// ─── Setup ──────────────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  mockUser = null;
  mockLoading = true;
  mockActionInProgress = false;
});

// ─── Tests ──────────────────────────────────────────────────────────────────
describe('AuthLayout', () => {
  it('renders nothing while loading', () => {
    mockLoading = true;
    const { container } = render(
      <AuthLayout><div>child</div></AuthLayout>,
    );

    expect(container.innerHTML).toBe('');
  });

  it('redirects to /dashboard when user is authenticated and not in progress', () => {
    mockLoading = false;
    mockUser = { uid: 'uid-1', email: 'user@example.com' };
    mockActionInProgress = false;

    render(<AuthLayout><div>child</div></AuthLayout>);

    expect(mockReplace).toHaveBeenCalledWith('/dashboard');
  });

  it('renders nothing when user is authenticated (redirecting)', () => {
    mockLoading = false;
    mockUser = { uid: 'uid-1', email: 'user@example.com' };
    mockActionInProgress = false;

    const { container } = render(
      <AuthLayout><div>child</div></AuthLayout>,
    );

    expect(container.innerHTML).toBe('');
  });

  it('renders children and header when user is NOT authenticated', () => {
    mockLoading = false;
    mockUser = null;
    mockActionInProgress = false;

    render(<AuthLayout><div>login form</div></AuthLayout>);

    expect(screen.getByText('login form')).toBeInTheDocument();
    expect(screen.getByText('Auth')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('does NOT redirect during actionInProgress even if user becomes set', () => {
    mockLoading = false;
    mockUser = { uid: 'uid-1', email: 'user@example.com' };
    mockActionInProgress = true;

    render(<AuthLayout><div>signing up...</div></AuthLayout>);

    expect(mockReplace).not.toHaveBeenCalled();
    expect(screen.getByText('signing up...')).toBeInTheDocument();
  });
});
