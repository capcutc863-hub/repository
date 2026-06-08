'use client';

import type { Order } from '@/lib/types';
import React from 'react';
import { Package } from 'lucide-react';

interface OrderReceiptProps {
    order: Order;
}

export const OrderReceipt: React.FC<OrderReceiptProps> = ({ order }) => {
    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div id={`receipt-${order.id}`} className="bg-white p-12 text-right font-cairo shadow-2xl border-t-8 border-emerald-600" style={{ width: '800px', direction: 'rtl' }}>
            <div className="flex justify-between items-start mb-12">
                <div className="flex items-center gap-4">
                    <div className="bg-emerald-600 p-4 rounded-2xl text-white shadow-lg">
                        <Package className="w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-emerald-900">مؤسسة العطور الملكية</h1>
                        <p className="text-gray-400 font-bold text-sm tracking-widest uppercase">ROYAL PERFUMES EST.</p>
                    </div>
                </div>
                <div className="text-left">
                    <div className="bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">رقم الفاتورة</p>
                        <p className="text-xl font-black text-emerald-600">#{order.id.toString().substring(0, 8).toUpperCase()}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-12">
                <div className="space-y-4">
                    <h3 className="text-lg font-black text-emerald-900 border-b pb-2">بيانات العميل</h3>
                    <div className="space-y-1">
                        <p className="text-sm font-black text-gray-800">{order.customerName}</p>
                        <p className="text-sm font-bold text-gray-500">{order.customerPhone}</p>
                        <p className="text-sm font-bold text-gray-500">{order.customerAddress}</p>
                        {order.customerNotes && (
                            <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100 italic text-xs text-amber-800">
                                <span className="font-black">ملاحظات:</span> {order.customerNotes}
                            </div>
                        )}
                    </div>
                </div>
                <div className="space-y-4">
                    <h3 className="text-lg font-black text-emerald-900 border-b pb-2">تفاصيل الطلب</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm"><span className="text-gray-400 font-bold">التاريخ:</span><span className="font-black">{formatDate(order.createdAt)}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-400 font-bold">المندوب:</span><span className="font-black">{order.salesRepName}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-400 font-bold">الحالة:</span><span className="font-black text-emerald-600">{order.status}</span></div>
                    </div>
                </div>
            </div>

            <table className="w-full mb-12">
                <thead>
                    <tr className="bg-emerald-900 text-white">
                        <th className="p-4 rounded-r-2xl font-black text-right">الصنف / الجودة</th>
                        <th className="p-4 font-black text-center">الكمية</th>
                        <th className="p-4 font-black text-center">سعر الوحدة</th>
                        <th className="p-4 rounded-l-2xl font-black text-left">الإجمالي</th>
                    </tr>
                </thead>
                <tbody className="divide-y border-b">
                    {order.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                            <td className="p-5 font-black text-gray-800">
                                {item.productName}
                                <p className="text-[10px] text-emerald-600 uppercase mt-1">{item.grade}</p>
                            </td>
                            <td className="p-5 text-center font-bold text-gray-500">{item.quantity} mg</td>
                            <td className="p-5 text-center font-bold text-gray-500">{item.price.toLocaleString()} ج.م</td>
                            <td className="p-5 text-left font-black text-emerald-900">{(item.quantity * item.price).toLocaleString()} ج.م</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-end">
                <div className="w-80 space-y-4">
                    <div className="flex justify-between text-sm px-2"><span className="text-gray-400 font-bold uppercase">المجموع الفرعي</span><span className="font-black text-gray-800">{order.subtotal.toLocaleString()} ج.م</span></div>
                    <div className="flex justify-between text-sm px-2"><span className="text-gray-400 font-bold uppercase">الخصم ({order.discountPercentage}%)</span><span className="font-black text-red-500">-{order.discountAmount.toLocaleString()} ج.م</span></div>
                    <div className="flex justify-between text-sm px-2 border-b pb-4"><span className="text-gray-400 font-bold uppercase">تكلفة الشحن</span><span className="font-black text-gray-800">{order.shippingCost.toLocaleString()} ج.م</span></div>
                    <div className="flex justify-between items-center bg-emerald-600 p-5 rounded-2xl text-white shadow-xl">
                        <span className="text-lg font-black uppercase tracking-tighter">الإجمالي النهائي</span>
                        <span className="text-2xl font-black">{order.totalAmount.toLocaleString()} ج.م</span>
                    </div>
                </div>
            </div>

            <div className="mt-20 text-center border-t pt-8">
                <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-2">شكراً لثقتكم في مؤسسة العطور الملكية</p>
                <p className="text-[10px] text-gray-300">تم إصدار هذه الفاتورة إلكترونياً من نظام إدارة المخازن المطور</p>
            </div>
        </div>
    );
};