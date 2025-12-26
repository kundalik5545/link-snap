'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ProfilePage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                <p className="mt-1 text-gray-600">Manage your account settings and preferences.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-xl font-semibold text-white">
                            AM
                        </div>
                        <div>
                            <div className="text-lg font-semibold text-gray-900">Alex Morgan</div>
                            <div className="text-sm text-gray-500">Pro Plan</div>
                        </div>
                    </div>
                    <div className="pt-4 border-t">
                        <p className="text-sm text-gray-600">
                            This is a simplified profile page. In a full implementation, you would have user
                            authentication and profile management features.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

