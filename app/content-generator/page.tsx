import { ContentGenerator } from '@/components/ContentGenerator'

export default function ContentGeneratorPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 p-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">AI Content Generator</h1>
                    <p className="text-gray-600">
                        Generate complete, SEO-optimized articles from outlines using AI
                    </p>
                </div>
                <ContentGenerator />
            </div>
        </main>
    )
}
