'use client'

import { useRef } from 'react'
import { Download, Copy } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { QRCodeSVG } from 'qrcode.react'
import { getBaseUrl } from '@/lib/config'

interface Link {
    id: string
    shortCode: string
    originalUrl: string
}

interface QRCodeModalProps {
    link: Link
    onClose: () => void
}

export function QRCodeModal({ link, onClose }: QRCodeModalProps) {
    const qrRef = useRef<HTMLDivElement>(null)
    const baseUrl = getBaseUrl()
    const shortUrl = `${baseUrl}/${link.shortCode}`

    const handleDownload = () => {
        if (!qrRef.current) return

        const svg = qrRef.current.querySelector('svg')
        if (!svg) return

        const svgData = new XMLSerializer().serializeToString(svg)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()

        img.onload = () => {
            canvas.width = img.width
            canvas.height = img.height
            ctx?.drawImage(img, 0, 0)
            const pngFile = canvas.toDataURL('image/png')
            const downloadLink = document.createElement('a')
            downloadLink.download = `qrcode-${link.shortCode}.png`
            downloadLink.href = pngFile
            downloadLink.click()
        }

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    }

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shortUrl)
            // You could add a toast notification here
        } catch (err) {
            console.error('Failed to copy link:', err)
        }
    }

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>QR Code</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 py-4">
                    <div ref={qrRef} className="flex items-center justify-center p-4 bg-white rounded-lg">
                        <QRCodeSVG value={shortUrl} size={200} />
                    </div>
                    <p className="text-sm text-gray-600 break-all text-center">{shortUrl}</p>
                    <div className="flex gap-2 w-full">
                        <Button variant="default" onClick={handleDownload} className="flex-1">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                        </Button>
                        <Button variant="outline" onClick={handleCopyLink} className="flex-1">
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Link
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

