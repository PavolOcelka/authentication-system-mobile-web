'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/useAuth';
import { logger } from '../../lib/logger';
import type { ReactNode } from 'react';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, loading, actionInProgress } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !actionInProgress && !user) {
      logger.info('ProtectedLayout: no user, redirecting to /login');
      router.replace('/login');
    }
  }, [user, loading, actionInProgress, router]);

  if (loading || actionInProgress || !user) return null;

  return <>{children}</>;
}
