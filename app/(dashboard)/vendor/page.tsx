import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { CreditCard, Package, Users, DollarSign } from 'lucide-react'

export default async function DashboardPage() {
    const stats = [
        { title: 'Total Revenue', value: '$45,231', icon: <DollarSign /> },
        { title: 'Orders', value: '+2350', icon: <CreditCard /> },
        { title: 'Products', value: '12', icon: <Package /> },
        { title: 'Customers', value: '+1,234', icon: <Users /> },
    ]

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <DashboardCard
                        key={index}
                        title={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                    />
                ))}
            </div>
        </div>
    )
}