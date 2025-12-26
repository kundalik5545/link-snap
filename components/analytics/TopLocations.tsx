'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface TopLocationsProps {
    locations: Array<{
        country: string
        code: string
        clicks: number
        percentage: number
    }>
}

export function TopLocations({ locations }: TopLocationsProps) {
    const maxClicks = Math.max(...locations.map((l) => l.clicks), 1)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Top Locations</CardTitle>
                <CardDescription>Where your clicks are coming from</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {locations.map((location) => (
                        <div key={location.country} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-gray-900">
                                    {location.country} ({location.code})
                                </span>
                                <span className="text-gray-600">{location.percentage}%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 rounded-full transition-all"
                                    style={{ width: `${(location.clicks / maxClicks) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

