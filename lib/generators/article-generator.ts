import { aiService } from '../ai-service'

export interface ContentOutline {
    title: string
    introduction: string
    sections: {
        heading: string
        subheadings?: string[]
        keyPoints: string[]
    }[]
    conclusion: string
    callToAction?: string
}

export interface ArticleGenerationOptions {
    outline: ContentOutline
    targetKeyword: string
    tone?: 'professional' | 'casual' | 'friendly' | 'authoritative'
    length?: 'short' | 'medium' | 'long' // 500, 1500, 3000+ words
    includeExamples?: boolean
    includeFAQ?: boolean
    provider?: 'openai' | 'anthropic' | 'gemini'
}

export interface GeneratedArticle {
    title: string
    metaDescription: string
    content: string
    wordCount: number
    sections: {
        heading: string
        content: string
    }[]
    faq?: {
        question: string
        answer: string
    }[]
}

/**
 * Article Generator Service
 * Generates complete SEO-optimized articles from outlines
 */
export class ArticleGenerator {
    /**
     * Generate a complete article from an outline
     */
    async generateArticle(options: ArticleGenerationOptions): Promise<GeneratedArticle> {
        const { outline, targetKeyword, tone = 'professional', length = 'medium' } = options

        // Generate sections in parallel for faster generation
        const sectionPromises = outline.sections.map((section, index) =>
            this.generateSection(section, targetKeyword, tone, index === 0)
        )

        const generatedSections = await Promise.all(sectionPromises)

        // Generate introduction
        const introduction = await this.generateIntroduction(
            outline.title,
            outline.introduction,
            targetKeyword,
            tone
        )

        // Generate conclusion
        const conclusion = await this.generateConclusion(
            outline.title,
            outline.conclusion,
            outline.callToAction,
            targetKeyword,
            tone
        )

        // Generate FAQ if requested
        let faq: { question: string; answer: string }[] | undefined
        if (options.includeFAQ) {
            faq = await this.generateFAQ(targetKeyword, outline.title)
        }

        // Combine all content
        const fullContent = this.assembleArticle(
            introduction,
            generatedSections,
            conclusion,
            faq
        )

        // Generate meta description
        const metaDescription = await this.generateMetaDescription(outline.title, targetKeyword)

        return {
            title: outline.title,
            metaDescription,
            content: fullContent,
            wordCount: this.countWords(fullContent),
            sections: [
                { heading: 'Introduction', content: introduction },
                ...generatedSections,
                { heading: 'Conclusion', content: conclusion }
            ],
            faq
        }
    }

    /**
     * Generate an outline from a topic and keyword
     */
    async generateOutline(
        topic: string,
        targetKeyword: string,
        numberOfSections: number = 5
    ): Promise<ContentOutline> {
        const prompt = `Create a detailed content outline for an article about "${topic}" targeting the keyword "${targetKeyword}".

The outline should include:
1. A compelling title that includes the target keyword
2. An introduction hook (2-3 sentences)
3. ${numberOfSections} main sections with:
   - Clear H2 headings
   - 2-3 H3 subheadings for each section
   - 3-5 key points to cover in each section
4. A conclusion summary
5. A call-to-action

Format the response as JSON with this structure:
{
  "title": "Article Title",
  "introduction": "Introduction hook...",
  "sections": [
    {
      "heading": "Section Heading",
      "subheadings": ["Subheading 1", "Subheading 2"],
      "keyPoints": ["Point 1", "Point 2", "Point 3"]
    }
  ],
  "conclusion": "Conclusion summary...",
  "callToAction": "CTA text..."
}`

        const result = await aiService.generate([
            { role: 'system', content: 'You are an expert SEO content strategist.' },
            { role: 'user', content: prompt }
        ])

        try {
            // Extract JSON from response (handle markdown code blocks)
            const jsonMatch = result.content.match(/```json\n([\s\S]*?)\n```/) ||
                result.content.match(/```\n([\s\S]*?)\n```/)
            const jsonStr = jsonMatch ? jsonMatch[1] : result.content
            return JSON.parse(jsonStr)
        } catch (error) {
            throw new Error('Failed to parse outline JSON. Please try again.')
        }
    }

    /**
     * Generate a single section of content
     */
    private async generateSection(
        section: ContentOutline['sections'][0],
        targetKeyword: string,
        tone: string,
        isFirstSection: boolean
    ): Promise<{ heading: string; content: string }> {
        const keywordInstruction = isFirstSection
            ? `Include the target keyword "${targetKeyword}" naturally in the first paragraph.`
            : `Mention the target keyword "${targetKeyword}" naturally if relevant.`

        const prompt = `Write a comprehensive section for an article with the following details:

**Section Heading (H2):** ${section.heading}
${section.subheadings ? `**Subheadings (H3):** ${section.subheadings.join(', ')}` : ''}
**Key Points to Cover:**
${section.keyPoints.map(p => `- ${p}`).join('\n')}

**Instructions:**
- Write in a ${tone} tone
- ${keywordInstruction}
- Use clear, engaging language
- Include specific examples or data where relevant
- Format with proper markdown (H3 subheadings, bullet points, etc.)
- Aim for 200-300 words
- Make it actionable and valuable to readers

Write the section content in markdown format:`

        const result = await aiService.generate([
            { role: 'system', content: 'You are an expert content writer specializing in SEO-optimized articles.' },
            { role: 'user', content: prompt }
        ])

        return {
            heading: section.heading,
            content: result.content.trim()
        }
    }

