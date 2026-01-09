'use client';

import type { Order } from '@/lib/types';
import React from 'react';

interface OrderReceiptProps {
    order: Order;
}

const formatTimestampForReceipt = (ts: Date | string) => {
    if (ts instanceof Date) {
        return ts.toLocaleDateString('ar-EG');
    }
    if (typeof ts === 'string') {
        return new Date(ts).toLocaleDateString('ar-EG');
    }
    return 'غير محدد';
}

export const OrderReceipt: React.FC<OrderReceiptProps> = ({ order }) => {
    return (
        <div id={`receipt-${order.id}`} className="bg-white p-8 font-cairo" style={{ width: '400px', direction: 'rtl' }}>
            <div className="text-center mb-8">
                <h1 className="text-2xl font-black">فاتورة طلب</h1>
                <p className="text-gray-500 text-sm">مؤسسة العطور الملكية</p>
            </div>
            
            <div className="border-t border-b border-dashed py-4 mb-6">
                <div className="flex justify-between text-sm">
                    <span>تاريخ الطلب:</span>
                    <span className="font-bold">{formatTimestampForReceipt(order.createdAt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span>رقم الفاتورة:</span>
                    <span className="font-bold">#{order.id.padStart(6, '0')}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span>المندوب:</span>
                    <span className="font-bold">{order.salesRepName}</span>
                </div>
            </div>

            <div className="mb-6">
                <h2 className="font-bold mb-2 text-md">بيانات العميل:</h2>
                <p className="text-sm"><span className="font-semibold">الاسم:</span> {order.customerName}</p>
                <p className="text-sm"><span className="font-semibold">الهاتف:</span> {order.customerPhone}</p>
                <p className="text-sm"><span className="font-semibold">العنوان:</span> {order.customerAddress}</p>
                {order.customerNotes && <p className="text-sm"><span className="font-semibold">ملاحظات:</span> {order.customerNotes}</p>}
            </div>

            <table className="w-full text-sm mb-6">
                <thead className="border-b">
                    <tr>
                        <th className="text-right font-bold pb-2">الصنف</th>
                        <th className="text-center font-bold pb-2">الكمية</th>
                        <th className="text-center font-bold pb-2">السعر</th>
                        <th className="text-left font-bold pb-2">الإجمالي</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items.map((item, index) => (
                        <tr key={index} className="border-b border-dashed">
                            <td className="py-2">{item.productName}</td>
                            <td className="text-center py-2">{item.quantity}</td>
                            <td className="text-center py-2">{item.price.toFixed(2)}</td>
                            <td className="text-left py-2">{(item.quantity * item.price).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span>المجموع الفرعي:</span>
                    <span>{order.subtotal.toFixed(2)} ج.م</span>
                </div>
                <div className="flex justify-between">
                    <span>خصم ({order.discountPercentage}%):</span>
                    <span className="text-red-500">-{order.discountAmount.toFixed(2)} ج.م</span>
                </div>
                <div className="flex justify-between">
                    <span>تكلفة الشحن:</span>
                    <span>{order.shippingCost.toFixed(2)} ج.م</span>
                </div>
                <div className="flex justify-between font-black text-xl border-t-2 border-black pt-2 mt-2">
                    <span>الإجمالي النهائي:</span>
                    <span>{order.totalAmount.toFixed(2)} ج.م</span>
                </div>
            </div>

            <div className="text-center mt-8 text-xs text-gray-400">
                <p>شكراً لتعاملكم معنا!</p>
            </div>
        </div>
    );
};
