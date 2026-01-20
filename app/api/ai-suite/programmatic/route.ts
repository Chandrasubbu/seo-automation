import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { programmaticSeoService } from '@/lib/services/programmatic-seo';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { domain, userId } = body;

        if (!domain) {
            return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
        }

        // 1. Run Analysis
        const opportunities = await programmaticSeoService.analyze(domain);

        // 2. Save to DB
        // We assume userId is passed or we verify session here. For now, using passed userId or skipping relation if null.
        // Also handling the case where relation is optional.

        // Create separate records or one big analysis? verify schema.
        // Schema: ProgrammaticAnalysis { keyword, source, data, provenance }
        // Opportunities are an array. Each opportunity is tied to a keyword/pattern.
        // We'll store each opportunity as a record for granularity.

        const savedRecords = [];
        for (const opp of opportunities) {
            const record = await prisma.programmaticAnalysis.create({
                data: {
                    keyword: opp.keyword || opp.pattern || 'Pattern Analysis',
                    source: opp.provenance.source,
                    data: opp as any, // Store full object JSON
                    provenance: opp.provenance as any,
                    userId: userId || undefined
                }
            });
            savedRecords.push(record);
        }

        return NextResponse.json({ success: true, count: savedRecords.length, data: savedRecords });
    } catch (error) {
        console.error('Programmatic SEO API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
