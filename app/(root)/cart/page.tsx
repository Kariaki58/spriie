"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Image from 'next/image';
import { useCartStore } from '@/stores/cart-store';
import NavigationBar from '@/components/app-ui/Navigation';

const formatNaira = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export default function CartDisplayPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    createCartOnServer,
    updateCartOnServer,
    getSubtotal,
  } = useCartStore();

  console.log({cartItems})

  // Calculate order summary values
  const subtotal = getSubtotal();
  const tax = subtotal * 0.075;
  const shipping = subtotal > 50000 ? 0 : 2000;
  const total = subtotal + tax + shipping;

  // Fetch cart data from database on component mount
  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch cart from API
        const response = await fetch('/api/cart');
        
        if (!response.ok) {
          throw new Error('Failed to fetch cart data');
        }
        
        const data = await response.json();
        
        // Sync Zustand store with database
        if (data.cartItems && data.cartItems.length > 0) {
          useCartStore.setState({ cartItems: data.cartItems });
        }
      } catch (err) {
        console.error('Error fetching cart:', err);
        setError('Failed to load your cart. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartData();
  }, []);


  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    console.log({id})

    try {
      updateQuantity(id, newQuantity);
      const updatedItem = useCartStore.getState().cartItems.find(item => item._id === id);
      console.log("cart 79")
      console.log(updatedItem)
      console.log("/33333333333333333")

      if (updatedItem) {
        await updateCartOnServer(updatedItem);
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      const removedItem = useCartStore.getState().cartItems.find(item => item._id === id);

      removeFromCart(id);

      if (removedItem) {
        await updateCartOnServer({ ...removedItem, quantity: 0 }); // Optional: let backend remove item
      }
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };



  // Restore body scroll on component mount
  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Your Shopping Cart | NaijaMarket</title>
        <meta name="description" content="Review your cart items before checkout" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Shopping Cart</h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h2 className="mt-2 text-lg font-medium text-gray-900">Your cart is empty</h2>
              <p className="mt-1 text-gray-500">Start adding some items to your cart</p>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart items */}
              <div className="lg:col-span-2">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <ul className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <li key={item._id} className="p-6">
                        <div className="flex flex-col sm:flex-row">
                          <div className="flex-shrink-0">
                            <Image
                              src={item.productId.images[0]}
                              alt={item.productId.title}
                              width={160}
                              height={160}
                              className="w-40 h-40 rounded-md object-cover object-center"
                            />
                          </div>

                          <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
                            <div className="flex justify-between">
                              <h3 className="text-lg font-medium text-gray-900">
                                {item.productId.title}
                              </h3>
                              <p className="text-lg font-medium text-gray-900 ml-4">
                                {formatNaira(item.price * item.quantity)}
                              </p>
                            </div>

                            {/* <div className="mt-2 text-sm text-gray-500">
                              <p>Variant: {item.variant.name}</p>
                              {item.variant.color && <p>Color: {item.variant.color}</p>}
                              {item.variant.size && <p>Size: {item.variant.size}</p>}
                            </div> */}
                            <p>StoreName - {item.storeName}</p>

                            <div className="mt-4 flex items-center">
                              <div className="flex items-center border border-gray-300 rounded-md">
                                <button
                                  onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                  disabled={item.quantity <= 1}
                                >
                                  -
                                </button>
                                <span className="px-3 py-1 text-center w-12">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                  // disabled={item.quantity >= item.variant.stock}
                                >
                                  +
                                </button>
                              </div>

                              <button
                                onClick={() => handleRemoveItem(item._id)}
                                className="ml-4 text-sm font-medium text-green-600 hover:text-green-500"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Order summary */}
              <div className="lg:col-span-1">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 sticky top-4">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatNaira(subtotal)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">
                        {shipping === 0 ? 'Free' : formatNaira(shipping)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">VAT (7.5%)</span>
                      <span className="font-medium">{formatNaira(tax)}</span>
                    </div>

                    <div className="border-t border-gray-200 pt-4 flex justify-between">
                      <span className="text-lg font-medium">Total</span>
                      <span className="text-lg font-bold">{formatNaira(total)}</span>
                    </div>

                    <button
                      onClick={() => router.push('/checkout')}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Proceed to Checkout
                    </button>

                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={() => router.push('/')}
                        className="text-green-600 hover:text-green-500 text-sm font-medium"
                      >
                        Continue Shopping
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <NavigationBar />
    </>
  );
}