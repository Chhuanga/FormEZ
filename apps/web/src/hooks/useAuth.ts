'use client';

import { useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();
  
  return {
    user: session?.user ? {
      ...session.user,
      // Map NextAuth user to the expected interface
      uid: session.user.id,
      getIdToken: async () => {
        // For NextAuth, we don't use ID tokens like Firebase
        // Return the user's email as a simple identifier
        return session.user.email || '';
      }
    } : null,
    loading: status === 'loading',
    getToken: async () => {
      // NextAuth handles tokens automatically
      // For API calls, the session will be validated server-side
      return session?.user?.email ?? null;
    },
  };
}
