'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Link as LinkIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { QRCodeModal } from '@/components/shared/QRCodeModal'
import { LinkAnalyticsModal } from '@/components/shared/LinkAnalyticsModal'

interface Link {
    id: string
    originalUrl: string
    shortCode: string
    createdAt: string
    clickCount?: number
}

interface RecentLinksProps {
    links: Link[]
    baseUrl: string
}

export function RecentLinks({ links, baseUrl }: RecentLinksProps) {
    const [selectedLink, setSelectedLink] = useState<Link | null>(null)
    const [analyticsLink, setAnalyticsLink] = useState<Link | null>(null)
    const router = useRouter()

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Links</CardTitle>
                    <Button
                        variant="link"
                        className="text-blue-600"
                        onClick={() => router.push('/analytics')}
                    >
                        View All
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {links.length === 0 ? (
                            <p className="text-sm text-gray-500">No links yet. Create your first link!</p>
                        ) : (
                            links.map((link) => {
                                const shortUrl = `${baseUrl}/${link.shortCode}`
                                const displayUrl =
                                    link.originalUrl.length > 40
                                        ? `${link.originalUrl.substring(0, 40)}...`
                                        : link.originalUrl

                                return (
                                    <div
                                        key={link.id}
                                        className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50 cursor-pointer"
                                        onClick={() => setAnalyticsLink(link)}
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <LinkIcon className="h-5 w-5 text-gray-400 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-900 truncate">{link.shortCode}</div>
                                                <div className="text-sm text-gray-500 truncate">{displayUrl}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 ml-4">
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {link.clickCount || 0}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {format(new Date(link.createdAt), 'MMM d')}
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setSelectedLink(link)
                                                }}
                                            >
                                                QR
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </CardContent>
            </Card>

            {selectedLink && (
                <QRCodeModal
                    link={selectedLink}
                    baseUrl={baseUrl}
                    onClose={() => setSelectedLink(null)}
                />
            )}

            {analyticsLink && (
                <LinkAnalyticsModal
                    link={analyticsLink}
                    baseUrl={baseUrl}
                    onClose={() => setAnalyticsLink(null)}
                />
            )}
        </>
    )
}

