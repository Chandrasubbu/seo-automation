'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Search,
    Network,
    CheckCircle2,
    FileText,
    TrendingUp,
    Lightbulb,
    ArrowRight
} from 'lucide-react';

export default function ContentStrategyDashboard() {
    const tools = [
        {
            title: 'User Intent Analyzer',
            description: 'Analyze search queries to determine user intent and optimize content strategy',
            icon: Search,
            href: '/content-strategy/intent-analyzer',
            color: 'bg-blue-500',
            features: [
                'Classify queries by intent type',
                'Get content recommendations',
                'Batch analysis support',
                'Intent distribution insights'
            ]
        },
        {
            title: 'Topic Cluster Builder',
            description: 'Create hub-and-spoke content structures for topical authority',
            icon: Network,
            href: '/content-strategy/cluster-builder',
            color: 'bg-purple-500',
            features: [
                'AI-powered cluster generation',
                'Internal linking strategy',
                'Visual cluster diagrams',
                'Export in multiple formats'
            ]
        },
        {
            title: 'Content Quality Scorecard',
            description: 'Evaluate content based on E-E-A-T, readability, SEO, and completeness',
            icon: CheckCircle2,
            href: '/content-strategy/quality-checker',
            color: 'bg-green-500',
            features: [
                'E-E-A-T assessment',
                'Readability scoring',
                'SEO optimization check',
                'Actionable recommendations'
            ]
        }
    ];

    const stats = [
        { label: 'Content Pieces Analyzed', value: '0', icon: FileText },
        { label: 'Topic Clusters Created', value: '0', icon: Network },
        { label: 'Average Quality Score', value: '-', icon: TrendingUp },
    ];

    return (
        <div className="container mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-4xl font-bold">Content Strategy & Quality</h1>
                <p className="text-xl text-muted-foreground">
                    AI-powered tools for creating valuable, relevant, and engaging content
                </p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <Card key={index}>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                                </div>
                                <stat.icon className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Strategy Overview */}
            <Card className="border-2 border-primary">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Content Strategy Framework
                    </CardTitle>
                    <CardDescription>
                        Our approach focuses on three key pillars for SEO success
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">1. User Intent</h3>
                            <p className="text-sm text-muted-foreground">
                                Understand what users are searching for and create content that matches their needs
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">2. Topical Authority</h3>
                            <p className="text-sm text-muted-foreground">
                                Build comprehensive topic clusters with pillar pages and supporting content
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">3. Content Quality</h3>
                            <p className="text-sm text-muted-foreground">
                                Ensure content meets E-E-A-T standards and provides real value to users
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tools */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Available Tools</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {tools.map((tool, index) => (
                        <Card key={index} className="flex flex-col">
                            <CardHeader>
                                <div className={`w-12 h-12 rounded-lg ${tool.color} flex items-center justify-center mb-4`}>
                                    <tool.icon className="h-6 w-6 text-white" />
                                </div>
                                <CardTitle>{tool.title}</CardTitle>
                                <CardDescription>{tool.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col">
                                <ul className="space-y-2 flex-1">
                                    {tool.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm">
                                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link href={tool.href} className="mt-4">
                                    <Button className="w-full">
                                        Launch Tool
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Quick Start Guide */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Start Guide</CardTitle>
                    <CardDescription>
                        Follow these steps to implement the content strategy
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                                1
                            </div>
                            <div>
                                <h4 className="font-semibold">Analyze User Intent</h4>
                                <p className="text-sm text-muted-foreground">
                                    Start by analyzing your target keywords to understand user intent and content requirements
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                                2
                            </div>
                            <div>
                                <h4 className="font-semibold">Build Topic Clusters</h4>
                                <p className="text-sm text-muted-foreground">
                                    Create pillar pages and cluster content to establish topical authority
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                                3
                            </div>
                            <div>
                                <h4 className="font-semibold">Check Content Quality</h4>
                                <p className="text-sm text-muted-foreground">
                                    Evaluate your content against E-E-A-T principles and SEO best practices
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                                4
                            </div>
                            <div>
                                <h4 className="font-semibold">Optimize & Publish</h4>
                                <p className="text-sm text-muted-foreground">
                                    Implement recommendations, optimize for SEO, and publish your content
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Resources */}
            <Card>
                <CardHeader>
                    <CardTitle>Additional Resources</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                        <Link href="/content-strategy-quality-guide.md">
                            <Button variant="outline" className="w-full justify-start">
                                <FileText className="h-4 w-4 mr-2" />
                                Complete Strategy Guide
                            </Button>
                        </Link>
                        <Button variant="outline" className="w-full justify-start" disabled>
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Performance Analytics (Coming Soon)
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
