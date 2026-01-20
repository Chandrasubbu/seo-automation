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
        if (!this.auth.email) {
            throw new Error('Google Search Console credentials not configured. Please set GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY in .env');
        }

        try {
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
            throw new Error(`Failed to fetch Google Search Console data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

export const searchConsoleService = new SearchConsoleService();
