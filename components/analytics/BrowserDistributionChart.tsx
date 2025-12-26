'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface BrowserDistributionChartProps {
    data: Array<{
        name: string
        value: number
        percentage: number
    }>
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

export function BrowserDistributionChart({ data }: BrowserDistributionChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Browser Distribution</CardTitle>
                <CardDescription>Traffic sources by browser type</CardDescription>
            </CardHeader>
            <CardContent className="px-2 md:px-6">
                <div className="flex items-center justify-center">
                    <div className="h-[250px] md:h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                innerRadius="40%"
                                outerRadius="65%"
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
                </div>
                <div className="mt-3 md:mt-4 space-y-1.5 md:space-y-2">
                    {data.map((item, index) => (
                        <div key={item.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div
                                    className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span className="text-xs md:text-sm text-gray-700">{item.name}</span>
                            </div>
                            <span className="text-xs md:text-sm font-medium text-gray-900">{item.percentage}%</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

