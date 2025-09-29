
import { NextRequest, NextResponse } from 'next/server';
import qrcode from 'qrcode';
import speakeasy from 'speakeasy';

export async function GET(request: NextRequest) {
  const { TOTP_SECRET, AUTH_EMAIL } = process.env;

  if (!TOTP_SECRET) {
    return NextResponse.json({ success: false, message: 'TOTP_SECRET is not configured on the server. Please configure this first in your .env file.' }, { status: 500 });
  }

  try {
    const otpauth_url = speakeasy.otpauthURL({
        secret: TOTP_SECRET,
        label: encodeURIComponent(`CreditFlow:${AUTH_EMAIL}`),
        issuer: 'CreditFlow Ledger',
        encoding: 'base32'
    });

    const qrCodeUrl = await qrcode.toDataURL(otpauth_url);

    return NextResponse.json({ success: true, qrCodeUrl, secret: TOTP_SECRET });
  } catch (error) {
    console.error('QR Code generation failed:', error);
    return NextResponse.json({ success: false, message: 'Failed to generate QR code.' }, { status: 500 });
  }
}
