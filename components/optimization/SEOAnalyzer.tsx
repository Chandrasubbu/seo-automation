"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SuggestionCard } from "@/components/optimization/SuggestionCard"
import { AlertCircle, CheckCircle, Search } from "lucide-react"

export default function SEOAnalyzer() {
    const [content, setContent] = useState("")
    const [keyword, setKeyword] = useState("")
    const [analyzing, setAnalyzing] = useState(false)
    const [results, setResults] = useState<any>(null)

    const handleAnalyze = async () => {
        if (!content || !keyword) return

        setAnalyzing(true)
        setResults(null)

        try {
            const res = await fetch("/api/optimization/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, targetKeyword: keyword }),
            })
            const data = await res.json()
            if (res.ok) {
                setResults(data)
            } else {
                console.error("Analysis failed", data.error)
            }
        } catch (error) {
            console.error("Error", error)
        } finally {
            setAnalyzing(false)
        }
    }

    const handleApplyFix = async (suggestionId: string) => {
        // Find suggestion info
        const suggestion = results.suggestions.find((s: any) => s.id === suggestionId)
        if (!suggestion) return

        try {
            const res = await fetch("/api/optimization/fix", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content,
                    suggestionId,
                    instruction: suggestion.fixPrediction
                }),
            })
            const data = await res.json()
            if (data.success && data.updatedContent) {
                setContent(data.updatedContent) // Update main editor
            }
        } catch (error) {
            console.error("Fix failed", error)
            throw error // Re-throw so card knows it failed
        }
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
                {/* Left Column: Input */}
                <div className="md:col-span-2 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Content Editor</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Target Keyword</label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="e.g. digital marketing"
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                    />
                                    <Button onClick={handleAnalyze} disabled={analyzing}>
                                        {analyzing ? "Analyzing..." : "Analyze"}
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Content</label>
                                <Textarea
                                    placeholder="Paste your content here..."
                                    className="min-h-[400px] font-mono text-sm leading-relaxed"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Analysis Results */}
                <div className="space-y-4">
                    {results ? (
                        <>
                            {/* Score Card */}
                            <Card>
                                <CardContent className="pt-6 text-center">
                                    <div className="relative inline-flex items-center justify-center">
                                        <svg className="w-32 h-32 transform -rotate-90">
                                            <circle cx="64" cy="64" r="56" stroke="#e2e8f0" strokeWidth="12" fill="none" />
                                            <circle
                                                cx="64" cy="64" r="56"
                                                stroke={results.score > 80 ? "#22c55e" : results.score > 50 ? "#eab308" : "#ef4444"}
                                                strokeWidth="12"
                                                fill="none"
                                                strokeDasharray={351}
                                                strokeDashoffset={351 - (351 * results.score) / 100}
                                                className="transition-all duration-1000 ease-out"
                                            />
                                        </svg>
                                        <span className="absolute text-3xl font-bold">{results.score}</span>
                                    </div>
                                    <p className="mt-2 font-medium text-muted-foreground">SEO Score</p>

                                    <div className="grid grid-cols-2 gap-2 mt-4 text-left text-sm">
                                        <div className="flex items-center gap-2">
                                            {results.details.title ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                                            <span>Title</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {results.details.headings ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                                            <span>Headings</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {results.details.length > 300 ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                                            <span>Length</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span>Readability</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Suggestions List */}
                            <div className="space-y-3">
                                <h3 className="font-semibold px-1">Suggestions ({results.suggestions.length})</h3>
                                {results.suggestions.length === 0 && (
                                    <p className="text-sm text-muted-foreground px-1">No issues found. Good job!</p>
                                )}
                                {results.suggestions.map((suggestion: any) => (
                                    <SuggestionCard
                                        key={suggestion.id}
                                        suggestion={suggestion}
                                        onFix={handleApplyFix}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <Card>
                            <CardContent className="pt-6 text-center text-muted-foreground">
                                <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>Enter content and keywords to see analysis</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
