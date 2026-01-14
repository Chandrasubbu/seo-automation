'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Search,
    TrendingUp,
    FileText,
    CheckCircle2,
    AlertCircle,
    Lightbulb,
    BarChart3
} from 'lucide-react';

interface IntentResult {
    query: string;
    primary_intent: string;
    confidence: number;
    intent_scores: Record<string, number>;
    matched_modifiers: string[];
    recommendations: {
        content_type: string;
        format: string;
        elements: string[];
        cta: string;
    };
}

const intentColors: Record<string, string> = {
    informational: 'bg-blue-500',
    navigational: 'bg-purple-500',
    commercial_investigation: 'bg-orange-500',
    transactional: 'bg-green-500',
};

const intentLabels: Record<string, string> = {
    informational: 'Informational',
    navigational: 'Navigational',
    commercial_investigation: 'Commercial Investigation',
    transactional: 'Transactional',
};

export default function IntentAnalyzer() {
    const [queries, setQueries] = useState('');
    const [results, setResults] = useState<IntentResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [distribution, setDistribution] = useState<any>(null);

    const analyzeQueries = async () => {
        setLoading(true);

        // Split queries by newline
        const queryList = queries.split('\n').filter(q => q.trim());

        try {
            const response = await fetch('/api/content-strategy/analyze-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ queries: queryList }),
            });

            const data = await response.json();
            setResults(data.results);
            setDistribution(data.distribution);
        } catch (error) {
            console.error('Error analyzing queries:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">User Intent Analyzer</h1>
                    <p className="text-muted-foreground mt-2">
                        Analyze search queries to determine user intent and optimize your content strategy
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Enter Search Queries
                    </CardTitle>
                    <CardDescription>
                        Enter one query per line. Analyze up to 50 queries at once.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        placeholder="how to make coffee&#10;best coffee maker 2024&#10;buy espresso machine&#10;starbucks login"
                        value={queries}
                        onChange={(e) => setQueries(e.target.value)}
                        rows={8}
                        className="font-mono"
                    />
                    <Button
                        onClick={analyzeQueries}
                        disabled={!queries.trim() || loading}
                        className="w-full"
                    >
                        {loading ? 'Analyzing...' : 'Analyze Intent'}
                    </Button>
                </CardContent>
            </Card>

            {distribution && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Intent Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(distribution.percentages).map(([intent, percentage]) => (
                                <div key={intent} className="text-center p-4 border rounded-lg">
                                    <div className={`w-12 h-12 rounded-full ${intentColors[intent]} mx-auto mb-2 flex items-center justify-center text-white font-bold`}>
                                        {String(percentage)}%
                                    </div>
                                    <p className="text-sm font-medium">{intentLabels[intent]}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {distribution.distribution[intent]} queries
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                            <p className="text-sm">
                                <strong>Dominant Intent:</strong> {intentLabels[distribution.dominant_intent]}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {results.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Analysis Results</h2>

                    {results.map((result, index) => (
                        <Card key={index}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{result.query}</CardTitle>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge className={intentColors[result.primary_intent]}>
                                                {intentLabels[result.primary_intent]}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                                Confidence: {(result.confidence * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="recommendations" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                                        <TabsTrigger value="scores">Intent Scores</TabsTrigger>
                                        <TabsTrigger value="modifiers">Matched Keywords</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="recommendations" className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                                    <FileText className="h-4 w-4" />
                                                    Content Type
                                                </h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {result.recommendations.content_type}
                                                </p>
                                            </div>

                                            <div>
                                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                                    <TrendingUp className="h-4 w-4" />
                                                    Format
                                                </h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {result.recommendations.format}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4" />
                                                Key Elements
                                            </h4>
                                            <ul className="space-y-1">
                                                {result.recommendations.elements.map((element, i) => (
                                                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                                        <span className="text-green-500 mt-0.5">•</span>
                                                        {element}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                                <Lightbulb className="h-4 w-4" />
                                                Call-to-Action
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                {result.recommendations.cta}
                                            </p>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="scores">
                                        <div className="space-y-3">
                                            {Object.entries(result.intent_scores).map(([intent, score]) => (
                                                <div key={intent} className="space-y-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span>{intentLabels[intent]}</span>
                                                        <span className="font-medium">{score}</span>
                                                    </div>
                                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${intentColors[intent]}`}
                                                            style={{ width: `${Math.min(100, score * 20)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="modifiers">
                                        {result.matched_modifiers.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {result.matched_modifiers.map((modifier, i) => (
                                                    <Badge key={i} variant="outline">
                                                        {modifier}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                No specific modifiers detected. Intent determined by heuristics.
                                            </p>
                                        )}
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
