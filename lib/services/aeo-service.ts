import { serpService } from '../serp-service';
import * as cheerio from 'cheerio';

export interface AeoOpportunity {
    query: string;
    type: 'snippet_gap' | 'paa_expansion' | 'format_optimization';
    currentOwner?: string;
    winningFormat?: 'list' | 'table' | 'paragraph' | 'video';
    schemaMissing: boolean;
    recommendation: string;
    provenance: {
        source: string;
        date: string;
        dataPoints: any[];
    };
}

export class AeoService {

    async analyze(keyword: string, location = 'United States'): Promise<AeoOpportunity[]> {
        const opportunities: AeoOpportunity[] = [];
        const today = new Date().toISOString().split('T')[0];

        // 1. Get Live SERP Data
        const serpResult = await serpService.analyze(keyword, location);

        // 2. Analyze Featured Snippet
        const snippet = serpResult.features.find(f => f.type === 'featured_snippet' || f.type === 'answer_box');
        if (snippet) {
            // Check if we own it (assuming we know our domain, passing it in would be better, adding to method signature later if needed)
            // For now, analyze the winner
            const winnerUrl = snippet.data.link || snippet.data.url; // standardization issues in mock data vs real api?

            if (winnerUrl) {
                const analysis = await this.analyzeWinningContent(winnerUrl);

                opportunities.push({
                    query: keyword,
                    type: 'format_optimization',
                    currentOwner: winnerUrl,
                    winningFormat: analysis.format,
                    schemaMissing: !analysis.hasSchema,
                    recommendation: `Competitor via ${analysis.format} (${analysis.wordCount} words). ${analysis.hasSchema ? 'Uses schema.' : 'No schema detected.'} Adopt ${analysis.format} format with ~${analysis.wordCount} words.`,
                    provenance: {
                        source: 'Live Google SERP',
                        date: today,
                        dataPoints: [{ type: 'snippet', url: winnerUrl }]
                    }
                });
            }
        } else {
            // No snippet? Opportunity to grab it.
            opportunities.push({
                query: keyword,
                type: 'snippet_gap',
                schemaMissing: true,
                recommendation: 'No featured snippet exists. Target this space with concise definitions (40-60 words).',
                provenance: {
                    source: 'Live Google SERP',
                    date: today,
                    dataPoints: []
                }
            });
        }

        // 3. Analyze PAA (People Also Ask)
        const paa = serpResult.features.find(f => f.type === 'people_also_ask');
        if (paa && Array.isArray(paa.data)) {
            // limit to top 3 for actionable insights
            const questions = paa.data.slice(0, 3);
            const questionsList = questions.map((q: any) => typeof q === 'string' ? q : q.question); // handle mock data string array vs object

            opportunities.push({
                query: keyword,
                type: 'paa_expansion',
                recommendation: `Integrate PAA questions into FAQ or H2s: ${questionsList.join(', ')}`,
                provenance: {
                    source: 'Live Google SERP (PAA)',
                    date: today,
                    dataPoints: questionsList
                },
                winningFormat: 'paragraph',
                schemaMissing: false
            });
        }

        return opportunities;
    }

    private async analyzeWinningContent(url: string): Promise<{ format: 'list' | 'table' | 'paragraph' | 'video', wordCount: number, hasSchema: boolean }> {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeout);

            if (!res.ok) throw new Error('Failed to fetch');
            const html = await res.text();
            const $ = cheerio.load(html);

            // Detect Schema
            const hasSchema = $('script[type="application/ld+json"]').length > 0;

            // Detect Format (Heuristic)
            // Simplified: check if the main content area has ul/ol or table interactions near the top headers?
            // Too hard to be precise without selector. 
            // Use basic count of elements.
            const lists = $('ul, ol').length;
            const tables = $('table').length;

            let format: 'list' | 'table' | 'paragraph' | 'video' = 'paragraph';
            if (tables > 2) format = 'table';
            else if (lists > 5) format = 'list';

            const wordCount = $('body').text().split(/\s+/).length; // Very rough

            return { format, wordCount, hasSchema };

        } catch (e) {
            return { format: 'paragraph', wordCount: 0, hasSchema: false };
        }
    }
}

export const aeoService = new AeoService();
