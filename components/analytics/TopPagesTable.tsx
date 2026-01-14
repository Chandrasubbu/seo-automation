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

interface PageData {
    path: string
    clicks: number
    impressions: number
    ctr: number
    position: number
}

interface TopPagesTableProps {
    data: PageData[]
}

export function TopPagesTable({ data }: TopPagesTableProps) {
    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Top Pages</CardTitle>
                <CardDescription>Pages with the most clicks</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Page</TableHead>
                            <TableHead className="text-right">Clicks</TableHead>
                            <TableHead className="text-right hidden sm:table-cell">Imp.</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground">No data available</TableCell>
                            </TableRow>
                        ) : (
                            data.slice(0, 5).map((page) => (
                                <TableRow key={page.path}>
                                    <TableCell className="font-medium truncate max-w-[200px]" title={page.path}>
                                        {page.path}
                                    </TableCell>
                                    <TableCell className="text-right">{page.clicks.toLocaleString()}</TableCell>
                                    <TableCell className="text-right hidden sm:table-cell">{page.impressions.toLocaleString()}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
