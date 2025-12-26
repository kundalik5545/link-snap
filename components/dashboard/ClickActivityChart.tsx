'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'

interface ClickActivityChartProps {
    data: Array<{
        month: string
        clicks: number
    }>
}

export function ClickActivityChart({ data }: ClickActivityChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Click Activity</CardTitle>
                <CardDescription>Clicks vs Impressions over last 7 months</CardDescription>
            </CardHeader>
            <CardContent className="px-2 md:px-6">
                <div className="h-[250px] md:h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                        <XAxis
                            dataKey="month"
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
                        <Area
                            type="monotone"
                            dataKey="clicks"
                            stroke="#3b82f6"
                            fillOpacity={1}
                            fill="url(#colorClicks)"
                        />
                    </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

