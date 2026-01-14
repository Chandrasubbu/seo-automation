'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Search, Globe, MapPin, ChevronRight, Star, Lock, Info, Filter, MoreHorizontal } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface KeywordData {
    keyword: string
    searchVolume: number | null
    difficulty: number | null // 0-100
    cpc: number | null
    competition: string | null
    intent: string | null
    trend: number[] | null
    position?: number | null
    url?: string | null
}

interface KeywordCluster {
    mainKeyword: string
    keywords: KeywordData[]
    totalVolume: number
    avgDifficulty: number
}

// Sparkline Component for Table
const Sparkline = ({ data }: { data: number[] | null }) => {
    if (!data || data.length < 2) return <div className="h-8 w-16 bg-gray-50 flex items-center justify-center text-xs text-gray-400">N/A</div>;

    const width = 60;
    const height = 24;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    // Simple bar chart style sparkline using SVG rects
    const barWidth = (width / data.length) - 1;

    return (
        <svg width={width} height={height}>
            {data.map((val, i) => {
                const barHeight = ((val - min) / range) * height; // Scale relative to min/max
                // or better, scale absolute from 0 if needed, but relative usually looks better for trends
                // Let's do absolute scale for volume? No, trends often relative.
                // Let's stick to normalized:
                const h = Math.max(2, ((val) / (max || 1)) * height); // Scale from 0 to max
                const x = i * (width / data.length);
                const y = height - h;
                return (
                    <rect key={i} x={x} y={y} width={barWidth} height={h} fill="#3b82f6" opacity={0.8} />
                )
            })}
        </svg>
    );
};

// Intent Badge Component
const IntentBadge = ({ intent }: { intent: string | null }) => {
    if (!intent) return null;

    const map: Record<string, { label: string, color: string, bg: string }> = {
        informational: { label: 'I', color: 'text-blue-700', bg: 'bg-blue-100' },
        navigational: { label: 'N', color: 'text-purple-700', bg: 'bg-purple-100' },
        commercial: { label: 'C', color: 'text-yellow-700', bg: 'bg-yellow-100' },
        transactional: { label: 'T', color: 'text-green-700', bg: 'bg-green-100' }
    };

    const style = map[intent] || { label: '?', color: 'text-gray-700', bg: 'bg-gray-100' };

    return (
        <span
            className={`flex items-center justify-center w-5 h-5 rounded text-xs font-bold ${style.bg} ${style.color}`}
            title={intent}
        >
            {style.label}
        </span>
    );
}

// Difficulty Badge Component
const DifficultyBadge = ({ score }: { score: number | null }) => {
    if (score === null) return <span className="text-gray-400">-</span>;

    let colorClass = 'bg-gray-200 text-gray-700'; // Unknown
    if (score < 30) colorClass = 'bg-green-500 text-white'; // Easy
    else if (score < 50) colorClass = 'bg-yellow-500 text-white'; // Possible
    else if (score < 70) colorClass = 'bg-orange-500 text-white'; // Hard
    else colorClass = 'bg-red-600 text-white'; // Very Hard

    return (
        <div className={`flex items-center justify-center w-8 h-8 rounded font-medium text-sm ${colorClass}`}>
            {score}
        </div>
    );
}

