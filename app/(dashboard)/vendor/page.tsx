'use client';

import { DashboardCard } from '@/components/dashboard/DashboardCard';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecentOrders } from '@/components/dashboard/RecentOrders';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardData } from '@/hooks/useDashboardData';
import { LucideIcon } from 'lucide-react';

// Define types for the dashboard data
type StatItem = {
  title: string;
  value: string;
  change: string;
  icon: keyof typeof iconMap;
};

type RecentOrder = {
  id: string;
  customer: string;
  amount: string;
  status: string;
  date: string;
};

type AlertItem = {
  type: string;
  message: string;
  details: string;
};

type PerformanceDataItem = {
  day: string;
  sales: number;
  orders: number;
};


// Define props for components
type QuickAction = {
  title: string;
  icon: React.ReactNode;
  action: string;
};

const iconMap = {
  'dollar-sign': DollarSign,
  'shopping-cart': ShoppingCart,
  'package': Package,
  'message-square': MessageSquare
} as Record<string, LucideIcon>;


type DashboardData = {
  stats: StatItem[];
  recentOrders: RecentOrder[];
  alerts: AlertItem[];
  performanceData: PerformanceDataItem[];
}

export default function DashboardPage() {
    const { dashboardData, loading, error } = useDashboardData();

    const quickActions: QuickAction[] = [
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
    ];

    if (loading) {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
            
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-36 rounded-lg" />
            ))}
          </div>
              
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-80 rounded-lg" />
            <Skeleton className="lg:col-span-2 h-80 rounded-lg" />
          </div>
              
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="lg:col-span-2 h-80 rounded-lg" />
            <Skeleton className="h-80 rounded-lg" />
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            Failed to load dashboard data
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {error}
          </p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      );
    }

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
        {(dashboardData as DashboardData)?.stats.map((stat, index) => {
          const IconComponent = iconMap[stat.icon];
          return (
            <DashboardCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              icon={<IconComponent className="h-5 w-5" />}
            />
          );
        })}
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
          <PerformanceChart data={(dashboardData as DashboardData)?.performanceData} />
        </div>
      </div>

      {/* Bottom Section - Recent Orders and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrders orders={(dashboardData as DashboardData)?.recentOrders || []} />
        </div>
        
        <div className="dark:bg-gray-800 rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Alerts & Notifications</h2>
          <div className="space-y-4">
            {(dashboardData as DashboardData)?.alerts.map((alert, index) => (
              <div key={index} className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium">{alert.message}</p>
                  <p className="text-sm text-muted-foreground">
                    {alert.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}