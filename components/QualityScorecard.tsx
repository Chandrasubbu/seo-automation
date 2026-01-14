'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    CheckCircle2,
    AlertTriangle,
    TrendingUp,
    FileText,
    Award,
    Lightbulb
} from 'lucide-react';

interface QualityScore {
    overall_score: number;
    readability_score: number;
    eeat_score: number;
    seo_score: number;
    completeness_score: number;
    grade: string;
    recommendations: string[];
}

export default function QualityScorecard() {
    const [content, setContent] = useState('');
    const [metadata, setMetadata] = useState({
        title: '',
        meta_description: '',
        target_keyword: '',
    });
    const [score, setScore] = useState<QualityScore | null>(null);
    const [loading, setLoading] = useState(false);

    const checkQuality = async () => {
        setLoading(true);

        try {
            const response = await fetch('/api/content-strategy/check-quality', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, metadata }),
            });

            const data = await response.json();
            setScore(data.score);
        } catch (error) {
            console.error('Error checking quality:', error);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getGradeColor = (grade: string) => {
        if (grade === 'A') return 'bg-green-500';
        if (grade === 'B') return 'bg-blue-500';
        if (grade === 'C') return 'bg-yellow-500';
        if (grade === 'D') return 'bg-orange-500';
        return 'bg-red-500';
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Content Quality Scorecard</h1>
                    <p className="text-muted-foreground mt-2">
                        Evaluate content based on E-E-A-T, readability, SEO, and completeness
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Content to Analyze
                            </CardTitle>
                            <CardDescription>
                                Paste your content below (supports Markdown)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                placeholder="# Your Content Here

Start typing or paste your content..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={15}
                                className="font-mono"
                            />
                            <div className="mt-2 text-sm text-muted-foreground">
                                Word count: {content.split(/\s+/).filter(w => w).length}
                            </div>
                        </CardContent>
                    </Card>

                    {score && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lightbulb className="h-5 w-5" />
                                    Recommendations
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {score.recommendations.map((rec, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm">
                                            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <span>{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Metadata</CardTitle>
                            <CardDescription>
                                Provide SEO metadata for better analysis
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    placeholder="Your page title"
                                    value={metadata.title}
                                    onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="meta-desc">Meta Description</Label>
                                <Textarea
                                    id="meta-desc"
                                    placeholder="Your meta description"
                                    value={metadata.meta_description}
                                    onChange={(e) => setMetadata({ ...metadata, meta_description: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="keyword">Target Keyword</Label>
                                <Input
                                    id="keyword"
                                    placeholder="main keyword"
                                    value={metadata.target_keyword}
                                    onChange={(e) => setMetadata({ ...metadata, target_keyword: e.target.value })}
                                />
                            </div>

                            <Button
                                onClick={checkQuality}
                                disabled={!content.trim() || loading}
                                className="w-full"
                            >
                                {loading ? 'Analyzing...' : 'Check Quality'}
                            </Button>
                        </CardContent>
                    </Card>

                    {score && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <Award className="h-5 w-5" />
                                        Overall Score
                                    </span>
                                    <Badge className={getGradeColor(score.grade)}>
                                        Grade {score.grade}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center mb-6">
                                    <div className={`text-5xl font-bold ${getScoreColor(score.overall_score)}`}>
                                        {score.overall_score}
                                    </div>
                                    <div className="text-sm text-muted-foreground">out of 100</div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Readability</span>
                                            <span className={getScoreColor(score.readability_score)}>
                                                {score.readability_score}
                                            </span>
                                        </div>
                                        <Progress value={score.readability_score} className="h-2" />
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>E-E-A-T</span>
                                            <span className={getScoreColor(score.eeat_score)}>
                                                {score.eeat_score}
                                            </span>
                                        </div>
                                        <Progress value={score.eeat_score} className="h-2" />
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>SEO</span>
                                            <span className={getScoreColor(score.seo_score)}>
                                                {score.seo_score}
                                            </span>
                                        </div>
                                        <Progress value={score.seo_score} className="h-2" />
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Completeness</span>
                                            <span className={getScoreColor(score.completeness_score)}>
                                                {score.completeness_score}
                                            </span>
                                        </div>
                                        <Progress value={score.completeness_score} className="h-2" />
                                    </div>
                                </div>

                                <div className="mt-6 p-3 bg-muted rounded-lg">
                                    <p className="text-xs text-muted-foreground">
                                        {score.overall_score >= 80 && "Excellent! Your content meets high quality standards."}
                                        {score.overall_score >= 60 && score.overall_score < 80 && "Good content, but there's room for improvement."}
                                        {score.overall_score < 60 && "Content needs significant improvements to rank well."}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
