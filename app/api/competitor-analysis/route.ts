import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { CompetitorAnalyzer } from '@/lib/services/competitor-analyzer';

export const maxDuration = 60; // Allow 60 seconds for scraping

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { clientUrl, competitorUrls } = await req.json();

        if (!clientUrl || !competitorUrls || !Array.isArray(competitorUrls) || competitorUrls.length === 0) {
            return NextResponse.json({ error: 'Invalid input. clientUrl and competitorUrls array required.' }, { status: 400 });
        }

        const analyzer = new CompetitorAnalyzer();
        const results = await analyzer.performGapAnalysis(clientUrl, competitorUrls);

        // Save to Database
        // 1. Find or create CompetitorSite entries
        // For simplicity, we'll associate the audit with the *first* competitor in the list as the primary one, 
        // or we could structure `CompetitorAudit` to handle multiple. 
        // Given the schema, let's treat the first competitor as the main one for the relation, 
        // but the JSON will store all data.

        // Check if competitor exists for this user
        const primaryCompetitorUrl = competitorUrls[0];
        let competitorSite = await prisma.competitorSite.findFirst({
            where: {
                userId: session.user.id,
                url: primaryCompetitorUrl
            }
        });

        if (!competitorSite) {
            try {
                competitorSite = await prisma.competitorSite.create({
                    data: {
                        userId: session.user.id,
                        url: primaryCompetitorUrl
                    }
                });
            } catch (dbError: any) {
                // P2003 = Foreign key constraint failed (User ID in session doesn't exist in DB)
                if (dbError.code === 'P2003') {
                    console.error('Orphaned session detected. User ID not found:', session.user.id);
                    return NextResponse.json({
                        error: 'Your session is invalid (User not found). Please sign out and sign in again.',
                        code: 'SESSION_INVALID'
                    }, { status: 401 });
                }
                throw dbError; // Re-throw other errors to be caught by outer catch
            }
        }

        const audit = await prisma.competitorAudit.create({
            data: {
                competitorSiteId: competitorSite.id,
                clientUrl: clientUrl,
                gapAnalysis: results.gaps as any,
                recommendations: results.recommendations as any
            }
        });

        return NextResponse.json({
            success: true,
            auditId: audit.id,
            results
        });

    } catch (error: any) {
        console.error('Competitor Analysis Error:', error);

        // Log stack trace if available for deep debugging
        if (error.stack) {
            console.error(error.stack);
        }

        return NextResponse.json({
            error: error.message || 'Internal Server Error during Competitor Analysis',
            details: error.toString()
        }, { status: 500 });
    }
}
