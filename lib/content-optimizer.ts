import { aiService } from "./ai-service"

export interface ContentAuditResult {
    score: number
    issues: ContentIssue[]
    suggestions: ContentSuggestion[]
    optimizedContent?: string
    seoAnalysis: SEOAnalysis
    readabilityAnalysis: ReadabilityAnalysis
}

export interface ContentIssue {
    type: "error" | "warning" | "info"
    category: string
    message: string
    location?: string
    fix?: string
}

export interface ContentSuggestion {
    category: string
    priority: "high" | "medium" | "low"
    suggestion: string
    impact: string
}

export interface SEOAnalysis {
    titleScore: number
    metaDescriptionScore: number
    headingStructure: number
    keywordDensity: number
    internalLinks: number
    imageOptimization: number
}

export interface ReadabilityAnalysis {
    fleschScore: number
    avgSentenceLength: number
    avgWordLength: number
    paragraphCount: number
    readingTime: number
}

/**
 * Content Optimizer Service
 * Analyzes and optimizes content for SEO and readability
 */
export class ContentOptimizer {
    /**
     * Run a comprehensive content audit
     */
    async auditContent(
        content: string,
        targetKeyword?: string,
        title?: string,
        metaDescription?: string
    ): Promise<ContentAuditResult> {
        const issues: ContentIssue[] = []
        const suggestions: ContentSuggestion[] = []

        // Basic metrics
        const wordCount = content.split(/\s+/).filter((w) => w.length > 0).length
        const paragraphs = content.split(/\n\n+/).filter((p) => p.trim().length > 0)
        const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0)
        const headings = content.match(/^#{1,6}\s+.+$/gm) || []
        const links = content.match(/\[.+?\]\(.+?\)/g) || []
        const images = content.match(/!\[.+?\]\(.+?\)/g) || []

        // Word count check
        if (wordCount < 300) {
            issues.push({
                type: "error",
                category: "Content Length",
                message: `Content is too short (${wordCount} words). Aim for at least 300 words.`,
                fix: "Add more detailed content, examples, or explanations.",
            })
        } else if (wordCount < 1000) {
            issues.push({
                type: "warning",
                category: "Content Length",
                message: `Content length is moderate (${wordCount} words). Consider expanding for better SEO.`,
                fix: "Add additional sections, FAQs, or supporting content.",
            })
        }

        // Title check
        if (!title) {
            issues.push({
                type: "error",
                category: "Title",
                message: "Missing title/H1 tag",
                fix: "Add a compelling title that includes your target keyword.",
            })
        } else {
            if (title.length < 30) {
                issues.push({
                    type: "warning",
                    category: "Title",
                    message: "Title is too short. Aim for 50-60 characters.",
                })
            } else if (title.length > 60) {
                issues.push({
                    type: "warning",
                    category: "Title",
                    message: "Title is too long. It may be truncated in search results.",
                    fix: "Shorten to under 60 characters.",
                })
            }
            if (targetKeyword && !title.toLowerCase().includes(targetKeyword.toLowerCase())) {
                issues.push({
                    type: "warning",
                    category: "Title",
                    message: "Target keyword not found in title",
                    fix: `Include "${targetKeyword}" in your title.`,
                })
            }
        }

        // Meta description check
        if (!metaDescription) {
            issues.push({
                type: "error",
                category: "Meta Description",
                message: "Missing meta description",
                fix: "Add a compelling meta description (150-160 characters).",
            })
        } else {
            if (metaDescription.length < 120) {
                issues.push({
                    type: "warning",
                    category: "Meta Description",
                    message: "Meta description is too short",
                    fix: "Expand to 150-160 characters for better CTR.",
                })
            } else if (metaDescription.length > 160) {
                issues.push({
                    type: "warning",
                    category: "Meta Description",
                    message: "Meta description is too long and may be truncated",
                    fix: "Shorten to under 160 characters.",
                })
            }
        }

        // Heading structure check
        if (headings.length === 0) {
            issues.push({
                type: "error",
                category: "Heading Structure",
                message: "No headings found in content",
                fix: "Add H2 and H3 headings to organize your content.",
            })
        } else {
            const h2Count = (content.match(/^## /gm) || []).length
            const h3Count = (content.match(/^### /gm) || []).length

            if (h2Count === 0) {
                issues.push({
                    type: "warning",
                    category: "Heading Structure",
                    message: "No H2 headings found",
                    fix: "Add H2 headings to break up content into sections.",
                })
            }

            if (wordCount > 1000 && h2Count < 3) {
                suggestions.push({
                    category: "Heading Structure",
                    priority: "medium",
                    suggestion: "Add more H2 headings to improve content structure",
                    impact: "Improves readability and helps search engines understand content hierarchy",
                })
            }
        }

        // Keyword density check
        if (targetKeyword) {
            const keywordRegex = new RegExp(targetKeyword, "gi")
            const keywordCount = (content.match(keywordRegex) || []).length
            const density = (keywordCount / wordCount) * 100

            if (density < 0.5) {
                issues.push({
                    type: "warning",
                    category: "Keyword Optimization",
                    message: `Keyword density is too low (${density.toFixed(2)}%). Aim for 1-2%.`,
                    fix: `Include "${targetKeyword}" more naturally throughout the content.`,
                })
            } else if (density > 3) {
                issues.push({
                    type: "warning",
                    category: "Keyword Optimization",
                    message: `Keyword density is too high (${density.toFixed(2)}%). Risk of keyword stuffing.`,
                    fix: "Reduce keyword usage to avoid over-optimization.",
                })
            }

            // Check keyword in first paragraph
            const firstParagraph = paragraphs[0] || ""
            if (!firstParagraph.toLowerCase().includes(targetKeyword.toLowerCase())) {
                suggestions.push({
                    category: "Keyword Optimization",
                    priority: "high",
                    suggestion: "Include target keyword in the first paragraph",
                    impact: "Helps search engines understand content relevance",
                })
            }
        }

        // Link check
        if (links.length === 0) {
            issues.push({
                type: "warning",
                category: "Internal Linking",
                message: "No internal links found",
                fix: "Add relevant internal links to other pages on your site.",
            })
        }

        // Image check
        if (wordCount > 500 && images.length === 0) {
            suggestions.push({
                category: "Visual Content",
                priority: "medium",
                suggestion: "Add images to break up text and improve engagement",
                impact: "Increases time on page and reduces bounce rate",
            })
        }

        // Calculate readability
        const readabilityAnalysis = this.calculateReadability(content, sentences, paragraphs)

        if (readabilityAnalysis.fleschScore < 30) {
            issues.push({
                type: "warning",
                category: "Readability",
                message: "Content is difficult to read (Flesch score: " + readabilityAnalysis.fleschScore.toFixed(0) + ")",
                fix: "Use shorter sentences and simpler words.",
            })
        }

        // Calculate SEO analysis
        const seoAnalysis: SEOAnalysis = {
            titleScore: title ? (title.length >= 30 && title.length <= 60 ? 100 : 70) : 0,
            metaDescriptionScore: metaDescription
                ? metaDescription.length >= 120 && metaDescription.length <= 160
                    ? 100
                    : 70
                : 0,
            headingStructure: headings.length > 0 ? Math.min(100, headings.length * 15) : 0,
            keywordDensity: targetKeyword
                ? Math.min(100, 100 - Math.abs(1.5 - ((content.match(new RegExp(targetKeyword, "gi")) || []).length / wordCount) * 100) * 30)
                : 50,
            internalLinks: Math.min(100, links.length * 20),
            imageOptimization: images.length > 0 ? 80 : 40,
        }

        // Calculate overall score
        const score = Math.round(
            (seoAnalysis.titleScore +
                seoAnalysis.metaDescriptionScore +
                seoAnalysis.headingStructure +
                seoAnalysis.keywordDensity +
                seoAnalysis.internalLinks +
                seoAnalysis.imageOptimization) /
            6
        )

        return {
            score,
            issues,
            suggestions,
            seoAnalysis,
            readabilityAnalysis,
        }
    }

    /**
     * Calculate readability metrics
     */
    private calculateReadability(
        content: string,
        sentences: string[],
        paragraphs: string[]
    ): ReadabilityAnalysis {
        const words = content.split(/\s+/).filter((w) => w.length > 0)
        const wordCount = words.length
        const syllableCount = words.reduce((acc, word) => acc + this.countSyllables(word), 0)

        const avgSentenceLength = sentences.length > 0 ? wordCount / sentences.length : 0
        const avgSyllablesPerWord = wordCount > 0 ? syllableCount / wordCount : 0

        // Flesch Reading Ease formula
        const fleschScore = Math.max(
            0,
            Math.min(100, 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord)
        )

        return {
            fleschScore: Math.round(fleschScore * 10) / 10,
            avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
            avgWordLength: words.length > 0
                ? Math.round((words.join("").length / words.length) * 10) / 10
                : 0,
            paragraphCount: paragraphs.length,
            readingTime: Math.ceil(wordCount / 200), // Average reading speed
        }
    }

    /**
     * Count syllables in a word
     */
    private countSyllables(word: string): number {
        word = word.toLowerCase().replace(/[^a-z]/g, "")
        if (word.length <= 3) return 1

        const vowels = "aeiouy"
        let count = 0
        let prevVowel = false

        for (let i = 0; i < word.length; i++) {
            const isVowel = vowels.includes(word[i])
            if (isVowel && !prevVowel) count++
            prevVowel = isVowel
        }

        // Adjust for silent e
        if (word.endsWith("e")) count--
        // Ensure at least 1 syllable
        return Math.max(1, count)
    }

    /**
     * Get AI-powered optimization suggestions
     */
    async getAISuggestions(
        content: string,
        targetKeyword: string,
        auditResult: ContentAuditResult
    ): Promise<string[]> {
        const issuesSummary = auditResult.issues
            .map((i) => `- ${i.category}: ${i.message}`)
            .join("\n")

        const prompt = `Analyze this content targeting the keyword "${targetKeyword}" and provide 5 specific, actionable suggestions to improve it.

Content issues found:
${issuesSummary}

Current scores:
- Title: ${auditResult.seoAnalysis.titleScore}/100
- Headings: ${auditResult.seoAnalysis.headingStructure}/100
- Keyword density: ${auditResult.seoAnalysis.keywordDensity}/100
- Readability: ${auditResult.readabilityAnalysis.fleschScore}/100

Provide exactly 5 specific suggestions, one per line, focusing on the most impactful improvements:`

        const result = await aiService.generate([
            {
                role: "system",
                content: "You are an SEO content optimization expert. Provide concise, actionable suggestions.",
            },
            { role: "user", content: prompt },
        ])

        return result.content
            .split("\n")
            .filter((line) => line.trim().length > 0)
            .slice(0, 5)
    }

    /**
     * Optimize content with AI
     */
    async optimizeContent(
        content: string,
        targetKeyword: string,
        focusAreas: string[]
    ): Promise<string> {
        const prompt = `Optimize this content for the keyword "${targetKeyword}". 
Focus on: ${focusAreas.join(", ")}.

Original content:
${content}

Provide the optimized version with improvements made. Keep the same general structure but enhance SEO, readability, and engagement.`

        const result = await aiService.generate([
            {
                role: "system",
                content: "You are an expert SEO content optimizer. Improve content while maintaining its voice and message.",
            },
            { role: "user", content: prompt },
        ])

        return result.content
    }
}

export const contentOptimizer = new ContentOptimizer()
