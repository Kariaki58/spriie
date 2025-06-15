import { ReactNode } from 'react'

export function DashboardCard({
    title,
    value,
    icon,
    trend,
}: {
    title: string
    value: string
    icon: ReactNode
    trend?: ReactNode
}) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {title}
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {value}
                    </h3>
                </div>
                <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                    {icon}
                </div>
            </div>
            {trend && <div className="mt-4">{trend}</div>}
        </div>
    )
}