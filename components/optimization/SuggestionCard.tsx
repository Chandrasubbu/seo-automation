"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wand2, CheckCircle2, AlertTriangle, Info } from "lucide-react"

interface Suggestion {
    id: string
    type: 'missing_keyword' | 'readability' | 'structure'
    message: string
    fixPrediction?: string
}

interface SuggestionCardProps {
    suggestion: Suggestion
    onFix: (id: string) => Promise<void>
}

export function SuggestionCard({ suggestion, onFix }: SuggestionCardProps) {
    const [loading, setLoading] = useState(false)
    const [fixed, setFixed] = useState(false)

    const handleFix = async () => {
        setLoading(true)
        try {
            await onFix(suggestion.id)
            setFixed(true)
        } catch (error) {
            console.error("Fix failed", error)
        } finally {
            setLoading(false)
        }
    }

    const getIcon = () => {
        switch (suggestion.type) {
            case 'missing_keyword': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
            case 'readability': return <Info className="h-5 w-5 text-blue-500" />
            default: return <Info className="h-5 w-5 text-gray-500" />
        }
    }

    if (fixed) {
        return (
            <Card className="bg-green-50/50 border-green-200">
                <CardContent className="p-4 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-green-700 font-medium">Fixed!</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getIcon()}</div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">{suggestion.message}</p>
                        {suggestion.fixPrediction && (
                            <p className="text-xs text-muted-foreground mt-1">
                                AI Suggestion: &quot;{suggestion.fixPrediction.substring(0, 60)}...&quot;
                            </p>
                        )}
                    </div>
                </div>

                {suggestion.fixPrediction && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
                        onClick={handleFix}
                        disabled={loading}
                    >
                        {loading ? (
                            <>Applying Fix...</>
                        ) : (
                            <>
                                <Wand2 className="h-3 w-3" />
                                Fix with AI
                            </>
                        )}
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}
