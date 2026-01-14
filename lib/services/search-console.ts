import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

export class SearchConsoleService {
    private auth: JWT;

    constructor() {
        // Check if credentials exist
        if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
            console.warn('Google Search Console credentials not found in environment variables');
        }

        this.auth = new google.auth.JWT({
            email: process.env.GOOGLE_CLIENT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
        });
    }

    async getSearchAnalytics(siteUrl: string, startDate: string, endDate: string, dimensions: string[] = ['date']) {
        try {
            if (!this.auth.email) {
                // Return mock data if no credentials
                console.log('Returning mock GSC data (no credentials provided)');
                return this.getMockData(dimensions, startDate, endDate);
            }

            const searchconsole = google.searchconsole({ version: 'v1', auth: this.auth });

            const response = await searchconsole.searchanalytics.query({
                siteUrl: siteUrl,
                requestBody: {
                    startDate,
                    endDate,
                    dimensions,
                    rowLimit: 1000,
                },
            });

            return response.data.rows || [];
        } catch (error) {
            console.error('Error fetching GSC data:', error);
            // Fallback to mock data on error for demo purposes, or rethrow
            // throw error; 
            return this.getMockData(dimensions, startDate, endDate);
        }
    }

    // Helper to generate mock data for development/demo
    private getMockData(dimensions: string[], startDate: string, endDate: string) {
        const days = 30;
        const rows = [];

        // Simple mock data generator
        if (dimensions.includes('date')) {
            const start = new Date(startDate);
            // Just generate random data for the range
            for (let i = 0; i < days; i++) {
                const date = new Date(start);
                date.setDate(date.getDate() + i);
                rows.push({
                    keys: [date.toISOString().split('T')[0]],
                    clicks: Math.floor(Math.random() * 100) + 10,
                    impressions: Math.floor(Math.random() * 1000) + 100,
                    ctr: Math.random() * 0.1,
                    position: Math.random() * 20 + 1,
                });
            }
        } else if (dimensions.includes('page')) {
            const pages = ['/blog/seo-guide', '/blog/content-marketing', '/features', '/pricing', '/'];
            return pages.map(page => ({
                keys: [page],
                clicks: Math.floor(Math.random() * 500),
                impressions: Math.floor(Math.random() * 5000),
                ctr: Math.random() * 0.1,
                position: Math.random() * 30 + 1,
            }));
        } else if (dimensions.includes('query')) {
            const queries = ['seo automation', 'ai content generator', 'keyword research tool', 'seo audit', 'content strategy'];
            return queries.map(q => ({
                keys: [q],
                clicks: Math.floor(Math.random() * 200),
                impressions: Math.floor(Math.random() * 2000),
                ctr: Math.random() * 0.15,
                position: Math.random() * 10 + 1,
            }));
        }

        return rows;
    }
}

export const searchConsoleService = new SearchConsoleService();
