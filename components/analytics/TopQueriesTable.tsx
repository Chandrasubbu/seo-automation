"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface QueryData {
    keyword: string
    clicks: number
    impressions: number
    ctr: number
    position: number
}

interface TopQueriesTableProps {
    data: QueryData[]
}

export function TopQueriesTable({ data }: TopQueriesTableProps) {
    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Top Queries</CardTitle>
                <CardDescription>Keywords driving traffic</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Query</TableHead>
                            <TableHead className="text-right">Clicks</TableHead>
                            <TableHead className="text-right hidden sm:table-cell">Pos.</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground">No data available</TableCell>
                            </TableRow>
                        ) : (
                            data.slice(0, 5).map((query) => (
                                <TableRow key={query.keyword}>
                                    <TableCell className="font-medium truncate max-w-[200px]" title={query.keyword}>
                                        {query.keyword}
                                    </TableCell>
                                    <TableCell className="text-right">{query.clicks.toLocaleString()}</TableCell>
                                    <TableCell className="text-right hidden sm:table-cell">{query.position.toFixed(1)}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
