"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProgrammaticDashboard } from "@/components/ai-suite/ProgrammaticDashboard"
import { AeoDashboard } from "@/components/ai-suite/AeoDashboard"
import { GeoDashboard } from "@/components/ai-suite/GeoDashboard"
import { AiVisibilityDashboard } from "@/components/ai-suite/AiVisibilityDashboard"
import { Sparkles } from "lucide-react"

export default function AiSuitePage() {
    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center gap-2 mb-8">
                <Sparkles className="h-8 w-8 text-indigo-500" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Suite</h1>
                    <p className="text-muted-foreground">
                        Next-generation SEO tools powered by real-world data and AI insights.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="programmatic" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="programmatic">Programmatic SEO</TabsTrigger>
                    <TabsTrigger value="aeo">Answer Engine (AEO)</TabsTrigger>
                    <TabsTrigger value="geo">Generative Engine (GEO)</TabsTrigger>
                    <TabsTrigger value="visibility">AI Visibility</TabsTrigger>
                </TabsList>

                <TabsContent value="programmatic" className="space-y-4">
                    <div className="border rounded-lg p-6 bg-card">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold">Programmatic Pattern Analysis</h2>
                            <p className="text-sm text-muted-foreground">Detect scalable ranking patterns and keyword gaps using GSC data.</p>
                        </div>
                        <ProgrammaticDashboard />
                    </div>
                </TabsContent>

                <TabsContent value="aeo" className="space-y-4">
                    <div className="border rounded-lg p-6 bg-card">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold">Answer Engine Optimization</h2>
                            <p className="text-sm text-muted-foreground">Optimize for Google's Featured Snippets, PAA, and rich results.</p>
                        </div>
                        <AeoDashboard />
                    </div>
                </TabsContent>

                <TabsContent value="geo" className="space-y-4">
                    <div className="border rounded-lg p-6 bg-card">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold">Generative Engine Optimization</h2>
                            <p className="text-sm text-muted-foreground">Analyze how AI models (OpenAI, Gemini) cite your brand.</p>
                        </div>
                        <GeoDashboard />
                    </div>
                </TabsContent>

                <TabsContent value="visibility" className="space-y-4">
                    <div className="border rounded-lg p-6 bg-card">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold">AI Search Visibility</h2>
                            <p className="text-sm text-muted-foreground">Track your Share of Voice across AI and Zero-Click surfaces.</p>
                        </div>
                        <AiVisibilityDashboard />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
