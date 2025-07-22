export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

export type OrderItem = {
    name: string;
    quantity: number;
    price: number;
    image: string;
};

export type ShippingAddress = {
    name: string;
    street: string;
    city: string;
    state: string;
    country: string;
    phone: string;
};

export type Order = {
    id: string;
    date: string;
    status: OrderStatus;
    amount: number;
    items: OrderItem[];
    shippingAddress: ShippingAddress;
    paymentMethod: string;
    trackingNumber?: string;
};