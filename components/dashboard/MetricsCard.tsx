import { Card, CardContent } from '@/components/ui/card'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricsCardProps {
    title: string
    value: string | number
    change?: number
    changeLabel?: string
    icon: React.ReactNode
    iconBgColor?: string
}

export function MetricsCard({
    title,
    value,
    change,
    changeLabel,
    icon,
    iconBgColor = 'bg-blue-100',
}: MetricsCardProps) {
    const isPositive = change !== undefined && change >= 0
    const changeColor = isPositive ? 'text-green-600' : 'text-red-600'

    return (
        <Card>
            <CardContent className="flex items-center justify-between p-6">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
                    {change !== undefined && (
                        <div className="mt-2 flex items-center gap-1">
                            {isPositive ? (
                                <ArrowUp className={cn('h-4 w-4', changeColor)} />
                            ) : (
                                <ArrowDown className={cn('h-4 w-4', changeColor)} />
                            )}
                            <span className={cn('text-sm font-medium', changeColor)}>
                                {isPositive ? '+' : ''}
                                {change}% {changeLabel || 'from last month'}
                            </span>
                        </div>
                    )}
                </div>
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', iconBgColor)}>
                    {icon}
                </div>
            </CardContent>
        </Card>
    )
}

