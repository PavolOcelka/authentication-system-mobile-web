'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/useAuth';
import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { user, loading, actionInProgress } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !actionInProgress && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, actionInProgress, router]);

  if (loading || (!actionInProgress && user)) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-header px-6 py-4">
        <span className="text-lg font-semibold text-accent-foreground">
          <span className="text-accent">Auth</span> System
        </span>
      </header>
      <main className="flex flex-1">{children}</main>
    </div>
  );
}
