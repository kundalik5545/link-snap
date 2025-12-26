'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BarChart3, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Profile', href: '/profile', icon: User },
]

export function BottomNav() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white md:hidden">
            <div className="grid h-16 grid-cols-3">
                {navigation.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center justify-center gap-1 transition-colors',
                                isActive
                                    ? 'text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            )}
                        >
                            <Icon className={cn('h-6 w-6', isActive && 'text-blue-600')} />
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}

