'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface DeviceDistributionChartProps {
    data: Array<{
        name: string
        value: number
        percentage: number
    }>
}

const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd']

export function DeviceDistributionChart({ data }: DeviceDistributionChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
                <CardDescription>Traffic sources by device type</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                innerRadius={60}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                    {data.map((item, index) => (
                        <div key={item.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span className="text-sm text-gray-700">{item.name}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{item.percentage}%</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

