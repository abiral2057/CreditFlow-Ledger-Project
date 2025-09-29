'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SetupQrPage() {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [secret, setSecret] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchQrCode = async () => {
            try {
                const res = await fetch('/api/generate-qr');
                const data = await res.json();
                if (data.success) {
                    setQrCodeUrl(data.qrCodeUrl);
                    setSecret(data.secret);
                }
            } catch (error) {
                console.error('Failed to fetch QR code', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchQrCode();
    }, []);

    return (
        <main className="flex-1 container mx-auto p-4 md:p-8">
             <div className="mb-6">
                <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                    </Link>
                </Button>
            </div>

            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Setup Two-Factor Authentication</CardTitle>
                    <CardDescription>
                        Scan this QR code with your authenticator app (like Google Authenticator) to start generating codes.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    {isLoading && <div className="h-64 w-64 bg-muted animate-pulse rounded-lg" />}
                    {qrCodeUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={qrCodeUrl} alt="2FA QR Code" className="rounded-lg" />
                    )}
                    {secret && (
                        <div className="text-center p-4 bg-muted rounded-lg w-full">
                            <p className="text-sm text-muted-foreground">Can't scan? Enter this secret key manually:</p>
                            <p className="text-lg font-mono tracking-wider font-bold text-primary mt-2 break-all">{secret}</p>
                        </div>
                    )}
                    <p className="text-xs text-muted-foreground text-center mt-4">
                        Note: For this demo, the QR code is generated using the same secret from your environment variables. In a real app, each user would get a unique secret stored securely.
                    </p>
                </CardContent>
            </Card>
        </main>
    );
}
