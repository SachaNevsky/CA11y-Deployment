// ./app/api/emas/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import EMA from '@/models/ema';

export async function POST(request: Request) {
    await dbConnect();
    try {
        const { user, questionId, question, response } = await request.json();

        if (!user || !questionId || !question || response === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const now = new Date();
        let userEMA = await EMA.findOne({ user });

        if (userEMA) {
            userEMA.responses.push({
                questionId,
                question,
                response,
                timestamp: now
            });
        } else {
            userEMA = new EMA({
                user,
                responses: [{
                    questionId,
                    question,
                    response,
                    timestamp: now
                }],
                createdAt: now
            });
        }

        await userEMA.save();
        return NextResponse.json({ message: 'EMA response saved successfully' }, { status: 201 });
    } catch (e) {
        console.error('Error saving EMA response:', e);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        await dbConnect();

        // Fetch all EMAs, sorted by creation date (newest first)
        const emas = await EMA.find({}).sort({ createdAt: -1 }).lean();

        return NextResponse.json(emas, { status: 200 });
    } catch (error) {
        console.error('Error fetching EMAs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch EMAs' },
            { status: 500 }
        );
    }
}