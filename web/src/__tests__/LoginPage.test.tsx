/**
 * LoginPage.test.tsx
 *
 * Tests for the login page component covering:
 * - Form rendering (inputs, links, labels)
 * - Form submission with credentials
 * - Navigation to dashboard on success
 * - Error display from auth context
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

const mockSignIn = vi.fn();
const mockClearError = vi.fn();
let mockLoading = false;
let mockError: { code: string; message: string } | null = null;

vi.mock('../lib/useAuth', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    loading: mockLoading,
    error: mockError,
    clearError: mockClearError,
  }),
}));

vi.mock('../lib/firebase', () => ({}));

import LoginPage from '../app/(auth)/login/page';

// ─── Setup ──────────────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  mockLoading = false;
  mockError = null;
  mockSignIn.mockResolvedValue(true);
});

// ─── Tests ──────────────────────────────────────────────────────────────────
describe('LoginPage', () => {
  it('renders email and password inputs', () => {
    render(<LoginPage />);

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('renders the "Sign in" heading and submit button', () => {
    render(<LoginPage />);

    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('renders navigation links to forgot-password and register', () => {
    render(<LoginPage />);

    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
    expect(screen.getByText('Create account')).toBeInTheDocument();
  });

  it('calls signIn with email and password on form submission', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('navigates to /dashboard on successful sign in', async () => {
    mockSignIn.mockResolvedValue(true);
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('does NOT navigate on failed sign in', async () => {
    mockSignIn.mockResolvedValue(false);
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('displays an error message when error is present', () => {
    mockError = { code: 'auth/wrong-password', message: 'Invalid email or password.' };
    render(<LoginPage />);

    expect(screen.getByText('Invalid email or password.')).toBeInTheDocument();
  });

  it('shows "Please wait..." button text when loading', () => {
    mockLoading = true;
    render(<LoginPage />);

    expect(screen.getByRole('button', { name: 'Please wait...' })).toBeDisabled();
  });

  it('calls clearError on unmount', () => {
    const { unmount } = render(<LoginPage />);
    unmount();

    expect(mockClearError).toHaveBeenCalledTimes(1);
  });
});
