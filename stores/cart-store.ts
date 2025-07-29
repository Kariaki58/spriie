import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProductVariant {
  id: string;
  name: string;
  price: number;
  color?: string;
  size?: string;
  stock: number;
}

interface IProductId {
  _id: string;
  title: string;
  price: number;
  images: string;
}

export interface CartItem {
  id: string;
  _id: string;
  productId: IProductId;
  storeName: string;
  name: string;
  variant: ProductVariant;
  quantity: number;
  image: string;
  price: number;
}

interface CartState {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  createCartOnServer: () => Promise<void>;
  updateCartOnServer: (item: CartItem) => Promise<void>;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],

      addToCart: (item) => {
        set((state) => {
          const existingItem = state.cartItems.find(
            (cartItem) => cartItem.id === item.id
          );

          if (existingItem) {
            return {
              cartItems: state.cartItems.map((cartItem) =>
                cartItem.id === item.id
                  ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                  : cartItem
              ),
            };
          }

          return { cartItems: [...state.cartItems, item] };
        });
      },

      removeFromCart: (id) => {
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item._id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        console.log(id, quantity)

        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item._id === id ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ cartItems: [] }),

      // POST - Create new cart
      createCartOnServer: async () => {
        try {
          const response = await fetch('/api/cart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              cartItems: get().cartItems,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to create cart on server');
          }
        } catch (error) {
          console.error('Error creating cart:', error);
          throw error;
        }
      },

      // PUT - Update only one cart item
      updateCartOnServer: async (item) => {
        try {
            console.log(item)
          const response = await fetch('/api/cart', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cartItem: item }),
          });

          if (!response.ok) {
            throw new Error('Failed to update cart item on server');
          }
        } catch (error) {
          console.error('Error updating cart item:', error);
          throw error;
        }
      },

      getTotalItems: () => {
        return get().cartItems.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      skipHydration: true,
    }
  )
);
