'use client';

import { type FormEvent, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/useAuth';
import { AuthForm } from '../../../components/AuthForm';

export default function ForgotPasswordPage() {
  const { resetPassword, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await resetPassword(email);
    if (!error) setSent(true);
  };

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="mb-3 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Check your email</h1>
          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            If an account exists for <span className="font-medium text-zinc-900 dark:text-zinc-50">{email}</span>, a reset link has been sent.
          </p>
          <Link href="/login" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AuthForm
      title="Reset password"
      onSubmit={handleSubmit}
      error={error}
      loading={loading}
      submitLabel="Send reset link"
      footer={
        <Link href="/login" className="hover:text-zinc-900 dark:hover:text-zinc-50">
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
        className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-600 dark:focus:border-zinc-600"
      />
    </AuthForm>
  );
}
