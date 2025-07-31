"use client";
import { useEffect, useState } from 'react';
import { FiPackage, FiCheckCircle, FiTruck, FiClock, FiSearch, FiFilter, FiUser, FiX, FiShoppingBag, FiRefreshCw, FiHome, FiMail, FiPhone } from 'react-icons/fi';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from 'next-auth/react';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

interface Order {
    _id: string;
    order_id: string;
    createdAt: string;
    paymentMethod: string;
    status: OrderStatus;
    cartItems: {
        product: {
            _id: string;
            name: string;
            price: number;
            images: string[];
        };
        quantity: number;
    }[];
    shippingAddress: {
        fullName: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    userId: {
        name: string;
        email: string;
    };
    cancellationReason?: string;
    returnReason?: string;
}

const OrdersManagement = () => {
    const { data: session } = useSession();
    const [orders, setOrders] = useState<Order[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [statusUpdate, setStatusUpdate] = useState<OrderStatus | ''>('');
    const [cancellationReason, setCancellationReason] = useState('');
    const [showCancellationDialog, setShowCancellationDialog] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('/api/orders', {
                    method: 'GET'
                });
                const data = await response.json();

                console.log("response...")
                console.log(data)
                console.log("ending....")
                
                const transformedOrders = data.map((order: any, index: number) => ({
                    _id: order._id,
                    order_id: `#ORD-${order._id.toString().substring(0, 6).toUpperCase()}`,
                    createdAt: order.createdAt,
                    paymentMethod: order.paymentMethod,
                    status: order.status,
                    cancellationReason: order.cancellationReason || '',
                    returnReason: order.returnReason || '',
                    cartItems: order.cartItems.map((item: any) => ({
                        product: {
                            _id: item.productId,
                            name: item.name,
                            price: item.price || 0,
                            images: item.images || []
                        },
                        quantity: item.quantity || 1
                    })),
                    shippingAddress: order.shippingAddress,
                    userId: order.userId
                }));

                console.log({transformedOrders})
                
                setOrders(transformedOrders);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        fetchOrders();
    }, []);

    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.shippingAddress.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.shippingAddress.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const openOrderDetails = (order: Order) => {
        setSelectedOrder(order);
        setStatusUpdate(order.status);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
        setStatusUpdate('');
        setCancellationReason('');
    };

