"use client"

import { useState } from "react"
import {
    AlertTriangle,
    CheckCircle,
    Info,
    Lightbulb,
    RefreshCw,
    Sparkles,
    FileText,
    Target,
    BookOpen,
    Link2,
    Image,
    Copy,
    Check,
} from "lucide-react"

interface ContentAuditResult {
    score: number
    issues: {
        type: "error" | "warning" | "info"
        category: string
        message: string
        location?: string
        fix?: string
    }[]
    suggestions: {
        category: string
        priority: "high" | "medium" | "low"
        suggestion: string
        impact: string
    }[]
    seoAnalysis: {
        titleScore: number
        metaDescriptionScore: number
        headingStructure: number
        keywordDensity: number
        internalLinks: number
        imageOptimization: number
    }
    readabilityAnalysis: {
        fleschScore: number
        avgSentenceLength: number
        avgWordLength: number
        paragraphCount: number
        readingTime: number
    }
    aiSuggestions?: string[]
}

export function ContentAuditor() {
    const [content, setContent] = useState("")
    const [title, setTitle] = useState("")
    const [metaDescription, setMetaDescription] = useState("")
    const [targetKeyword, setTargetKeyword] = useState("")
    const [includeAI, setIncludeAI] = useState(true)
    const [result, setResult] = useState<ContentAuditResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [copied, setCopied] = useState(false)

    const handleAudit = async () => {
        if (!content.trim()) {
            setError("Please enter content to audit")
            return
        }

        setLoading(true)
        setError("")
        setResult(null)

        try {
            const res = await fetch("/api/content/audit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content,
                    title,
                    metaDescription,
                    targetKeyword,
                    includeAISuggestions: includeAI,
                }),
            })

            if (!res.ok) throw new Error("Failed to audit content")

            const data = await res.json()
            setResult(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    const handleCopyReport = async () => {
        if (!result) return

        const report = `
Content Audit Report
====================
Overall Score: ${result.score}/100

SEO Analysis:
- Title: ${result.seoAnalysis.titleScore}/100
- Meta Description: ${result.seoAnalysis.metaDescriptionScore}/100
- Heading Structure: ${result.seoAnalysis.headingStructure}/100
- Keyword Density: ${result.seoAnalysis.keywordDensity}/100
- Internal Links: ${result.seoAnalysis.internalLinks}/100
- Image Optimization: ${result.seoAnalysis.imageOptimization}/100

Readability:
- Flesch Score: ${result.readabilityAnalysis.fleschScore}
- Avg Sentence Length: ${result.readabilityAnalysis.avgSentenceLength} words
- Reading Time: ${result.readabilityAnalysis.readingTime} min

Issues Found:
${result.issues.map((i) => `- [${i.type.toUpperCase()}] ${i.category}: ${i.message}`).join("\n")}

Suggestions:
${result.suggestions.map((s) => `- [${s.priority.toUpperCase()}] ${s.suggestion}`).join("\n")}
${result.aiSuggestions ? `\nAI Suggestions:\n${result.aiSuggestions.map((s) => `- ${s}`).join("\n")}` : ""}
    `.trim()

        await navigator.clipboard.writeText(report)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-400"
        if (score >= 60) return "text-yellow-400"
        if (score >= 40) return "text-orange-400"
        return "text-red-400"
    }

    const getScoreBg = (score: number) => {
        if (score >= 80) return "from-green-500 to-emerald-500"
        if (score >= 60) return "from-yellow-500 to-amber-500"
        if (score >= 40) return "from-orange-500 to-amber-600"
        return "from-red-500 to-rose-500"
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Content Auditor</h1>
                    <p className="text-gray-400 mt-1">
                        Analyze your content for SEO optimization and readability
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Input Section */}
                    <div className="space-y-6">
                        {/* Content Input */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Content to Audit
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full h-48 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none"
                                placeholder="Paste your content here (supports markdown)..."
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                {content.split(/\s+/).filter((w) => w.length > 0).length} words
                            </p>
                        </div>

                        {/* Metadata Inputs */}
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Page Title (H1)
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                                    placeholder="Your page title..."
                                />
                                <p className="mt-1 text-xs text-gray-500">{title.length}/60 characters</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Meta Description
                                </label>
                                <textarea
                                    value={metaDescription}
                                    onChange={(e) => setMetaDescription(e.target.value)}
                                    className="w-full h-20 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none"
                                    placeholder="Your meta description..."
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    {metaDescription.length}/160 characters
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Target Keyword
                                </label>
                                <input
                                    type="text"
                                    value={targetKeyword}
                                    onChange={(e) => setTargetKeyword(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                                    placeholder="e.g., content marketing strategy"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="includeAI"
                                    checked={includeAI}
                                    onChange={(e) => setIncludeAI(e.target.checked)}
                                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500"
                                />
                                <label htmlFor="includeAI" className="text-sm text-gray-300">
                                    Include AI-powered suggestions
                                </label>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
                                {error}
                            </div>
                        )}

                        {/* Audit Button */}
                        <button
                            onClick={handleAudit}
                            disabled={loading || !content.trim()}
                            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Run Content Audit
                                </>
                            )}
                        </button>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                        {result ? (
                            <>
                                {/* Score Card */}
                                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-white">Overall Score</h3>
                                        <button
                                            onClick={handleCopyReport}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg text-gray-300 hover:bg-white/20 transition text-sm"
                                        >
                                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            {copied ? "Copied!" : "Copy Report"}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div
                                            className={`text-6xl font-bold bg-gradient-to-r ${getScoreBg(result.score)} bg-clip-text text-transparent`}
                                        >
                                            {result.score}
                                        </div>
                                        <div className="flex-1">
                                            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${getScoreBg(result.score)} transition-all duration-500`}
                                                    style={{ width: `${result.score}%` }}
                                                />
                                            </div>
                                            <p className="text-gray-400 text-sm mt-2">
                                                {result.score >= 80
                                                    ? "Excellent! Your content is well-optimized."
                                                    : result.score >= 60
                                                        ? "Good, but there's room for improvement."
                                                        : result.score >= 40
                                                            ? "Needs work. Review the issues below."
                                                            : "Critical issues found. Major improvements needed."}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* SEO Analysis */}
                                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                                    <h3 className="text-lg font-semibold text-white mb-4">SEO Analysis</h3>
                                    <div className="space-y-3">
                                        {[
                                            { label: "Title", value: result.seoAnalysis.titleScore, icon: FileText },
                                            { label: "Meta Description", value: result.seoAnalysis.metaDescriptionScore, icon: FileText },
                                            { label: "Heading Structure", value: result.seoAnalysis.headingStructure, icon: BookOpen },
                                            { label: "Keyword Density", value: result.seoAnalysis.keywordDensity, icon: Target },
                                            { label: "Internal Links", value: result.seoAnalysis.internalLinks, icon: Link2 },
                                            { label: "Image Optimization", value: result.seoAnalysis.imageOptimization, icon: Image },
                                        ].map((item) => (
                                            <div key={item.label} className="flex items-center gap-3">
                                                <item.icon className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-300 text-sm flex-1">{item.label}</span>
                                                <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full bg-gradient-to-r ${getScoreBg(item.value)}`}
                                                        style={{ width: `${item.value}%` }}
                                                    />
                                                </div>
                                                <span className={`text-sm font-medium w-10 text-right ${getScoreColor(item.value)}`}>
                                                    {item.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Readability */}
                                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                                    <h3 className="text-lg font-semibold text-white mb-4">Readability</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 rounded-lg p-4">
                                            <p className="text-gray-400 text-xs">Flesch Score</p>
                                            <p className={`text-2xl font-bold ${getScoreColor(result.readabilityAnalysis.fleschScore)}`}>
                                                {result.readabilityAnalysis.fleschScore}
                                            </p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-4">
                                            <p className="text-gray-400 text-xs">Reading Time</p>
                                            <p className="text-2xl font-bold text-white">
                                                {result.readabilityAnalysis.readingTime} min
                                            </p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-4">
                                            <p className="text-gray-400 text-xs">Avg Sentence Length</p>
                                            <p className="text-2xl font-bold text-white">
                                                {result.readabilityAnalysis.avgSentenceLength}
                                            </p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-4">
                                            <p className="text-gray-400 text-xs">Paragraphs</p>
                                            <p className="text-2xl font-bold text-white">
                                                {result.readabilityAnalysis.paragraphCount}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Issues */}
                                {result.issues.length > 0 && (
                                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                                        <h3 className="text-lg font-semibold text-white mb-4">Issues Found</h3>
                                        <div className="space-y-3">
                                            {result.issues.map((issue, index) => (
                                                <div
                                                    key={index}
                                                    className={`p-4 rounded-lg border ${issue.type === "error"
                                                            ? "bg-red-500/10 border-red-500/30"
                                                            : issue.type === "warning"
                                                                ? "bg-yellow-500/10 border-yellow-500/30"
                                                                : "bg-blue-500/10 border-blue-500/30"
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        {issue.type === "error" ? (
                                                            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                                                        ) : issue.type === "warning" ? (
                                                            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                                                        ) : (
                                                            <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                                                        )}
                                                        <div className="flex-1">
                                                            <p className="text-white font-medium">{issue.category}</p>
                                                            <p className="text-gray-300 text-sm mt-1">{issue.message}</p>
                                                            {issue.fix && (
                                                                <p className="text-gray-400 text-sm mt-2">
                                                                    <span className="text-green-400">Fix:</span> {issue.fix}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* AI Suggestions */}
                                {result.aiSuggestions && result.aiSuggestions.length > 0 && (
                                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-purple-400" />
                                            AI Suggestions
                                        </h3>
                                        <div className="space-y-3">
                                            {result.aiSuggestions.map((suggestion, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-start gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30"
                                                >
                                                    <Lightbulb className="w-5 h-5 text-purple-400 mt-0.5" />
                                                    <p className="text-gray-300 text-sm">{suggestion}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center">
                                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">No Audit Results Yet</h3>
                                <p className="text-gray-400">
                                    Enter your content and click &quot;Run Content Audit&quot; to analyze
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
