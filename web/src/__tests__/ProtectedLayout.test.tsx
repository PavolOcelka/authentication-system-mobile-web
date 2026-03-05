/**
 * ProtectedLayout.test.tsx
 *
 * Tests for the (protected) layout component covering:
 * - Redirects unauthenticated users to /login
 * - Renders children when user IS authenticated
 * - Renders nothing while loading
 * - Does not redirect during actionInProgress (e.g. signOut in progress)
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
vi.mock('../lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

import ProtectedLayout from '../app/(protected)/layout';

// ─── Setup ──────────────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  mockUser = null;
  mockLoading = true;
  mockActionInProgress = false;
});

// ─── Tests ──────────────────────────────────────────────────────────────────
describe('ProtectedLayout', () => {
  it('renders nothing while loading', () => {
    mockLoading = true;
    const { container } = render(
      <ProtectedLayout><div>dashboard</div></ProtectedLayout>,
    );

    expect(container.innerHTML).toBe('');
  });

  it('redirects to /login when no user and not loading', () => {
    mockLoading = false;
    mockUser = null;
    mockActionInProgress = false;

    render(<ProtectedLayout><div>dashboard</div></ProtectedLayout>);

    expect(mockReplace).toHaveBeenCalledWith('/login');
  });

  it('renders nothing when no user (redirecting)', () => {
    mockLoading = false;
    mockUser = null;
    mockActionInProgress = false;

    const { container } = render(
      <ProtectedLayout><div>dashboard</div></ProtectedLayout>,
    );

    expect(container.innerHTML).toBe('');
  });

  it('renders children when user IS authenticated', () => {
    mockLoading = false;
    mockUser = { uid: 'uid-1', email: 'user@example.com' };
    mockActionInProgress = false;

    render(<ProtectedLayout><div>dashboard content</div></ProtectedLayout>);

    expect(screen.getByText('dashboard content')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('does NOT redirect during actionInProgress (e.g. signing out)', () => {
    mockLoading = false;
    mockUser = null;
    mockActionInProgress = true;

    render(<ProtectedLayout><div>dashboard</div></ProtectedLayout>);

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('renders nothing during actionInProgress when user is null', () => {
    mockLoading = false;
    mockUser = null;
    mockActionInProgress = true;

    const { container } = render(
      <ProtectedLayout><div>dashboard</div></ProtectedLayout>,
    );

    expect(container.innerHTML).toBe('');
  });
});
