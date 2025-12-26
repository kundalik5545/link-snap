'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function RedirectPage() {
    const params = useParams()
    const shortCode = params?.shortCode as string

    useEffect(() => {
        if (shortCode) {
            // Redirect to API route which will handle the redirect and tracking
            window.location.href = `/api/${shortCode}`
        }
    }, [shortCode])

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-center">
                <div className="mb-4 text-lg text-gray-600">Redirecting...</div>
                <div className="h-2 w-64 overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full w-full animate-pulse bg-blue-600" />
                </div>
            </div>
        </div>
    )
}

