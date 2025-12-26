'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts'

interface ClickOverviewChartProps {
    data: Array<{
        date: string
        clicks: number
        uniqueVisitors: number
    }>
}

export function ClickOverviewChart({ data }: ClickOverviewChartProps) {
    // Format dates for display (Mon, Tue, etc.)
    const formattedData = data.map((item) => ({
        ...item,
        day: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
    }))

    return (
        <Card>
            <CardHeader>
                <CardTitle>Click Overview</CardTitle>
                <CardDescription>Daily clicks vs unique visitors</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={formattedData}>
                        <defs>
                            <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                        <XAxis
                            dataKey="day"
                            className="text-xs"
                            tick={{ fill: '#6b7280' }}
                            axisLine={{ stroke: '#e5e7eb' }}
                        />
                        <YAxis
                            className="text-xs"
                            tick={{ fill: '#6b7280' }}
                            axisLine={{ stroke: '#e5e7eb' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                            }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="clicks"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill="url(#colorClicks)"
                            name="Daily clicks"
                        />
                        <Line
                            type="monotone"
                            dataKey="uniqueVisitors"
                            stroke="#a855f7"
                            strokeWidth={2}
                            fill="url(#colorVisitors)"
                            name="Unique visitors"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

