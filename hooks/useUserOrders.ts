import { useState, useEffect } from 'react';
import { Order, OrderStatus } from '@/types/types';


export const useUserOrders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/orders/user');
                if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                }
                const data = await response.json();
                setOrders(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const cancelOrder = async (orderId: string) => {
        try {
            const response = await fetch(`/api/orders/${orderId}/cancel`, {
                method: 'PATCH'
            });
            if (!response.ok) {
                throw new Error('Failed to cancel order');
            }
            setOrders(orders.map(order => 
                order.id === orderId ? { ...order, status: 'cancelled' } : order
            ));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to cancel order');
        }
    };

    const initiateReturn = async (orderId: string) => {
        try {
            const response = await fetch(`/api/orders/${orderId}/return`, {
                method: 'PATCH'
            });
            if (!response.ok) {
                throw new Error('Failed to initiate return');
            }
            setOrders(orders.map(order => 
                order.id === orderId ? { ...order, status: 'returned' } : order
            ));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to initiate return');
        }
    };

    return { orders, loading, error, cancelOrder, initiateReturn };
};