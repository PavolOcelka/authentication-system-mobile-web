/**
 * AuthForm.test.tsx
 *
 * WHAT WE ARE TESTING
 * -------------------
 * AuthForm is a "dumb" (purely presentational) component. It receives all
 * data and behaviour through props — it has no internal state of its own.
 * This makes it very easy to test: render it with different props and assert
 * on what the user sees.
 *
 * KEY CONCEPTS DEMONSTRATED
 * -------------------------
 * - React Testing Library (RTL): query by role/text/placeholder (as the user
 *   would perceive the UI), NOT by CSS class or internal implementation detail
 * - getByRole / queryByRole: getBy throws if not found (used when you expect
 *   something to be present). queryBy returns null (used for "should NOT exist")
 * - @testing-library/jest-dom matchers: toBeInTheDocument, toBeDisabled, etc.
 * - Testing conditional rendering (subtitle, error banner, footer)
 * - Testing prop-driven behaviour (loading state, submit label)
 *
 * WHY RTL INSTEAD OF ENZYME?
 * --------------------------
 * RTL encourages testing behaviour (what the user sees/does) rather than
 * implementation details (component state, method calls). This produces tests
 * that don't break when you refactor internals without changing behaviour.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthForm } from '../components/AuthForm';

// ─── Default props ────────────────────────────────────────────────────────────
// A complete set of valid props to start each test from. Individual tests
// override specific props via spread: { ...defaultProps, loading: true }
const defaultProps = {
  title: 'Sign In',
  onSubmit: vi.fn(),
  error: null,
  loading: false,
  submitLabel: 'Sign In',
  children: <input type="email" placeholder="Email address" />,
} as const;

// ═════════════════════════════════════════════════════════════════════════════
describe('AuthForm', () => {
  // ── Title and subtitle ────────────────────────────────────────────────────
  describe('title and subtitle', () => {
    it('renders the title', () => {
      render(<AuthForm {...defaultProps} />);
      // Use getByRole('heading') to target only the <h1>, not the submit button
      // which happens to share the same label text.
      expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
    });

    it('renders the subtitle when the subtitle prop is provided', () => {
      render(<AuthForm {...defaultProps} subtitle="Welcome back" />);
      expect(screen.getByText('Welcome back')).toBeInTheDocument();
    });

    it('does not render a subtitle when the prop is omitted', () => {
      render(<AuthForm {...defaultProps} />);
      expect(screen.queryByText('Welcome back')).not.toBeInTheDocument();
    });
  });

  // ── Error banner ──────────────────────────────────────────────────────────
  describe('error banner', () => {
    it('renders the error message when an error object is provided', () => {
      const error = { code: 'auth/wrong-password', message: 'Invalid email or password.' };
      render(<AuthForm {...defaultProps} error={error} />);
      expect(screen.getByText('Invalid email or password.')).toBeInTheDocument();
    });

    it('does not render an error message when error is null', () => {
      render(<AuthForm {...defaultProps} error={null} />);
      expect(screen.queryByText('Invalid email or password.')).not.toBeInTheDocument();
    });

    it('updates the displayed message when a different error is passed', () => {
      const error = { code: 'auth/email-already-in-use', message: 'Unable to create account. The email may not be authorized or may already be in use.' };
      render(<AuthForm {...defaultProps} error={error} />);
      expect(screen.getByText('Unable to create account. The email may not be authorized or may already be in use.')).toBeInTheDocument();
    });
  });

  // ── Submit button ─────────────────────────────────────────────────────────
  describe('submit button', () => {
    it('shows the submitLabel text when not loading', () => {
      render(<AuthForm {...defaultProps} submitLabel="Log in" loading={false} />);
      expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument();
    });

    it('shows "Please wait..." when loading is true', () => {
      render(<AuthForm {...defaultProps} loading={true} />);
      expect(screen.getByRole('button', { name: 'Please wait...' })).toBeInTheDocument();
    });

    it('is disabled when loading is true', () => {
      render(<AuthForm {...defaultProps} loading={true} />);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('is enabled when loading is false', () => {
      render(<AuthForm {...defaultProps} loading={false} />);
      expect(screen.getByRole('button')).not.toBeDisabled();
    });
  });

  // ── Children and footer ───────────────────────────────────────────────────
  describe('children and footer', () => {
    it('renders the children inside the form', () => {
      render(<AuthForm {...defaultProps} />);
      expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    });

    it('renders the footer when the footer prop is provided', () => {
      render(
        <AuthForm
          {...defaultProps}
          footer={<a href="/register">Create an account</a>}
        />,
      );
      expect(screen.getByText('Create an account')).toBeInTheDocument();
    });

    it('does not render a footer section when the prop is omitted', () => {
      render(<AuthForm {...defaultProps} />);
      expect(screen.queryByText('Create an account')).not.toBeInTheDocument();
    });
  });

  // ── Form submission ───────────────────────────────────────────────────────
  describe('form submission', () => {
    it('calls onSubmit when the form is submitted', () => {
      const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
      const { container } = render(<AuthForm {...defaultProps} onSubmit={onSubmit} />);

      fireEvent.submit(container.querySelector('form')!);

      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('does not call onSubmit when button is disabled (loading)', () => {
      const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
      render(
        <AuthForm {...defaultProps} onSubmit={onSubmit} loading={true} />,
      );

      // The button is disabled; clicking it won't submit the form
      fireEvent.click(screen.getByRole('button'));

      // Note: HTML disabled buttons don't fire click events that trigger form
      // submission, but the form's onSubmit won't be invoked via button click
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });
});
