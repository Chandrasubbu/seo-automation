"use client"

import * as React from "react"
import { Plus, Trash2, Sparkles, Loader2, Download } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { generatePDF } from "@/lib/pdf-generator"

export function WorkflowForm() {
    const [competitors, setCompetitors] = React.useState<string[]>(["", "", ""])
    const [keyword, setKeyword] = React.useState("")
    const [brand, setBrand] = React.useState("")
    const [services, setServices] = React.useState("")
    const [loading, setLoading] = React.useState(false)
    const [result, setResult] = React.useState<string | null>(null)

    const addCompetitor = () => {
        if (competitors.length < 5) {
            setCompetitors([...competitors, ""])
        }
    }

    const removeCompetitor = (index: number) => {
        const newCompetitors = [...competitors]
        newCompetitors.splice(index, 1)
        setCompetitors(newCompetitors)
    }

    const updateCompetitor = (index: number, value: string) => {
        const newCompetitors = [...competitors]
        newCompetitors[index] = value
        setCompetitors(newCompetitors)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setResult(null)

        try {
            const response = await fetch("/api/analyze", {
                method: "POST",
                body: JSON.stringify({ competitors, keyword, brand, services }),
            })
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Analysis failed")
            }

            setResult(data.blueprint)

        } catch (error: any) {
            console.error(error)
            setResult(`### Error\n\n${error.message || "An unexpected error occurred."}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-4 space-y-8">
            <Card className="border-indigo-500/20 shadow-xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500" />
                <CardHeader>
                    <CardTitle className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                        SEO Blueprint Generator
                    </CardTitle>
                    <CardDescription className="text-lg">
                        Generate a data-driven service page strategy by analyzing your competitors.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="brand">Brand Name</Label>
                                <Input
                                    id="brand"
                                    placeholder="e.g. Acme Digital"
                                    value={brand}
                                    onChange={(e) => setBrand(e.target.value)}
                                    className="bg-secondary/30"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="keyword">Target Keyword</Label>
                                <Input
                                    id="keyword"
                                    placeholder="e.g. SEO Audit Services"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    className="bg-secondary/30"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Competitor URLs (Min 1, Max 5)</Label>
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {competitors.map((url, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex gap-2"
                                        >
                                            <Input
                                                placeholder={`https://competitor${index + 1}.com/service-page`}
                                                value={url}
                                                onChange={(e) => updateCompetitor(index, e.target.value)}
                                                className="bg-secondary/30"
                                                required={index === 0}
                                            />
                                            {competitors.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeCompetitor(index)}
                                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                            {competitors.length < 5 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addCompetitor}
                                    className="mt-2 border-dashed text-muted-foreground group"
                                >
                                    <Plus className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                                    Add Competitor
                                </Button>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="services">Services Offered (Context)</Label>
                            <Textarea
                                id="services"
                                placeholder="Briefly describe your service offering..."
                                value={services}
                                onChange={(e) => setServices(e.target.value)}
                                className="min-h-[100px] bg-secondary/30"
                            />
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                size="lg"
                                className="w-full text-lg shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 border-0"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Analyzing Content...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-5 w-5" />
                                        Generate Blueprint
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {result && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border bg-card text-card-foreground shadow-sm p-6"
                >
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h2 className="text-2xl font-bold">Generated Blueprint</h2>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigator.clipboard.writeText(result)}
                            >
                                Copy Markdown
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => generatePDF({
                                    title: 'SEO Blueprint Report',
                                    keyword: keyword,
                                    brand: brand,
                                    content: result
                                })}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                            </Button>
                        </div>
                    </div>
                    <article className="prose prose-indigo dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {result}
                        </ReactMarkdown>
                    </article>
                </motion.div>
            )}
        </div>
    )
}
