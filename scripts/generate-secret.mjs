import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import fs from 'fs';
import path from 'path';

// This script generates a new TOTP secret and QR code.
// Run it with `node scripts/generate-secret.mjs`
// Then, copy the "Base32 Secret" into your .env.local file for the TOTP_SECRET variable.

async function generateSecret() {
    const secret = speakeasy.generateSecret({
        name: 'CreditFlow Ledger',
        length: 20,
    });

    console.log('TOTP Secret Object:', secret);
    console.log('\n--------------------------------------------------');
    console.log('✅ Base32 Secret:', secret.base32);
    console.log('--------------------------------------------------\n');
    console.log('Instructions:');
    console.log('1. Copy the "Base32 Secret" above and paste it as the value for TOTP_SECRET in your .env.local file.');
    console.log('2. Scan the QR code below with your Google Authenticator or other authenticator app.');
    console.log('3. A QR code image has also been saved to `qr-code.png`.\n');


    try {
        const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);
        
        // Log QR code to console (if terminal supports it)
        qrcode.toString(secret.otpauth_url, { type: 'terminal' }, (err, url) => {
            if (err) throw err;
            console.log(url);
        });

        // Save QR code as a file
        const imageBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
        fs.writeFileSync('qr-code.png', imageBuffer);
        
    } catch (err) {
        console.error('Failed to generate QR code', err);
    }
}

generateSecret();
