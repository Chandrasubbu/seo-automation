import { NextRequest, NextResponse } from 'next/server'
import { keywordService } from '@/lib/keyword-service'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const { keyword, type = 'keyword', location = 'us', language = 'en' } = await request.json()

        if (!keyword) {
            return NextResponse.json(
                { error: 'Keyword is required' },
                { status: 400 }
            )
        }

        // Research keywords
        let research;
        if (type === 'domain') {
            research = await keywordService.researchDomain(keyword, location)
        } else {
            research = await keywordService.research(keyword, location, language)
        }

        // Save main keyword to database
        const saved = await prisma.keywordResearch.create({
            data: {
                keyword: research.mainKeyword.keyword,
                searchVolume: research.mainKeyword.searchVolume,
                difficulty: research.mainKeyword.difficulty,
                cpc: research.mainKeyword.cpc,
                competition: research.mainKeyword.competition,
                trend: research.mainKeyword.trend as any,
                relatedKeywords: research.relatedKeywords as any,
                clusters: research.clusters as any,
                intent: research.mainKeyword.intent
            }
        })

        return NextResponse.json({
            id: saved.id,
            ...research
        })
    } catch (error: any) {
        console.error('Keyword research error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to research keywords' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const keyword = searchParams.get('keyword')
        const limit = parseInt(searchParams.get('limit') || '10')

        if (keyword) {
            // Get specific keyword data
            const data = await prisma.keywordResearch.findFirst({
                where: { keyword },
                orderBy: { createdAt: 'desc' }
            })

            return NextResponse.json({ data })
        } else {
            // Get recent keyword research
            const recent = await prisma.keywordResearch.findMany({
                orderBy: { createdAt: 'desc' },
                take: limit,
                select: {
                    id: true,
                    keyword: true,
                    searchVolume: true,
                    difficulty: true,
                    cpc: true,
                    competition: true,
                    intent: true,
                    createdAt: true
                }
            })

            return NextResponse.json({ recent })
        }
    } catch (error: any) {
        console.error('Keyword fetch error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch keyword data' },
            { status: 500 }
        )
    }
}
