'use client';

import { useAuth } from '../../../lib/useAuth';

export default function DashboardPage() {
  const { user, signOut } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Dashboard</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{user?.email}</span>
          <button
            onClick={signOut}
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center">
        <p className="text-zinc-400 dark:text-zinc-600">You are signed in.</p>
      </main>
    </div>
  );
}
