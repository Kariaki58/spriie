import { useCallback } from 'react';
import { useCartStore } from '@/stores/cart-store';
import { toast } from 'sonner';
import { CartItem } from '@/stores/cart-store';

export function useCart() {
  const { 
    cartItems, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart,
    getTotalItems,
    getTotalPrice
  } = useCartStore();

  const handleAddToCart = useCallback(async (item: CartItem) => {
    try {
      // Optimistic update
      addToCart(item);

      // Sync with backend
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItems: [...cartItems, item]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update cart on server');
      }

      toast.success('Product added to cart');
    } catch (error: any) {
      // Revert optimistic update
      useCartStore.getState().removeFromCart(item.productId._id);
      toast.error(error.message || 'Failed to add to cart');
    }
  }, [addToCart, cartItems]);

  const handleRemoveFromCart = useCallback(async (productId: string) => {
    try {
      // Optimistic update
      removeFromCart(productId);

      // Sync with backend
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItems: cartItems.filter(item => item.productId._id !== productId)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update cart on server');
      }

      toast.success('Product removed from cart');
    } catch (error: any) {
      // Revert optimistic update
      useCartStore.getState().addToCart(
        cartItems.find(item => item.productId._id === productId)!
      );
      toast.error(error.message || 'Failed to remove from cart');
    }
  }, [removeFromCart, cartItems]);

  return {
    cartItems,
    addToCart: handleAddToCart,
    removeFromCart: handleRemoveFromCart,
    updateQuantity,
    clearCart,
    totalItems: getTotalItems(),
    totalPrice: getTotalPrice()
  };
}