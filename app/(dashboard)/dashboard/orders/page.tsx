"use client";
import { useEffect, useState } from 'react';
import { FiPackage, FiCheckCircle, FiTruck, FiClock, FiSearch, FiFilter, FiUser, FiX, FiShoppingBag } from 'react-icons/fi';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type OrderStatus = 'paid' | 'received' | 'shipped' | 'completed' | 'cancelled';

interface Order {
    id: string;
    order_id: string;
    timestamp: string;
    payment: {
        method: string;
        amount: number;
    };
    data: {
        status: OrderStatus;
        items: string[]
    };
    product: {
        name: string;
        photo: string;
        store_id: string;
    };
    customer: {
        name: string;
        email: string;
        phone: string;
        location: string;
    }
}

const OrdersManagement = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [statusUpdate, setStatusUpdate] = useState<OrderStatus | ''>('');

    useEffect(() => {
        const dummyOrders: Order[] = [
            {
                id: '1',
                order_id: '#ORD-001',
                timestamp: '2023-05-15T10:30:00Z',
                payment: {
                    method: 'Credit Card',
                    amount: 124.99
                },
                data: {
                    status: 'received',
                    items: ['Wireless Headphones Pro X', 'USB-C Fast Charging Cable']
                },
                product: {
                    name: 'Electronics Bundle',
                    photo: '',
                    store_id: 'store-1'
                },
                customer: {
                    name: 'Alex Johnson',
                    email: 'alex.johnson@example.com',
                    phone: '+1 (555) 123-4567',
                    location: '123 Main St, Apt 4B, New York, NY 10001'
                }
            },
            {
                id: '2',
                order_id: '#ORD-002',
                timestamp: '2023-05-14T14:45:00Z',
                payment: {
                    method: 'PayPal',
                    amount: 45.99
                },
                data: {
                    status: 'paid',
                    items: ['Premium Smart Watch Band']
                },
                product: {
                    name: 'Premium Smart Watch Band',
                    photo: '',
                    store_id: 'store-2'
                },
                customer: {
                    name: 'Maria Garcia',
                    email: 'maria.garcia@example.com',
                    phone: '+1 (555) 987-6543',
                    location: '456 Oak Ave, Los Angeles, CA 90015'
                }
            },
            {
                id: '3',
                order_id: '#ORD-003',
                timestamp: '2023-05-16T09:15:00Z',
                payment: {
                    method: 'Credit Card',
                    amount: 89.99
                },
                data: {
                    status: 'shipped',
                    items: ['Wireless Earbuds', 'Charging Case']
                },
                product: {
                    name: 'Wireless Earbuds Bundle',
                    photo: '',
                    store_id: 'store-3'
                },
                customer: {
                    name: 'James Wilson',
                    email: 'james.wilson@example.com',
                    phone: '+1 (555) 456-7890',
                    location: '789 Pine Rd, Chicago, IL 60601'
                }
            },
            {
                id: '4',
                order_id: '#ORD-004',
                timestamp: '2023-05-17T16:20:00Z',
                payment: {
                    method: 'Apple Pay',
                    amount: 29.99
                },
                data: {
                    status: 'completed',
                    items: ['Bluetooth Speaker']
                },
                product: {
                    name: 'Portable Bluetooth Speaker',
                    photo: '',
                    store_id: 'store-1'
                },
                customer: {
                    name: 'Sarah Miller',
                    email: 'sarah.miller@example.com',
                    phone: '+1 (555) 789-0123',
                    location: '321 Elm St, Apt 7C, Boston, MA 02108'
                }
            },
            {
                id: '5',
                order_id: '#ORD-005',
                timestamp: '2023-05-18T11:10:00Z',
                payment: {
                    method: 'Credit Card',
                    amount: 19.99
                },
                data: {
                    status: 'cancelled',
                    items: ['Phone Case']
                },
                product: {
                    name: 'Premium Phone Case',
                    photo: '',
                    store_id: 'store-2'
                },
                customer: {
                    name: 'David Brown',
                    email: 'david.brown@example.com',
                    phone: '+1 (555) 234-5678',
                    location: '654 Maple Ave, Seattle, WA 98101'
                }
            }
        ];
        setOrders(dummyOrders);
    }, []);

    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || order.data.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const openOrderDetails = (order: Order) => {
        setSelectedOrder(order);
        setStatusUpdate(order.data.status);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
        setStatusUpdate('');
    };

    const handleStatusUpdate = () => {
        if (!selectedOrder || !statusUpdate) return;
        
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order.id === selectedOrder.id 
                        ? { ...order, data: { ...order.data, status: statusUpdate as OrderStatus } } 
                        : order
                )
            );
            setLoading(false);
            setShowDialog(false);
            setIsModalOpen(false);
        }, 1500);
    };

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case 'paid':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'received':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'shipped':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    const getStatusIcon = (status: OrderStatus) => {
        switch (status) {
            case 'paid':
                return <FiClock className="mr-1" />;
            case 'received':
                return <FiPackage className="mr-1" />;
            case 'shipped':
                return <FiTruck className="mr-1" />;
            case 'completed':
                return <FiCheckCircle className="mr-1" />;
            case 'cancelled':
                return <FiX className="mr-1" />;
            default:
                return null;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const statusOptions: { value: OrderStatus; label: string }[] = [
        { value: 'paid', label: 'Paid' },
        { value: 'received', label: 'Received' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    return (
        <div className="dark:bg-gray-900 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* <div className="mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Orders Management</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage customer orders</p>
                </div> */}

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
                                <option value="paid">Paid</option>
                                <option value="received">Received</option>
                                <option value="shipped">Shipped</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
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
                                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white cursor-pointer" onClick={() => openOrderDetails(order)}>
                                            {order.order_id}
                                        </td>
                                        <td
                                            className="px-4 py-4 whitespace-nowrap cursor-pointer"
                                            onClick={() => openOrderDetails(order)}
                                        >
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{order.customer.name}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{order.customer.email}</div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(order.timestamp).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {order.data.items.length} item{order.data.items.length !== 1 ? 's' : ''}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {formatCurrency(order.payment.amount)}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex items-center text-xs leading-4 font-medium rounded-full ${getStatusColor(order.data.status)}`}>
                                                {getStatusIcon(order.data.status)}
                                                {order.data.status.charAt(0).toUpperCase() + order.data.status.slice(1)}
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
                                                {new Date(selectedOrder.timestamp).toLocaleDateString('en-US', {
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
                                                    <p className="text-sm font-medium dark:text-white">{selectedOrder.customer.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                                    <p className="text-sm font-medium dark:text-white">{selectedOrder.customer.email}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                                                    <p className="text-sm font-medium dark:text-white">{selectedOrder.customer.phone}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                                                    <p className="text-sm font-medium dark:text-white">{selectedOrder.customer.location}</p>
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
                                                    >
                                                        {statusOptions.map((option) => (
                                                            <option key={option.value} value={option.value} className="bg-white dark:bg-gray-800">
                                                                {option.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="flex justify-between">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Payment Method</p>
                                                    <p className="text-sm font-medium dark:text-white">{selectedOrder.payment.method}</p>
                                                </div>
                                                <div className="flex justify-between">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                                                    <p className="text-sm font-medium dark:text-white">{formatCurrency(selectedOrder.payment.amount)}</p>
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
                                                    {selectedOrder.data.items.map((item, index) => (
                                                        <tr key={index}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                                {item}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                                {formatCurrency(selectedOrder.payment.amount / selectedOrder.data.items.length)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                                1
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                                {formatCurrency(selectedOrder.payment.amount / selectedOrder.data.items.length)}
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
                                    <div className="space-x-2">
                                        <Button 
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                            onClick={() => setShowDialog(true)}
                                            disabled={loading || !statusUpdate || statusUpdate === selectedOrder.data.status}
                                        >
                                            {loading ? "Updating..." : "Update Status"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

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
            </div>
        </div>
    );
};

export default OrdersManagement;