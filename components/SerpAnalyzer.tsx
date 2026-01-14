'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Search, TrendingUp, ExternalLink } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
    Info,
    Map as MapIcon,
    MessageCircle,
    ChevronDown,
    ChevronUp,
    Globe,
    Monitor,
    Smartphone,
    Download,
    ImageIcon,
    Settings
} from 'lucide-react'

interface SerpResult {
    position: number
    title: string
    url: string
    snippet: string
    domain: string
    favicon?: string
    lps: number
    da: number
    pa: number
    cf: number
    tf: number
    fb: number | string
    inpr: number | string
    links: number
    rd: number
    ri: number
}

interface SerpFeature {
    type: string
    data: any
}

export function SerpAnalyzer() {
    const [keyword, setKeyword] = useState('')
    const [location, setLocation] = useState('United States')
    const [customerDomain, setCustomerDomain] = useState('')
    const [competitorDomains, setCompetitorDomains] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState('')

    const handleAnalyze = async () => {
        if (!keyword.trim()) {
            setError('Please enter a keyword')
            return
        }

        setLoading(true)
        setError('')
        setResult(null)

        try {
            const res = await fetch('/api/serp/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    keyword: keyword.trim(),
                    location,
                    customerDomain: customerDomain.trim(),
                    competitorDomains: competitorDomains.split(',').map(d => d.trim()).filter(Boolean)
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to analyze SERP')
            }

            setResult(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const getMetricColor = (val: any, type: 'da' | 'pa' | 'lps' | 'links') => {
        if (val === 'N/A' || val === undefined) return 'bg-gray-100 text-gray-500'
        const v = Number(val)

        switch (type) {
            case 'da':
            case 'pa':
                if (v < 20) return 'bg-green-100 text-green-700 border-green-200'
                if (v < 50) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
                return 'bg-red-100 text-red-700 border-red-200'
            case 'lps':
                if (v < 15) return 'bg-green-100 text-green-700 border-green-200'
                if (v < 35) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
                return 'bg-red-100 text-red-700 border-red-200'
            default:
                if (v < 10) return 'bg-green-100 text-green-700 border-green-200'
                if (v < 50) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
                return 'bg-red-100 text-red-700 border-red-200'
        }
    }

    const getDifficultyColor = (score: number) => {
        if (score < 30) return 'text-green-500'
        if (score < 60) return 'text-yellow-500'
        return 'text-red-500'
    }

    const getDifficultyLabel = (score: number) => {
        if (score < 30) return 'STILL EASY'
        if (score < 60) return 'MODERATE'
        return 'HARD'
    }

    return (
        <div className="space-y-6">
            {/* Top Navigation / Controls */}
            <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                        placeholder="hvac services"
                        className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                    <Search className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
                        <Globe className="w-4 h-4 text-slate-500" />
                        <select
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="bg-transparent text-sm outline-none font-medium"
                        >
                            <option>Winnipeg, Manitoba, Canada</option>
                            <option>United States</option>
                            <option>London, UK</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
                        <Smartphone className="w-4 h-4 text-slate-500" />
                        <select className="bg-transparent text-sm outline-none font-medium">
                            <option>Mobile</option>
                            <option>Desktop</option>
                        </select>
                    </div>

                    <Button
                        onClick={handleAnalyze}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 h-10 px-4"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5 text-white" />}
                    </Button>
                </div>

                <div className="hidden lg:flex items-center gap-2 ml-auto">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" /> Export to CSV
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                        <ImageIcon className="w-4 h-4" /> Save as image
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Settings className="w-4 h-4" /> Metrics settings
                    </Button>
                </div>
            </div>

            {result ? (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="p-5 flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="text-3xl font-black mb-1 flex items-baseline">
                                {result.difficulty}<span className="text-sm font-normal text-slate-400">/100</span>
                            </div>
                            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${getDifficultyColor(result.difficulty)} bg-opacity-10 mb-2 border border-current`}>
                                {getDifficultyLabel(result.difficulty)}
                            </div>
                            <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                                Keyword SEO Difficulty <Info className="w-3 h-3" />
                            </div>
                        </Card>

                        <Card className="p-5 flex flex-col items-center justify-center">
                            <div className="text-3xl font-black mb-1 flex items-baseline">
                                {result.featuresImpact}<span className="text-sm font-normal text-slate-400">/5</span>
                            </div>
                            <div className="text-[10px] font-bold px-2 py-0.5 rounded-sm text-yellow-600 bg-yellow-50 mb-2 border border-yellow-200">
                                AVERAGE
                            </div>
                            <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                                SERP Features Impact <Info className="w-3 h-3" />
                            </div>
                        </Card>

                        <Card className="p-5 flex flex-col items-center justify-center md:col-span-1">
                            <div className="text-3xl font-black mb-1">
                                {result.totalResults < 1000 ? result.totalResults : (result.totalResults / 1000000).toFixed(1) + 'M'}
                            </div>
                            <div className="text-[10px] font-bold px-2 py-0.5 rounded-sm text-slate-600 bg-slate-100 mb-2 border border-slate-200">
                                DATASET
                            </div>
                            <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                                Number of results <Info className="w-3 h-3" />
                            </div>
                        </Card>

                        <div className="flex flex-col gap-3 justify-center">
                            <div className="flex gap-2">
                                <Badge variant="outline" className="gap-2 py-1 px-3 bg-white text-slate-600 font-bold border-slate-200">
                                    <MapIcon className="w-3.5 h-3.5 text-slate-400" /> Map Pack
                                </Badge>
                                <Badge variant="outline" className="gap-2 py-1 px-3 bg-white text-slate-600 font-bold border-slate-200">
                                    <MessageCircle className="w-3.5 h-3.5 text-slate-400" /> People Also Ask
                                </Badge>
                            </div>
                            <div className="text-[11px] text-right text-slate-400 flex items-center justify-end gap-1">
                                <Globe className="w-3 h-3" /> Last updated: just now
                            </div>
                        </div>
                    </div>

                    {/* Results Content */}
                    <Tabs defaultValue="results" className="w-full">
                        <TabsList className="bg-slate-100/50 p-1 h-auto w-auto">
                            <TabsTrigger value="results" className="py-2 px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <Globe className="w-4 h-4 mr-2" /> Results
                            </TabsTrigger>
                            <TabsTrigger value="snapshot" className="py-2 px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <ImageIcon className="w-4 h-4 mr-2" /> Snapshot
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="results" className="mt-6">
                            <Card className="overflow-hidden border-none shadow-xl">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                                                <th className="py-4 px-4 w-12 text-center">#</th>
                                                <th className="py-4 px-4 min-w-[300px]">URL</th>
                                                <th className="py-4 px-4 text-center">LPS</th>
                                                <th className="py-4 px-4 text-center">DA</th>
                                                <th className="py-4 px-4 text-center">PA</th>
                                                <th className="py-4 px-4 text-center">CF</th>
                                                <th className="py-4 px-4 text-center">TF</th>
                                                <th className="py-4 px-4 text-center">FB</th>
                                                <th className="py-4 px-4 text-center">INPR</th>
                                                <th className="py-4 px-4 text-center">Links</th>
                                                <th className="py-4 px-4 text-center">RD</th>
                                                <th className="py-4 px-4 text-center">RI</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {/* Top Feature Rows */}
                                            {result.features?.map((f: any, i: number) => (
                                                f.type === 'map_pack' && (
                                                    <tr key={`map-${i}`} className="bg-slate-50/50">
                                                        <td className="py-3 px-4 text-[11px] text-slate-400 font-bold text-center">
                                                            <div className="flex flex-col items-center">
                                                                <MapIcon className="w-4 h-4 mb-1" />
                                                            </div>
                                                        </td>
                                                        <td colSpan={11} className="py-3 px-4">
                                                            <div className="flex items-center gap-4 text-sm font-bold text-slate-700">
                                                                Map Pack
                                                                <div className="h-4 w-[1px] bg-slate-200" />
                                                                <div className="flex gap-4">
                                                                    {f.data.businesses?.map((b: any, idx: number) => (
                                                                        <div key={idx} className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                                                                            <span className="text-slate-800">{b.name}</span>
                                                                            <span className="text-yellow-500">★ {b.rating}</span>
                                                                            <span>({b.reviews})</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            ))}

                                            {result.features?.map((f: any, i: number) => (
                                                f.type === 'people_also_ask' && (
                                                    <tr key={`paa-${i}`} className="bg-slate-50/50">
                                                        <td className="py-3 px-4 text-[11px] text-slate-400 font-bold text-center">
                                                            <div className="flex flex-col items-center">
                                                                <MessageCircle className="w-4 h-4 mb-1" />
                                                            </div>
                                                        </td>
                                                        <td colSpan={11} className="py-3 px-4">
                                                            <div className="flex items-center justify-between text-sm font-bold text-slate-700">
                                                                <div className="flex items-center gap-2">
                                                                    People Also Ask <span className="text-[10px] text-slate-400 px-1 bg-white border border-slate-200 rounded">{f.data?.length} items</span>
                                                                </div>
                                                                <ChevronDown className="w-4 h-4 text-slate-400" />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            ))}

                                            {/* Organic Results */}
                                            {result.results?.map((r: SerpResult) => {
                                                const isCustomer = result.tracking?.customer?.position === r.position;
                                                const isCompetitor = result.tracking?.competitors?.some((c: any) => c.position === r.position);

                                                return (
                                                    <tr key={r.position} className={`hover:bg-slate-50 transition-colors group ${isCustomer ? 'bg-blue-50/50' : isCompetitor ? 'bg-orange-50/30' : ''}`}>
                                                        <td className="py-4 px-4 text-center align-top relative">
                                                            {isCustomer && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />}
                                                            {isCompetitor && <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500" />}
                                                            <div className="text-xs font-bold text-slate-900">{r.position}</div>
                                                            <div className="text-[8px] text-slate-400 mt-0.5">{(2 + Math.random() * 2).toFixed(2)}%</div>
                                                        </td>
                                                        <td className="py-4 px-4 max-w-[400px]">
                                                            <div className="flex gap-3">
                                                                <img
                                                                    src={r.favicon || `https://www.google.com/s2/favicons?domain=${r.domain}&sz=32`}
                                                                    className="w-4 h-4 mt-1 flex-shrink-0"
                                                                    alt=""
                                                                    onError={(e) => (e.currentTarget.src = "https://www.google.com/favicon.ico")}
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-0.5">
                                                                        <a
                                                                            href={r.url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-[13px] font-bold text-blue-700 hover:underline line-clamp-1"
                                                                        >
                                                                            {r.title}
                                                                        </a>
                                                                        {isCustomer && <Badge className="text-[8px] h-3.5 px-1 bg-blue-600">YOU</Badge>}
                                                                        {isCompetitor && <Badge className="text-[8px] h-3.5 px-1 bg-orange-500 font-bold">COMP</Badge>}
                                                                    </div>
                                                                    <div className="text-[11px] text-green-700 font-medium truncate flex items-center gap-1">
                                                                        {r.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Metrics Columns */}
                                                        <td className="py-4 px-2 text-center align-middle">
                                                            <Badge variant="outline" className={`w-8 h-6 justify-center p-0 text-[11px] font-bold ${getMetricColor(r.lps, 'lps')}`}>
                                                                {r.lps}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-4 px-2 text-center align-middle">
                                                            <Badge variant="outline" className={`w-8 h-6 justify-center p-0 text-[11px] font-bold ${getMetricColor(r.da, 'da')}`}>
                                                                {r.da}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-4 px-2 text-center align-middle">
                                                            <Badge variant="outline" className={`w-8 h-6 justify-center p-0 text-[11px] font-bold ${getMetricColor(r.pa, 'pa')}`}>
                                                                {r.pa}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-4 px-2 text-center align-middle">
                                                            <div className={`text-[11px] font-medium ${r.cf > 30 ? 'text-slate-800' : 'text-green-600'}`}>{r.cf}</div>
                                                        </td>
                                                        <td className="py-4 px-2 text-center align-middle">
                                                            <div className={`text-[11px] font-medium ${r.tf > 30 ? 'text-slate-800' : 'text-green-600'}`}>{r.tf}</div>
                                                        </td>
                                                        <td className="py-4 px-2 text-center align-middle">
                                                            <div className="text-[11px] text-slate-500">{r.fb}</div>
                                                        </td>
                                                        <td className="py-4 px-2 text-center align-middle">
                                                            <div className="text-[11px] text-slate-500">{r.inpr}</div>
                                                        </td>
                                                        <td className="py-4 px-2 text-center align-middle">
                                                            <div className="text-[11px] font-medium text-slate-800">{r.links}</div>
                                                        </td>
                                                        <td className="py-4 px-2 text-center align-middle">
                                                            <div className="text-[11px] font-medium text-slate-800">{r.rd}</div>
                                                        </td>
                                                        <td className="py-4 px-2 text-center align-middle">
                                                            <div className="text-[11px] font-medium text-slate-800">{r.ri}</div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </TabsContent>

                        <TabsContent value="snapshot" className="mt-6">
                            <Card className="p-12 text-center border-dashed border-2">
                                <ImageIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-800 mb-2">SERP Visual Snapshot</h3>
                                <p className="text-slate-500 max-w-md mx-auto">
                                    Visual snapshots of the SERP are not available in mock mode. Upgrade to a professional plan to see direct search result screenshots.
                                </p>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            ) : (
                <Card className="p-12 text-center border-dashed border-2 bg-white/50">
                    <TrendingUp className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Keyword Analysis Ready</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-6">
                        Enter a keyword and optional tracking domains to generate a comprehensive SERP analysis.
                    </p>

                    <div className="max-w-xl mx-auto space-y-4 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                value={customerDomain}
                                onChange={(e) => setCustomerDomain(e.target.value)}
                                placeholder="Your Domain (optional)"
                                className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                            />
                            <input
                                type="text"
                                value={competitorDomains}
                                onChange={(e) => setCompetitorDomains(e.target.value)}
                                placeholder="Competitor Domains (comma separated)"
                                className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2">
                        {['hvac services', 'plumber winnipeg', 'roofing repair', 'ac installation'].map(kw => (
                            <button
                                key={kw}
                                onClick={() => setKeyword(kw)}
                                className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-50"
                            >
                                {kw}
                            </button>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    )
}
