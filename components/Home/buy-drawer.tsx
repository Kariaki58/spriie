"use client";
import { 
    ShoppingCart,
    Minus, 
    CreditCard,
    Plus,
    ArrowRight,
    Eye,
    ChevronUp,
    ChevronDown,
    X,
    MapPin,
    Mail,
    User,
    Phone,
    Banknote,
    Wallet,
    EyeOff
} from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BuyDrawerProps } from './ProductScreen';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface CheckoutFormData {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

interface PaystackTransaction {
    reference: string;
    trans: string;
    trxref: string;
    status: string;
    message: string;
    transaction: string;
}

interface ICartItem {
  storeId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
  size?: string;
  color?: string;
  thumbnail?: string;
}

interface PaystackPop {
    newTransaction: (options: {
        key: string;
        email: string;
        amount: number;
        onSuccess: (transaction: PaystackTransaction) => void;
        onCancel: () => void;
    }) => void;
}

export default function BuyDrawer({ product, showFullDescription, toggleDescription, setQty, qty }: BuyDrawerProps) {
    function formatNumberWithCommas(number: number | string) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    const { data: session } = useSession();
    const [isCheckout, setIsCheckout] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isMounted, setIsMounted] = useState<boolean>(false);
    const [PaystackPop, setPaystackPop] = useState<PaystackPop | null>(null);
    const [formData, setFormData] = useState<CheckoutFormData>({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
    });
    const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'wallet'>('paystack');
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [balanceVisible, setBalanceVisible] = useState(false);
    const { addToCart: addToCartStore, cartItems } = useCartStore();
    const router = useRouter();

    const totalAmount = product.basePrice * qty;
    const canPayWithWallet = walletBalance >= totalAmount;
    const remainingBalance = totalAmount - walletBalance;

    useEffect(() => {
        const fetchWalletBalance = async () => {
            if (!session?.user?.id) return;
            
            try {
                const res = await fetch('/api/profile', {
                    method: 'GET',
                });
                const data = await res.json();
                setWalletBalance(data.message?.wallet || 0);
            } catch (error) {
                console.error('Failed to fetch wallet balance:', error);
            }
        };

        fetchWalletBalance();
    }, [session]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddToCart = async () => {
        try {
            const cartItem: ICartItem = {
                storeId: product.storeId,
                productId: product._id,
                name: product.name,
                price: product.basePrice,
                quantity: qty,
                totalPrice: product.basePrice * qty,
            };

            addToCartStore(cartItem);

            const response = await fetch('/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cartItems: [...cartItems, cartItem]
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update cart on server');
            }

            toast.success('Product added to cart');
        } catch (error: any) {
            useCartStore.getState().removeFromCart(product._id);
            toast.error(error.message || 'Failed to add to cart');
        }
    };

    const handlePlaceOrder = async () => {
        if (!formData.email) {
            toast.error("Please provide your email address");
            return;
        }

        setIsProcessing(true);

        try {
            if (paymentMethod === 'paystack') {
                if (!PaystackPop) {
                    throw new Error("Payment SDK not loaded");
                }

                const paystack = new PaystackPop();
                paystack.newTransaction({
                    key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
                    email: formData.email,
                    amount: totalAmount * 100, // Convert to kobo
                    metadata: {
                        reserve_funds: true
                    },
                    onSuccess: async (transaction: PaystackTransaction) => {
                        try {
                            const response = await fetch('/api/orders', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    reference: transaction.reference,
                                    trxref: transaction.trxref,
                                    transaction: transaction.transaction,
                                    customer: formData,
                                    qty,
                                    paymentMethod: 'paystack',
                                    currency: 'NGN',
                                    product
                                }),
                            });

                            const order = await response.json();

                            if (!response.ok) {
                                throw new Error(order.message || "Order creation failed");
                            }

                            toast.success(order.message);
                        } catch (error: any) {
                            console.error(error);
                            toast.error(error.message || "Something went wrong during order creation");
                        } finally {
                            setIsProcessing(false);
                        }
                    },
                    onCancel: () => {
                        setIsProcessing(false);
                        toast.info("Payment was cancelled");
                    },
                });
            } else if (paymentMethod === 'wallet') {
                if (!canPayWithWallet) {
                    throw new Error("Insufficient wallet balance");
                }

                const response = await fetch('/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        customer: formData,
                        qty,
                        paymentMethod: 'wallet',
                        currency: 'NGN',
                        product
                    }),
                });

                const order = await response.json();

                if (!response.ok) {
                    throw new Error(order.message || "Order creation failed");
                }

                // Update local wallet balance
                setWalletBalance(prev => prev - totalAmount);
                toast.success(order.message);
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Something went wrong");
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        setIsMounted(true);
        import("@paystack/inline-js").then((module) => {
            setPaystackPop(() => module.default);
        });
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <Drawer>
            <div>
                <DrawerTrigger asChild>
                    <button
                        className="flex flex-col items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-md p-3 rounded-2xl w-16 h-16"
                        aria-label="Add to cart"
                    >
                        <ShoppingCart size={20} color="white" />
                        <span className="text-xs font-semibold text-white">Buy</span>
                    </button>
                </DrawerTrigger>
            </div>
            
            <DrawerContent className="max-h-[90vh]">
                {!isCheckout ? (
                    <div className="mx-auto w-full max-w-sm px-4 pb-6 overflow-y-auto">
                        <DrawerHeader>
                            <DrawerTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
                                Complete Your Purchase
                            </DrawerTitle>
                            <DrawerDescription className="text-gray-600 dark:text-gray-400">
                                Review your selection before proceeding
                            </DrawerDescription>
                        </DrawerHeader>

                        <div className="flex gap-4 items-center border border-gray-200 dark:border-gray-700 p-4 rounded-xl bg-white dark:bg-gray-800 my-4 shadow-sm">
                            <img
                                src={product.thumbnail}
                                alt={product.name}
                                className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{product.title}</p>
                                <div className="flex items-center mt-1">
                                    <span className="text-lg font-bold text-emerald-600">₦{formatNumberWithCommas(product.basePrice)}</span>
                                    {product.discount > 0 && (
                                        <span className="ml-2 text-sm line-through text-gray-500 dark:text-gray-400">
                                            ₦{formatNumberWithCommas((product.basePrice / (1 - product.discount/100)).toFixed(2))}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="my-4">
                            <p className="text-gray-700 dark:text-gray-300 mb-2">Description</p>
                            <div className="relative">
                                <p className={`text-sm ${showFullDescription ? '' : 'line-clamp-2'} text-gray-600 dark:text-gray-400`}>
                                    {product.description}
                                </p>
                                {product.description.length > 100 && (
                                    <button 
                                        onClick={toggleDescription}
                                        className="text-emerald-500 dark:text-emerald-400 text-xs font-medium flex items-center mt-1"
                                    >
                                        {showFullDescription ? (
                                            <>
                                                <ChevronUp size={14} className="mr-1" /> Show less
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown size={14} className="mr-1" /> Read more
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between items-center my-6">
                            <span className="text-gray-700 dark:text-gray-300 font-medium">Quantity</span>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setQty(Math.max(1, qty - 1))} 
                                    className="border border-gray-300 dark:border-gray-600 rounded-full w-9 h-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="w-8 text-center font-medium dark:text-white">{qty}</span>
                                <button 
                                    onClick={() => setQty(qty + 1)} 
                                    className="border border-gray-300 dark:border-gray-600 rounded-full w-9 h-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span className="text-gray-700 dark:text-gray-300">Total</span>
                                <span className="text-emerald-600">₦{formatNumberWithCommas((product.basePrice * qty).toFixed(2))}</span>
                            </div>
                        </div>

                        <DrawerFooter className="px-0">
                            <div className='flex flex-col gap-3'>
                                <button 
                                    onClick={() => setIsCheckout(true)}
                                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white p-3 rounded-xl font-semibold transition-all shadow-md"
                                >
                                    <CreditCard className="w-5 h-5" />
                                    Proceed to Checkout
                                </button>
                                {/* <button 
                                    onClick={handleAddToCart} 
                                    className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white p-3 rounded-xl font-semibold transition-all shadow-md"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    Add to Cart
                                </button> */}
                            </div>
                            <DrawerClose asChild>
                                <div className='flex gap-3 mt-4'>
                                    <button className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm">
                                        <ArrowRight className="w-4 h-4" />
                                        Explore More
                                    </button>
                                    <button className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm">
                                        <Eye className="w-4 h-4" />
                                        View Details
                                    </button>
                                </div>
                            </DrawerClose>
                        </DrawerFooter>
                    </div>
                ) : (
                    <div className="mx-auto w-full max-w-sm px-4 pb-6 overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <button 
                                onClick={() => setIsCheckout(false)}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Checkout</h2>
                            <div className="w-10"></div>
                        </div>

                        <div className="mb-6">
                            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Contact Information</h3>
                            <div className="space-y-3">
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="fullName"
                                        placeholder="Full Name"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-white"
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email Address"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-white"
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="Phone Number"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-white"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Shipping Address</h3>
                            <div className="space-y-3">
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="address"
                                        placeholder="Street Address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-white"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        name="city"
                                        placeholder="City"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-white"
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="state"
                                        placeholder="State/Province"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-white"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        name="zipCode"
                                        placeholder="ZIP/Postal Code"
                                        value={formData.zipCode}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-white"
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="country"
                                        placeholder="Country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:text-white"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Payment Method</h3>
                            <div className="space-y-3">
                                {/* <button
                                    onClick={() => setPaymentMethod('paystack')}
                                    className={`w-full flex items-center justify-between p-3 border rounded-lg transition-colors ${
                                        paymentMethod === 'paystack'
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                        <span className="text-gray-700 dark:text-gray-300">Paystack</span>
                                    </div>
                                    {paymentMethod === 'paystack' && (
                                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-white"></div>
                                        </div>
                                    )}
                                </button> */}

                                <div
                                    onClick={() => setPaymentMethod('wallet')}
                                    className={`w-full flex items-center justify-between p-3 border rounded-lg transition-colors ${
                                        paymentMethod === 'wallet'
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Wallet className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                        <div>
                                            <span className="text-gray-700 dark:text-gray-300">Wallet</span>
                                            <div className="flex items-center gap-1 text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">Balance:</span>
                                                <div className="flex items-center">
                                                    <button 
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setBalanceVisible(!balanceVisible);
                                                        }}
                                                        className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                                                    >
                                                        {balanceVisible ? (
                                                            <span>₦{formatNumberWithCommas(walletBalance.toFixed(2))}</span>
                                                        ) : (
                                                            <span>•••••••</span>
                                                        )}
                                                    </button>
                                                    {balanceVisible ? (
                                                        <EyeOff 
                                                            size={16} 
                                                            className="ml-1 text-emerald-600 dark:text-emerald-400 cursor-pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setBalanceVisible(false);
                                                            }}
                                                        />
                                                    ) : (
                                                        <Eye 
                                                            size={16} 
                                                            className="ml-1 text-emerald-600 dark:text-emerald-400 cursor-pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setBalanceVisible(true);
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {paymentMethod === 'wallet' && (
                                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-white"></div>
                                        </div>
                                    )}
                                </div>

                                {paymentMethod === 'wallet' && (
                                    <div className={`p-3 rounded-lg ${
                                        canPayWithWallet 
                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                                            : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                                    }`}>
                                        {canPayWithWallet ? (
                                            <p className="text-sm">Your wallet balance is sufficient for this purchase</p>
                                        ) : (
                                            <p className="text-sm">
                                                You need ₦{formatNumberWithCommas(remainingBalance.toFixed(2))} more to complete this purchase
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span className="text-gray-700 dark:text-gray-300">Total</span>
                                <span className="text-emerald-600">₦{formatNumberWithCommas(totalAmount.toFixed(2))}</span>
                            </div>
                        </div>

                        <DrawerFooter className="px-0">
                            <DrawerClose asChild>
                                <button 
                                    onClick={handlePlaceOrder}
                                    disabled={isProcessing || (paymentMethod === 'wallet' && !canPayWithWallet)}
                                    className={`w-full flex items-center justify-center gap-2 text-white p-3 rounded-xl font-semibold transition-all shadow-md ${
                                        isProcessing || (paymentMethod === 'wallet' && !canPayWithWallet)
                                            ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
                                    }`}
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            {paymentMethod === 'paystack' ? (
                                                <CreditCard className="w-5 h-5" />
                                            ) : (
                                                <Wallet className="w-5 h-5" />
                                            )}
                                            Complete Payment
                                        </>
                                    )}
                                </button>
                            </DrawerClose>
                            
                            <DrawerClose asChild>
                                <button className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm">
                                    <ArrowRight className="w-4 h-4" />
                                    Continue Shopping
                                </button>
                            </DrawerClose>
                        </DrawerFooter>
                    </div>
                )}
            </DrawerContent>
        </Drawer>
    )
}