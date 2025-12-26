'use client'

import { Search, Bell } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function Header() {
    return (
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
            <div className="flex flex-1 items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        type="search"
                        placeholder="Search links..."
                        className="pl-10 text-sm"
                    />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button className="relative text-gray-400 hover:text-gray-600">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500" />
                </button>
            </div>
        </header>
    )
}

