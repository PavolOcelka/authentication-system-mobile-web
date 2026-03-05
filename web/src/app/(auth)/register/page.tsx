'use client';

import { type FormEvent, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/useAuth';
import { AuthForm } from '../../../components/AuthForm';

export default function RegisterPage() {
  const { signUp, loading, error, clearError } = useAuth();
  const router = useRouter();

  useEffect(() => { return () => clearError(); }, []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);

    if (password !== confirm) {
      setLocalError('Passwords do not match.');
      return;
    }

    const success = await signUp(email, password);
    if (success) router.push('/dashboard');
  };

  const displayError = localError
    ? { code: 'local/validation', message: localError }
    : error;

  return (
    <AuthForm
      title="Create account"
      subtitle="Available by invitation only. You must be pre-authorized to register."
      onSubmit={handleSubmit}
      error={displayError}
      loading={loading}
      submitLabel="Create account"
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Sign in
          </Link>
        </>
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
      <input
        type="password"
        placeholder="Password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="h-10 rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder-muted outline-none focus:border-accent"
      />
      <input
        type="password"
        placeholder="Confirm password"
        required
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className="h-10 rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder-muted outline-none focus:border-accent"
      />
    </AuthForm>
  );
}
