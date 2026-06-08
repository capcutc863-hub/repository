
'use client';
import React, { useState } from 'react';
import type { Order, OrderItem, Product, User, SalesRep } from '@/lib/types';
import { X, PlusCircle, ShoppingCart, Plus, Trash2, Check, Percent } from 'lucide-react';

interface OrderFormProps {
    order: Order | 'new';
    onClose: () => void;
    currentUser: User;
    currentRep: SalesRep | undefined;
    salesReps: SalesRep[];
    products: Product[];
    onSave: (order: Omit<Order, 'id' | 'createdAt' | 'salesRepName'>, orderId?: string) => void;
}

export function OrderForm({ order, onClose, currentUser, currentRep, salesReps, products, onSave }: OrderFormProps) {

    const isEditing = typeof order === 'object';
    
    // Form state
    const [customerName, setCustomerName] = useState(isEditing ? order.customerName : '');
    const [customerPhone, setCustomerPhone] = useState(isEditing ? order.customerPhone : '');
    const [customerAddress, setCustomerAddress] = useState(isEditing ? order.customerAddress : '');
    const [customerNotes, setCustomerNotes] = useState(isEditing ? order.customerNotes || '' : '');
    const [shipping, setShipping] = useState<number>(isEditing ? order.shippingCost : 0);
    const [discount, setDiscount] = useState<number>(isEditing ? order.discountPercentage : 0);
    const [cart, setCart] = useState<OrderItem[]>(isEditing ? [...order.items] : []);
    
    const defaultRepId = currentRep?.id || (salesReps.length > 0 ? salesReps[0].id : '');
    const [selectedRepId, setSelectedRepId] = useState(isEditing ? order.salesRepId : defaultRepId);

    // Products for item entry
    const [itemSearch, setItemSearch] = useState('');
    const [itemQty, setItemQty] = useState('');
    const [itemPrice, setItemPrice] = useState('');
    
    const subtotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const discountAmount = (subtotal * discount) / 100;
    const netTotal = subtotal - discountAmount;
    
    const effectiveRepId = (currentUser.role !== 'sales' ? selectedRepId : currentRep?.id);
    const effectiveRep = salesReps.find(r => r.id === effectiveRepId);
    const commissionRate = effectiveRep?.customCommissionRate || 0.05;
    
    // نقوم بتقريب العمولة لأقرب خانتين عشريتين (قروش)
    const estimatedCommission = Math.round((netTotal * commissionRate) * 100) / 100;
    
    const handleConfirmOrder = () => {
        if (!customerName || cart.length === 0 || !currentUser) {
            alert('الرجاء إدخال اسم العميل وإضافة أصناف للسلة.');
            return;
        }
    
        if (!effectiveRepId || !effectiveRep) {
            alert('لا يمكن إنشاء فاتورة بدون مندوب محدد.');
            return;
        }
        
        const maxDiscount = effectiveRep.maxDiscountAllowed || 0;
        if (discount > maxDiscount) {
            alert(`لا يمكنك تجاوز نسبة الخصم المسموح بها للمندوب (${maxDiscount}%).`);
            return;
        }
    
        const totalAmount = netTotal + Number(shipping);
        
        const orderData: Omit<Order, 'id' | 'createdAt' | 'salesRepName'> = {
            customerName, customerPhone, customerAddress, customerNotes,
            items: [...cart],
            subtotal,
            discountPercentage: discount,
            discountAmount,
            shippingCost: Number(shipping),
            totalAmount,
            status: isEditing ? (order as Order).status : 'قيد التنفيذ',
            commission: estimatedCommission,
            salesRepId: effectiveRepId,
        };
        
        onSave(orderData, isEditing ? (order as Order).id : undefined);
    };

    const formatAmount = (val: number) => {
        return val.toLocaleString('en-US', { 
            minimumFractionDigits: 0, 
            maximumFractionDigits: 2 
        });
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 z-[300] overflow-y-auto no-print">
            <div className="bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl flex flex-col md:flex-row max-h-[90vh] overflow-hidden animate-in zoom-in">
                <div className="p-10 flex-1 overflow-y-auto custom-scrollbar space-y-10">
                    <div className="flex justify-between items-center">
                        <h3 className="text-3xl font-black text-emerald-950 flex items-center gap-4"><PlusCircle className="text-emerald-600 w-8 h-8"/> {order === 'new' ? 'فاتورة جديدة' : 'تعديل الفاتورة'}</h3>
                        <button onClick={onClose} className="p-4 bg-gray-100 rounded-2xl hover:bg-red-100 hover:text-red-500 transition-all"><X className="w-6 h-6"/></button>
                    </div>
                    
                    <div className="bg-gray-50 p-8 rounded-[2.5rem] space-y-6 border border-gray-100">
                        {(currentUser.role === 'admin' || currentUser.role === 'supervisor') && (
                             <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 mr-2 uppercase tracking-widest">مندوب المبيعات المسؤول</p>
                                <select value={selectedRepId} onChange={e => setSelectedRepId(e.target.value)} className="w-full p-4 bg-white rounded-2xl font-black outline-none border-2 border-transparent focus:border-emerald-500 shadow-sm transition-all">
                                    {salesReps.map(rep => (
                                        <option key={rep.id} value={rep.id}>{rep.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="اسم العميل الرباعي..." className="p-5 bg-white rounded-2xl font-bold shadow-sm outline-none border-2 border-transparent focus:border-emerald-500 transition-all" />
                            <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="رقم الهاتف (للمتابعة)..." className="p-5 bg-white rounded-2xl font-bold shadow-sm outline-none border-2 border-transparent focus:border-emerald-500 transition-all text-left" />
                            <input value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} placeholder="عنوان التوصيل بالتفصيل..." className="col-span-2 p-5 bg-white rounded-2xl font-bold shadow-sm outline-none border-2 border-transparent focus:border-emerald-500 transition-all" />
                            <textarea value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} placeholder="ملاحظات إضافية (اختياري)..." className="col-span-2 p-5 bg-white rounded-2xl font-bold shadow-sm outline-none border-2 border-transparent focus:border-emerald-500 transition-all" rows={2}/>
                        </div>
                    </div>

                    <div className="bg-emerald-50/50 p-8 rounded-[2.5rem] border-2 border-emerald-100 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                            <div className="relative col-span-1 lg:col-span-2">
                                <p className="text-[10px] font-black text-emerald-600 mr-2 mb-1 uppercase">ابحث عن زيت خام</p>
                                <input list="prods" value={itemSearch} onChange={(e) => setItemSearch(e.target.value)} placeholder="مثال: عطر ملكي، مسك..." className="w-full p-4 bg-white rounded-xl outline-none font-bold shadow-sm border-2 border-emerald-100 focus:border-emerald-500 transition-all"/>
                                <datalist id="prods">{products.map(p => <option key={p.id} value={p.name}>{p.grade}</option>)}</datalist>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-emerald-600 mr-2 mb-1 uppercase">الكمية (mg)</p>
                                <input type="number" value={itemQty} onChange={(e) => setItemQty(e.target.value)} placeholder="0" className="w-full p-4 bg-white rounded-xl font-bold outline-none text-left shadow-sm border-2 border-emerald-100 focus:border-emerald-500 transition-all"/>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-emerald-600 mr-2 mb-1 uppercase">السعر</p>
                                <input type="number" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} placeholder="0" className="w-full p-4 bg-white rounded-xl font-bold outline-none text-left shadow-sm border-2 border-emerald-100 focus:border-emerald-500 transition-all"/>
                            </div>
                        </div>
                        <button onClick={() => {
                            const product = products.find(p => p.name === itemSearch);
                            if (!itemSearch || !itemQty || !itemPrice) return;
                            setCart([...cart, { productName: itemSearch, grade: product?.grade || 'تجاري (Code C)', quantity: Number(itemQty), price: Number(itemPrice) }]);
                            setItemSearch(''); setItemQty(''); setItemPrice('');
                        }} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"><Plus className="w-6 h-6"/> إضافة للسلة</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100">
                            <h4 className="text-lg font-black text-amber-900 mb-6 flex justify-between items-center">
                                <span className="flex items-center gap-2"><Percent className="w-5 h-5"/> خصم إضافي</span>
                                <span className="bg-white px-4 py-1 rounded-full border border-amber-200">{discount}%</span>
                            </h4>
                            <input type="range" min="0" max="50" step="0.5" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"/>
                        </div>
                        <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100">
                            <h4 className="text-lg font-black text-blue-900 mb-4">مصاريف الشحن والتوصيل</h4>
                            <input type="number" value={shipping} onChange={(e) => setShipping(Number(e.target.value))} className="w-full p-5 bg-white rounded-2xl font-bold shadow-sm outline-none border-2 border-transparent focus:border-blue-500 text-left transition-all"/>
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-[480px] bg-[#064E3B] p-12 text-white flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <h4 className="text-2xl font-black mb-10 flex items-center gap-4 relative z-10"><ShoppingCart className="text-emerald-400 w-8 h-8"/> مراجعة السلة النهائية</h4>
                    
                    <div className="flex-1 overflow-y-auto space-y-4 mb-8 pr-2 custom-scrollbar-dark relative z-10">
                        {cart.map((item, idx) => (
                            <div key={idx} className="bg-white/10 p-6 rounded-2xl border border-white/5 flex justify-between items-center group hover:bg-white/15 transition-all">
                                <div className="flex-1">
                                    <p className="font-black text-emerald-50 truncate text-base">{item.productName}</p>
                                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">{item.quantity} mg × {formatAmount(item.price)} ج.م</p>
                                </div>
                                <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="text-red-400 p-3 hover:bg-red-500/20 rounded-xl transition-all"><Trash2 className="w-5 h-5"/></button>
                            </div>
                        ))}
                        {cart.length === 0 && <div className="h-full flex flex-col items-center justify-center opacity-20"><ShoppingCart className="w-20 h-20 mb-4"/><p className="font-black">السلة فارغة حالياً</p></div>}
                    </div>
                    
                    <div className="bg-black/20 p-8 rounded-[2.5rem] border border-white/10 mb-8 space-y-4 relative z-10">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-emerald-400 font-black uppercase tracking-widest">صافي المنتجات:</span>
                            <span className="font-black text-white text-lg">{formatAmount(netTotal)} ج.م</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-t border-white/5 pt-4">
                            <span className="text-indigo-400 font-black flex items-center gap-2"><Percent className="w-4 h-4"/> عمولة المندوب ({Math.round(commissionRate * 100)}%):</span>
                            <div className="text-left">
                                <span className="font-black text-indigo-300 text-xl">{formatAmount(estimatedCommission)}</span>
                                <span className="text-[10px] font-bold mr-1">ج.م</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/10 space-y-4 mb-10 relative z-10">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-black text-emerald-100/50 uppercase tracking-widest">الإجمالي النهائي للتحصيل</span>
                            <div className="text-left">
                                <span className="text-5xl font-black text-emerald-400 leading-none">
                                    {formatAmount(netTotal + Number(shipping))}
                                </span>
                                <span className="text-xs font-black block mt-2 opacity-50">جنيهاً مصرياً</span>
                            </div>
                        </div>
                    </div>
                    
                    <button onClick={handleConfirmOrder} className="w-full py-6 bg-emerald-500 text-emerald-950 rounded-[2rem] font-black text-2xl hover:bg-emerald-400 shadow-2xl transition-all shadow-emerald-500/20 flex items-center justify-center gap-4 relative z-10 active:scale-95">
                        <Check className="w-8 h-8"/> تأكيد الفاتورة
                    </button>
                </div>
            </div>
        </div>
    );
}
