import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai-service'
import { z } from 'zod'

const generateSchema = z.object({
    prompt: z.string().min(1),
    type: z.enum(['article', 'outline', 'meta', 'improvement']).default('article'),
    provider: z.enum(['openai', 'anthropic', 'gemini']).optional(),
    options: z.object({
        temperature: z.number().min(0).max(2).optional(),
        maxTokens: z.number().min(100).max(8000).optional()
    }).optional()
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { prompt, type, provider, options } = generateSchema.parse(body)

        const systemPrompt = getSystemPrompt(type)

        const result = await aiService.generate([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
        ], {
            provider,
            temperature: options?.temperature,
            maxTokens: options?.maxTokens
        })

        return NextResponse.json({
            content: result.content,
            provider: result.provider,
            model: result.model,
            tokensUsed: result.tokensUsed
        })
    } catch (error: any) {
        console.error('Content generation error:', error)

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid request parameters', details: error.errors },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: error.message || 'Failed to generate content' },
            { status: 500 }
        )
    }
}

function getSystemPrompt(type: string): string {
    const prompts: Record<string, string> = {
        article: `You are an expert SEO content writer. Generate high-quality, engaging, and SEO-optimized articles that:
- Follow E-E-A-T principles (Experience, Expertise, Authoritativeness, Trustworthiness)
- Use natural language and conversational tone
- Include relevant keywords naturally
- Have clear structure with headers and subheaders
- Provide actionable insights and value to readers`,

        outline: `You are an expert at creating detailed content outlines. Generate comprehensive outlines that:
- Start with a compelling introduction
- Break down the topic into logical sections
- Include H2 and H3 headers
- Suggest key points to cover in each section
- End with a strong conclusion and call-to-action`,

        meta: `You are an expert at writing compelling meta descriptions and title tags. Generate:
- Title tags under 60 characters that include the primary keyword
- Meta descriptions under 160 characters that are compelling and include keywords
- Both should encourage clicks while accurately representing the content`,

        improvement: `You are an expert content editor. Analyze the provided content and suggest specific improvements for:
- SEO optimization (keyword usage, structure, headers)
- Readability (sentence length, clarity, flow)
- E-E-A-T signals (expertise, authority, trust)
- Engagement (hooks, calls-to-action, value proposition)
Provide actionable, specific recommendations.`
    }

    return prompts[type] || prompts.article
}

// GET endpoint to check available providers
export async function GET() {
    try {
        const providers = aiService.getAvailableProviders()

        return NextResponse.json({
            providers,
            default: providers[0] || null
        })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
