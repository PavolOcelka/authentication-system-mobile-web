'use client';

import { type FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/useAuth';
import { AuthForm } from '../../../components/AuthForm';

export default function RegisterPage() {
  const { signUp, loading, error } = useAuth();
  const router = useRouter();
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

    await signUp(email, password);
    if (!error) router.push('/dashboard');
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
          <Link href="/login" className="font-medium text-zinc-900 hover:underline dark:text-zinc-50">
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
        className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-600 dark:focus:border-zinc-600"
      />
      <input
        type="password"
        placeholder="Password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-600 dark:focus:border-zinc-600"
      />
      <input
        type="password"
        placeholder="Confirm password"
        required
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-600 dark:focus:border-zinc-600"
      />
    </AuthForm>
  );
}
