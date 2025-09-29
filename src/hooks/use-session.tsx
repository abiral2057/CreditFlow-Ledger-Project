
'use client';

import { useState, useEffect } from 'react';

type Session = {
  isLoggedIn?: boolean;
  username?: string;
};

export function useSession() {
  const [session, setSession] = useState<Session>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch('/api/session');
        const data = await res.json();
        setSession(data);
      } catch (error) {
        console.error('Failed to fetch session', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSession();
  }, []);

  return { ...session, isLoading };
}
