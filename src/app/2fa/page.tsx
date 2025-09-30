
'use client';

import { useState, useEffect } from 'react';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  token: z.string().min(6, 'Your one-time password must be 6 characters.'),
});

export default function TwoFactorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [isQrLoading, setIsQrLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token: '',
    },
  });

  const { isSubmitting } = form.formState;

  const fetchQrCode = async () => {
      if (qrCodeUrl) return; // Don't fetch if we already have it
      setIsQrLoading(true);
      try {
          const res = await fetch('/api/generate-qr');
          const data = await res.json();
          if (data.success) {
              setQrCodeUrl(data.qrCodeUrl);
              setSecret(data.secret);
          } else {
                toast({ variant: 'destructive', title: 'Error', description: data.message || 'Could not load QR code.' });
          }
      } catch (error) {
          toast({ variant: 'destructive', title: 'Error', description: 'Could not load QR code.' });
      } finally {
          setIsQrLoading(false);
      }
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
        const response = await fetch('/api/verify-2fa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
        });

        const data = await response.json();
        
        if (data.success) {
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
            <ShieldCheck className="h-8 w-8 text-foreground" />
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

           <Accordion type="single" collapsible className="w-full mt-6">
            <AccordionItem value="item-1">
              <AccordionTrigger onClick={fetchQrCode}>
                Need to set up a new device?
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col items-center gap-4 pt-4">
                  <p className="text-sm text-muted-foreground text-center">Scan this QR code with your authenticator app.</p>
                  {isQrLoading ? (
                      <Skeleton className="h-48 w-48 rounded-lg" />
                  ) : (
                      qrCodeUrl && <Image src={qrCodeUrl} alt="2FA QR Code" width={192} height={192} className="rounded-lg" />
                  )}
                  {secret && (
                      <div className="text-center p-3 bg-muted rounded-lg w-full text-xs">
                          <p className="text-muted-foreground">Or enter this key manually:</p>
                          <p className="font-mono tracking-wider font-bold text-primary mt-1 break-all">{secret}</p>
                      </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

        </CardContent>
      </Card>
    </main>
  );
}
