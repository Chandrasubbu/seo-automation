import { KeywordResearcher } from '@/components/KeywordResearcher'

export default function KeywordResearchPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Keyword Research</h1>
                    <p className="text-gray-600">
                        Discover high-value keywords with search volume, difficulty, and intent analysis
                    </p>
                </div>
                <KeywordResearcher />
            </div>
        </main>
    )
}