    const handleStatusUpdate = async () => {
        if (!selectedOrder || !statusUpdate) return;
        
        setLoading(true);
        
        try {
            const updateData: any = {
                status: statusUpdate
            };

            if (statusUpdate === 'cancelled' && cancellationReason) {
                updateData.cancellationReason = cancellationReason;
            }

            const response = await fetch(`/api/orders/${selectedOrder._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                throw new Error('Failed to update order status');
            }

            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order._id === selectedOrder._id 
                        ? { 
                            ...order, 
                            status: statusUpdate as OrderStatus,
                            cancellationReason: statusUpdate === 'cancelled' ? cancellationReason : order.cancellationReason
                        } 
                        : order
                )
            );
        } catch (error) {
            console.error('Error updating order status:', error);
        } finally {
            setLoading(false);
            setShowDialog(false);
            setShowCancellationDialog(false);
            setIsModalOpen(false);
        }
    };

    const handleStatusChange = (newStatus: OrderStatus) => {
        setStatusUpdate(newStatus);
        if (newStatus === 'cancelled') {
            setShowCancellationDialog(true);
        } else {
            setShowDialog(true);
        }
    };

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case 'pending':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
            case 'processing':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'shipped':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'delivered':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'returned':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    const getStatusIcon = (status: OrderStatus) => {
        switch (status) {
            case 'pending':
                return <FiClock className="mr-1" />;
            case 'processing':
                return <FiClock className="mr-1" />;
            case 'shipped':
                return <FiTruck className="mr-1" />;
            case 'delivered':
                return <FiCheckCircle className="mr-1" />;
            case 'cancelled':
                return <FiX className="mr-1" />;
            case 'returned':
                return <FiRefreshCw className="mr-1" />;
            default:
                return null;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount);
    };

    const calculateOrderTotal = (order: Order) => {
        return order.cartItems.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);
    };

    const statusOptions: { value: OrderStatus; label: string }[] = [
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    return (
        <div className="dark:bg-gray-900 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Seller Session Card */}
                {session?.user && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                        <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                                            {session.user.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        {session.user.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {session.user.email}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="flex items-center space-x-2">
                                    <FiPackage className="text-gray-400 dark:text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
                                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                                            {orders.length}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <FiCheckCircle className="text-green-500 dark:text-green-400" />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                                            {orders.filter(o => o.status === 'delivered').length}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <FiRefreshCw className="text-purple-500 dark:text-purple-400" />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Returns</p>
                                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                                            {orders.filter(o => o.status === 'returned').length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Orders Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div className="relative flex-grow max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiSearch className="text-gray-400 dark:text-gray-500" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 dark:focus:border-blue-600 text-sm dark:text-white"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center">
                            <FiFilter className="text-gray-400 dark:text-gray-500 mr-2" />
                            <select
                                className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 dark:focus:border-blue-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="returned">Returned</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Items
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white cursor-pointer" onClick={() => openOrderDetails(order)}>
                                            {order.order_id}
                                        </td>
                                        <td
                                            className="px-4 py-4 whitespace-nowrap cursor-pointer"
                                            onClick={() => openOrderDetails(order)}
                                        >
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{order.shippingAddress.fullName}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{order.shippingAddress.email}</div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {order.cartItems.length} item{order.cartItems.length !== 1 ? 's' : ''}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {formatCurrency(calculateOrderTotal(order))}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex items-center text-xs leading-4 font-medium rounded-full ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => openOrderDetails(order)}
                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredOrders.length === 0 && (
                        <div className="text-center py-12">
                            <FiPackage className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No orders found</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Try adjusting your search or filter to find what you are looking for.
                            </p>
                        </div>
                    )}
                </div>

                {/* Order Details Modal */}
                {isModalOpen && selectedOrder && (
                    <>
                        <div
                            className="fixed inset-0 bg-black/60 bg-opacity-50 z-40 transition-opacity duration-300 ease-in-out"
                            onClick={closeModal}
                        ></div>

                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                            <div
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-300 ease-in-out"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="overflow-y-auto px-6 pt-6 pb-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                                Order Details: {selectedOrder.order_id}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <button
                                            onClick={closeModal}
                                            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors cursor-pointer"
                                        >
                                            <FiX className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg">
                                            <div className="flex items-center mb-4">
                                                <FiUser className="text-gray-400 dark:text-gray-500 mr-2" />
                                                <h4 className="text-base font-semibold text-gray-900 dark:text-white">Customer Information</h4>
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                                                    <p className="text-sm font-medium dark:text-white">{selectedOrder.shippingAddress.fullName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                                    <p className="text-sm font-medium dark:text-white">{selectedOrder.shippingAddress.email}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                                                    <p className="text-sm font-medium dark:text-white">{selectedOrder.shippingAddress.phone}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                                                    <p className="text-sm font-medium dark:text-white">
                                                        {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}, {selectedOrder.shippingAddress.country}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg">
                                            <div className="flex items-center mb-4">
                                                <FiShoppingBag className="text-gray-400 dark:text-gray-500 mr-2" />
                                                <h4 className="text-base font-semibold text-gray-900 dark:text-white">Order Summary</h4>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                                                    <select
                                                        value={statusUpdate}
                                                        onChange={(e) => setStatusUpdate(e.target.value as OrderStatus)}
                                                        className={`px-3 py-1 inline-flex items-center text-xs leading-4 font-medium rounded-full ${getStatusColor(statusUpdate as OrderStatus)} dark:bg-gray-800 dark:border dark:border-gray-600`}
                                                        disabled={selectedOrder.status === 'returned'}
                                                    >
                                                        {statusOptions.map((option) => (
                                                            <option key={option.value} value={option.value} className="bg-white dark:bg-gray-800">
                                                                {option.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {selectedOrder.status === 'cancelled' && selectedOrder.cancellationReason && (
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Cancellation Reason</p>
                                                        <p className="text-sm font-medium dark:text-white mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                                                            {selectedOrder.cancellationReason}
                                                        </p>
                                                    </div>
                                                )}
                                                {selectedOrder.status === 'returned' && selectedOrder.returnReason && (
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Return Reason</p>
                                                        <p className="text-sm font-medium dark:text-white mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                                                            {selectedOrder.returnReason}
                                                        </p>
                                                    </div>
                                                )}
                                                <div className="flex justify-between">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Payment Method</p>
                                                    <p className="text-sm font-medium dark:text-white">
                                                        {selectedOrder.paymentMethod.charAt(0).toUpperCase() + selectedOrder.paymentMethod.slice(1)}
                                                    </p>
                                                </div>
                                                <div className="flex justify-between">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                                                    <p className="text-sm font-medium dark:text-white">{formatCurrency(calculateOrderTotal(selectedOrder))}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Order Items</h4>
                                        <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                <thead className="bg-gray-50 dark:bg-gray-700">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qty</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                    {selectedOrder.cartItems.map((item, index) => (
                                                        <tr key={index}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                                {item.product.name}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                                {formatCurrency(item.product.price)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                                {item.quantity}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                                {formatCurrency(item.product.price * item.quantity)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 px-2 md:px-6 py-4 border-t border-gray-200 dark:border-gray-600 flex justify-between">
                                    <button
                                        type="button"
                                        className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer"
                                        onClick={closeModal}
                                    >
                                        Close
                                    </button>
                                    {selectedOrder.status !== 'returned' && (
                                        <div className="space-x-2">
                                            <Button 
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                onClick={() => handleStatusChange(statusUpdate as OrderStatus)}
                                                disabled={loading || !statusUpdate || statusUpdate === selectedOrder.status}
                                            >
                                                {loading ? "Updating..." : "Update Status"}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 sm:mb-0">
                        Showing <span className="font-medium">{filteredOrders.length}</span> of <span className="font-medium">{orders.length}</span> orders
                    </p>
                    <div className="flex space-x-2">
                        <button
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                            disabled
                        >
                            Previous
                        </button>
                        <button
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                            disabled
                        >
                            Next
                        </button>
                    </div>
                </div>

                {/* Status Update Confirmation Dialog */}
                <Dialog open={showDialog} onOpenChange={setShowDialog}>
                    <DialogContent
                        className="sm:max-w-[425px] w-[85%] rounded-xl text-black dark:text-white bg-white dark:bg-gray-800 transition-opacity duration-300"
                        style={{
                            opacity: showDialog ? 1 : 0,
                            transition: "opacity 300ms",
                            transform: showDialog ? "translateY(0)" : "translateY(-20px)"
                        }}
                    >
                        <DialogHeader>
                            <DialogTitle>Update Order Status</DialogTitle>
                            <DialogDescription className="dark:text-gray-400">
                                Are you sure you want to update this order status to {statusUpdate}?
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end space-x-2 mt-4">
                            <Button
                                variant="outline"
                                onClick={() => setShowDialog(false)}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={handleStatusUpdate}
                                disabled={loading}
                            >
                                {loading ? "Processing..." : "Confirm Update"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Cancellation Dialog */}
                <Dialog open={showCancellationDialog} onOpenChange={setShowCancellationDialog}>
                    <DialogContent
                        className="sm:max-w-[425px] w-[85%] rounded-xl text-black dark:text-white bg-white dark:bg-gray-800 transition-opacity duration-300"
                        style={{
                            opacity: showCancellationDialog ? 1 : 0,
                            transition: "opacity 300ms",
                            transform: showCancellationDialog ? "translateY(0)" : "translateY(-20px)"
                        }}
                    >
                        <DialogHeader>
                            <DialogTitle>Cancel Order</DialogTitle>
                            <DialogDescription className="dark:text-gray-400">
                                Please provide a reason for cancellation
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4">
                            <Textarea
                                placeholder="Enter cancellation reason..."
                                value={cancellationReason}
                                onChange={(e) => setCancellationReason(e.target.value)}
                                className="min-h-[100px]"
                            />
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowCancellationDialog(false);
                                    setStatusUpdate(selectedOrder?.status || '');
                                }}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => {
                                    if (cancellationReason.trim()) {
                                        handleStatusUpdate();
                                    }
                                }}
                                disabled={loading || !cancellationReason.trim()}
                            >
                                {loading ? "Processing..." : "Confirm Cancellation"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default OrdersManagement;