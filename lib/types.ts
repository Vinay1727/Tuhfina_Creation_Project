export interface User {
    uid: string;
    email: string;
    role: 'ADMIN' | 'USER';
    createdAt: Date;
}

export interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    images: string[];
    isCustomizable: boolean;
    features?: string[];
    createdAt: Date;
}

export interface CartItem {
    productId: string;
    quantity: number;
    customization?: {
        text?: string;
        imageUrl?: string;
    };
}

export interface Order {
    id: string;
    userId: string;
    items: {
        productId: string;
        title: string;
        price: number;
        quantity: number;
        imageUrl: string;
        customization?: {
            text?: string;
            imageUrl?: string;
        };
    }[];
    totalAmount: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentStatus?: 'PENDING' | 'PAID' | 'FAILED';
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    invoiceUrl?: string;
    createdAt: Date;
    userEmail?: string;
    shippingAddress?: {
        name: string;
        address: string;
        city: string;
        state: string;
        pincode: string;
        phone: string;
    };
}

export const CATEGORIES = [
    'Artificial Flowers',
    'Real Flowers',
    'Gifts',
    'Customized Earrings',
    'Customized Frames',
    'Customized Keychains',
    'Diwali Diyas & Candles',
] as const;

export const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'Tuhfinacreations@gmail.com';
