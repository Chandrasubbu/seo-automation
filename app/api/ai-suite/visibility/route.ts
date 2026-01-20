import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { aiVisibilityService } from '@/lib/services/ai-visibility';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { entity, domain, topics, userId } = body;

        if (!entity || !topics || !Array.isArray(topics)) {
            return NextResponse.json({ error: 'Entity and topics are required' }, { status: 400 });
        }

        const metrics = await aiVisibilityService.trackVisibility(entity, domain || '', topics);

        const savedRecords = [];
        for (const m of metrics) {
            const record = await prisma.aiVisibility.create({
                data: {
                    entity: m.entity,
                    platform: m.platform,
                    shareOfVoice: m.shareOfVoice,
                    mentions: m.mentions,
                    provenance: { ...m.provenance, totalProbes: m.totalProbes } as any,
                    userId: userId || undefined
                }
            });
            savedRecords.push(record);
        }

        return NextResponse.json({ success: true, count: savedRecords.length, data: savedRecords });
    } catch (error) {
        console.error('AI Visibility API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
