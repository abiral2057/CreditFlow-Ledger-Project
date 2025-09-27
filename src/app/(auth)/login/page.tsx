
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { WalletCards, Chrome } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const formSchema = z.object({
  username: z.string().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${result.username}!`,
        });
        router.push('/');
        router.refresh();
      } else {
        throw new Error(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Login Error',
        description: (error as Error).message,
      });
    }
  }

  async function handleGoogleSignIn() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user) {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            isGoogle: true,
            username: user.displayName || 'Google User',
            email: user.email || '',
          }),
        });

        const res = await response.json();

        if (res.success) {
          toast({
            title: 'Login Successful',
            description: `Welcome, ${user.displayName}!`,
          });
          router.push('/');
          router.refresh();
        } else {
          throw new Error(res.error || 'Google Sign-In failed.');
        }
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Google Sign-In Error',
        description: (error as Error).message,
      });
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-3 text-primary mb-4">
            <WalletCards className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-headline font-bold">CreditFlow</h1>
          </div>
          <CardTitle className="text-2xl">Login to your account</CardTitle>
          <CardDescription>Enter your username and password to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="your_username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>

          <Separator className="my-6" />

          <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
            <Chrome className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
