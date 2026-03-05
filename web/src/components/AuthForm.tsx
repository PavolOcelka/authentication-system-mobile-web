'use client';

import type { FormEvent, ReactNode } from 'react';
import type { AuthError } from '@shared/types';

interface AuthFormProps {
  title: string;
  subtitle?: string;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  error: AuthError | null;
  loading: boolean;
  submitLabel: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthForm({ title, subtitle, onSubmit, error, loading, submitLabel, children, footer }: AuthFormProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>
        {subtitle && (
          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        )}
        {!subtitle && <div className="mb-5" />}

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {error.message}
          </div>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {children}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loading ? 'Please wait...' : submitLabel}
          </button>
        </form>

        {footer && (
          <div className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
