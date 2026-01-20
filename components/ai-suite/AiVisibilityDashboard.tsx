"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, BarChart, Eye } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function AiVisibilityDashboard() {
    const [entity, setEntity] = useState("")
    const [domain, setDomain] = useState("")
    const [topics, setTopics] = useState("")
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<any[]>([])

    const handleTrack = async () => {
        if (!entity || !topics) return
        setLoading(true)
        try {
            const topicList = topics.split('\n').filter(t => t.trim())
            const res = await fetch("/api/ai-suite/visibility", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ entity, domain, topics: topicList }),
            })
            const data = await res.json()
            if (data.success) {
                setResults(data.data)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex gap-4 items-end flex-wrap">
                <div className="space-y-2 w-full md:w-auto flex-1">
                    <label className="text-sm font-medium">Entity / Brand</label>
                    <Input
                        placeholder="Brand Name"
                        value={entity}
                        onChange={(e) => setEntity(e.target.value)}
                    />
                </div>
                <div className="space-y-2 w-full md:w-auto flex-1">
                    <label className="text-sm font-medium">Domain</label>
                    <Input
                        placeholder="example.com"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Topics (one per line)</label>
                <Textarea
                    placeholder="Enter topics to track visibility for..."
                    value={topics}
                    onChange={(e) => setTopics(e.target.value)}
                    rows={3}
                />
            </div>
            <Button onClick={handleTrack} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BarChart className="mr-2 h-4 w-4" />}
                Track Visibility
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.map((r, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg">{r.platform === 'ai_chat' ? 'AI Chat Models' : 'Search AI Features'}</CardTitle>
                                <Badge variant={r.shareOfVoice > 50 ? 'default' : 'secondary'}>
                                    {r.shareOfVoice.toFixed(1)}% SOV
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Share of Voice</span>
                                        <span>{r.shareOfVoice}%</span>
                                    </div>
                                    <Progress value={r.shareOfVoice} className="h-2" />
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <div className="text-center p-3 bg-muted rounded-lg">
                                        <div className="text-2xl font-bold">{r.mentions}</div>
                                        <div className="text-xs text-muted-foreground">Mentions</div>
                                    </div>
                                    <div className="text-center p-3 bg-muted rounded-lg">
                                        <div className="text-2xl font-bold">{r.provenance.totalProbes}</div>
                                        <div className="text-xs text-muted-foreground">Total Probes</div>
                                    </div>
                                </div>
                                <div className="text-xs text-right text-muted-foreground">
                                    Source: {r.provenance.source} ({r.provenance.lastUpdated})
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
