// src/contexts/AuthContext.tsx
'use client';

import React, { ReactNode } from 'react';
import { SessionProvider, useSession, signIn, signOut } from 'next-auth/react';

// This is the inner context provider that will be wrapped by SessionProvider
function AuthProviderContent({ children }: { children: ReactNode }) {
  // You can add more app-specific auth logic here if needed in the future
  return <>{children}</>;
}

// The main export is the wrapper that includes NextAuth's SessionProvider
export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProviderContent>{children}</AuthProviderContent>
    </SessionProvider>
  );
}

// Custom hook to easily access auth state and functions
export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user ?? null, // Provide a consistent user object or null
    loading: status === 'loading',
    login: () => signIn('google', { callbackUrl: '/dashboard' }), // Simplified login
    logout: () => signOut({ callbackUrl: '/' }),
  };
}
