import { NextRequest, NextResponse } from 'next/server'
import { articleGenerator } from '@/lib/generators/article-generator'
import { getTemplate, getTemplateNames, generateOutlineFromTemplate } from '@/lib/generators/content-templates'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Validation schemas
const generateOutlineSchema = z.object({
    topic: z.string().min(1),
    targetKeyword: z.string().min(1),
    numberOfSections: z.number().min(3).max(15).optional(),
    template: z.string().optional()
})

const generateArticleSchema = z.object({
    outline: z.object({
        title: z.string(),
        introduction: z.string(),
        sections: z.array(z.object({
            heading: z.string(),
            subheadings: z.array(z.string()).optional(),
            keyPoints: z.array(z.string())
        })),
        conclusion: z.string(),
        callToAction: z.string().optional()
    }),
    targetKeyword: z.string().min(1),
    tone: z.enum(['professional', 'casual', 'friendly', 'authoritative']).optional(),
    length: z.enum(['short', 'medium', 'long']).optional(),
    includeExamples: z.boolean().optional(),
    includeFAQ: z.boolean().optional(),
    provider: z.enum(['openai', 'anthropic', 'gemini']).optional()
})

/**
 * POST /api/content/article/generate
 * Generate a complete article from an outline
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action') || 'generate'

        if (action === 'outline') {
            // Generate outline
            const { topic, targetKeyword, numberOfSections, template } = generateOutlineSchema.parse(body)

            let outline
            if (template) {
                // Use template
                outline = generateOutlineFromTemplate(template, topic, targetKeyword)
            } else {
                // Generate custom outline
                outline = await articleGenerator.generateOutline(topic, targetKeyword, numberOfSections)
            }

            return NextResponse.json({ outline })
        } else if (action === 'generate') {
            // Generate full article
            const options = generateArticleSchema.parse(body)

            const article = await articleGenerator.generateArticle(options)

            // Save to database
            const saved = await prisma.analysisResult.create({
                data: {
                    keyword: options.targetKeyword,
                    brand: null,
                    competitors: [],
                    blueprint: article.content,
                    metadata: {
                        type: 'generated_article',
                        title: article.title,
                        metaDescription: article.metaDescription,
                        wordCount: article.wordCount,
                        tone: options.tone,
                        includedFAQ: options.includeFAQ,
                        generatedAt: new Date().toISOString()
                    }
                }
            })

            return NextResponse.json({
                id: saved.id,
                ...article
            })
        } else {
            return NextResponse.json(
                { error: 'Invalid action. Use ?action=outline or ?action=generate' },
                { status: 400 }
            )
        }
    } catch (error: any) {
        console.error('Article generation error:', error)

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid request parameters', details: error.errors },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: error.message || 'Failed to generate article' },
            { status: 500 }
        )
    }
}

/**
 * GET /api/content/article/generate
 * Get available templates and options
 */
export async function GET() {
    try {
        const templates = getTemplateNames().map(name => {
            const template = getTemplate(name)
            return {
                name,
                ...template
            }
        })

        return NextResponse.json({
            templates,
            tones: ['professional', 'casual', 'friendly', 'authoritative'],
            lengths: ['short', 'medium', 'long']
        })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