export function KeywordResearcher() {
    const [searchType, setSearchType] = useState('domain') // Default to domain as requested
    const [keyword, setKeyword] = useState('')
    const [domain, setDomain] = useState('eastsideventilation.ca') // Pre-fill for demo
    const [location, setLocation] = useState('us')
    const [language, setLanguage] = useState('en')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState('')
    const [selectedKeyword, setSelectedKeyword] = useState<KeywordData | null>(null)

    const handleResearch = async () => {
        const query = searchType === 'keyword' ? keyword : domain;
        if (!query.trim()) {
            setError(`Please enter a ${searchType}`)
            return
        }

        setLoading(true)
        setError('')
        setResult(null)
        setSelectedKeyword(null)

        try {
            const res = await fetch('/api/keywords/research', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    keyword: query.trim(),
                    type: searchType,
                    location,
                    language
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to research keywords')
            }

            setResult(data)
            // Select first keyword by default
            if (data.relatedKeywords && data.relatedKeywords.length > 0) {
                setSelectedKeyword(data.relatedKeywords[0])
            } else {
                setSelectedKeyword(data.mainKeyword)
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Prepare chart data for selected keyword
    const getChartData = (kw: KeywordData) => {
        if (!kw || !kw.trend) return [];
        // Assuming trend is last 12 months. Let's generate dummy labels.
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Rotate to end at current month? Or just take last 12 from now.
        // For simplicity, just map the array.
        return kw.trend.map((val, i) => ({
            name: months[i % 12],
            volume: val
        }));
    };

    return (
        <div className="space-y-4 font-sans text-sm">
            {/* Top Bar: Search Controls */}
            <Card className="p-4 border-b">
                <Tabs defaultValue="domain" onValueChange={setSearchType} className="w-full">
                    <TabsList className="grid w-64 grid-cols-2 mb-4 h-9">
                        <TabsTrigger value="keyword">Keyword</TabsTrigger>
                        <TabsTrigger value="domain">Domain</TabsTrigger>
                    </TabsList>

                    <div className="flex flex-col md:flex-row gap-3 items-center">
                        <div className="flex-1 w-full relative">
                            {searchType === 'keyword' ? (
                                <>
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleResearch()}
                                        placeholder="Enter keyword"
                                        className="pl-9 h-10"
                                    />
                                </>
                            ) : (
                                <>
                                    <Globe className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input
                                        value={domain}
                                        onChange={(e) => setDomain(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleResearch()}
                                        placeholder="Enter domain"
                                        className="pl-9 h-10"
                                    />
                                </>
                            )}
                        </div>

                        <div className="w-[140px]">
                            <Select value={location} onValueChange={setLocation}>
                                <SelectTrigger className="h-10">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Loc" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="us">US</SelectItem>
                                    <SelectItem value="uk">UK</SelectItem>
                                    <SelectItem value="ca">CA</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            onClick={handleResearch}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 h-10 px-6"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                        </Button>
                    </div>
                </Tabs>

                {error && <div className="mt-2 text-red-600 text-sm">{error}</div>}
            </Card>

            {/* Results Area */}
            {result && (
                <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">

                    {/* Left Panel: Keyword List */}
                    <Card className="flex-1 flex flex-col overflow-hidden border-gray-200 shadow-sm rounded-lg lg:w-2/3">
                        <div className="p-3 border-b flex items-center justify-between bg-gray-50">
                            <div className="flex gap-2 text-gray-600">
                                <Button variant="ghost" size="sm" className="h-8 text-xs font-normal border bg-white"><Filter className="w-3 h-3 mr-1" /> Filter</Button>
                                <Button variant="ghost" size="sm" className="h-8 text-xs font-normal border bg-white">Clusters</Button>
                            </div>
                            <div className="text-gray-500 text-xs">
                                {result.relatedKeywords?.length || 0} Keywords
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white border-b sticky top-0 z-10 text-xs text-gray-500 uppercase font-semibold">
                                    <tr>
                                        <th className="p-3 w-8"><input type="checkbox" /></th>
                                        <th className="p-3 w-8"></th>
                                        <th className="p-3">Keyword</th>
                                        <th className="p-3 w-12 text-center">Intent</th>
                                        <th className="p-3 w-12 text-center">SF</th>
                                        <th className="p-3 w-12 text-center">Opps</th>
                                        <th className="p-3 w-12 text-center">Pos</th>
                                        <th className="p-3 w-20">Trend</th>
                                        <th className="p-3 w-16 text-right">Search</th>
                                        <th className="p-3 w-12 text-center">KD</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y">
                                    {result.relatedKeywords?.map((kw: KeywordData, i: number) => (
                                        <tr
                                            key={i}
                                            className={`hover:bg-blue-50 cursor-pointer ${selectedKeyword === kw ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                                            onClick={() => setSelectedKeyword(kw)}
                                        >
                                            <td className="p-3"><input type="checkbox" /></td>
                                            <td className="p-3 text-gray-300 hover:text-yellow-400"><Star className="w-4 h-4" /></td>
                                            <td className="p-3 font-medium text-gray-900">
                                                {kw.keyword}
                                                {kw.url && <div className="text-xs text-blue-500 truncate max-w-[200px] mt-0.5">{kw.url.replace('https://', '')}</div>}
                                            </td>
                                            <td className="p-3 text-center flex justify-center gap-1">
                                                {kw.intent?.split(',').map((it, idx) => (
                                                    <IntentBadge key={idx} intent={it.trim()} />
                                                ))}
                                            </td>
                                            <td className="p-3 text-center text-gray-400">
                                                <div className="flex justify-center items-center h-5 w-5 bg-gray-100 rounded-full text-[10px] mx-auto" title="SERP Features">
                                                    {Math.floor(Math.random() * 3) + 1}
                                                </div>
                                            </td>
                                            <td className="p-3 text-center text-gray-400">-</td>
                                            <td className="p-3 text-center font-semibold text-gray-700">
                                                {kw.position || '-'}
                                            </td>
                                            <td className="p-3">
                                                <Sparkline data={kw.trend} />
                                            </td>
                                            <td className="p-3 text-right text-gray-600">
                                                {kw.searchVolume?.toLocaleString()}
                                            </td>
                                            <td className="p-3 text-center">
                                                <DifficultyBadge score={kw.difficulty} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-2 border-t text-center text-xs text-gray-400 bg-gray-50">
                            Showing 1-{result.relatedKeywords?.length} of {result.relatedKeywords?.length} keywords
                        </div>
                    </Card>

                    {/* Right Panel: Keyword Detail */}
                    {selectedKeyword && (
                        <Card className="w-full lg:w-1/3 flex flex-col overflow-y-auto border-gray-200 shadow-sm p-5 space-y-6 bg-white h-auto">

                            {/* Header */}
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedKeyword.keyword}</h2>
                                <div className="flex gap-3 text-xs text-gray-500 items-center">
                                    <span className="flex items-center gap-1 uppercase"><MapPin className="w-3 h-3" /> {location}</span>
                                    <span className="flex items-center gap-1 uppercase">{language}</span>
                                    <span>Intent: {selectedKeyword.intent}</span>
                                </div>
                            </div>

                            {/* Difficulty Gauge (Simplified) */}
                            <div className="bg-white rounded-lg border p-4">
                                <div className="text-sm font-semibold text-gray-500 mb-2">Keyword Difficulty</div>
                                <div className="flex items-end gap-2">
                                    <div className="text-4xl font-bold text-gray-900">{selectedKeyword.difficulty}</div>
                                    <div className="text-sm text-gray-500 mb-1">/ 100</div>
                                </div>
                                <div className="text-sm font-medium mt-1 text-green-600">
                                    {selectedKeyword.difficulty && selectedKeyword.difficulty < 30 ? 'Easy' :
                                        selectedKeyword.difficulty && selectedKeyword.difficulty < 50 ? 'Possible' : 'Hard'}
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full mt-3 overflow-hidden">
                                    <div
                                        className={`h-full ${selectedKeyword.difficulty && selectedKeyword.difficulty < 30 ? 'bg-green-500' : 'bg-orange-500'}`}
                                        style={{ width: `${selectedKeyword.difficulty}%` }}
                                    />
                                </div>
                                <div className="text-xs text-gray-400 mt-2">
                                    You will need high quality content to rank.
                                </div>
                            </div>

                            {/* Volume Chart */}
                            <div className="bg-white rounded-lg border p-4">
                                <div className="text-sm font-semibold text-gray-500 mb-4 flex justify-between">
                                    <span>Search Volume</span>
                                    <span className="text-gray-900 font-bold">{selectedKeyword.searchVolume?.toLocaleString()}</span>
                                </div>
                                <div className="h-40 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={getChartData(selectedKeyword)}>
                                            <Tooltip
                                                cursor={{ fill: '#f3f4f6' }}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Bar dataKey="volume" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex justify-between text-xs text-gray-400 mt-2 px-1">
                                    <span>Past 12 Months</span>
                                    <span>Trend</span>
                                </div>
                            </div>

                            {/* SERP Overview (Placeholder) */}
                            <div className="bg-white rounded-lg border p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="text-sm font-semibold text-gray-500">SERP Overview</div>
                                    <Button size="sm" variant="outline" className="h-6 text-xs">Analyze</Button>
                                </div>

                                <div className="space-y-3">
                                    {[1, 2, 3, 4, 5].map((pos) => (
                                        <div key={pos} className="flex items-start gap-3 text-sm">
                                            <div className="w-4 text-gray-400 font-medium">{pos}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-blue-600 truncate cursor-pointer hover:underline">
                                                    {pos === 1 ? selectedKeyword.url || 'example.com/page' : `competitor-${pos}.com/page`}
                                                </div>
                                                <div className="flex gap-2 text-xs text-gray-400 mt-0.5">
                                                    <span>DA: {Math.floor(Math.random() * 60) + 20}</span>
                                                    <span>Links: {Math.floor(Math.random() * 1000)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </Card>
                    )}
                </div>
            )}
        </div>
    )
}
