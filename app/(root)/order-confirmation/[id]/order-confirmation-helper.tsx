"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Download } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@uidotdev/usehooks';
import { formatNaira } from '@/lib/utils';
import NavigationBar from '@/components/app-ui/Navigation';

interface CartItem {
  productId: {
    _id: string;
  };
  name: string;
  size?: string;
  color?: string;
  quantity: number;
  price: number;
  image: string;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface OrderItem {
  storeId: {
    _id: string;
    storeName: string;
    email: string;
    phone: string;
  };
  items: CartItem[];
  status: string;
  shippingAddress: ShippingAddress;
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  trackingNumber?: string;
}

interface Order {
  _id: string;
  orderItems: OrderItem[];
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  cancellationReason?: string;
}

export default function OrderConfirmation({ orderId }: { orderId: string}) {
  const router = useRouter();
  const { width, height } = useWindowSize();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }
        const data = await response.json();
        setOrder(data);
        // if (data.paymentStatus === 'paid') {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000); // Stop confetti after 5 seconds
        // }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 text-red-500 mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-gray-900">Error loading order</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => router.push('/orders')}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900">Order not found</h2>
          <p className="mt-2 text-gray-600">The requested order could not be found.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const grandTotal = order.orderItems.reduce((total, item) => total + item.total, 0);

  return (
    <div className="h-screen overflow-y-auto bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Confetti celebration */}
      {showConfetti && (
        <Confetti
          width={width || window.innerWidth}
          height={height || window.innerHeight}
          recycle={false}
          numberOfPieces={500}
          gravity={0.2}
          colors={['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0']}
        />
      )}

      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Header with success message */}
          <div className="px-4 py-5 sm:px-6 bg-green-50 border-b border-green-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle2 className="h-12 w-12 text-green-600 mr-4" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Order Confirmed!</h1>
                  <p className="mt-1 text-gray-600">
                    Thank you for your purchase. Your order #{order._id} has been received and is being processed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-6">
              {/* Order details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Order Information</h3>
                  <div className="space-y-1">
                    <p className="text-sm">Order Number: <span className="font-medium">{order._id}</span></p>
                    <p className="text-sm">Date: <span className="font-medium">{formattedDate}</span></p>
                    <p className="text-sm">Status: <span className="font-medium text-green-600 capitalize">{order.paymentStatus}</span></p>
                    <p className="text-sm">Payment Method: <span className="font-medium capitalize">{order.paymentMethod.replace(/_/g, ' ')}</span></p>
                  </div>
                </div>
              </div>

              {/* Order items grouped by store */}
              {order.orderItems.map((storeOrder, storeIndex) => (
                <div key={storeIndex} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">{storeOrder.storeId.storeName}</h3>
                    <span className="text-sm text-gray-500 capitalize">{storeOrder.status}</span>
                  </div>

                  {/* Shipping address for this store order */}
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Shipping Information</h3>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{storeOrder.shippingAddress.firstName} {storeOrder.shippingAddress.lastName}</p>
                      <p className="text-sm">{storeOrder.shippingAddress.address}</p>
                      <p className="text-sm">
                        {storeOrder.shippingAddress.city}, {storeOrder.shippingAddress.state} {storeOrder.shippingAddress.postalCode}
                      </p>
                      <p className="text-sm">{storeOrder.shippingAddress.country}</p>
                      <p className="text-sm">Email: {storeOrder.shippingAddress.email}</p>
                      <p className="text-sm">Phone: {storeOrder.shippingAddress.phone}</p>
                    </div>
                  </div>

                  {/* Items from this store */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Items</h3>
                    <ul className="divide-y divide-gray-200">
                      {storeOrder.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="py-4 flex">
                          <div className="flex-shrink-0">
                            <img
                              src={item.image || '/placeholder-product.jpg'}
                              alt={item.name}
                              className="w-16 h-16 rounded-md object-cover object-center"
                            />
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex justify-between">
                              <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                              <p className="text-sm font-medium text-gray-900">
                                {formatNaira(item.price * item.quantity)}
                              </p>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                            <p className="mt-1 text-sm text-gray-500">
                              Price: {formatNaira(item.price)} each
                            </p>
                            {item.size && <p className="mt-1 text-sm text-gray-500">Size: {item.size}</p>}
                            {item.color && <p className="mt-1 text-sm text-gray-500">Color: {item.color}</p>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Store order summary */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatNaira(storeOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>{formatNaira(storeOrder.shippingFee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>{formatNaira(storeOrder.tax)}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Store Total</span>
                        <span>{formatNaira(storeOrder.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Store contact info */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Store Contact</h3>
                    <div className="space-y-1 text-sm">
                      <p>Email: {storeOrder.storeId.email}</p>
                      <p>Phone: {storeOrder.storeId.phone}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Grand total */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Grand Total</span>
                  <span>{formatNaira(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-4 py-4 sm:px-6 bg-gray-50 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => router.push('/orders')}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              View All Orders
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
      <NavigationBar />
    </div>
  );
}