'use client';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Order, OrderStatus, SalesRep, User } from '@/lib/types';
import { Search, Printer, Edit3, Trash2, X, Download } from 'lucide-react';
import { OrderReceipt } from '../receipts/order-receipt';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { createClient } from '@/lib/supabase';

interface OrdersTabProps {
    currentUser: User;
    currentRep: SalesRep | undefined;
    orders: Order[];
    onEditOrder: (order: Order) => void;
    refreshData: () => void;
}

const OrdersTab: React.FC<OrdersTabProps> = ({ currentUser, currentRep, orders, onEditOrder, refreshData }) => {
    const supabase = createClient();
    const [orderSearch, setOrderSearch] = useState('');
    const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);
    const receiptRef = useRef<HTMLDivElement>(null);
    const [receiptImage, setReceiptImage] = useState<{dataUrl: string; format: 'png' | 'pdf'} | null>(null);

    const filteredOrders = useMemo(() => {
        let displayOrders = orders;
        if (currentUser.role === 'sales' && currentRep) {
            displayOrders = orders.filter(o => o.salesRepId === currentRep.id);
        }

        if (!orderSearch) return displayOrders.sort((a,b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());

        return displayOrders.filter(o =>
            o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) || 
            o.customerPhone.includes(orderSearch) || 
            o.id.toLowerCase().includes(orderSearch.toLowerCase())
        ).sort((a,b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());
    }, [orders, orderSearch, currentUser, currentRep]);

    const handlePreviewOrder = (order: Order) => {
        setSelectedOrderForPrint(order);
    };

    const downloadAs = async (format: 'png' | 'pdf') => {
        if (!receiptRef.current || !selectedOrderForPrint) return;

        try {
            const canvas = await html2canvas(receiptRef.current, { scale: 3, useCORS: true, allowTaint: true, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            setReceiptImage({dataUrl: imgData, format});
        } catch (error) {
            console.error("Error generating file:", error);
            alert("حدث خطأ أثناء إنشاء الملف.");
        }
    };
    
    useEffect(() => {
      if (receiptImage && selectedOrderForPrint) {
        if (receiptImage.format === 'png') {
            const link = document.createElement('a');
            link.href = receiptImage.dataUrl;
            link.download = `invoice-${selectedOrderForPrint.id}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else { // pdf
            const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const img = new Image();
            img.src = receiptImage.dataUrl;
            img.onload = () => {
                const imgWidth = img.width;
                const imgHeight = img.height;
                const ratio = imgWidth / imgHeight;
                
                let finalWidth, finalHeight;

                if (ratio > (pdfWidth/pdfHeight)) {
                  finalWidth = pdfWidth;
                  finalHeight = pdfWidth / ratio;
                } else {
                  finalHeight = pdfHeight;
                  finalWidth = pdfHeight * ratio;
                }

                const x = (pdfWidth - finalWidth) / 2;
                const y = (pdfHeight - finalHeight) / 2;
                
                pdf.addImage(receiptImage.dataUrl, 'PNG', x, y, finalWidth, finalHeight);
                pdf.save(`invoice-${selectedOrderForPrint.id}.pdf`);
            }
        }
        setReceiptImage(null); // Reset after download
      }
    }, [receiptImage, selectedOrderForPrint]);


    const handleDeleteOrder = async (orderId: string) => {
      if (window.confirm('هل أنت متأكد من حذف الفاتورة نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.')) {
        const { error } = await supabase.from('orders').delete().eq('id', orderId);
        if (error) {
            alert(`فشل حذف الفاتورة: ${error.message}`);
        } else {
            alert('تم حذف الفاتورة بنجاح.');
            refreshData();
        }
      }
    }

    const toggleOrderStatus = async (order: Order, newStatus: OrderStatus) => {
        const oldStatus = order.status;
        if (oldStatus === newStatus) return;

        if (currentUser?.role === 'sales' && newStatus !== 'ملغي' && newStatus !== 'قيد التنفيذ') {
            alert('ليس لديك صلاحية لتغيير الحالة، يمكنك فقط إلغاء الطلب أو إعادته للتنفيذ.');
            return;
        }

        const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', order.id);
        if (error) {
            alert(`فشل تحديث حالة الطلب: ${error.message}`);
        } else {
            alert('تم تحديث حالة الطلب ✅');
            refreshData(); // Refresh all data to reflect potential commission changes
        }
    };
    
    const formatTimestamp = (ts: Date | string) => {
        if (ts instanceof Date) {
            return ts.toLocaleString('ar-EG');
        }
        if (typeof ts === 'string') {
            return new Date(ts).toLocaleString('ar-EG');
        }
        return 'تاريخ غير معروف';
    }


    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center gap-4">
                <Search className="text-gray-300 w-5 h-5" />
                <input value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} placeholder="ابحث في الفواتير بالاسم، رقم الهاتف، أو كود الطلب..." className="w-full bg-transparent p-2 outline-none font-bold text-emerald-950" />
            </div>
            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-right">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-8 text-xs font-black text-gray-400 uppercase">العميل / الكود</th>
                            <th className="p-8 text-xs font-black text-gray-400 uppercase text-center">المبلغ</th>
                            <th className="p-8 text-xs font-black text-gray-400 uppercase text-center">المندوب</th>
                            <th className="p-8 text-xs font-black text-gray-400 uppercase text-center">الحالة</th>
                            <th className="p-8 text-xs font-black text-gray-400 uppercase">الإجراء</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredOrders.map(o => (
                            <tr key={o.id} className="hover:bg-gray-50/50 transition-all group">
                                <td className="p-8">
                                    <p className="font-black text-emerald-950">{o.customerName}</p>
                                    <p className="text-[10px] text-gray-400 font-bold">#{o.id.toString().substring(0,6)} • {formatTimestamp(o.createdAt)}</p>
                                </td>
                                <td className="p-8 text-center font-black text-emerald-900">{o.totalAmount.toLocaleString()}</td>
                                <td className="p-8 text-center text-xs font-black text-gray-500">{o.salesRepName || 'غير محدد'}</td>
                                <td className="p-8 text-center">
                                    <select 
                                        value={o.status} 
                                        onChange={(e) => toggleOrderStatus(o, e.target.value as OrderStatus)}
                                        className={`px-4 py-2 rounded-full text-[10px] font-black border outline-none cursor-pointer ${
                                            o.status === 'تم التسليم' ? 'bg-green-100 text-green-700 border-green-200' : 
                                            o.status === 'ملغي' || o.status === 'مرتجع' ? 'bg-red-100 text-red-700 border-red-200' : 
                                            'bg-amber-100 text-amber-700 border-amber-200'
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
                                        <button onClick={() => handlePreviewOrder(o)} className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all"><Printer className="w-5 h-5"/></button>
                                        <button onClick={() => onEditOrder(o)} className="p-4 bg-amber-50 text-amber-600 rounded-2xl hover:bg-amber-600 hover:text-white transition-all"><Edit3 className="w-5 h-5"/></button>
                                        {currentUser.role === 'admin' && (
                                            <button onClick={() => handleDeleteOrder(o.id.toString())} className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all"><Trash2 className="w-5 h-5"/></button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Receipt Preview Modal */}
            {selectedOrderForPrint && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-in fade-in">
                    <div className="bg-white rounded-[3rem] p-8 shadow-2xl w-full max-w-2xl relative animate-in zoom-in">
                        <button onClick={() => setSelectedOrderForPrint(null)} className="absolute top-6 left-6 p-3 bg-gray-100 rounded-2xl hover:bg-red-100 hover:text-red-500 transition-all z-10"><X/></button>
                        <h3 className="text-2xl font-black text-emerald-950 mb-6 text-center">معاينة الفاتورة</h3>
                        <div className="bg-gray-50 rounded-2xl p-4 border overflow-y-auto max-h-[60vh] flex justify-center">
                             <div ref={receiptRef}>
                                <OrderReceipt order={selectedOrderForPrint} />
                            </div>
                        </div>
                        <div className="flex gap-4 justify-center mt-6">
                            <button onClick={() => downloadAs('png')} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg hover:bg-emerald-700 transition-all"><Download/> تحميل كصورة (PNG)</button>
                            <button onClick={() => downloadAs('pdf')} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg hover:bg-indigo-700 transition-all"><Download/> تحميل كملف (PDF)</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersTab;

    