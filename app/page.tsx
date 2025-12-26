'use client'

import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MetricsCard } from '@/components/dashboard/MetricsCard'
import { CreateLinkForm } from '@/components/dashboard/CreateLinkForm'
import { RecentLinks } from '@/components/dashboard/RecentLinks'
import { ClickActivityChart } from '@/components/dashboard/ClickActivityChart'
import { Send, Link2, Smartphone } from 'lucide-react'
import { format, subMonths } from 'date-fns'
import { downloadExcelReport } from '@/lib/excel-export'

interface Link {
  id: string
  originalUrl: string
  shortCode: string
  createdAt: string
  clickCount?: number
}

interface Analytics {
  totalClicks: number
  activeLinks: number
  mobileTraffic: number
  clicksByMonth: Record<string, number>
}

export default function DashboardPage() {
  const [links, setLinks] = useState<Link[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const fetchData = async () => {
    try {
      const [linksRes, analyticsRes] = await Promise.all([
        fetch('/api/links'),
        fetch('/api/analytics'),
      ])

      if (linksRes.ok) {
        const linksData = await linksRes.json()
        setLinks(linksData.slice(0, 3)) // Show only recent 3
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json()
        setAnalytics(analyticsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Prepare chart data for last 7 months
  const chartData = analytics
    ? Object.entries(analytics.clicksByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, clicks]) => ({
        month: format(new Date(month + '-01'), 'MMM'),
        clicks: clicks as number,
      }))
    : []

  // Calculate percentage changes (mock data for now)
  const totalClicksChange = 2.5
  const activeLinksChange = 4.1
  const mobileTrafficChange = -1.2

  const handleDownloadReport = () => {
    if (!analytics || links.length === 0) {
      alert('No data available to download')
      return
    }

    // Fetch all links for the report
    fetch('/api/links')
      .then((res) => res.json())
      .then((allLinks) => {
        // Fetch full analytics
        fetch('/api/analytics')
          .then((res) => res.json())
          .then((fullAnalytics) => {
            downloadExcelReport(allLinks, fullAnalytics)
          })
          .catch((error) => {
            console.error('Error fetching analytics:', error)
            alert('Failed to download report')
          })
      })
      .catch((error) => {
        console.error('Error fetching links:', error)
        alert('Failed to download report')
      })
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-600">Welcome back, here's your link overview.</p>
        </div>
        <Button onClick={handleDownloadReport}>
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
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
          icon={<Link2 className="h-6 w-6 text-purple-600" />}
          iconBgColor="bg-purple-100"
        />
        <MetricsCard
          title="Mobile Traffic"
          value={`${analytics?.mobileTraffic || 0}%`}
          change={mobileTrafficChange}
          icon={<Smartphone className="h-6 w-6 text-pink-600" />}
          iconBgColor="bg-pink-100"
        />
      </div>

      {/* Create Link Form */}
      <CreateLinkForm onLinkCreated={fetchData} />

      {/* Charts and Recent Links */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ClickActivityChart data={chartData} />
        <RecentLinks links={links} baseUrl={baseUrl} />
      </div>
    </div>
  )
}
