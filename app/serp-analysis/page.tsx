import { SerpAnalyzer } from '@/components/SerpAnalyzer'

export default function SerpAnalysisPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">SERP Analysis</h1>
                    <p className="text-gray-600">
                        Analyze search engine results to understand your competition and identify opportunities
                    </p>
                </div>
                <SerpAnalyzer />
            </div>
        </main>
    )
}
