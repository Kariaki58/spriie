import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { 
  CreditCard, 
  Package, 
  Users, 
  DollarSign,
  ShoppingCart,
  Truck,
  RefreshCw,
  AlertCircle,
  MessageSquare,
  Plus,
  TrendingUp,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RecentOrders } from '@/components/dashboard/RecentOrders'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { PerformanceChart } from '@/components/dashboard/PerformanceChart'

export default async function DashboardPage() {
    const stats = [
        { 
          title: 'Today\'s Revenue', 
          value: '₦245,800', 
          change: '+12% from yesterday',
          icon: <DollarSign className="text-green-500" /> 
        },
        { 
          title: 'Pending Orders', 
          value: '24', 
          change: '5 new in last hour',
          icon: <ShoppingCart className="text-blue-500" /> 
        },
        { 
          title: 'Products', 
          value: '42', 
          change: '3 low in stock',
          icon: <Package className="text-amber-500" /> 
        },
        { 
          title: 'Customer Messages', 
          value: '8', 
          change: '3 awaiting reply',
          icon: <MessageSquare className="text-purple-500" /> 
        },
    ]

    const quickActions = [
      {
        title: 'Add New Product',
        icon: <Plus className="h-5 w-5" />,
        action: '/vendor/content-upload'
      },
      {
        title: 'Process Orders',
        icon: <Truck className="h-5 w-5" />,
        action: '/vendor/orders'
      },
      {
        title: 'Update Inventory',
        icon: <RefreshCw className="h-5 w-5" />,
        action: '/vendor/content'
      },
      {
        title: 'View Reports',
        icon: <FileText className="h-5 w-5" />,
        action: '/vendor/analytics'
      }
    ]

    const recentOrders = [
      {
        id: '#ORD-8765',
        customer: 'Adebola Johnson',
        amount: '₦42,500',
        status: 'processing',
        date: '10 mins ago'
      },
      {
        id: '#ORD-8764',
        customer: 'Chinedu Okoro',
        amount: '₦18,750',
        status: 'shipped',
        date: '25 mins ago'
      },
      {
        id: '#ORD-8763',
        customer: 'Funke Adeleke',
        amount: '₦63,200',
        status: 'pending',
        date: '1 hour ago'
      },
      {
        id: '#ORD-8762',
        customer: 'Emeka Okafor',
        amount: '₦12,900',
        status: 'delivered',
        date: '2 hours ago'
      },
      {
        id: '#ORD-8761',
        customer: 'Bisi Alabi',
        amount: '₦29,350',
        status: 'processing',
        date: '3 hours ago'
      }
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold">Seller Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome back! Here's what's happening with your store today.
                </p>
              </div>
              <Button className="gap-2">
                <TrendingUp className="h-4 w-4" />
                View Analytics
              </Button>
            </div>

            {/* Stats Cards - Top Section */}
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

            {/* Middle Section - Quick Actions and Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <QuickActions actions={quickActions} />
              
              <div className="lg:col-span-2 dark:bg-gray-800 rounded-lg border p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">7-Day Performance</h2>
                  <Button variant="ghost" size="sm">
                    Last 7 days
                  </Button>
                </div>
                <PerformanceChart />
              </div>
            </div>

            {/* Bottom Section - Recent Orders and Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RecentOrders orders={recentOrders} />
              </div>
              
              <div className="dark:bg-gray-800 rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4">Alerts & Notifications</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-medium">3 products low in stock</p>
                      <p className="text-sm text-muted-foreground">
                        Nike Air Max, Adidas Ultraboost, and Puma RS-X are running low
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Truck className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium">5 orders ready for dispatch</p>
                      <p className="text-sm text-muted-foreground">
                        Packages need to be prepared for shipping today
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="font-medium">New customer inquiry</p>
                      <p className="text-sm text-muted-foreground">
                        Oluwaseun asked about product availability
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
    )
}