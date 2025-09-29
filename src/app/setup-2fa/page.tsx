
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  token: z.string().min(6, 'Your one-time password must be 6 characters.'),
});

export default function Setup2FAPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [secret, setSecret] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchQrCode = async () => {
            setIsLoading(true);
            try {
                const res = await fetch('/api/generate-qr');
                const data = await res.json();
                if (data.success) {
                    setQrCodeUrl(data.qrCodeUrl);
                    setSecret(data.secret);
                } else {
                     toast({ variant: 'destructive', title: 'Error', description: 'Could not load QR code.' });
                }
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load QR code.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchQrCode();
    }, [toast]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { token: '' },
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
                toast({ title: 'Success!', description: '2FA has been set up successfully.' });
                window.location.href = '/dashboard';
            } else {
                toast({ variant: "destructive", title: "Verification Failed", description: data.message || "Invalid code. Please try again."});
                form.reset();
            }
        } catch (error) {
            toast({ variant: "destructive", title: "An Error Occurred", description: "Something went wrong."});
        }
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Set Up Two-Factor Authentication</CardTitle>
                    <CardDescription>
                        Scan the QR code with your authenticator app, then enter the generated code below to verify.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6">
                    {isLoading ? (
                        <div className="h-64 w-64 animate-pulse rounded-lg bg-muted" />
                    ) : (
                        qrCodeUrl && <img src={qrCodeUrl} alt="2FA QR Code" className="rounded-lg" />
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
                        <FormField
                            control={form.control}
                            name="token"
                            render={({ field }) => (
                            <FormItem className="flex flex-col items-center">
                                <FormLabel>Verification Code</FormLabel>
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
                        <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
                            {isSubmitting ? 'Verifying...' : 'Verify & Complete Setup'}
                        </Button>
                        </form>
                    </Form>
                     {secret && (
                        <div className="text-center p-4 bg-muted rounded-lg w-full">
                            <p className="text-sm text-muted-foreground">Can't scan? Enter this key manually:</p>
                            <p className="text-lg font-mono tracking-wider font-bold text-primary mt-2 break-all">{secret}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </main>
    );
}
