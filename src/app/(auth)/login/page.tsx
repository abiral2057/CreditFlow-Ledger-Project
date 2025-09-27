
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
import { WalletCards, Chrome } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  username: z.string().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
});

export default function LoginPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // This is now a no-op since login is bypassed.
    console.log('Login attempt blocked as login is bypassed.');
  }

  async function handleGoogleSignIn() {
    // This is now a no-op since login is bypassed.
    console.log('Google Sign-In attempt blocked as login is bypassed.');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-3 text-primary mb-4">
            <WalletCards className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-headline font-bold">CreditFlow</h1>
          </div>
          <CardTitle className="text-2xl">Login Disabled</CardTitle>
          <CardDescription>Authentication is currently bypassed. Refresh to access the app.</CardDescription>
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
                      <Input placeholder="your_username" {...field} disabled />
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
                      <Input type="password" placeholder="••••••••" {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={true}>
                Login
              </Button>
            </form>
          </Form>

          <Separator className="my-6" />

          <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={true}>
            <Chrome className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
