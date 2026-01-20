"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Bot, Link as LinkIcon } from "lucide-react"

export function GeoDashboard() {
    const [brandName, setBrandName] = useState("")
    const [brandUrl, setBrandUrl] = useState("")
    const [queries, setQueries] = useState("")
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<any[]>([])

    const handleAnalyze = async () => {
        if (!brandName || !queries) return
        setLoading(true)
        try {
            const queryList = queries.split('\n').filter(q => q.trim())
            const res = await fetch("/api/ai-suite/geo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ brandName, brandUrl, queries: queryList }),
            })
            const data = await res.json()
            if (data.success) {
                setResults(data.data.map((r: any) => ({
                    ...r.recommendations, // recommendation text and competitors
                    ...r, // prompt, model, citations
                    citations: r.citations // ensure citations are available
                })))
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                    <Input
                        placeholder="Brand Name (e.g. Acme Corp)"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                    />
                    <Input
                        placeholder="Brand URL (e.g. acme.com)"
                        value={brandUrl}
                        onChange={(e) => setBrandUrl(e.target.value)}
                    />
                    <Textarea
                        placeholder="Enter target queries (one per line)"
                        value={queries}
                        onChange={(e) => setQueries(e.target.value)}
                        rows={5}
                    />
                    <Button onClick={handleAnalyze} disabled={loading} className="w-full">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                        Analyze AI Responses
                    </Button>
                </div>

                <div className="space-y-4 h-[400px] overflow-y-auto pr-2">
                    {results.map((r, i) => (
                        <Card key={i} className="border-l-4 border-emerald-500">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between">
                                    <Badge variant="outline">{r.aiModel}</Badge>
                                    <span className="text-xs text-muted-foreground">{r.provenance.date}</span>
                                </div>
                                <CardTitle className="text-md mt-2">"{r.prompt}"</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm font-medium mb-2">{r.text || r.recommendations?.text}</p>

                                {r.citations && r.citations.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        <p className="text-xs text-muted-foreground font-semibold">Citations Found:</p>
                                        {r.citations.map((c: any, j: number) => (
                                            <div key={j} className="flex items-center gap-2 text-xs bg-muted p-2 rounded">
                                                <LinkIcon className="w-3 h-3" />
                                                <span className="truncate max-w-[200px]">{c.url}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                    {results.length === 0 && !loading && (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            Results will appear here
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
