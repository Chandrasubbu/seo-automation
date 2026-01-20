import { aiService, AIProvider } from '../ai-service';

export interface GeoCitation {
    url: string;
    context: string;
    sentiment: 'positive' | 'neutral' | 'negative';
}

export interface GeoAnalysisResult {
    prompt: string;
    model: string;
    brandMentioned: boolean;
    citations: GeoCitation[];
    competitorsCited: string[];
    recommendation: string;
    provenance: {
        source: string;
        date: string;
    };
}

export class GeoService {

    async analyze(brandName: string, brandUrl: string, queries: string[]): Promise<GeoAnalysisResult[]> {
        const results: GeoAnalysisResult[] = [];
        const providers = aiService.getAvailableProviders();
        const today = new Date().toISOString().split('T')[0];

        if (providers.length === 0) {
            console.warn('No AI providers configured for GEO analysis');
            return [];
        }

        // Safely parse hostname
        let brandHostname = '';
        try {
            brandHostname = new URL(brandUrl).hostname;
        } catch {
            brandHostname = brandUrl;
        }

        for (const query of queries) {
            try {
                const prompt = `Answer the following question as a search engine would: "${query}". Provide a helpful, detailed answer and cite 3-5 reliable sources with URLs.`;

                const aiResponse = await aiService.generate([
                    { role: 'system', content: 'You are a helpful AI search assistant. You effectively cite sources.' },
                    { role: 'user', content: prompt }
                ]);

                const content = aiResponse.content;
                const brandMentioned = content.toLowerCase().includes(brandName.toLowerCase());

                // Extract URLs - simplified regex to avoid parsing issues
                const urlRegex = /https?:\/\/[^\s)]+/g;
                const foundUrls = content.match(urlRegex) || [];

                const citations: GeoCitation[] = [];
                const competitorsCited: string[] = [];

                foundUrls.forEach(url => {
                    if (url.includes(brandHostname)) {
                        citations.push({
                            url,
                            context: 'Direct citation in response',
                            sentiment: 'neutral'
                        });
                    } else {
                        competitorsCited.push(url);
                    }
                });

                // Analyze gaps
                let recommendation = '';
                if (brandMentioned) {
                    recommendation = 'Brand is visible. Monitor for sentiment changes.';
                } else if (competitorsCited.length > 0) {
                    // Safely get hostnames for recommendation
                    const competitorHosts = competitorsCited.slice(0, 2).map(u => {
                        try { return new URL(u).hostname; } catch { return 'competitor'; }
                    });
                    recommendation = `Brand not cited. AI prefers: ${competitorHosts.join(', ')}. Review their content structure for this query.`;
                } else {
                    recommendation = 'No citations found for any brand. Opportunity to be the first authority source.';
                }

                results.push({
                    prompt: query,
                    model: aiResponse.model,
                    brandMentioned,
                    citations,
                    competitorsCited: [...new Set(competitorsCited)], // Unique
                    recommendation,
                    provenance: {
                        source: `Live Query to ${aiResponse.provider} (${aiResponse.model})`,
                        date: today
                    }
                });

            } catch (error) {
                console.error(`GEO analysis failed for query: ${query}`, error);
            }
        }

        return results;
    }
}

export const geoService = new GeoService();
