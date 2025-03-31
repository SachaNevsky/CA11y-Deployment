import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Log from '@/models/log';

// Time buffer in milliseconds (100ms)
const TIME_BUFFER = 100;
// Size threshold in bytes (15MB)
const SIZE_THRESHOLD = 15 * 1024 * 1024;

export async function POST(request: Request) {
    await dbConnect();
    try {
        const { user, action } = await request.json();
        if (!user || !action) {
            return NextResponse.json({ error: 'User or action is required' }, { status: 400 });
        }

        let userLog = await Log.findOne({ user }).sort({ createdAt: -1 });
        const now = new Date();

        if (userLog) {
            const recentSameAction = userLog.actions.find((entry: { action: string; timestamp: Date }) =>
                entry.action === action &&
                (now.getTime() - new Date(entry.timestamp).getTime()) < TIME_BUFFER
            );

            if (!recentSameAction) {
                const documentSize = JSON.stringify(userLog).length;

                if (documentSize >= SIZE_THRESHOLD) {
                    userLog = new Log({
                        user,
                        actions: [{ action, timestamp: now }],
                        createdAt: now,
                        documentIndex: (userLog.documentIndex || 0) + 1
                    });
                } else {
                    userLog.actions.push({ action, timestamp: now });
                }

                await userLog.save();
            } else {
                return NextResponse.json({ message: 'Action skipped (duplicate)' }, { status: 200 });
            }
        } else {
            userLog = new Log({
                user,
                actions: [{ action, timestamp: now }],
                createdAt: now,
                documentIndex: 0
            });
            await userLog.save();
        }

        return NextResponse.json({ message: 'Action logged successfully' }, { status: 201 });
    } catch (e) {
        console.log("error", e)
        return NextResponse.json({ error: 'Server error:', e }, { status: 500 });
    }
}