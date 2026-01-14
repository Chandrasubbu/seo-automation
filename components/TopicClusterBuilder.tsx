'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Network,
    Plus,
    Download,
    FileJson,
    FileText,
    Trash2,
    Link as LinkIcon
} from 'lucide-react';

interface ClusterContent {
    title: string;
    target_keyword: string;
    search_volume: number;
    difficulty: string;
    word_count: number;
    url_slug: string;
}

interface PillarPage {
    title: string;
    target_keyword: string;
    description: string;
    word_count: number;
    url_slug: string;
    clusters: ClusterContent[];
}

export default function TopicClusterBuilder() {
    const [pillar, setPillar] = useState<PillarPage>({
        title: '',
        target_keyword: '',
        description: '',
        word_count: 3000,
        url_slug: '',
        clusters: [],
    });

    const [newCluster, setNewCluster] = useState<ClusterContent>({
        title: '',
        target_keyword: '',
        search_volume: 0,
        difficulty: 'medium',
        word_count: 1500,
        url_slug: '',
    });

    const [analysis, setAnalysis] = useState<any>(null);
    const [linkingStrategy, setLinkingStrategy] = useState<any>(null);

    const generateClusterIdeas = async () => {
        if (!pillar.target_keyword) return;

        try {
            const response = await fetch('/api/content-strategy/generate-clusters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pillar_topic: pillar.target_keyword,
                    template_type: 'guide',
                    count: 12
                }),
            });

            const data = await response.json();
            const generatedClusters = data.ideas.map((idea: string, index: number) => ({
                title: idea,
                target_keyword: idea.toLowerCase(),
                search_volume: 1000 + index * 100,
                difficulty: 'medium',
                word_count: 1500,
                url_slug: idea.toLowerCase().replace(/\s+/g, '-'),
            }));

            setPillar({ ...pillar, clusters: generatedClusters });
        } catch (error) {
            console.error('Error generating clusters:', error);
        }
    };

    const addCluster = () => {
        if (!newCluster.title) return;

        const cluster = {
            ...newCluster,
            url_slug: newCluster.url_slug || newCluster.title.toLowerCase().replace(/\s+/g, '-'),
        };

        setPillar({
            ...pillar,
            clusters: [...pillar.clusters, cluster],
        });

        setNewCluster({
            title: '',
            target_keyword: '',
            search_volume: 0,
            difficulty: 'medium',
            word_count: 1500,
            url_slug: '',
        });
    };

    const removeCluster = (index: number) => {
        setPillar({
            ...pillar,
            clusters: pillar.clusters.filter((_, i) => i !== index),
        });
    };

    const analyzeCluster = async () => {
        try {
            const response = await fetch('/api/content-strategy/analyze-cluster', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pillar }),
            });

            const data = await response.json();
            setAnalysis(data.analysis);
            setLinkingStrategy(data.linking_strategy);
        } catch (error) {
            console.error('Error analyzing cluster:', error);
        }
    };

    const exportCluster = async (format: string) => {
        try {
            const response = await fetch('/api/content-strategy/export-cluster', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pillar, format }),
            });

            const data = await response.json();

            // Download file
            const blob = new Blob([data.content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `topic-cluster-${pillar.url_slug || 'export'}.${format === 'json' ? 'json' : 'md'}`;
            a.click();
        } catch (error) {
            console.error('Error exporting cluster:', error);
        }
    };

    const difficultyColors: Record<string, string> = {
        low: 'bg-green-500',
        medium: 'bg-yellow-500',
        high: 'bg-red-500',
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Topic Cluster Builder</h1>
                    <p className="text-muted-foreground mt-2">
                        Create hub-and-spoke content structures for topical authority
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Network className="h-5 w-5" />
                        Pillar Page Configuration
                    </CardTitle>
                    <CardDescription>
                        Define your main pillar page that will serve as the hub for cluster content
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="pillar-title">Pillar Page Title</Label>
                            <Input
                                id="pillar-title"
                                placeholder="Complete Guide to Email Marketing"
                                value={pillar.title}
                                onChange={(e) => setPillar({ ...pillar, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pillar-keyword">Target Keyword</Label>
                            <Input
                                id="pillar-keyword"
                                placeholder="email marketing"
                                value={pillar.target_keyword}
                                onChange={(e) => setPillar({ ...pillar, target_keyword: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="pillar-description">Description</Label>
                        <Textarea
                            id="pillar-description"
                            placeholder="Comprehensive guide covering all aspects of email marketing..."
                            value={pillar.description}
                            onChange={(e) => setPillar({ ...pillar, description: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="pillar-wordcount">Target Word Count</Label>
                            <Input
                                id="pillar-wordcount"
                                type="number"
                                value={pillar.word_count}
                                onChange={(e) => setPillar({ ...pillar, word_count: parseInt(e.target.value) })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pillar-slug">URL Slug</Label>
                            <Input
                                id="pillar-slug"
                                placeholder="email-marketing-guide"
                                value={pillar.url_slug}
                                onChange={(e) => setPillar({ ...pillar, url_slug: e.target.value })}
                            />
                        </div>
                    </div>

                    <Button onClick={generateClusterIdeas} className="w-full">
                        Generate Cluster Ideas with AI
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Add Cluster Content
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="cluster-title">Cluster Title</Label>
                            <Input
                                id="cluster-title"
                                placeholder="How to Build an Email List"
                                value={newCluster.title}
                                onChange={(e) => setNewCluster({ ...newCluster, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cluster-keyword">Target Keyword</Label>
                            <Input
                                id="cluster-keyword"
                                placeholder="email list building"
                                value={newCluster.target_keyword}
                                onChange={(e) => setNewCluster({ ...newCluster, target_keyword: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="cluster-volume">Search Volume</Label>
                            <Input
                                id="cluster-volume"
                                type="number"
                                value={newCluster.search_volume}
                                onChange={(e) => setNewCluster({ ...newCluster, search_volume: parseInt(e.target.value) })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cluster-difficulty">Difficulty</Label>
                            <select
                                id="cluster-difficulty"
                                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                value={newCluster.difficulty}
                                onChange={(e) => setNewCluster({ ...newCluster, difficulty: e.target.value })}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cluster-wordcount">Word Count</Label>
                            <Input
                                id="cluster-wordcount"
                                type="number"
                                value={newCluster.word_count}
                                onChange={(e) => setNewCluster({ ...newCluster, word_count: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    <Button onClick={addCluster} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Cluster
                    </Button>
                </CardContent>
            </Card>

            {pillar.clusters.length > 0 && (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle>Cluster Content ({pillar.clusters.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {pillar.clusters.map((cluster, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex-1">
                                            <h4 className="font-medium">{cluster.title}</h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-sm text-muted-foreground">
                                                    {cluster.target_keyword}
                                                </span>
                                                <Badge className={difficultyColors[cluster.difficulty]}>
                                                    {cluster.difficulty}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {cluster.search_volume} searches/mo
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {cluster.word_count} words
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeCluster(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2 mt-4">
                                <Button onClick={analyzeCluster} className="flex-1">
                                    Analyze Cluster
                                </Button>
                                <Button onClick={() => exportCluster('json')} variant="outline">
                                    <FileJson className="h-4 w-4 mr-2" />
                                    Export JSON
                                </Button>
                                <Button onClick={() => exportCluster('markdown')} variant="outline">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Export MD
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {analysis && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Cluster Analysis</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="overview">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="overview">Overview</TabsTrigger>
                                        <TabsTrigger value="linking">Internal Linking</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="overview" className="space-y-4">
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div className="p-4 border rounded-lg">
                                                <p className="text-sm text-muted-foreground">Total Clusters</p>
                                                <p className="text-2xl font-bold">{analysis.total_clusters}</p>
                                            </div>
                                            <div className="p-4 border rounded-lg">
                                                <p className="text-sm text-muted-foreground">Total Words</p>
                                                <p className="text-2xl font-bold">{analysis.total_word_count.toLocaleString()}</p>
                                            </div>
                                            <div className="p-4 border rounded-lg">
                                                <p className="text-sm text-muted-foreground">Completeness</p>
                                                <p className="text-2xl font-bold">{analysis.completeness_score}%</p>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold mb-2">Recommendations</h4>
                                            <ul className="space-y-1">
                                                {analysis.recommendations.map((rec: string, i: number) => (
                                                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                                        <span className="text-blue-500 mt-0.5">•</span>
                                                        {rec}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="linking" className="space-y-4">
                                        {linkingStrategy && (
                                            <>
                                                <div>
                                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                                        <LinkIcon className="h-4 w-4" />
                                                        Pillar to Clusters ({linkingStrategy.pillar_to_clusters.length} links)
                                                    </h4>
                                                    <div className="text-sm text-muted-foreground">
                                                        Link from pillar page to all cluster content pieces
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                                        <LinkIcon className="h-4 w-4" />
                                                        Clusters to Pillar ({linkingStrategy.clusters_to_pillar.length} links)
                                                    </h4>
                                                    <div className="text-sm text-muted-foreground">
                                                        Each cluster links back to the main pillar page
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                                        <LinkIcon className="h-4 w-4" />
                                                        Cluster to Cluster ({linkingStrategy.cluster_to_cluster.length} links)
                                                    </h4>
                                                    <div className="text-sm text-muted-foreground">
                                                        Related clusters link to each other
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
