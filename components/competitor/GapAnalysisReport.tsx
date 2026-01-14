'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, TrendingUp, BookOpen } from "lucide-react";

interface GapAnalysisProps {
    results: {
        client: { url: string; wordCount: number; h1: string[] };
        competitors: { url: string; wordCount: number; h1: string[] }[];
        gaps: {
            contentLengthGap: number;
        };
        recommendations: string[];
    };
}

export function GapAnalysisReport({ results }: GapAnalysisProps) {
    const avgCompetitorWords = results.competitors.reduce((acc, c) => acc + c.wordCount, 0) / results.competitors.length;
    const wordCountDiff = results.client.wordCount - avgCompetitorWords;
    const isContentShort = wordCountDiff < 0;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-100 dark:border-blue-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Your Word Count</CardTitle>
                        <BookOpen className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{results.client.wordCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {isContentShort ? (
                                <span className="text-red-500 flex items-center">
                                    <TrendingUp className="h-3 w-3 mr-1 rotate-180" /> {Math.abs(Math.round(wordCountDiff))} less than avg
                                </span>
                            ) : (
                                <span className="text-green-500 flex items-center">
                                    <TrendingUp className="h-3 w-3 mr-1" /> {Math.round(wordCountDiff)} more than avg
                                </span>
                            )}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-100 dark:border-purple-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Headings Health</CardTitle>
                        <AlertTriangle className={`h-4 w-4 ${results.client.h1.length === 1 ? 'text-green-500' : 'text-amber-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{results.client.h1.length === 1 ? 'Optimal' : results.client.h1.length + ' H1 Tags'}</div>
                        <p className="text-xs text-muted-foreground">
                            {results.client.h1.length === 0 ? 'Missing H1 tag' : results.client.h1.length > 1 ? 'Multiple H1 tags found' : 'Perfect structure'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recommendations & Headings Comparison */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            Actionable Recommendations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            {results.recommendations.map((rec, i) => (
                                <li key={i} className="flex gap-3 items-start p-3 rounded-lg bg-accent/50">
                                    <div className="mt-1 min-w-[20px] h-5 w-5 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                                        {i + 1}
                                    </div>
                                    <span className="text-sm leading-relaxed">{rec}</span>
                                </li>
                            ))}
                            {results.recommendations.length === 0 && (
                                <li className="text-muted-foreground text-sm italic">Great job! No critical issues found comparing to competitors.</li>
                            )}
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Heading Structure Gap</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Your H1</h4>
                            {results.client.h1.length > 0 ? (
                                results.client.h1.map((h, i) => <Badge key={i} variant="outline" className="mr-2 mb-2 p-2 text-base">{h}</Badge>)
                            ) : <span className="text-red-500 text-sm">Missing</span>}
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Competitor H1s</h4>
                            <div className="flex flex-wrap gap-2">
                                {results.competitors.flatMap(c => c.h1).map((h, i) => (
                                    <Badge key={i} variant="secondary" className="p-2">{h}</Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
