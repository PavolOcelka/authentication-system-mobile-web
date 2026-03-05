'use client';

import { useAuth } from '../../../lib/useAuth';

export default function DashboardPage() {
  const { user, signOut } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between bg-header px-6 py-4">
        <span className="text-sm font-medium text-accent-foreground">Dashboard</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-accent-foreground/80">{user?.email}</span>
          <button
            onClick={signOut}
            className="text-sm text-accent-foreground/80 hover:text-accent-foreground"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center">
        <p className="text-muted">You are signed in.</p>
      </main>
    </div>
  );
}
