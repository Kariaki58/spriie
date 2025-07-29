"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cart-store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { formatNaira } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  postalCode: z.string().min(3, "Postal code must be at least 3 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  paymentMethod: z.enum(["credit_card", "paypal", "bank_transfer", "cash_on_delivery", "paystack"]),
  saveInfo: z.boolean().optional()
});

type FormData = z.infer<typeof formSchema>;

export default function CheckOutDisplayPage() {
  const router = useRouter();
  const { cartItems, getSubtotal, clearCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stores, setStores] = useState<Record<string, {name: string, items: typeof cartItems}>>({});
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentMethod: "paystack",
      country: "Nigeria"
    }
  });

  // Group items by store
  useEffect(() => {
    const grouped: Record<string, {name: string, items: typeof cartItems}> = {};
    
    cartItems.forEach(item => {
      console.log(item)
      const storeId = item.storeId.toString();
      if (!grouped[storeId]) {
        grouped[storeId] = {
          name: item.storeName || "Unknown Store",
          items: []
        };
      }
      grouped[storeId].items.push(item);
    });
    
    setStores(grouped);
  }, [cartItems]);

  // Calculate totals per store
  const calculateStoreTotals = (items: typeof cartItems) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 50000 ? 0 : 2000;
    const tax = subtotal * 0.075;
    const total = subtotal + shipping + tax;
    
    return { subtotal, shipping, tax, total };
  };

  // Calculate grand total
  const grandTotal = Object.values(stores).reduce((sum, store) => {
    const { total } = calculateStoreTotals(store.items);
    return sum + total;
  }, 0);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create order
      const response = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shippingAddress: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            address: data.address,
            city: data.city,
            state: data.state,
            postalCode: data.postalCode,
            country: data.country
          },
          paymentMethod: data.paymentMethod
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const result = await response.json();

      console.log(result);

      // Handle payment based on method
      if (data.paymentMethod === 'paystack') {
        // Initialize Paystack payment
        // const paymentResponse = await fetch('/api/payments/paystack', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({
        //     orderId: result.orderId,
        //     amount: grandTotal * 100,
        //     email: data.email,
        //     callbackUrl: `${window.location.origin}/order-confirmation/${result.orderId}`
        //   })
        // });

        // if (!paymentResponse.ok) {
        //   throw new Error('Failed to initialize payment');
        // }

        // const paymentData = await paymentResponse.json();
        // window.location.href = paymentData.authorization_url;
      } else {
        // For other payment methods, redirect to confirmation
        // await clearCart();
        // router.push(`/order-confirmation/${result.orderId}`);
      }

    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during checkout');
    } finally {
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-4">Your cart is empty</h2>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping and Payment Form */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Shipping Information</h2>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    {...register('firstName')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    {...register('lastName')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  {...register('email')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="mt-4">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  {...register('phone')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div className="mt-4">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  {...register('address')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    {...register('city')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    {...register('state')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    {...register('postalCode')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                  {errors.postalCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    {...register('country')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    disabled
                  />
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      id="paystack"
                      type="radio"
                      value="paystack"
                      {...register('paymentMethod')}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <label htmlFor="paystack" className="ml-3 block text-sm font-medium text-gray-700">
                      Paystack (Cards, Bank Transfer)
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="bank_transfer"
                      type="radio"
                      value="bank_transfer"
                      {...register('paymentMethod')}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <label htmlFor="bank_transfer" className="ml-3 block text-sm font-medium text-gray-700">
                      Direct Bank Transfer
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="cash_on_delivery"
                      type="radio"
                      value="cash_on_delivery"
                      {...register('paymentMethod')}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <label htmlFor="cash_on_delivery" className="ml-3 block text-sm font-medium text-gray-700">
                      Cash on Delivery
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Processing...
                    </>
                  ) : (
                    `Pay ${formatNaira(grandTotal)}`
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-8">
              {Object.entries(stores).map(([storeId, store]) => {
                const { subtotal, shipping, tax, total } = calculateStoreTotals(store.items);
                
                return (
                  <div key={storeId} className="border-b pb-6 last:border-b-0 last:pb-0">
                    <h3 className="text-md font-medium text-gray-900 mb-4">{store.name}</h3>
                    
                    <ul className="divide-y divide-gray-200">
                      {store.items.map((item) => (
                        <li key={item._id} className="py-4 flex">
                          <div className="flex-shrink-0">
                            <img
                              src={item.image || item.productId.images[0]}
                              alt={item.productId.title}
                              className="w-20 h-20 rounded-md object-cover object-center"
                            />
                          </div>

                          <div className="ml-4 flex-1">
                            <div className="flex justify-between">
                              <h4 className="text-sm font-medium text-gray-900">
                                {item.productId.title}
                              </h4>
                              <p className="text-sm font-medium text-gray-900">
                                {formatNaira(item.price * item.quantity)}
                              </p>
                            </div>
                            <p>StoreName - {item.storeName}</p>

                            {/* {(item.size || item.color) && (
                              <div className="mt-1 text-sm text-gray-500">
                                {item.size && <span>Size: {item.size}</span>}
                                {item.size && item.color && <span className="mx-1">•</span>}
                                {item.color && <span>Color: {item.color}</span>}
                              </div>
                            )} */}

                            <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Subtotal</span>
                        <span className="text-sm font-medium">{formatNaira(subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Shipping</span>
                        <span className="text-sm font-medium">
                          {shipping === 0 ? 'Free' : formatNaira(shipping)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">VAT (7.5%)</span>
                        <span className="text-sm font-medium">{formatNaira(tax)}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 pt-2">
                        <span className="text-base font-medium">Store Total</span>
                        <span className="text-base font-bold">{formatNaira(total)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="border-t border-gray-200 pt-4 flex justify-between">
                <span className="text-lg font-medium">Grand Total</span>
                <span className="text-lg font-bold">{formatNaira(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}