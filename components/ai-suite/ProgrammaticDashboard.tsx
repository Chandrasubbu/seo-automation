"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, TrendingUp, AlertTriangle, FileText, Globe } from "lucide-react"

export function ProgrammaticDashboard() {
    const [domain, setDomain] = useState("")
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<any[]>([])

    const handleAnalyze = async () => {
        if (!domain) return
        setLoading(true)
        try {
            const res = await fetch("/api/ai-suite/programmatic", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ domain }),
            })
            const data = await res.json()
            if (data.success) {
                // Parse data if it was stored as JSON string, or use directly if object
                // The API returns records with `data` field being the JSON content
                setResults(data.data.map((r: any) => r.data || r))
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Input
                    placeholder="Enter domain (e.g. example.com)"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="max-w-md"
                />
                <Button onClick={handleAnalyze} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Globe className="mr-2 h-4 w-4" />}
                    Analyze Patterns
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {results.map((opp, i) => (
                    <Card key={i} className="border-l-4 border-blue-500">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <Badge variant={opp.type === 'gap' ? 'destructive' : 'secondary'}>
                                    {opp.type.replace('_', ' ')}
                                </Badge>
                                <div className="text-xs text-muted-foreground flex flex-col items-end">
                                    <span className="font-semibold">{opp.provenance.source}</span>
                                    <span>{opp.provenance.date}</span>
                                </div>
                            </div>
                            <CardTitle className="text-lg mt-2">{opp.pattern || opp.keyword}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <p className="text-muted-foreground">{opp.recommendation}</p>
                                <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                                    <div className="flex items-center gap-1">
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                        <span className="font-bold">+{opp.potentialTraffic}</span>
                                        <span className="text-xs text-muted-foreground">visits/mo</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                        <span className="font-bold">{Math.round((opp.confidence || 0) * 100)}%</span>
                                        <span className="text-xs text-muted-foreground">confidence</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {results.length === 0 && !loading && (
                <div className="text-center py-12 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 opacity-20 mb-4" />
                    <p>Enter a domain to analyze programmatic SEO opportunities.</p>
                </div>
            )}
        </div>
    )
}
