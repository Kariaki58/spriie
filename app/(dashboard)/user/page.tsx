"use client"
import { useState } from 'react';
import React from 'react';
import { useSession } from 'next-auth/react';

// Types
type Order = {
  id: string;
  date: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  amount: number;
};

type WishlistItem = {
  id: string;
  name: string;
  price: number;
  image: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
};

type Activity = {
  id: string;
  type: 'order' | 'points' | 'payment';
  title: string;
  date: string;
  icon: React.ReactElement;
};

type StatsCardProps = {
  title: string;
  value: string;
  icon: React.ReactElement;
  trend: 'up' | 'down' | 'neutral';
  percentage: string;
};

const StatsCard = ({ title, value, icon, trend, percentage }: StatsCardProps) => {
  const trendColor = {
    up: 'text-emerald-600 dark:text-emerald-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">{value}</p>
        </div>
        <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
          {icon}
        </div>
      </div>
      <div className={`mt-2 text-sm ${trendColor[trend]} flex items-center`}>
        {trend === 'up' ? (
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12 7a1 1 0 01.707.293l4 4a1 1 0 01-1.414 1.414L12 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4A1 1 0 0112 7z" clipRule="evenodd" />
          </svg>
        ) : trend === 'down' ? (
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12 13a1 1 0 01-.707-.293l-4-4a1 1 0 011.414-1.414L12 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4A1 1 0 0112 13z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 13a1 1 0 01-.707-.293l-2-2a1 1 0 011.414-1.414L10 10.586l1.293-1.293a1 1 0 011.414 1.414l-2 2A1 1 0 0110 13z" clipRule="evenodd" />
          </svg>
        )}
        {percentage} from last month
      </div>
    </div>
  );
};

