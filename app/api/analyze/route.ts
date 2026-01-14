import { NextResponse } from 'next/server';
import { generateSeoBlueprint } from '@/lib/seo-agent';
import { rateLimit, getRateLimitInfo } from '@/lib/rate-limiter';

export async function POST(req: Request) {
    try {
        // Rate limiting (5 RPM per IP)
        const ip = req.headers.get('x-forwarded-for') || 'unknown';

        if (!rateLimit(ip, 5, 60000)) {
            const info = getRateLimitInfo(ip);
            return NextResponse.json(
                {
                    error: `Rate limit exceeded. Please wait ${Math.ceil(info.resetIn / 1000)}s before trying again.`,
                    resetIn: info.resetIn
                },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': '5',
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': new Date(Date.now() + info.resetIn).toISOString()
                    }
                }
            );
        }

        const body = await req.json();

        // Check for API Keys early
        if (!process.env.GOOGLE_API_KEY || !process.env.JINA_API_KEY) {
            return NextResponse.json(
                { error: 'Missing API Keys. Please configure JINA_API_KEY and GOOGLE_API_KEY in .env.local' },
                { status: 500 }
            );
        }

        const blueprint = await generateSeoBlueprint(body);

        // Save to database
        const { prisma } = await import('@/lib/db');
        const saved = await prisma.analysisResult.create({
            data: {
                keyword: body.keyword,
                brand: body.brand,
                competitors: body.competitors,
                blueprint: blueprint,
                metadata: {
                    services: body.services,
                    generatedAt: new Date().toISOString(),
                    ip: ip
                }
            }
        });

        const info = getRateLimitInfo(ip);
        return NextResponse.json(
            {
                id: saved.id,
                blueprint
            },
            {
                headers: {
                    'X-RateLimit-Limit': '5',
                    'X-RateLimit-Remaining': info.remaining.toString(),
                    'X-RateLimit-Reset': new Date(Date.now() + info.resetIn).toISOString()
                }
            }
        );
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
