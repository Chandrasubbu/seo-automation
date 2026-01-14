import SEOAnalyzer from "@/components/optimization/SEOAnalyzer"

export default function OptimizationPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Automated Optimization</h1>
                <p className="text-muted-foreground mt-2">
                    Analyze and improve your content with AI-powered SEO suggestions.
                </p>
            </div>

            <SEOAnalyzer />
        </div>
    )
}
