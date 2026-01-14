import { aiService } from '@/lib/ai-service';

export interface SEOScore {
    score: number;
    details: {
        title: boolean;
        headings: boolean;
        density: number;
        length: number;
        readability: number;
    };
    issues: string[];
}

export interface Suggestion {
    id: string;
    type: 'missing_keyword' | 'readability' | 'structure';
    message: string;
    context?: string; // The text to fix
    fixPrediction?: string; // AI generated fix
}

export class OptimizationEngine {

    /**
     * Analyzes content for basic SEO metrics
     */
    analyzeSXO(content: string, targetKeyword: string): SEOScore {
        const issues: string[] = [];
        let score = 100;

        const lowerContent = content.toLowerCase();
        const lowerKeyword = targetKeyword.toLowerCase();

        // 1. Title/First Line Check
        // Simple heuristic: check first line or H1
        const firstLine = content.split('\n')[0].toLowerCase();
        const hasKeywordInTitle = firstLine.includes(lowerKeyword);
        if (!hasKeywordInTitle) {
            score -= 20;
            issues.push('Target keyword not found in the main title/first line.');
        }

        // 2. Keyword Density
        const wordCount = content.split(/\s+/).length;
        const keywordCount = (lowerContent.match(new RegExp(lowerKeyword, 'g')) || []).length;
        const density = wordCount > 0 ? (keywordCount / wordCount) * 100 : 0;

        // Ideal density approx 0.5% - 2.5%
        if (density < 0.5) {
            score -= 10;
            issues.push(`Keyword density is too low (${density.toFixed(2)}%). Aim for at least 0.5%.`);
        } else if (density > 3.0) {
            score -= 5;
            issues.push(`Keyword density is too high (${density.toFixed(2)}%). Risk of stuffing.`);
        }

        // 3. Content Length
        if (wordCount < 300) {
            score -= 15;
            issues.push('Content is too short (under 300 words).');
        }

        // 4. Heading Structure (Basic check forMarkdown headers)
        const hasHeadings = content.includes('## ') || content.includes('### ');
        if (!hasHeadings && wordCount > 300) {
            score -= 10;
            issues.push('Content lacks subheadings (H2/H3). Break up text for better readability.');
        }

        return {
            score: Math.max(0, score),
            details: {
                title: hasKeywordInTitle,
                headings: hasHeadings,
                density,
                length: wordCount,
                readability: 100 // Placceholder for complex algorithm
            },
            issues
        };
    }

    /**
     * helper to extract potential keyword opportunities using AI
     * (Mock implementation for now to avoid token usage in dev, or real call if wired up)
     */
    async generateSuggestions(content: string, targetKeyword: string): Promise<Suggestion[]> {
        // In a real scenario, we'd prompt the LLM:
        // "Analyze this text for SEO based on keyword '${targetKeyword}'. Suggest specific improvements."

        const suggestions: Suggestion[] = [];
        const analysis = this.analyzeSXO(content, targetKeyword);

        // Convert rule-based issues to suggestions
        analysis.issues.forEach((issue, idx) => {
            suggestions.push({
                id: `rule-${idx}`,
                type: 'structure',
                message: issue
            });
        });

        // Add a mock AI suggestion for demonstration
        if (!content.includes('conclusion') && !content.includes('summary')) {
            suggestions.push({
                id: 'ai-1',
                type: 'structure',
                message: 'Content seems to lack a clear conclusion or summary section.',
                fixPrediction: `## Conclusion\n\nIn summary, ${targetKeyword} is an essential strategy...`
            });
        }

        return suggestions;
    }

    /**
     * Applies an AI fix to the content
     */
    async applyFix(content: string, suggestionId: string, instruction: string): Promise<string> {
        // Logic to call AI to rewrite section
        // For now, simple mock append or replace
        if (suggestionId === 'ai-1') {
            return content + '\n\n' + instruction;
        }
        return content; // No change
    }
}

export const optimizationEngine = new OptimizationEngine();
