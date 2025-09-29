
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
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
import { ShieldCheck } from 'lucide-react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

const formSchema = z.object({
  token: z.string().min(6, 'Your one-time password must be 6 characters.'),
});

export default function TwoFactorPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token: '',
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
        const response = await fetch('/api/verify-2fa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
        });

        const data = await response.json();
        
        if (data.success) {
            // Force a full page reload to the dashboard
            window.location.href = '/dashboard';
        } else {
             toast({
                title: "Verification Failed",
                description: data.message || "Invalid code. Please try again.",
                variant: "destructive"
            });
            form.reset();
        }
    } catch(error) {
        toast({
            title: "An Error Occurred",
            description: "Something went wrong. Please try again.",
            variant: "destructive"
        });
    }
  }


  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-3 text-primary mb-4">
            <ShieldCheck className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-headline font-bold">Two-Factor Authentication</h1>
          </div>
          <CardTitle className="text-2xl">Enter Your Code</CardTitle>
          <CardDescription>Enter the 6-digit code from your authenticator app.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormLabel>One-Time Password</FormLabel>
                    <FormControl>
                        <InputOTP maxLength={6} {...field}>
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Verifying...' : 'Verify'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
