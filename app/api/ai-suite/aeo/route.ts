import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { aeoService } from '@/lib/services/aeo-service';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { keyword, location, userId } = body;

        if (!keyword) {
            return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
        }

        const opportunities = await aeoService.analyze(keyword, location);

        const savedRecords = [];
        for (const opp of opportunities) {
            const record = await prisma.aeoAnalysis.create({
                data: {
                    query: opp.query,
                    answerType: opp.type,
                    currentOwner: opp.currentOwner || null,
                    recommendations: opp as any,
                    provenance: opp.provenance as any,
                    userId: userId || undefined
                }
            });
            savedRecords.push(record);
        }

        return NextResponse.json({ success: true, count: savedRecords.length, data: savedRecords });
    } catch (error) {
        console.error('AEO API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
