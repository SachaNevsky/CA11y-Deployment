// ./app/api/mux/route.ts

import { NextRequest, NextResponse } from 'next/server';
import Mux from '@mux/mux-node';

const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID || '',
    tokenSecret: process.env.MUX_TOKEN_SECRET || '',
});

export async function POST(request: NextRequest) {
    try {
        const { videoName } = await request.json();

        const asset = await mux.video.assets.create({
            inputs: [{ url: videoName }],
            playback_policies: ['public'],
        });

        return NextResponse.json({ asset });
    } catch (error) {
        console.error('Failed to create Mux asset:', error);
        return NextResponse.json(
            { error: 'Failed to create Mux asset' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const assetId = url.searchParams.get('assetId');
    if (!assetId) {
        return NextResponse.json(
            { error: 'Asset ID is required' },
            { status: 400 }
        );
    }

    try {
        const asset = await mux.video.assets.retrieve(assetId);
        return NextResponse.json({ asset });
    } catch (error) {
        console.error('Failed to retrieve Mux asset:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve Mux asset' },
            { status: 500 }
        );
    }
}
