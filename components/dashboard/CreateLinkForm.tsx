'use client'

import { useState } from 'react'
import { Link as LinkIcon, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function CreateLinkForm({ onLinkCreated }: { onLinkCreated?: () => void }) {
    const [url, setUrl] = useState('')
    const [customAlias, setCustomAlias] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const response = await fetch('/api/links', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    originalUrl: url,
                    customAlias: customAlias || undefined,
                }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to create link')
            }

            // Reset form
            setUrl('')
            setCustomAlias('')
            onLinkCreated?.()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create link')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create New Link</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="url">Paste your long URL here</Label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                id="url"
                                type="url"
                                placeholder="Paste your long URL here (e.g., https://example.com/very/long/path)"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Wrench className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Custom alias (optional)"
                                value={customAlias}
                                onChange={(e) => setCustomAlias(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Shortening...' : 'Shorten'}
                        </Button>
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                </form>
            </CardContent>
        </Card>
    )
}

