'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BarChart3, User, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Profile', href: '/profile', icon: User },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-white">
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 px-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <span className="text-xl font-bold text-white">L</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">LinkSnap</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            {/* User Profile */}
            <div className="border-t p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                        AM
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">Alex Morgan</div>
                        <div className="text-xs text-gray-500">Pro Plan</div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    )
}

