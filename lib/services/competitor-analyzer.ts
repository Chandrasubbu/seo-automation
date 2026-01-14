import * as cheerio from 'cheerio';

interface PageData {
    url: string;
    h1: string[];
    h2: string[];
    h3: string[];
    wordCount: number;
    content: string;
}

interface GapAnalysisResult {
    client: PageData;
    competitors: PageData[];
    gaps: {
        missingKeywords: string[];
        structureGaps: string[];
        contentLengthGap: number;
    };
    recommendations: string[];
}

export class CompetitorAnalyzer {

    async analyzePage(url: string): Promise<PageData> {
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Compatible; SEO-Bot/1.0; +http://example.com/bot)'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
            }

            const html = await response.text();
            const $ = cheerio.load(html);

            const h1 = $('h1').map((_, el) => $(el).text().trim()).get().filter(t => t.length > 0);
            const h2 = $('h2').map((_, el) => $(el).text().trim()).get().filter(t => t.length > 0);
            const h3 = $('h3').map((_, el) => $(el).text().trim()).get().filter(t => t.length > 0);

            // Get main content text (simplified)
            const content = $('body').text().replace(/\s+/g, ' ').trim();
            const wordCount = content.split(' ').length;

            return {
                url,
                h1,
                h2,
                h3,
                wordCount,
                content: content.slice(0, 1000) // Store only snippet for preview to save space
            };

        } catch (error) {
            console.error(`Error analyzing ${url}:`, error);
            // Return empty data on failure to allow process to continue
            return {
                url,
                h1: [],
                h2: [],
                h3: [],
                wordCount: 0,
                content: ''
            };
        }
    }

    generateRecommendations(client: PageData, competitors: PageData[]): string[] {
        const recommendations: string[] = [];

        // 1. Analyze Word Count
        const avgCompetitorWordCount = competitors.reduce((acc, curr) => acc + curr.wordCount, 0) / competitors.length;
        if (client.wordCount < avgCompetitorWordCount * 0.8) {
            recommendations.push(`Increase content length. Your content (${client.wordCount} words) is significantly shorter than the competitor average (${Math.round(avgCompetitorWordCount)} words).`);
        }

        // 2. Analyze H1
        if (client.h1.length === 0) {
            recommendations.push("Add a main H1 heading. Your page is missing an H1 tag.");
        } else if (client.h1.length > 1) {
            recommendations.push("Use only one H1 heading. Multiple H1 tags can confuse search engines.");
        }

        // 3. Keyword/Topic Gaps (Simplified logic based on headings)
        const competitorKeywords = new Set<string>();
        competitors.forEach(comp => {
            [...comp.h1, ...comp.h2, ...comp.h3].forEach(h => {
                h.toLowerCase().split(' ').forEach(w => {
                    if (w.length > 4) competitorKeywords.add(w);
                });
            });
        });

        const clientKeywords = new Set<string>();
        [...client.h1, ...client.h2, ...client.h3].forEach(h => {
            h.toLowerCase().split(' ').forEach(w => {
                if (w.length > 4) clientKeywords.add(w);
            });
        });

        // Find top missing terms (very naive implementation)
        let missingCount = 0;
        for (const kw of competitorKeywords) {
            if (!clientKeywords.has(kw) && missingCount < 5) {
                recommendations.push(`Consider adding a section about "${kw}" which competitors are covering.`);
                missingCount++;
            }
        }

        return recommendations;
    }

    async performGapAnalysis(clientUrl: string, competitorUrls: string[]): Promise<GapAnalysisResult> {
        const clientData = await this.analyzePage(clientUrl);
        const competitorData = await Promise.all(competitorUrls.map(url => this.analyzePage(url)));

        // Extract keywords from competitors that client is missing
        const competitorKeywords = new Set<string>();
        competitorData.forEach(comp => {
            [...comp.h1, ...comp.h2, ...comp.h3].forEach(h => {
                h.toLowerCase().split(/\s+/).forEach(w => {
                    if (w.length > 4) competitorKeywords.add(w);
                });
            });
        });

        const clientKeywords = new Set<string>();
        [...clientData.h1, ...clientData.h2, ...clientData.h3].forEach(h => {
            h.toLowerCase().split(/\s+/).forEach(w => {
                if (w.length > 4) clientKeywords.add(w);
            });
        });

        const missingKeywords = Array.from(competitorKeywords)
            .filter(kw => !clientKeywords.has(kw))
            .sort(() => Math.random() - 0.5)
            .slice(0, 10);

        const recommendations = this.generateRecommendations(clientData, competitorData);

        return {
            client: clientData,
            competitors: competitorData,
            gaps: {
                missingKeywords,
                structureGaps: clientData.h1.length === 0 ? ['Missing H1 Heading'] : [],
                contentLengthGap: Math.round(competitorData.reduce((acc, c) => acc + c.wordCount, 0) / competitorData.length - clientData.wordCount)
            },
            recommendations
        };
    }
}
