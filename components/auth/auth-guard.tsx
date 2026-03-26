'use client';

/**
 * AuthGuard — wraps the app, shows PIN login when unauthenticated.
 */

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth';
import { PinLogin } from '@/components/auth/pin-login';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const initialized = useAuthStore((s) => s.initialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const pinEnabled = useAuthStore((s) => s.pinEnabled);
  const checkSession = useAuthStore((s) => s.checkSession);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Loading state
  if (!initialized) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <div className="size-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // No PIN users configured — skip auth entirely
  if (!pinEnabled) {
    return children;
  }

  // Not authenticated — show PIN login
  if (!isAuthenticated) {
    return <PinLogin />;
  }

  // Authenticated
  return children;
}
