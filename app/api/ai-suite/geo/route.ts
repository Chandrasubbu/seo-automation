import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { geoService } from '@/lib/services/geo-service';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { brandName, brandUrl, queries, userId } = body;

        if (!brandName || !queries || !Array.isArray(queries)) {
            return NextResponse.json({ error: 'Brand name and queries array are required' }, { status: 400 });
        }

        const results = await geoService.analyze(brandName, brandUrl || '', queries);

        const savedRecords = [];
        for (const res of results) {
            const record = await prisma.geoAnalysis.create({
                data: {
                    prompt: res.prompt,
                    aiModel: res.model,
                    citations: res.citations as any,
                    recommendations: { text: res.recommendation, competitors: res.competitorsCited } as any,
                    provenance: res.provenance as any,
                    userId: userId || undefined
                }
            });
            savedRecords.push(record);
        }

        return NextResponse.json({ success: true, count: savedRecords.length, data: savedRecords });
    } catch (error) {
        console.error('GEO API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