const UserDashboard = () => {
  // Mock user data
  const { data: session } = useSession();
  const [user] = useState({
    name: 'John Doe',
    initials: 'JD',
    totalSpent: 524500, // in kobo (₦5,245.00)
    totalOrders: 8,
    activeOrders: 2,
    loyaltyPoints: 1850,
    loyaltyTier: 'Gold',
    address: {
      street: '123 Victoria Island',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria'
    }
  });

  // Mock orders data
  const [orders] = useState<Order[]>([
    {
      id: 'SPR-2023-4567',
      date: 'June 12, 2023',
      status: 'delivered',
      amount: 125000 // ₦1,250.00
    },
    {
      id: 'SPR-2023-4566',
      date: 'June 5, 2023',
      status: 'shipped',
      amount: 89500 // ₦895.00
    }
  ]);

  // Mock wishlist data with fixed placeholder images
  const [wishlist] = useState<WishlistItem[]>([
    {
      id: '1',
      name: 'Smartphone X',
      price: 150000,
      image: 'https://placehold.co/150x150?text=Smartphone'
    },
    {
      id: '2',
      name: 'Wireless Earbuds',
      price: 35000,
      image: 'https://placehold.co/150x150?text=Earbuds'
    },
    {
      id: '3',
      name: 'Laptop Bag',
      price: 12000,
      image: 'https://placehold.co/150x150?text=Laptop+Bag'
    },
    {
      id: '4',
      name: 'Smart Watch',
      price: 75000,
      image: 'https://placehold.co/150x150?text=Smart+Watch'
    }
  ]);

  // Mock recommended products with fixed placeholder images
  const [recommendedProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Generac Power Generator',
      price: 250000,
      image: 'https://placehold.co/150x150?text=Generator'
    },
    {
      id: '2',
      name: 'Solar Panel Kit',
      price: 180000,
      image: 'https://placehold.co/150x150?text=Solar+Panel'
    },
    {
      id: '3',
      name: 'Inverter System',
      price: 120000,
      image: 'https://placehold.co/150x150?text=Inverter'
    },
    {
      id: '4',
      name: 'Portable Fridge',
      price: 95000,
      image: 'https://placehold.co/150x150?text=Portable+Fridge'
    }
  ]);

  // Mock activities
  const [activities] = useState<Activity[]>([
    {
      id: '1',
      type: 'order',
      title: `Order ${orders[0].id} delivered`,
      date: '2 days ago',
      icon: (
        <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    {
      id: '2',
      type: 'order',
      title: `Order ${orders[1].id} shipped`,
      date: '1 week ago',
      icon: (
        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: '3',
      type: 'points',
      title: 'You earned 150 loyalty points',
      date: '2 weeks ago',
      icon: (
        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      )
    }
  ]);

  // Format currency for Nigeria (Naira)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount / 100); // Convert from kobo to Naira
  };

  // Get status color
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return { bg: 'bg-emerald-100 dark:bg-emerald-900/50', text: 'text-emerald-800 dark:text-emerald-200' };
      case 'shipped':
        return { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-800 dark:text-blue-200' };
      case 'pending':
        return { bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-800 dark:text-yellow-200' };
      case 'cancelled':
        return { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-800 dark:text-red-200' };
      default:
        return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-200' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 mb-6 text-white shadow-lg">
          <h2 className="text-2xl font-bold">Welcome back, {session?.user?.name}!</h2>
          <p className="opacity-90 mt-1">Here's what's happening with your Spriie account today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatsCard
            title="Total Spent"
            value={formatCurrency(user.totalSpent)}
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            }
            trend="up"
            percentage="12.5%"
          />
          <StatsCard
            title="Total Orders"
            value={user.totalOrders.toString()}
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
              </svg>
            }
            trend="up"
            percentage="8.3%"
          />
          <StatsCard
            title="Active Orders"
            value={user.activeOrders.toString()}
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            }
            trend="neutral"
            percentage="0%"
          />
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Recent Orders</h3>
            <div className="space-y-4">
              {orders.map((order) => {
                const statusColor = getStatusColor(order.status);
                return (
                  <div key={order.id} className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">{order.id}</p>
                      <p className="text-sm text-gray-500">{order.date}</p>
                      <p className="text-sm text-gray-800 dark:text-gray-300 mt-1">{formatCurrency(order.amount)}</p>
                    </div>
                    <span className={`px-3 py-1 ${statusColor.bg} ${statusColor.text} text-sm rounded-full capitalize`}>
                      {order.status}
                    </span>
                  </div>
                );
              })}
              <button className="w-full mt-2 py-2 text-emerald-600 dark:text-emerald-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition">
                View all orders
              </button>
            </div>
          </div>

          {/* Wishlist Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Wishlist</h3>
            <div className="grid grid-cols-2 gap-4">
              {wishlist.map((item) => (
                <div key={item.id} className="group relative">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white dark:bg-gray-700 rounded-full shadow-sm">
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate mt-1">{item.name}</p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">{formatCurrency(item.price)}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-emerald-600 dark:text-emerald-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition">
              View full wishlist
            </button>
          </div>

          {/* Account Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Account Summary</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Total Spent</p>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{formatCurrency(user.totalSpent)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Loyalty Points</p>
                <div className="flex items-center space-x-2">
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{user.loyaltyPoints.toLocaleString()}</p>
                  <span className="text-xs bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 px-2 py-1 rounded-full">
                    {user.loyaltyTier} Tier
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Default Address</p>
                <p className="text-gray-800 dark:text-gray-200">{user.address.street}</p>
                <p className="text-gray-800 dark:text-gray-200">{user.address.city}, {user.address.state}</p>
                <p className="text-gray-800 dark:text-gray-200">{user.address.country}</p>
              </div>
              <button className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition">
                Manage Account
              </button>
            </div>
          </div>

          {/* Recommended Products */}
          <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Recommended For You</h3>
              <button className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">View all</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendedProducts.map((product) => (
                <div key={product.id} className="group">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-2">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{product.name}</p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">{formatCurrency(product.price)}</p>
                  <button className="mt-2 w-full py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {activities.map((activity) => {
                let bgColor = 'bg-gray-100 dark:bg-gray-700';
                if (activity.type === 'order') bgColor = 'bg-emerald-100 dark:bg-emerald-900/20';
                if (activity.type === 'points') bgColor = 'bg-purple-100 dark:bg-purple-900/20';
                
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 ${bgColor} rounded-full`}>
                      {activity.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.date}</p>
                    </div>
                  </div>
                );
              })}
              <button className="w-full mt-2 py-2 text-emerald-600 dark:text-emerald-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition">
                View all activity
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;