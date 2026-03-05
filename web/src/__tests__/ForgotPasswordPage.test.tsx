/**
 * ForgotPasswordPage.test.tsx
 *
 * Tests for the forgot-password page component covering:
 * - Form rendering
 * - Form submission triggers resetPassword
 * - Success state shows confirmation message
 * - Error display from auth context
 * - Error cleanup on unmount
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ─── Mocks ──────────────────────────────────────────────────────────────────
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

const mockResetPassword = vi.fn();
const mockClearError = vi.fn();
let mockLoading = false;
let mockError: { code: string; message: string } | null = null;

vi.mock('../lib/useAuth', () => ({
  useAuth: () => ({
    resetPassword: mockResetPassword,
    loading: mockLoading,
    error: mockError,
    clearError: mockClearError,
  }),
}));

vi.mock('../lib/firebase', () => ({}));

import ForgotPasswordPage from '../app/(auth)/forgot-password/page';

// ─── Setup ──────────────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  mockLoading = false;
  mockError = null;
  mockResetPassword.mockResolvedValue(true);
});

// ─── Tests ──────────────────────────────────────────────────────────────────
describe('ForgotPasswordPage', () => {
  it('renders the email input and "Send reset link" button', () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send reset link' })).toBeInTheDocument();
  });

  it('renders the "Reset password" heading', () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByRole('heading', { name: 'Reset password' })).toBeInTheDocument();
  });

  it('renders a link back to sign in', () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByText('Back to sign in')).toBeInTheDocument();
  });

  it('calls resetPassword with the entered email on submit', async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordPage />);

    await user.type(screen.getByPlaceholderText('Email'), 'user@example.com');
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));

    expect(mockResetPassword).toHaveBeenCalledWith('user@example.com');
  });

  it('shows the success screen after successful submission', async () => {
    mockResetPassword.mockResolvedValue(true);
    const user = userEvent.setup();
    render(<ForgotPasswordPage />);

    await user.type(screen.getByPlaceholderText('Email'), 'user@example.com');
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Check your email' })).toBeInTheDocument();
    });
    expect(screen.getByText(/reset link has been sent/)).toBeInTheDocument();
    expect(screen.getByText('Back to sign in')).toBeInTheDocument();
  });

  it('does NOT show the success screen when resetPassword fails', async () => {
    mockResetPassword.mockResolvedValue(false);
    const user = userEvent.setup();
    render(<ForgotPasswordPage />);

    await user.type(screen.getByPlaceholderText('Email'), 'user@example.com');
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalled();
    });
    expect(screen.queryByText('Check your email')).not.toBeInTheDocument();
    // The form should still be visible
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
  });

  it('displays an error message when error is present', () => {
    mockError = { code: 'auth/user-not-found', message: 'No account with that email.' };
    render(<ForgotPasswordPage />);

    expect(screen.getByText('No account with that email.')).toBeInTheDocument();
  });

  it('shows "Please wait..." button text when loading', () => {
    mockLoading = true;
    render(<ForgotPasswordPage />);

    expect(screen.getByRole('button', { name: 'Please wait...' })).toBeDisabled();
  });

  it('calls clearError on unmount', () => {
    const { unmount } = render(<ForgotPasswordPage />);
    unmount();

    expect(mockClearError).toHaveBeenCalledTimes(1);
  });
});
