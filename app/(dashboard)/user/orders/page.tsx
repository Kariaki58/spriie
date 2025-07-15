"use client"
import { useState } from 'react';

type OrderStatus = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

type Order = {
  id: string;
  date: string;
  status: OrderStatus;
  amount: number;
  items: {
    name: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    country: string;
    phone: string;
  };
  paymentMethod: string;
  trackingNumber?: string;
};

const UserOrderDashboard = () => {
  const [activeTab, setActiveTab] = useState<OrderStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'SPR-2023-7890',
      date: 'July 15, 2023',
      status: 'pending',
      amount: 87500,
      paymentMethod: 'Pay on Delivery',
      items: [
        {
          name: 'Wireless Headphones',
          quantity: 1,
          price: 35000,
          image: 'https://placehold.co/80x80?text=Headphones'
        },
        {
          name: 'Phone Case',
          quantity: 2,
          price: 5000,
          image: 'https://placehold.co/80x80?text=Case'
        }
      ],
      shippingAddress: {
        name: 'John Doe',
        street: '456 Lekki Phase 1',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria',
        phone: '+2348012345678'
      }
    },
    {
      id: 'SPR-2023-7891',
      date: 'July 14, 2023',
      status: 'pending',
      amount: 125000,
      paymentMethod: 'Card Payment',
      items: [
        {
          name: 'Smart Watch Pro',
          quantity: 1,
          price: 125000,
          image: 'https://placehold.co/80x80?text=Watch+Pro'
        }
      ],
      shippingAddress: {
        name: 'John Doe',
        street: '456 Lekki Phase 1',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria',
        phone: '+2348012345678'
      }
    },
    // Processing orders (5)
    {
      id: 'SPR-2023-7889',
      date: 'July 10, 2023',
      status: 'processing',
      amount: 120000,
      paymentMethod: 'Card Payment',
      items: [
        {
          name: 'Smart Watch',
          quantity: 1,
          price: 75000,
          image: 'https://placehold.co/80x80?text=Watch'
        },
        {
          name: 'Fitness Band',
          quantity: 1,
          price: 45000,
          image: 'https://placehold.co/80x80?text=Band'
        }
      ],
      shippingAddress: {
        name: 'John Doe',
        street: '456 Lekki Phase 1',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria',
        phone: '+2348012345678'
      }
    },
    // Shipped orders (5)
    {
      id: 'SPR-2023-7888',
      date: 'July 5, 2023',
      status: 'shipped',
      amount: 250000,
      paymentMethod: 'Card Payment',
      trackingNumber: 'SPR123456789',
      items: [
        {
          name: 'Power Generator',
          quantity: 1,
          price: 250000,
          image: 'https://placehold.co/80x80?text=Generator'
        }
      ],
      shippingAddress: {
        name: 'John Doe',
        street: '456 Lekki Phase 1',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria',
        phone: '+2348012345678'
      }
    },
    // Delivered orders (5)
    {
      id: 'SPR-2023-7887',
      date: 'June 28, 2023',
      status: 'delivered',
      amount: 180000,
      paymentMethod: 'Card Payment',
      trackingNumber: 'SPR987654321',
      items: [
        {
          name: 'Solar Panel Kit',
          quantity: 1,
          price: 180000,
          image: 'https://placehold.co/80x80?text=Solar'
        }
      ],
      shippingAddress: {
        name: 'John Doe',
        street: '456 Lekki Phase 1',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria',
        phone: '+2348012345678'
      }
    },
    // Cancelled orders (3)
    {
      id: 'SPR-2023-7886',
      date: 'June 20, 2023',
      status: 'cancelled',
      amount: 65000,
      paymentMethod: 'Card Payment',
      items: [
        {
          name: 'Bluetooth Speaker',
          quantity: 1,
          price: 65000,
          image: 'https://placehold.co/80x80?text=Speaker'
        }
      ],
      shippingAddress: {
        name: 'John Doe',
        street: '456 Lekki Phase 1',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria',
        phone: '+2348012345678'
      }
    },
    // Returned orders (2)
    {
      id: 'SPR-2023-7885',
      date: 'June 15, 2023',
      status: 'returned',
      amount: 45000,
      paymentMethod: 'Card Payment',
      items: [
        {
          name: 'Wireless Earbuds',
          quantity: 1,
          price: 45000,
          image: 'https://placehold.co/80x80?text=Earbuds'
        }
      ],
      shippingAddress: {
        name: 'John Doe',
        street: '456 Lekki Phase 1',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria',
        phone: '+2348012345678'
      }
    }
  ]);

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount / 100);
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

  const cancelOrder = (orderId: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: 'cancelled' } : order
    ));
  };

  const initiateReturn = (orderId: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: 'returned' } : order
    ));
  };

  const statusTabs: OrderStatus[] = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm py-4 px-6 border-b border-emerald-500/20">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <h1 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Spriie</h1>
          </div>
          <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-semibold cursor-pointer hover:bg-emerald-600 transition">
            JD
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">My Orders</h2>
            <p className="text-gray-600 dark:text-gray-400">View and manage your orders</p>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            {statusTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Order #{order.id}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{order.date}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                    <span className={`px-3 py-1 ${getStatusColor(order.status)} rounded-full text-sm font-medium mb-2 sm:mb-0 capitalize`}>
                      {order.status}
                    </span>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                      {formatCurrency(order.amount)}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Items ({order.items.length})</h4>
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 dark:text-gray-200">{item.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-gray-800 dark:text-gray-200">{formatCurrency(item.price)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Info */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Shipping Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Recipient</p>
                      <p className="text-gray-800 dark:text-gray-200">{order.shippingAddress.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="text-gray-800 dark:text-gray-200">{order.shippingAddress.phone}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                      <p className="text-gray-800 dark:text-gray-200">
                        {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.country}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Payment Method</p>
                      <p className="text-gray-800 dark:text-gray-200">{order.paymentMethod}</p>
                    </div>
                    {order.trackingNumber && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tracking Number</p>
                        <p className="text-gray-800 dark:text-gray-200">{order.trackingNumber}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Actions */}
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                  {order.status === 'pending' && (
                    <button 
                      onClick={() => cancelOrder(order.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
                    >
                      Cancel Order
                    </button>
                  )}
                  {order.status === 'delivered' && (
                    <button 
                      onClick={() => initiateReturn(order.id)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition"
                    >
                      Initiate Return
                    </button>
                  )}
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition"
                  >
                    View Details
                  </button>
                  {(order.status === 'shipped' || order.status === 'delivered') && order.trackingNumber && (
                    <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition">
                      Track Package
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center border border-gray-100 dark:border-gray-700">
              <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-200">No orders found</h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">You don't have any {activeTab === 'all' ? '' : activeTab} orders yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Order Details #{selectedOrder.id}</h3>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-6 space-y-6">
                {/* Order Summary */}
                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">Order Summary</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Order Date</p>
                      <p className="text-gray-800 dark:text-gray-200">{selectedOrder.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                      <span className={`px-3 py-1 ${getStatusColor(selectedOrder.status)} rounded-full text-sm font-medium capitalize`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                      <p className="text-gray-800 dark:text-gray-200">{formatCurrency(selectedOrder.amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Payment Method</p>
                      <p className="text-gray-800 dark:text-gray-200">{selectedOrder.paymentMethod}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">Items</h4>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-start space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 dark:text-gray-200">{item.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
                          <p className="text-gray-800 dark:text-gray-200 mt-1">{formatCurrency(item.price)}</p>
                        </div>
                        <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Info */}
                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">Shipping Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Recipient</p>
                      <p className="text-gray-800 dark:text-gray-200">{selectedOrder.shippingAddress.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="text-gray-800 dark:text-gray-200">{selectedOrder.shippingAddress.phone}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                      <p className="text-gray-800 dark:text-gray-200">
                        {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}, {selectedOrder.shippingAddress.country}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Actions */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                  {selectedOrder.status === 'pending' && (
                    <button 
                      onClick={() => {
                        cancelOrder(selectedOrder.id);
                        setSelectedOrder(null);
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
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
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition"
                    >
                      Initiate Return
                    </button>
                  )}
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrderDashboard;