'use client'

import { useState, useEffect } from 'react'
import { MetricsCard } from '@/components/dashboard/MetricsCard'
import { ClickOverviewChart } from '@/components/analytics/ClickOverviewChart'
import { DeviceDistributionChart } from '@/components/analytics/DeviceDistributionChart'
import { TopLocations } from '@/components/analytics/TopLocations'
import { Send, Globe, Smartphone } from 'lucide-react'
import { format, subDays } from 'date-fns'

interface Analytics {
    totalClicks: number
    activeLinks: number
    mobileTraffic: number
    deviceDistribution: Record<string, number>
    countryDistribution: Record<string, number>
    dailyClicks: Record<string, number>
    uniqueVisitorsDaily: Record<string, number>
}

export default function AnalyticsPage() {
    const [analytics, setAnalytics] = useState<Analytics | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/analytics')
            .then((res) => res.json())
            .then((data) => {
                setAnalytics(data)
                setLoading(false)
            })
            .catch((error) => {
                console.error('Error fetching analytics:', error)
                setLoading(false)
            })
    }, [])

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-gray-500">Loading...</div>
            </div>
        )
    }

    // Prepare device distribution data
    const deviceData = analytics
        ? Object.entries(analytics.deviceDistribution)
            .map(([name, value]) => {
                const total = Object.values(analytics.deviceDistribution).reduce((a, b) => a + b, 0)
                return {
                    name,
                    value,
                    percentage: total > 0 ? Math.round((value / total) * 100) : 0,
                }
            })
            .sort((a, b) => b.value - a.value)
        : []

    // Prepare daily clicks data for last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd')
        return date
    })

    const dailyData = last7Days.map((date) => ({
        date,
        clicks: analytics?.dailyClicks[date] || 0,
        uniqueVisitors: analytics?.uniqueVisitorsDaily[date] || 0,
    }))

    // Prepare top locations data
    const topLocations = analytics
        ? Object.entries(analytics.countryDistribution)
            .map(([country, clicks]) => {
                const total = Object.values(analytics.countryDistribution).reduce((a, b) => a + b, 0)
                return {
                    country,
                    code: country.substring(0, 2).toUpperCase(),
                    clicks,
                    percentage: total > 0 ? Math.round((clicks / total) * 100) : 0,
                }
            })
            .sort((a, b) => b.clicks - a.clicks)
            .slice(0, 5)
        : []

    // Calculate percentage changes (mock data for now)
    const totalClicksChange = 12.5
    const activeLinksChange = 4.2
    const avgCtrChange = -1.1

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                <p className="mt-1 text-gray-600">Detailed insights into your link performance.</p>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <MetricsCard
                    title="Total Clicks"
                    value={analytics?.totalClicks.toLocaleString() || '0'}
                    change={totalClicksChange}
                    icon={<Send className="h-6 w-6 text-blue-600" />}
                    iconBgColor="bg-blue-100"
                />
                <MetricsCard
                    title="Active Links"
                    value={analytics?.activeLinks.toLocaleString() || '0'}
                    change={activeLinksChange}
                    icon={<Globe className="h-6 w-6 text-blue-600" />}
                    iconBgColor="bg-blue-100"
                />
                <MetricsCard
                    title="Avg. CTR"
                    value="4.8%"
                    change={avgCtrChange}
                    icon={<Smartphone className="h-6 w-6 text-blue-600" />}
                    iconBgColor="bg-blue-100"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ClickOverviewChart data={dailyData} />
                <DeviceDistributionChart data={deviceData} />
            </div>

            {/* Top Locations */}
            <TopLocations locations={topLocations} />
        </div>
    )
}