    /**
     * Generate introduction
     */
    private async generateIntroduction(
        title: string,
        hook: string,
        targetKeyword: string,
        tone: string
    ): Promise<string> {
        const prompt = `Write an engaging introduction for an article titled "${title}".

**Hook:** ${hook}
**Target Keyword:** ${targetKeyword}

**Instructions:**
- Start with the hook to grab attention
- Include the target keyword "${targetKeyword}" in the first paragraph
- Explain what the article will cover
- Set expectations for the reader
- Use a ${tone} tone
- Aim for 100-150 words
- Make it compelling and valuable

Write the introduction in markdown format:`

        const result = await aiService.generate([
            { role: 'system', content: 'You are an expert content writer.' },
            { role: 'user', content: prompt }
        ])

        return result.content.trim()
    }

    /**
     * Generate conclusion
     */
    private async generateConclusion(
        title: string,
        summary: string,
        cta: string | undefined,
        targetKeyword: string,
        tone: string
    ): Promise<string> {
        const prompt = `Write a strong conclusion for an article titled "${title}".

**Summary Points:** ${summary}
${cta ? `**Call-to-Action:** ${cta}` : ''}
**Target Keyword:** ${targetKeyword}

**Instructions:**
- Summarize the key takeaways
- Reinforce the value provided
- ${cta ? 'Include the call-to-action naturally' : 'End with a thought-provoking statement'}
- Mention the target keyword "${targetKeyword}" once if natural
- Use a ${tone} tone
- Aim for 80-120 words

Write the conclusion in markdown format:`

        const result = await aiService.generate([
            { role: 'system', content: 'You are an expert content writer.' },
            { role: 'user', content: prompt }
        ])

        return result.content.trim()
    }

    /**
     * Generate FAQ section
     */
    private async generateFAQ(
        targetKeyword: string,
        articleTitle: string
    ): Promise<{ question: string; answer: string }[]> {
        const prompt = `Generate 5 frequently asked questions (FAQ) related to "${targetKeyword}" and the article "${articleTitle}".

For each question:
- Make it specific and relevant
- Provide a concise, helpful answer (2-3 sentences)
- Use natural language

Format as JSON array:
[
  {
    "question": "Question text?",
    "answer": "Answer text."
  }
]`

        const result = await aiService.generate([
            { role: 'system', content: 'You are an SEO expert creating FAQ content.' },
            { role: 'user', content: prompt }
        ])

        try {
            const jsonMatch = result.content.match(/```json\n([\s\S]*?)\n```/) ||
                result.content.match(/```\n([\s\S]*?)\n```/) ||
                result.content.match(/\[[\s\S]*\]/)
            const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : result.content
            return JSON.parse(jsonStr)
        } catch (error) {
            return []
        }
    }

    /**
     * Generate meta description
     */
    private async generateMetaDescription(
        title: string,
        targetKeyword: string
    ): Promise<string> {
        const prompt = `Write a compelling meta description for an article titled "${title}" targeting the keyword "${targetKeyword}".

Requirements:
- Maximum 155 characters
- Include the target keyword
- Be compelling and encourage clicks
- Accurately represent the content

Write only the meta description, no extra text:`

        const result = await aiService.generate([
            { role: 'system', content: 'You are an SEO expert.' },
            { role: 'user', content: prompt }
        ])

        return result.content.trim().replace(/^["']|["']$/g, '').substring(0, 155)
    }

    /**
     * Assemble the complete article
     */
    private assembleArticle(
        introduction: string,
        sections: { heading: string; content: string }[],
        conclusion: string,
        faq?: { question: string; answer: string }[]
    ): string {
        let article = `${introduction}\n\n`

        sections.forEach(section => {
            article += `## ${section.heading}\n\n${section.content}\n\n`
        })

        article += `## Conclusion\n\n${conclusion}\n\n`

        if (faq && faq.length > 0) {
            article += `## Frequently Asked Questions\n\n`
            faq.forEach(item => {
                article += `### ${item.question}\n\n${item.answer}\n\n`
            })
        }

        return article.trim()
    }

    /**
     * Count words in text
     */
    private countWords(text: string): number {
        return text.split(/\s+/).filter(word => word.length > 0).length
    }
}

// Export singleton instance
export const articleGenerator = new ArticleGenerator()
