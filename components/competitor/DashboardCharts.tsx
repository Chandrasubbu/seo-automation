'use client';

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock Data Generators for Visualization
const generateRankingData = () => {
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
        name: month,
        Client: Math.floor(Math.random() * 40) + 10, // Rank 10-50
        Competitor: Math.floor(Math.random() * 20) + 1, // Rank 1-20
    }));
};

const generateRadarData = () => {
    return [
        { subject: 'Content Quality', A: 120, B: 110, fullMark: 150 },
        { subject: 'Backlinks', A: 98, B: 130, fullMark: 150 },
        { subject: 'Tech SEO', A: 86, B: 130, fullMark: 150 },
        { subject: 'Mobile', A: 99, B: 100, fullMark: 150 },
        { subject: 'Speed', A: 85, B: 90, fullMark: 150 },
        { subject: 'UX', A: 65, B: 85, fullMark: 150 },
    ];
};

export function DashboardCharts() {
    const rankingData = generateRankingData();
    const radarData = generateRadarData();

    return (
        <div className="grid gap-6 md:grid-cols-2 mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Ranking History (Last 6 Months)</CardTitle>
                    <p className="text-sm text-muted-foreground">Average position for target keywords</p>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={rankingData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis reversed domain={[1, 100]} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="Client" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="Competitor" stroke="#ec4899" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Technical & On-Page SEO Comparison</CardTitle>
                    <p className="text-sm text-muted-foreground">Gap analysis across key metrics</p>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <PolarRadiusAxis angle={30} domain={[0, 150]} />
                            <Radar name="You" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                            <Radar name="Competitor" dataKey="B" stroke="#ec4899" fill="#ec4899" fillOpacity={0.6} />
                            <Legend />
                            <Tooltip />
                        </RadarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
