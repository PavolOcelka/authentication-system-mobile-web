'use client';

import { type FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/useAuth';
import { AuthForm } from '../../../components/AuthForm';

export default function LoginPage() {
  const { signIn, loading, error } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await signIn(email, password);
    if (!error) router.push('/dashboard');
  };

  return (
    <AuthForm
      title="Sign in"
      onSubmit={handleSubmit}
      error={error}
      loading={loading}
      submitLabel="Sign in"
      footer={
        <>
          <Link href="/forgot-password" className="text-muted hover:text-foreground">
            Forgot password?
          </Link>
          <span className="mx-2">·</span>
          <Link href="/register" className="text-muted hover:text-foreground">
            Create account
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
    </AuthForm>
  );
}
