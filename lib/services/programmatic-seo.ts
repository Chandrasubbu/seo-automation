import { searchConsoleService } from './search-console';
import { technicalAuditService, TechnicalAuditResult } from './technical-audit';

export interface ProgrammaticOpportunity {
    type: 'gap' | 'cannibalization' | 'template_improvement';
    url?: string;
    pattern?: string;
    keyword?: string;
    currentMetrics?: {
        clicks: number;
        impressions: number;
        position: number;
    };
    potentialTraffic: number;
    confidence: number;
    recommendation: string;
    provenance: {
        source: string;
        date: string;
        dataPoints: any[];
    }
}

export class ProgrammaticSeoService {

    async analyze(domain: string, gscData?: any[]): Promise<ProgrammaticOpportunity[]> {
        const opportunities: ProgrammaticOpportunity[] = [];
        const today = new Date().toISOString().split('T')[0];

        // 1. Get GSC Data (Real World Data)
        // We fetch a broad range to detect patterns
        let analytics = gscData;
        if (!analytics) {
            const endDate = today;
            const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            try {
                analytics = await searchConsoleService.getSearchAnalytics(domain, startDate, endDate, ['query', 'page']);
            } catch (e) {
                console.error('Failed to fetch GSC data', e);
                return [];
            }
        }

        if (!analytics || analytics.length === 0) {
            console.warn('No GSC data available for analysis');
            return [];
        }

        // 2. Data Structure for Analysis
        const urlPatterns = new Map<string, { count: number; metrics: any; examples: string[] }>();
        const queryMap = new Map<string, any[]>();

        analytics.forEach((row: any) => {
            const query = row.keys[0];
            const page = row.keys[1];

            // Group queries
            if (!queryMap.has(query)) queryMap.set(query, []);
            queryMap.get(query)?.push({ page, ...row });

            // Identify URL pattern
            const pattern = this.getPattern(page);
            if (pattern) {
                if (!urlPatterns.has(pattern)) {
                    urlPatterns.set(pattern, {
                        count: 0,
                        metrics: { clicks: 0, impressions: 0 },
                        examples: []
                    });
                }
                const data = urlPatterns.get(pattern)!;
                data.count++;
                data.metrics.clicks += row.clicks;
                data.metrics.impressions += row.impressions;
                if (data.examples.length < 5) data.examples.push(page);
            }
        });

        // 3. Identify Pattern Opportunities
        for (const [pattern, data] of urlPatterns.entries()) {
            // If a pattern has high impressions but low Clicks/CTR compared to others, it might need template improvement
            const ctr = data.metrics.clicks / (data.metrics.impressions || 1);
            if (data.metrics.impressions > 100 && ctr < 0.05) { // Thresholds lower for demo
                opportunities.push({
                    type: 'template_improvement',
                    pattern,
                    potentialTraffic: Math.round(data.metrics.impressions * 0.05), // Goal: 5% CTR
                    confidence: 0.8,
                    recommendation: `Template '${pattern}' has low CTR (${(ctr * 100).toFixed(1)}%). Optimize the template structure based on top performers like ${data.examples[0]}.`,
                    provenance: {
                        source: 'Google Search Console',
                        date: today,
                        dataPoints: [{ metric: 'impressions', value: data.metrics.impressions }, { metric: 'ctr', value: ctr }]
                    }
                });
            }
        }

        // 4. Identify Content Gaps (Simplified)
        // Look for queries that should match a programmatic pattern but land on a generic page
        // Example logic: Query contains "price" but lands on homepage or category root instead of product page
        // This requires understanding the domain structure better, which we infer from patterns.

        // For now, looking for keyword cannibalization as a proxy for gaps/conflicts
        for (const [query, rows] of queryMap.entries()) {
            if (rows.length > 1) {
                // Check if multiple pages are fighting for the same query
                const pages = rows.map((r: any) => r.page);
                // If the impressions are split significantly
                const totalImp = rows.reduce((sum: number, r: any) => sum + r.impressions, 0);
                const significantPages = rows.filter((r: any) => r.impressions > totalImp * 0.2); // Pages with >20% share

                if (significantPages.length > 1) {
                    opportunities.push({
                        type: 'cannibalization',
                        keyword: query,
                        potentialTraffic: Math.round(totalImp * 0.1), // Consolidation gain
                        confidence: 0.9,
                        recommendation: `Keyword '${query}' is cannibalized by ${significantPages.length} pages (e.g., ${significantPages[0].page}). Canonicalize or merge content.`,
                        provenance: {
                            source: 'Google Search Console',
                            date: today,
                            dataPoints: significantPages.map((p: any) => ({ url: p.page, impressions: p.impressions }))
                        }
                    });
                }
            }
        }

        return opportunities;
    }

    // Basic Heuristic for URL Patterns
    private getPattern(url: string): string | null {
        try {
            // Handle relative URLs if they come from GSC as such (usually absolute)
            const u = new URL(url.startsWith('http') ? url : `https://example.com${url.startsWith('/') ? '' : '/'}${url}`);
            const segments = u.pathname.split('/').filter(s => s);
            if (segments.length < 2) return null; // Root or high level

            // Heuristic: Replace numeric IDs or slugs that look like IDs
            const patternSegments = segments.map(s => {
                if (/^\d+$/.test(s)) return '[id]';
                if (s.length > 20 || s.split('-').length > 3) return '[slug]'; // Assume long dashing strings are slugs
                return s;
            });

            return '/' + patternSegments.join('/');
        } catch {
            return null;
        }
    }
}

export const programmaticSeoService = new ProgrammaticSeoService();
