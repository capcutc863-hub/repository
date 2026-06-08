
'use client';

import type { Order } from '@/lib/types';
import React from 'react';
import { Package } from 'lucide-react';

interface OrderReceiptProps {
    order: Order;
}

export const OrderReceipt: React.FC<OrderReceiptProps> = ({ order }) => {
    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    };

    return (
        <div id={`receipt-${order.id}`} className="bg-white p-12 text-right font-cairo shadow-2xl border-t-[12px] border-emerald-600" style={{ width: '800px', direction: 'rtl' }}>
            <div className="flex justify-between items-start mb-16">
                <div className="flex items-center gap-4">
                    <div className="bg-emerald-600 p-5 rounded-[1.5rem] text-white shadow-xl">
                        <Package className="w-12 h-12" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-emerald-950">مؤسسة العطور الملكية</h1>
                        <p className="text-gray-400 font-bold text-sm tracking-[0.2em] uppercase mt-1">ROYAL PERFUMES EST.</p>
                    </div>
                </div>
                <div className="text-left">
                    <div className="bg-gray-50 px-8 py-4 rounded-3xl border border-gray-100 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest text-center">رقم الفاتورة</p>
                        <p className="text-2xl font-black text-emerald-600">#{order.id.toString().substring(0, 8).toUpperCase()}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-16">
                <div className="space-y-4">
                    <h3 className="text-lg font-black text-emerald-900 border-b-2 border-emerald-50 pb-2">بيانات العميل</h3>
                    <div className="space-y-1">
                        <p className="text-base font-black text-gray-900">{order.customerName}</p>
                        <p className="text-sm font-bold text-gray-500">{order.customerPhone}</p>
                        <p className="text-sm font-bold text-gray-500">{order.customerAddress}</p>
                        {order.customerNotes && (
                            <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-100 italic text-xs text-amber-800">
                                <span className="font-black">ملاحظات:</span> {order.customerNotes}
                            </div>
                        )}
                    </div>
                </div>
                <div className="space-y-4">
                    <h3 className="text-lg font-black text-emerald-900 border-b-2 border-emerald-50 pb-2">تفاصيل الطلب</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm"><span className="text-gray-400 font-bold uppercase">تاريخ الإصدار:</span><span className="font-black">{formatDate(order.createdAt)}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-400 font-bold uppercase">المندوب المسؤول:</span><span className="font-black">{order.salesRepName}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-400 font-bold uppercase">حالة الطلب:</span><span className="font-black text-emerald-600">{order.status}</span></div>
                    </div>
                </div>
            </div>

            <table className="w-full mb-16">
                <thead>
                    <tr className="bg-emerald-950 text-white">
                        <th className="p-5 rounded-r-3xl font-black text-right">الصنف / الجودة</th>
                        <th className="p-5 font-black text-center">الكمية</th>
                        <th className="p-5 font-black text-center">سعر الوحدة</th>
                        <th className="p-5 rounded-l-3xl font-black text-left">الإجمالي</th>
                    </tr>
                </thead>
                <tbody className="divide-y border-b">
                    {order.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="p-6 font-black text-gray-900">
                                {item.productName}
                                <p className="text-[10px] text-emerald-600 font-bold uppercase mt-1 tracking-wider">{item.grade}</p>
                            </td>
                            <td className="p-6 text-center font-bold text-gray-600">{item.quantity} mg</td>
                            <td className="p-6 text-center font-bold text-gray-600">{formatCurrency(item.price)} ج.م</td>
                            <td className="p-6 text-left font-black text-emerald-950">{formatCurrency(item.quantity * item.price)} ج.م</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-end">
                <div className="w-96 space-y-4">
                    <div className="flex justify-between text-sm px-4"><span className="text-gray-400 font-black uppercase">المجموع الفرعي</span><span className="font-black text-gray-800">{formatCurrency(order.subtotal)} ج.م</span></div>
                    <div className="flex justify-between text-sm px-4"><span className="text-gray-400 font-black uppercase">الخصم المطبق ({order.discountPercentage}%)</span><span className="font-black text-red-500">-{formatCurrency(order.discountAmount)} ج.م</span></div>
                    <div className="flex justify-between text-sm px-4 border-b-2 border-gray-50 pb-6"><span className="text-gray-400 font-black uppercase">مصاريف الشحن</span><span className="font-black text-gray-800">{formatCurrency(order.shippingCost)} ج.م</span></div>
                    <div className="flex justify-between items-center bg-emerald-600 p-6 rounded-[2rem] text-white shadow-2xl shadow-emerald-600/20">
                        <span className="text-xl font-black uppercase tracking-tighter">الإجمالي النهائي</span>
                        <div className="text-left">
                            <span className="text-3xl font-black">{formatCurrency(order.totalAmount)}</span>
                            <span className="text-xs font-bold mr-2 uppercase">جنيهاً مصرياً</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-24 text-center border-t-2 border-gray-50 pt-10">
                <p className="text-xs font-black text-gray-400 uppercase tracking-[0.4em] mb-3">شكراً لثقتكم في مؤسسة العطور الملكية</p>
                <div className="flex justify-center gap-8 text-[10px] text-gray-300 font-bold">
                    <p>صورة طبق الأصل من نظام الإدارة المطور</p>
                    <p>المخزن الجديد - فرع الزيوت الخام</p>
                </div>
            </div>
        </div>
    );
};
