import DashboardSidebar from '@/components/dashboard/Sidebar'
import TopNav from '@/components/dashboard/TopNav'
import { Home, ShoppingCart, Users, Settings, Package, BarChart2, TableOfContents, CloudUpload, MonitorUp } from 'lucide-react'
import ProviderImport from './provider-import'

const sidebarConfig = {
    navItems: [
        { href: '/vendor', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
        { href: '/vendor/analytics', label: 'Analytics', icon: <BarChart2 className="w-5 h-5" /> },
        { href: '/vendor/content', label: 'content', icon: <TableOfContents className="w-5 h-5"/> },
        { href: '/vendor/content-upload', label: 'Content Upload', icon: <MonitorUp className="w-5 h-5" /> },
        // { href: '/vendor/products', label: 'Products', icon: <Package className="w-5 h-5" /> },
        // { href: '/vendor/product-upload', label: 'Product Upload', icon: <CloudUpload className="w-5 h-5"/> },
        { href: '/vendor/orders', label: 'Orders', icon: <ShoppingCart className="w-5 h-5" /> },
        { href: '/vendor/customers', label: 'Customers', icon: <Users className="w-5 h-5" /> },
        { href: '/vendor/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
    ]
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
            <ProviderImport>
                <DashboardSidebar config={sidebarConfig}/>
                <div className="flex flex-col flex-1 overflow-hidden">
                    <TopNav />
                    <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </ProviderImport>
        </div>
    )
}