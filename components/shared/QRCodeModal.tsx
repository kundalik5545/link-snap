'use client'

import { useRef, useState } from 'react'
import { Download, Copy, Check } from 'lucide-react'
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
    const [copied, setCopied] = useState(false)
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
            // Try modern Clipboard API first
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(shortUrl)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
                return
            }

            // Fallback for mobile devices and older browsers
            const textArea = document.createElement('textarea')
            textArea.value = shortUrl
            // Make textarea visible but off-screen for better mobile compatibility
            textArea.style.position = 'fixed'
            textArea.style.left = '0'
            textArea.style.top = '0'
            textArea.style.width = '2em'
            textArea.style.height = '2em'
            textArea.style.padding = '0'
            textArea.style.border = 'none'
            textArea.style.outline = 'none'
            textArea.style.boxShadow = 'none'
            textArea.style.background = 'transparent'
            textArea.style.opacity = '0'
            textArea.setAttribute('readonly', '')
            textArea.setAttribute('aria-hidden', 'true')
            document.body.appendChild(textArea)
            
            // Select and copy - works better on iOS
            textArea.focus()
            textArea.select()
            // For iOS Safari
            textArea.setSelectionRange(0, shortUrl.length)
            
            try {
                const successful = document.execCommand('copy')
                if (successful) {
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                } else {
                    throw new Error('execCommand failed')
                }
            } catch (err) {
                console.error('Fallback copy failed:', err)
                // Last resort: show the URL for manual copy
                alert(`Please copy this link manually:\n${shortUrl}`)
            } finally {
                document.body.removeChild(textArea)
            }
        } catch (err) {
            console.error('Failed to copy link:', err)
            // Show URL for manual copy as last resort
            alert(`Please copy this link manually:\n${shortUrl}`)
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
                            {copied ? (
                                <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Link
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

