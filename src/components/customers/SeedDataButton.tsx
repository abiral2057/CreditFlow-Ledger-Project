
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Database } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SeedDataButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSeed = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/seed');
      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success!',
          description: 'Dummy data has been added to the system.',
        });
        router.refresh();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error Seeding Data',
          description: data.message || 'An unknown error occurred.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Client-side Error',
        description: 'Failed to make the request to the seed endpoint.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleSeed} disabled={isLoading}>
      <Database className="mr-2 h-4 w-4" />
      {isLoading ? 'Seeding...' : 'Seed Dummy Data'}
    </Button>
  );
}
