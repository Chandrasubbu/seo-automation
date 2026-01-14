'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GapAnalysisReport } from "@/components/competitor/GapAnalysisReport";
import { DashboardCharts } from "@/components/competitor/DashboardCharts";
import { Loader2, Search, BarChart3 } from "lucide-react";

export default function CompetitorAnalysisPage() {
    const [clientUrl, setClientUrl] = useState('');
    const [competitorUrl, setCompetitorUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!clientUrl || !competitorUrl) return;

        setLoading(true);
        setError(null);
        setResults(null);

        try {
            const res = await fetch('/api/competitor-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientUrl,
                    competitorUrls: [competitorUrl]
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || `Error ${res.status}: ${res.statusText}`);
            }

            if (data.success) {
                setResults(data.results);
            } else {
                throw new Error('Analysis failed unexpectedly.');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An unknown error occurred during analysis.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Competitor Intelligence
                </h1>
                <p className="text-lg text-muted-foreground">
                    Compare your technical SEO and content against top competitors to find ranking gaps.
                </p>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center">
                    <Loader2 className="h-5 w-5 mr-2 animate-spin hidden" /> {/* Hidden loader reuse */}
                    <span className="font-semibold mr-2">Error:</span> {error}
                </div>
            )}

            {/* Input Section */}
            <Card className="mb-8 border-none shadow-lg bg-gradient-to-r from-background to-secondary/10">
                <CardHeader>
                    <CardTitle>Analysis Setup</CardTitle>
                    <CardDescription>Enter your URL and a competitor's URL to start the audit.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-4">
                    <Input
                        placeholder="Your Website URL (e.g., https://yoursite.com)"
                        value={clientUrl}
                        onChange={(e) => setClientUrl(e.target.value)}
                        className="flex-1"
                    />
                    <Input
                        placeholder="Competitor URL (e.g., https://competitor.com)"
                        value={competitorUrl}
                        onChange={(e) => setCompetitorUrl(e.target.value)}
                        className="flex-1"
                    />
                    <Button onClick={handleAnalyze} disabled={loading || !clientUrl || !competitorUrl} size="lg">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                        Analyze Gap
                    </Button>
                </CardContent>
            </Card>

            {/* Results Section */}
            {results ? (
                <div className="space-y-8">
                    <GapAnalysisReport results={results} />
                    <DashboardCharts />
                </div>
            ) : (
                /* Empty State / Placeholder */
                <div className="text-center py-20 border-2 border-dashed rounded-xl opacity-50">
                    <BarChart3 className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium">Ready to Analyze</h3>
                    <p>Enter valid URLs above to visualize the SEO gap.</p>
                </div>
            )}
        </div>
    );
}
