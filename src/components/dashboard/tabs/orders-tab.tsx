
'use client';
import React, { useState, useMemo, useRef } from 'react';
import type { Order, OrderStatus, SalesRep, User } from '@/lib/types';
import { Search, Printer, Edit3, Trash2, X, Download } from 'lucide-react';
import { OrderReceipt } from '../receipts/order-receipt';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { createClient } from '@/lib/supabase';

interface OrdersTabProps {
    currentUser: User;
    currentRep: SalesRep | undefined;
    salesReps: SalesRep[];
    orders: Order[];
    onEditOrder: (order: Order) => void;
    refreshData: () => void;
}

const OrdersTab: React.FC<OrdersTabProps> = ({ currentUser, currentRep, salesReps, orders, onEditOrder, refreshData }) => {
    const supabase = createClient();
    const [orderSearch, setOrderSearch] = useState('');
    const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);
    const receiptRef = useRef<HTMLDivElement>(null);
    const [exporting, setExporting] = useState(false);

    const formatAmount = (val: number) => {
        return (val / 100).toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
    };

    const filteredOrders = useMemo(() => {
        let displayOrders = orders;
        if (currentUser.role === 'sales' && currentRep) {
            displayOrders = orders.filter(o => o.salesRepId === currentRep.id);
        }
        if (!orderSearch) return [...displayOrders].sort((a,b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());
        return displayOrders.filter(o =>
            o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) || 
            o.customerPhone.includes(orderSearch) || 
            o.id.toLowerCase().includes(orderSearch.toLowerCase())
        ).sort((a,b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());
    }, [orders, orderSearch, currentUser, currentRep]);

    const toggleOrderStatus = async (order: Order, newStatus: OrderStatus) => {
        const oldStatus = order.status;
        if (oldStatus === newStatus) return;

        if (currentUser?.role === 'sales' && newStatus !== 'ملغي' && newStatus !== 'قيد التنفيذ') {
            alert('ليس لديك صلاحية لتأكيد التسليم، فقط المشرف يمكنه ذلك.');
            return;
        }

        try {
            const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', order.id);
            if (error) throw error;

            if (newStatus === 'تم التسليم' && oldStatus === 'قيد التنفيذ') {
                const rep = salesReps.find(r => r.id === order.salesRepId);
                if (rep) {
                    await supabase.from('sales_reps').update({
                        total_commission: Math.round(Number(rep.total_commission || 0) + Number(order.commission)),
                        pending_commission: Math.max(0, Math.round(Number(rep.pending_commission || 0) - Number(order.commission)))
                    }).eq('id', rep.id);
                }
            } else if (newStatus === 'ملغي' && oldStatus === 'قيد التنفيذ') {
                const rep = salesReps.find(r => r.id === order.salesRepId);
                if (rep) {
                    await supabase.from('sales_reps').update({
                        pending_commission: Math.max(0, Math.round(Number(rep.pending_commission || 0) - Number(order.commission)))
                    }).eq('id', rep.id);
                }
            }

            alert('تم تحديث حالة الطلب وترحيل العمولات بنجاح ✅');
            refreshData();
        } catch (err: any) {
            alert(`خطأ: ${err.message}`);
        }
    };

    const downloadAs = async (format: 'png' | 'pdf') => {
        if (!receiptRef.current || !selectedOrderForPrint) return;
        setExporting(true);
        try {
            const canvas = await html2canvas(receiptRef.current, { scale: 3, useCORS: true, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            if (format === 'png') {
                const link = document.createElement('a');
                link.href = imgData;
                link.download = `فاتورة-${selectedOrderForPrint.customerName}.png`;
                link.click();
            } else {
                const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: [canvas.width / 3, canvas.height / 3] });
                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 3, canvas.height / 3);
                pdf.save(`فاتورة-${selectedOrderForPrint.customerName}.pdf`);
            }
        } catch (error) {
            alert("خطأ في التحميل.");
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center gap-4 shadow-sm">
                <Search className="text-gray-300 w-5 h-5" />
                <input value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} placeholder="بحث باسم العميل أو رقم الهاتف..." className="w-full bg-transparent p-2 outline-none font-bold text-emerald-950" />
            </div>
            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-right">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-8 text-xs font-black text-gray-400 uppercase">العميل / التاريخ</th>
                            <th className="p-8 text-xs font-black text-gray-400 uppercase text-center">المبلغ</th>
                            <th className="p-8 text-xs font-black text-gray-400 uppercase text-center">المندوب</th>
                            <th className="p-8 text-xs font-black text-gray-400 uppercase text-center">الحالة</th>
                            <th className="p-8 text-xs font-black text-gray-400 uppercase">الإجراء</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredOrders.map(o => (
                            <tr key={o.id} className="hover:bg-gray-50/50 transition-all">
                                <td className="p-8">
                                    <p className="font-black text-emerald-950">{o.customerName}</p>
                                    <p className="text-[10px] text-gray-400 font-bold">#{o.id.substring(0,6)} • {new Date(o.createdAt).toLocaleDateString('en-US')}</p>
                                </td>
                                <td className="p-8 text-center font-black text-emerald-900">{formatAmount(o.totalAmount)} ج.م</td>
                                <td className="p-8 text-center text-xs font-black text-gray-500">{o.salesRepName}</td>
                                <td className="p-8 text-center">
                                    <select 
                                        value={o.status} 
                                        onChange={(e) => toggleOrderStatus(o, e.target.value as OrderStatus)}
                                        className={`px-4 py-2 rounded-full text-[10px] font-black border outline-none cursor-pointer ${
                                            o.status === 'تم التسليم' ? 'bg-green-100 text-green-700' : 
                                            o.status === 'ملغي' || o.status === 'مرتجع' ? 'bg-red-100 text-red-700' : 
                                            'bg-amber-100 text-amber-700'
                                        }`}
                                    >
                                        <option value="قيد التنفيذ">قيد التنفيذ</option>
                                        <option value="تم التسليم">تم التسليم</option>
                                        <option value="مرتجع">مرتجع</option>
                                        <option value="ملغي">ملغي</option>
                                    </select>
                                </td>
                                <td className="p-8">
                                    <div className="flex gap-2">
                                        <button onClick={() => setSelectedOrderForPrint(o)} className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"><Printer className="w-5 h-5"/></button>
                                        <button onClick={() => onEditOrder(o)} className="p-4 bg-amber-50 text-amber-600 rounded-2xl hover:bg-amber-600 hover:text-white transition-all shadow-sm"><Edit3 className="w-5 h-5"/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedOrderForPrint && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[1000] p-4 animate-in fade-in">
                    <div className="bg-white rounded-[3rem] p-10 shadow-2xl w-full max-w-4xl relative animate-in zoom-in overflow-hidden">
                        <button onClick={() => setSelectedOrderForPrint(null)} className="absolute top-8 left-8 p-4 bg-gray-100 rounded-2xl hover:bg-red-100 hover:text-red-500 transition-all z-20"><X/></button>
                        <h3 className="text-3xl font-black text-emerald-950 mb-10 text-center">معاينة الفاتورة</h3>
                        <div className="bg-gray-100/50 rounded-[2.5rem] p-8 border border-gray-200 overflow-y-auto max-h-[65vh] flex justify-center">
                             <div ref={receiptRef} className="shadow-2xl"><OrderReceipt order={selectedOrderForPrint} /></div>
                        </div>
                        <div className="flex gap-4 justify-center mt-10">
                            <button disabled={exporting} onClick={() => downloadAs('png')} className="bg-emerald-600 text-white px-10 py-5 rounded-[1.5rem] font-black text-lg flex items-center gap-3">
                                <Download/> {exporting ? 'جاري التجهيز...' : 'تحميل صورة'}
                            </button>
                            <button disabled={exporting} onClick={() => downloadAs('pdf')} className="bg-indigo-600 text-white px-10 py-5 rounded-[1.5rem] font-black text-lg flex items-center gap-3">
                                <Download/> {exporting ? 'جاري التجهيز...' : 'تحميل PDF'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersTab;
