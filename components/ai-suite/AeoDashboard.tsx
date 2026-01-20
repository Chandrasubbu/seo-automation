"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, CheckCircle, XCircle } from "lucide-react"

export function AeoDashboard() {
    const [keyword, setKeyword] = useState("")
    const [location, setLocation] = useState("United States")
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<any[]>([])

    const handleAnalyze = async () => {
        if (!keyword) return
        setLoading(true)
        try {
            const res = await fetch("/api/ai-suite/aeo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ keyword, location }),
            })
            const data = await res.json()
            if (data.success) {
                setResults(data.data.map((r: any) => r.recommendations || r))
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
                    placeholder="Target Keyword (e.g. how to fix leaks)"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="max-w-md"
                />
                <Input
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="max-w-[200px]"
                />
                <Button onClick={handleAnalyze} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                    Analyze SERP
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((r, i) => (
                    <Card key={i} className="border-l-4 border-purple-500">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between">
                                <Badge variant="outline">{r.type.replace('_', ' ').toUpperCase()}</Badge>
                                <span className="text-xs text-muted-foreground">{r.provenance.source}</span>
                            </div>
                            <CardTitle className="text-lg mt-2">{r.query}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm mb-4">{r.recommendation}</p>

                            <div className="flex gap-4 text-sm border-t pt-4">
                                {r.winningFormat && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">Winner Format:</span>
                                        <Badge>{r.winningFormat}</Badge>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">Schema:</span>
                                    {r.schemaMissing ?
                                        <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> Missing</Badge> :
                                        <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle className="w-3 h-3" /> Detected</Badge>
                                    }
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
