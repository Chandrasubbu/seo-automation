import { geoService } from './geo-service';
import { serpService } from '../serp-service';

export interface VisibilityMetrics {
    entity: string;
    platform: 'ai_chat' | 'search_ai' | 'traditional_serp';
    shareOfVoice: number; // 0 to 100
    mentions: number;
    totalProbes: number;
    citationConsistency: number; // 0 to 100
    trend: 'up' | 'down' | 'stable';
    provenance: {
        source: string;
        lastUpdated: string;
    };
}

export class AiVisibilityService {

    async trackVisibility(entity: string, domain: string, topics: string[]): Promise<VisibilityMetrics[]> {
        const today = new Date().toISOString().split('T')[0];
        const metrics: VisibilityMetrics[] = [];

        // 1. AI Chat Visibility (via GeoService)
        // We probe with 3 questions per topic
        let totalChatProbes = 0;
        let chatMentions = 0;

        for (const topic of topics) {
            const queries = [
                `What is the best ${topic}?`,
                `Who are the leaders in ${topic}?`,
                `Review of ${topic} providers`
            ];

            const geoResults = await geoService.analyze(entity, domain, queries);
            totalChatProbes += queries.length;
            chatMentions += geoResults.filter(r => r.brandMentioned || r.citations.some(c => c.url.includes(domain))).length;
        }

        metrics.push({
            entity,
            platform: 'ai_chat',
            shareOfVoice: totalChatProbes > 0 ? (chatMentions / totalChatProbes) * 100 : 0,
            mentions: chatMentions,
            totalProbes: totalChatProbes,
            citationConsistency: 80, // detailed text analysis needed for real score
            trend: 'stable',
            provenance: {
                source: 'Aggregated LLM Probes (OpenAI/Anthropic)',
                lastUpdated: today
            }
        });

        // 2. Search AI / SERP Visibility
        // We check for "AI Overviews" (if supported) or Featured Snippets as zero-click proxy
        let totalSearchProbes = 0;
        let searchMentions = 0;

        for (const topic of topics) {
            const query = `${topic} definition`; // Intent that triggers features
            try {
                const serp = await serpService.analyze(query);
                totalSearchProbes++;

                // Check features
                const hasSnippet = serp.features.some(f =>
                    (f.type === 'featured_snippet' || f.type === 'answer_box') &&
                    (JSON.stringify(f.data).includes(domain))
                );

                // In future: Check for "AI Overview" specific feature type if API supports it
                if (hasSnippet) searchMentions++;

            } catch (e) {
                console.error(`SERP check failed for ${topic}`);
            }
        }

        metrics.push({
            entity,
            platform: 'search_ai', // Using Featured Snippet as proxy for Zero-Click/AI Visibility
            shareOfVoice: totalSearchProbes > 0 ? (searchMentions / totalSearchProbes) * 100 : 0,
            mentions: searchMentions,
            totalProbes: totalSearchProbes,
            citationConsistency: 100,
            trend: 'stable',
            provenance: {
                source: 'Google SERP Features',
                lastUpdated: today
            }
        });

        return metrics;
    }
}

export const aiVisibilityService = new AiVisibilityService();
