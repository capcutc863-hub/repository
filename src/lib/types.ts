
export type OrderStatus = 'قيد التنفيذ' | 'تم التسليم' | 'مرتجع' | 'ملغي';
export type UserRole = 'admin' | 'supervisor' | 'sales';
export type OilGrade = 'عالي (Code A)' | 'وسط (Code B)' | 'تجاري (Code C)';

export interface MonthlyCommission {
    month: string;
    amount: number;
    ordersCount: number;
}

export interface User {
    id: string;
    name: string;
    nickname?: string;
    avatar?: string;
    username: string;
    role: UserRole;
    salesRepId?: string;
    isSuspended: boolean;
    isMuted: boolean;
    canEditInventory: boolean;
    canConfirmDelivery: boolean; 
    address?: string;
    startDate?: string;
    online?: boolean;
}

export interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: Date;
}

export interface Product {
    id: string;
    name: string;
    grade: OilGrade;
    pricePerMg: number;
    stock: number; // in mg
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    address?: string;
    totalSpent: number;
    classification: 'ذهبي' | 'فضي' | 'عادي';
    lastOrderDate: string;
}

export interface SalesRep {
    id: string;
    userId: string;
    name: string;
    totalCommission: number;
    pendingCommission: number;
    ordersCount: number;
    maxDiscountAllowed: number;
    customCommissionRate: number;
    monthlyHistory: MonthlyCommission[];
}

export interface OrderItem {
    productName: string;
    grade: OilGrade;
    quantity: number;
    price: number;
}

export interface Order {
    id: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    customerNotes?: string;
    salesRepId: string;
    salesRepName: string;
    items: OrderItem[];
    subtotal: number;
    discountPercentage: number;
    discountAmount: number;
    shippingCost: number;
    totalAmount: number;
    status: OrderStatus;
    createdAt: Date | string;
    commission: number;
}

    