// ./app/api/mux/webhook/route.ts

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    const rawBody = await request.text();
    const signature = request.headers.get('mux-signature');

    if (!signature) {
        return NextResponse.json({ error: 'No signature provided' }, { status: 401 });
    }

    // Verify webhook signature (if enabled in Mux dashboard)
    const isValid = verifySignature(
        rawBody,
        signature,
        process.env.MUX_WEBHOOK_SECRET || ''
    );

    if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    // Handle different webhook events
    switch (event.type) {
        case 'video.asset.ready':
            // Update your database with the ready asset
            console.log('Asset ready:', event.data.id);
            break;
        case 'video.asset.errored':
            console.error('Asset error:', event.data.id);
            break;
        default:
            console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
}

function verifySignature(payload: string, signature: string, secret: string) {
    const hash = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

    return hash === signature;
}