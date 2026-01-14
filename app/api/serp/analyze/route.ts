import { NextRequest, NextResponse } from 'next/server'
import { serpService } from '@/lib/serp-service'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const { keyword, location, customerDomain, competitorDomains } = await request.json()

        if (!keyword) {
            return NextResponse.json(
                { error: 'Keyword is required' },
                { status: 400 }
            )
        }

        // Analyze SERP
        const analysis = await serpService.analyze(keyword, location || 'United States')

        // Check rankings for customer and competitors (Top 20 focus)
        const trackingResults: any = {
            customer: null,
            competitors: []
        }

        // 1. Check Customer Domain
        if (customerDomain) {
            const customerRank = analysis.results.find(r =>
                r.domain.toLowerCase().includes(customerDomain.toLowerCase()) ||
                customerDomain.toLowerCase().includes(r.domain.toLowerCase())
            )
            if (customerRank) {
                trackingResults.customer = {
                    domain: customerRank.domain,
                    position: customerRank.position,
                    url: customerRank.url
                }
            }
        }

        // 2. Check Competitor Domains
        if (competitorDomains && Array.isArray(competitorDomains)) {
            competitorDomains.forEach((compDomain: string) => {
                const compRank = analysis.results.find(r =>
                    r.domain.toLowerCase().includes(compDomain.toLowerCase()) ||
                    compDomain.toLowerCase().includes(r.domain.toLowerCase())
                )
                if (compRank) {
                    trackingResults.competitors.push({
                        target: compDomain,
                        found_domain: compRank.domain,
                        position: compRank.position,
                        url: compRank.url
                    })
                } else {
                    trackingResults.competitors.push({
                        target: compDomain,
                        position: null, // Not found in top results
                        url: null
                    })
                }
            })
        }

        // Save to database
        const saved = await prisma.serpAnalysis.create({
            data: {
                keyword: analysis.keyword,
                location: analysis.location,
                rankings: analysis.results as any, // Stores all results
                features: analysis.features as any,
                competitors: analysis.results.slice(0, 10).map(r => ({
                    domain: r.domain,
                    position: r.position,
                    url: r.url,
                    title: r.title
                })) as any,
                metadata: {
                    totalResults: analysis.totalResults,
                    provider: serpService.getProvider(),
                    tracking: trackingResults, // Store tracking info
                    target_customer: customerDomain,
                    target_competitors: competitorDomains
                } as any
            }
        })

        return NextResponse.json({
            id: saved.id,
            ...analysis,
            tracking: trackingResults // valid property for response even if not in type definition of AnalysisResult
        })
    } catch (error: any) {
        console.error('SERP analysis error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to analyze SERP' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const keyword = searchParams.get('keyword')
        const limit = parseInt(searchParams.get('limit') || '10')

        if (!keyword) {
            return NextResponse.json(
                { error: 'Keyword parameter is required' },
                { status: 400 }
            )
        }

        // Get historical SERP data for keyword
        const history = await prisma.serpAnalysis.findMany({
            where: { keyword },
            orderBy: { createdAt: 'desc' },
            take: limit,
            select: {
                id: true,
                keyword: true,
                location: true,
                rankings: true,
                features: true,
                createdAt: true
            }
        })

        return NextResponse.json({ history })
    } catch (error: any) {
        console.error('SERP history error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch SERP history' },
            { status: 500 }
        )
    }
}
