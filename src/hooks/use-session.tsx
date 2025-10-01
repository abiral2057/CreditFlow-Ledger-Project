
'use client';

import { useState, useEffect } from 'react';

type Session = {
  isLoggedIn?: boolean;
  username?: string;
};

export function useSession() {
  const [session, setSession] = useState<Session>({ isLoggedIn: false });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/session');
        const data = await res.json();
        setSession(data);
      } catch (error) {
        console.error('Failed to fetch session', error);
        setSession({ isLoggedIn: false });
      } finally {
        setIsLoading(false);
      }
    }

    fetchSession();
  }, []);

  return { session, isLoading };
}
