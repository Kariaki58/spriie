import DashboardSidebar from '@/components/dashboard/Sidebar'
import TopNav from '@/components/dashboard/TopNav'
import { 
  Home, 
  ShoppingCart, 
  Settings, 
  History, 
  Star, 
  Package, 
  PackageSearch, 
  UserPlus,
  ShieldCheck
} from 'lucide-react'
import ProviderImport from '../vendor/provider-import'

const sidebarConfig = {
    navItems: [
        { href: '/user', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },        
        { href: '/user/orders', label: 'Orders', icon: <ShoppingCart className="w-5 h-5" /> },
        { href: '/user/product-tracking', label: 'Product Tracking', icon: <PackageSearch className="w-5 h-5" /> },
        
        { href: '/user/reviews', label: 'My Reviews', icon: <Star className="w-5 h-5" /> },
        { href: '/user/pending-reviews', label: 'Pending Reviews', icon: <Star className="w-5 h-5" /> },
        
        { href: '/store', label: 'Become a Seller', icon: <UserPlus className="w-5 h-5" />, highlight: true },
        { href: '/vendor', label: 'Seller Dashboard', icon: <ShieldCheck className="w-5 h-5" /> },
        
        { href: '/user/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
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
                    <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </ProviderImport>
        </div>
    )
}