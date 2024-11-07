import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Log from '@/models/log';

export async function POST(request: Request) {
    await dbConnect();
    try {
        const { user, action } = await request.json();
        if (!user || !action) {
            return NextResponse.json({ error: 'User or action is required' }, { status: 400 });
        }

        const newLog = new Log({ user, action });
        await newLog.save();
        return NextResponse.json({ message: 'Action logged successfully' }, { status: 201 });
    } catch (e) {
        return NextResponse.json({ error: 'Server error:', e }, { status: 500 });
    }
}