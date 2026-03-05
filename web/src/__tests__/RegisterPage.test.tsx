/**
 * RegisterPage.test.tsx
 *
 * Tests for the registration page component covering:
 * - Form rendering (inputs, links, subtitle)
 * - Password match validation (client-side)
 * - Form submission with credentials
 * - Navigation to dashboard on success
 * - Error display (local validation + auth context errors)
 * - Error cleanup on unmount
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ─── Mocks ──────────────────────────────────────────────────────────────────
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
}));

const mockSignUp = vi.fn();
const mockClearError = vi.fn();
let mockLoading = false;
let mockError: { code: string; message: string } | null = null;

vi.mock('../lib/useAuth', () => ({
  useAuth: () => ({
    signUp: mockSignUp,
    loading: mockLoading,
    error: mockError,
    clearError: mockClearError,
  }),
}));

vi.mock('../lib/firebase', () => ({}));

import RegisterPage from '../app/(auth)/register/page';

// ─── Setup ──────────────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  mockLoading = false;
  mockError = null;
  mockSignUp.mockResolvedValue(true);
});

// ─── Tests ──────────────────────────────────────────────────────────────────
describe('RegisterPage', () => {
  it('renders email, password, and confirm password inputs', () => {
    render(<RegisterPage />);

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm password')).toBeInTheDocument();
  });

  it('renders the "Create account" heading, subtitle, and submit button', () => {
    render(<RegisterPage />);

    expect(screen.getByRole('heading', { name: 'Create account' })).toBeInTheDocument();
    expect(screen.getByText(/invitation only/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
  });

  it('renders a link to the login page', () => {
    render(<RegisterPage />);

    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });

  it('shows a local error when passwords do not match', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'password123');
    await user.type(screen.getByPlaceholderText('Confirm password'), 'different');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('does NOT call signUp when passwords do not match', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'abc');
    await user.type(screen.getByPlaceholderText('Confirm password'), 'xyz');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('calls signUp with email and password when passwords match', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText('Email'), 'new@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'pass123');
    await user.type(screen.getByPlaceholderText('Confirm password'), 'pass123');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(mockSignUp).toHaveBeenCalledWith('new@example.com', 'pass123');
  });

  it('navigates to /dashboard on successful sign up', async () => {
    mockSignUp.mockResolvedValue(true);
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText('Email'), 'new@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'pass123');
    await user.type(screen.getByPlaceholderText('Confirm password'), 'pass123');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('does NOT navigate on failed sign up', async () => {
    mockSignUp.mockResolvedValue(false);
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByPlaceholderText('Email'), 'new@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'pass123');
    await user.type(screen.getByPlaceholderText('Confirm password'), 'pass123');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalled();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('displays auth context error when present (not local error)', () => {
    mockError = { code: 'auth/not-whitelisted', message: 'Not authorized.' };
    render(<RegisterPage />);

    expect(screen.getByText('Not authorized.')).toBeInTheDocument();
  });

  it('clears local error on new submission attempt', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    // First: trigger local error
    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'abc');
    await user.type(screen.getByPlaceholderText('Confirm password'), 'xyz');
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();

    // Clear inputs and retry with matching passwords
    await user.clear(screen.getByPlaceholderText('Password'));
    await user.clear(screen.getByPlaceholderText('Confirm password'));
    await user.type(screen.getByPlaceholderText('Password'), 'same123');
    await user.type(screen.getByPlaceholderText('Confirm password'), 'same123');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(screen.queryByText('Passwords do not match.')).not.toBeInTheDocument();
    });
  });

  it('shows "Please wait..." button text when loading', () => {
    mockLoading = true;
    render(<RegisterPage />);

    expect(screen.getByRole('button', { name: 'Please wait...' })).toBeDisabled();
  });

  it('calls clearError on unmount', () => {
    const { unmount } = render(<RegisterPage />);
    unmount();

    expect(mockClearError).toHaveBeenCalledTimes(1);
  });
});
