'use client';

import { type FormEvent, useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/useAuth';
import { AuthForm } from '../../../components/AuthForm';

export default function ForgotPasswordPage() {
  const { resetPassword, loading, error, clearError } = useAuth();

  useEffect(() => { return () => clearError(); }, []);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = await resetPassword(email);
    if (success) setSent(true);
  };

  if (sent) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="mb-3 text-2xl font-semibold text-foreground">Check your email</h1>
          <p className="mb-6 text-sm text-muted">
            If an account exists with that email, a reset link has been sent.
          </p>
          <Link href="/login" className="text-sm text-muted hover:text-foreground">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AuthForm
      title="Reset password"
      subtitle="Enter your email and we'll send you a reset link."
      onSubmit={handleSubmit}
      error={error}
      loading={loading}
      submitLabel="Send reset link"
      footer={
        <Link href="/login" className="text-muted hover:text-foreground">
          Back to sign in
        </Link>
      }
    >
      <input
        type="email"
        placeholder="Email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-10 rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder-muted outline-none focus:border-accent"
      />
    </AuthForm>
  );
}
