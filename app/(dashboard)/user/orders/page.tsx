"use client"
import { useState } from 'react';
import { useUserOrders } from '@/hooks/useUserOrders';
import { Copy, Check } from 'lucide-react';

type OrderStatus = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
  image: string;
  variants?: {
    attribute: string;
    value: string;
  }[];
};

type ShippingAddress = {
  fullName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
};

type Order = {
  id: string;
  date: string;
  status: OrderStatus;
  amount: number;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  trackingNumber?: string;
};

const UserOrderDashboard = () => {
  const [activeTab, setActiveTab] = useState<OrderStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const { orders, loading, error, cancelOrder, initiateReturn } = useUserOrders();


  console.log(orders)

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleCopyOrderId = (orderId: string) => {
    navigator.clipboard.writeText(orderId);
    setCopiedOrderId(orderId);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const shortenOrderId = (orderId: string) => {
    return `${orderId.substring(0, 4)}...${orderId.substring(orderId.length - 4)}`;
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'returned':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const statusTabs: OrderStatus[] = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm max-w-md w-full text-center">
          <div className="text-red-500 dark:text-red-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-2">Error Loading Orders</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Main Content */}
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 px-2">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">My Orders</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage your orders</p>
        </div>

        {/* Status Tabs - Scrollable */}
        <div className="mb-6 px-2">
          <div className="flex space-x-2 pb-2 overflow-x-auto scrollbar-hide">
            {statusTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4 px-2">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
                {/* Order Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                          Order #{shortenOrderId(order.id)}
                        </h3>
                        <button 
                          onClick={() => handleCopyOrderId(order.id)}
                          className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition"
                          title="Copy order ID"
                        >
                          {copiedOrderId === order.id ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{order.date}</p>
                    </div>
                    <span className={`px-2.5 py-1 ${getStatusColor(order.status)} rounded-full text-xs font-medium capitalize`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="p-4">
                  <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                        />
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="flex-shrink-0 relative">
                        <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">+{order.items.length - 3} more</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{formatCurrency(order.amount)}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                      >
                        Details
                      </button>
                      {order.status === 'pending' && (
                        <button 
                          onClick={() => cancelOrder(order.id)}
                          className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center border border-gray-100 dark:border-gray-700">
              <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-gray-200">No orders found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {activeTab === 'all' ? "You haven't placed any orders yet." : `You don't have any ${activeTab} orders.`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Order #{selectedOrder.id}</h3>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Order Summary */}
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Order Date</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{selectedOrder.date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                    <span className={`px-2 py-1 ${getStatusColor(selectedOrder.status)} rounded-full text-xs font-medium capitalize`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{formatCurrency(selectedOrder.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Payment</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{selectedOrder.paymentMethod}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-3">Items ({selectedOrder.items.length})</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-14 h-14 rounded-lg object-cover border border-gray-200 dark:border-gray-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                        {/* Display variants if they exist */}
                        {item.variants && item.variants.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.variants.map((variant, vIndex) => (
                              <span 
                                key={vIndex} 
                                className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                              >
                                {variant.attribute}: {variant.value}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{formatCurrency(item.price)} each</p>
                      </div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Info */}
              <div>
                <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-3">Shipping Details</h4>
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Recipient</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{selectedOrder.shippingAddress.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{selectedOrder.shippingAddress.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}
                    </p>
                  </div>
                  {selectedOrder.trackingNumber && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Tracking</p>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{selectedOrder.trackingNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Actions */}
              <div className="flex flex-col space-y-2">
                {selectedOrder.status === 'pending' && (
                  <button 
                    onClick={() => {
                      cancelOrder(selectedOrder.id);
                      setSelectedOrder(null);
                    }}
                    className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
                  >
                    Cancel Order
                  </button>
                )}
                {selectedOrder.status === 'delivered' && (
                  <button 
                    onClick={() => {
                      initiateReturn(selectedOrder.id);
                      setSelectedOrder(null);
                    }}
                    className="w-full px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition"
                  >
                    Initiate Return
                  </button>
                )}
                {(selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered') && selectedOrder.trackingNumber && (
                  <button className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition">
                    Track Package
                  </button>
                )}
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrderDashboard;