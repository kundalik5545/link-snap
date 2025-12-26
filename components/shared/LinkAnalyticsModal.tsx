'use client'

import { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { getBaseUrl } from '@/lib/config'

interface Link {
    id: string
    shortCode: string
    originalUrl: string
    createdAt: string
}

interface LinkAnalytics {
    totalClicks: number
    uniqueVisitors: number
    deviceDistribution: Record<string, number>
    countryDistribution: Record<string, number>
    browserDistribution?: Record<string, number>
    sourceDistribution?: Record<string, number>
    clicks: Array<{
        clickedAt: string
        deviceType: string | null
        country: string | null
        city: string | null
        timezone: string | null
        browser: string | null
        sourceType: string | null
        referrer: string | null
        ipAddress: string | null
    }>
}

interface LinkAnalyticsModalProps {
    link: Link | null
    onClose: () => void
}

export function LinkAnalyticsModal({
    link,
    onClose,
}: LinkAnalyticsModalProps) {
    const [analytics, setAnalytics] = useState<LinkAnalytics | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (link) {
            setLoading(true)
            fetch(`/api/links/${link.id}`)
                .then((res) => res.json())
                .then((data) => {
                    setAnalytics(data.analytics)
                    setLoading(false)
                })
                .catch((error) => {
                    console.error('Error fetching analytics:', error)
                    setLoading(false)
                })
        }
    }, [link])

    if (!link) return null

    const baseUrl = getBaseUrl()
    const shortUrl = `${baseUrl}/${link.shortCode}`

    return (
        <Dialog open={!!link} onOpenChange={onClose}>
            <DialogContent
                id="link-analytics-modal"
                className="max-h-[90vh] overflow-y-auto"
                style={{
                    maxWidth: 'min(95vw, 1280px)',
                    width: 'min(95vw, 1280px)',
                    minWidth: 'min(95vw, 1280px)'
                }}
            >
                <DialogHeader>
                    <DialogTitle>Link Analytics</DialogTitle>
                    <DialogDescription>
                        Detailed analytics for {link.shortCode}
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="text-gray-500">Loading analytics...</div>
                    </div>
                ) : analytics ? (
                    <div className="space-y-4">
                        {/* Link Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Link Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div>
                                    <span className="text-sm font-medium text-gray-600">Short URL:</span>
                                    <p className="text-sm text-gray-900 break-all">{shortUrl}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-600">Original URL:</span>
                                    <p className="text-sm text-gray-900 break-all">{link.originalUrl}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-600">Created:</span>
                                    <p className="text-sm text-gray-900">
                                        {format(new Date(link.createdAt), 'PPp')}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Total Clicks</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {analytics.totalClicks}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Unique Visitors</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {analytics.uniqueVisitors}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Device Distribution */}
                        {Object.keys(analytics.deviceDistribution).length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Device Distribution</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {Object.entries(analytics.deviceDistribution)
                                            .sort(([, a], [, b]) => b - a)
                                            .map(([device, count]) => {
                                                const percentage =
                                                    (count / analytics.totalClicks) * 100
                                                return (
                                                    <div key={device} className="space-y-1">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-700">{device}</span>
                                                            <span className="font-medium text-gray-900">
                                                                {count} ({percentage.toFixed(1)}%)
                                                            </span>
                                                        </div>
                                                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-blue-600 rounded-full"
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Country Distribution */}
                        {Object.keys(analytics.countryDistribution).length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Top Countries</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {Object.entries(analytics.countryDistribution)
                                            .sort(([, a], [, b]) => b - a)
                                            .slice(0, 5)
                                            .map(([country, count]) => {
                                                const percentage =
                                                    (count / analytics.totalClicks) * 100
                                                return (
                                                    <div key={country} className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-700">{country}</span>
                                                        <span className="font-medium text-gray-900">
                                                            {count} ({percentage.toFixed(1)}%)
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Browser Distribution */}
                        {analytics.browserDistribution && Object.keys(analytics.browserDistribution).length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Browser Distribution</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {Object.entries(analytics.browserDistribution)
                                            .sort(([, a], [, b]) => b - a)
                                            .map(([browser, count]) => {
                                                const percentage =
                                                    (count / analytics.totalClicks) * 100
                                                return (
                                                    <div key={browser} className="space-y-1">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-700">{browser}</span>
                                                            <span className="font-medium text-gray-900">
                                                                {count} ({percentage.toFixed(1)}%)
                                                            </span>
                                                        </div>
                                                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-green-600 rounded-full"
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Source Distribution */}
                        {analytics.sourceDistribution && Object.keys(analytics.sourceDistribution).length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Traffic Sources</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {Object.entries(analytics.sourceDistribution)
                                            .sort(([, a], [, b]) => b - a)
                                            .map(([source, count]) => {
                                                const percentage =
                                                    (count / analytics.totalClicks) * 100
                                                return (
                                                    <div key={source} className="space-y-1">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-700">{source}</span>
                                                            <span className="font-medium text-gray-900">
                                                                {count} ({percentage.toFixed(1)}%)
                                                            </span>
                                                        </div>
                                                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-purple-600 rounded-full"
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Recent Clicks */}
                        {analytics.clicks.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Recent Clicks</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {analytics.clicks.slice(0, 10).map((click, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between text-sm border-b pb-2 last:border-0"
                                            >
                                                <div className="flex-1">
                                                    <p className="text-gray-900 font-medium">
                                                        {format(new Date(click.clickedAt), 'PPp')}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        <p className="text-xs text-gray-500">
                                                            {click.deviceType || 'Unknown'} Device
                                                        </p>
                                                        {click.browser && (
                                                            <p className="text-xs text-gray-500">
                                                                • {click.browser}
                                                            </p>
                                                        )}
                                                        {click.country && (
                                                            <p className="text-xs text-gray-500">
                                                                • {click.country}
                                                            </p>
                                                        )}
                                                        {click.city && (
                                                            <p className="text-xs text-gray-500">
                                                                • {click.city}
                                                            </p>
                                                        )}
                                                        {click.sourceType && (
                                                            <p className="text-xs text-blue-600 font-medium">
                                                                • {click.sourceType}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {click.referrer && (
                                                        <p className="text-xs text-gray-400 mt-1 truncate max-w-md">
                                                            From: {click.referrer}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-center py-8">
                        <div className="text-gray-500">No analytics data available</div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

