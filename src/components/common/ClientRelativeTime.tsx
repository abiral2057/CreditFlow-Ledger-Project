
'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

type ClientRelativeTimeProps = {
  date: string | Date;
};

export function ClientRelativeTime({ date }: ClientRelativeTimeProps) {
  const [relativeTime, setRelativeTime] = useState('');

  useEffect(() => {
    // This effect runs only on the client, after hydration
    setRelativeTime(formatDistanceToNow(new Date(date), { addSuffix: true }));
  }, [date]);

  if (!relativeTime) {
    // Render a placeholder or nothing on the server and initial client render
    return <p className="text-xs text-muted-foreground h-4 w-24 animate-pulse rounded-md bg-muted"></p>;
  }

  return (
    <p className="text-xs text-muted-foreground">
      {relativeTime}
    </p>
  );
}
