/**
 * HomePage.test.tsx
 *
 * Tests for the root page component (app/page.tsx) covering:
 * - Redirects authenticated users to /dashboard
 * - Redirects unauthenticated users to /login
 * - Shows nothing while loading
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

// ─── Mocks ──────────────────────────────────────────────────────────────────
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: vi.fn() }),
}));

let mockUser: { uid: string; email: string } | null = null;
let mockLoading = true;

vi.mock('../lib/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: mockLoading,
  }),
}));

vi.mock('../lib/firebase', () => ({}));

import Home from '../app/page';

// ─── Setup ──────────────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  mockUser = null;
  mockLoading = true;
});

// ─── Tests ──────────────────────────────────────────────────────────────────
describe('Home (root page)', () => {
  it('renders nothing (returns null)', () => {
    const { container } = render(<Home />);
    expect(container.innerHTML).toBe('');
  });

  it('does NOT redirect while loading', () => {
    mockLoading = true;
    render(<Home />);

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('redirects to /dashboard when user is authenticated', () => {
    mockLoading = false;
    mockUser = { uid: 'uid-1', email: 'user@example.com' };
    render(<Home />);

    expect(mockReplace).toHaveBeenCalledWith('/dashboard');
  });

  it('redirects to /login when user is not authenticated', () => {
    mockLoading = false;
    mockUser = null;
    render(<Home />);

    expect(mockReplace).toHaveBeenCalledWith('/login');
  });
});
