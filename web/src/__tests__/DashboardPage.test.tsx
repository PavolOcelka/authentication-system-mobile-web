/**
 * DashboardPage.test.tsx
 *
 * Tests for the dashboard page component covering:
 * - Displays user email
 * - Shows sign-out button
 * - Calls signOut on button click
 * - Renders the "You are signed in" message
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ─── Mocks ──────────────────────────────────────────────────────────────────
const mockSignOut = vi.fn();

vi.mock('../lib/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'uid-1', email: 'alice@example.com', displayName: 'Alice' },
    signOut: mockSignOut,
  }),
}));

vi.mock('../lib/firebase', () => ({}));

import DashboardPage from '../app/(protected)/dashboard/page';

// ─── Setup ──────────────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Tests ──────────────────────────────────────────────────────────────────
describe('DashboardPage', () => {
  it('renders the user email', () => {
    render(<DashboardPage />);

    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });

  it('renders the "Dashboard" label', () => {
    render(<DashboardPage />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders the "You are signed in." message', () => {
    render(<DashboardPage />);

    expect(screen.getByText('You are signed in.')).toBeInTheDocument();
  });

  it('renders a "Sign out" button', () => {
    render(<DashboardPage />);

    expect(screen.getByText('Sign out')).toBeInTheDocument();
  });

  it('calls signOut when the "Sign out" button is clicked', async () => {
    const user = userEvent.setup();
    render(<DashboardPage />);

    await user.click(screen.getByText('Sign out'));

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
});
