'use client';
import React, { useState } from 'react';
import type { Order, OrderItem, Product, User, SalesRep } from '@/lib/types';
import { X, PlusCircle, ShoppingCart, Plus, Trash2, Check } from 'lucide-react';

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
    
    const handleConfirmOrder = () => {
        if (!customerName || cart.length === 0 || !currentUser) {
            alert('الرجاء إدخال اسم العميل وإضافة أصناف للسلة.');
            return;
        }
    
        const subtotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
        
        const effectiveRepId = (currentUser.role !== 'sales' ? selectedRepId : currentRep?.id);
        const effectiveRep = salesReps.find(r => r.id === effectiveRepId);
        
        if (!effectiveRepId || !effectiveRep) {
            alert('لا يمكن إنشاء فاتورة بدون مندوب محدد.');
            return;
        }
        
        const maxDiscount = effectiveRep.maxDiscountAllowed || 0;
    
        if (discount > maxDiscount) {
            alert(`لا يمكنك تجاوز نسبة الخصم المسموح بها للمندوب (${maxDiscount}%).`);
            return;
        }
    
        const discountAmount = (subtotal * discount) / 100;
        const totalAmount = subtotal - discountAmount + Number(shipping);
        
        // SAFE COMMISSION CALCULATION
        const commissionRate = effectiveRep.customCommissionRate || 0.05; // Default to 5% if not set
        const commission = (subtotal - discountAmount) * commissionRate;
        
        const orderData: Omit<Order, 'id' | 'createdAt' | 'salesRepName'> = {
            customerName, customerPhone, customerAddress, customerNotes,
            items: [...cart],
            subtotal,
            discountPercentage: discount,
            discountAmount,
            shippingCost: Number(shipping),
            totalAmount,
            status: isEditing ? (order as Order).status : 'قيد التنفيذ',
            commission,
            salesRepId: effectiveRepId,
        };
        
        onSave(orderData, isEditing ? (order as Order).id : undefined);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 z-[300] overflow-y-auto no-print">
            <div className="bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl flex flex-col md:flex-row max-h-[90vh] overflow-hidden animate-in zoom-in">
                <div className="p-10 flex-1 overflow-y-auto custom-scrollbar space-y-10">
                    <div className="flex justify-between items-center">
                        <h3 className="text-3xl font-black text-emerald-950 flex items-center gap-4"><PlusCircle className="text-emerald-600"/> {order === 'new' ? 'فاتورة جديدة' : 'تعديل الفاتورة'}</h3>
                        <button onClick={onClose} className="p-3 bg-gray-100 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"><X/></button>
                    </div>
                    <div className="bg-gray-50 p-8 rounded-[2.5rem] space-y-6">
                        {(currentUser.role === 'admin' || currentUser.role === 'supervisor') && (
                             <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 mr-2 uppercase">مندوب المبيعات</p>
                                <select value={selectedRepId} onChange={e => setSelectedRepId(e.target.value)} className="w-full p-4 bg-white rounded-2xl font-black outline-none border focus:border-emerald-500">
                                    {salesReps.map(rep => (
                                        <option key={rep.id} value={rep.id}>{rep.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="اسم العميل..." className="p-5 bg-white rounded-2xl font-bold shadow-sm outline-none border focus:border-emerald-500" />
                            <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="رقم الهاتف..." className="p-5 bg-white rounded-2xl font-bold shadow-sm outline-none border focus:border-emerald-500 text-left" />
                            <input value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} placeholder="عنوان التوصيل..." className="col-span-2 p-5 bg-white rounded-2xl font-bold shadow-sm outline-none border focus:border-emerald-500" />
                            <textarea value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} placeholder="ملاحظات..." className="col-span-2 p-5 bg-white rounded-2xl font-bold shadow-sm outline-none border focus:border-emerald-500" rows={2}/>
                        </div>
                    </div>
                    <div className="bg-emerald-50/50 p-8 rounded-[2.5rem] border border-emerald-100 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                            <div className="relative col-span-1 lg:col-span-2">
                                <input list="prods" value={itemSearch} onChange={(e) => setItemSearch(e.target.value)} placeholder="ابحث عن صنف..." className="w-full p-4 bg-white rounded-xl outline-none font-bold shadow-sm border"/>
                                <datalist id="prods">{products.map(p => <option key={p.id} value={p.name}>{p.grade}</option>)}</datalist>
                            </div>
                            <input type="number" value={itemQty} onChange={(e) => setItemQty(e.target.value)} placeholder="الكمية" className="w-full p-4 bg-white rounded-xl font-bold outline-none text-left shadow-sm border"/>
                            <input type="number" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} placeholder="السعر" className="w-full p-4 bg-white rounded-xl font-bold outline-none text-left shadow-sm border"/>
                        </div>
                        <button onClick={() => {
                            const product = products.find(p => p.name === itemSearch);
                            if (!itemSearch || !itemQty || !itemPrice) return;
                            setCart([...cart, { productName: itemSearch, grade: product?.grade || 'تجاري (Code C)', quantity: Number(itemQty), price: Number(itemPrice) }]);
                            setItemSearch(''); setItemQty(''); setItemPrice('');
                        }} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"><Plus className="w-5 h-5"/> إضافة الصنف</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-amber-50 p-8 rounded-[2.5rem]">
                            <h4 className="text-lg font-black text-amber-900 mb-6 flex justify-between"><span>الخصم</span><span>{discount}%</span></h4>
                            <input type="range" min="0" max="50" step="0.5" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-full accent-amber-600"/>
                        </div>
                        <div className="bg-blue-50 p-8 rounded-[2.5rem]">
                            <h4 className="text-lg font-black text-blue-900 mb-4">الشحن</h4>
                            <input type="number" value={shipping} onChange={(e) => setShipping(Number(e.target.value))} className="w-full p-5 bg-white rounded-2xl font-bold shadow-sm outline-none border focus:border-blue-500 text-left"/>
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-[450px] bg-[#064E3B] p-12 text-white flex flex-col">
                    <h4 className="text-2xl font-black mb-10 flex items-center gap-3"><ShoppingCart className="text-emerald-400"/> مراجعة السلة</h4>
                    <div className="flex-1 overflow-y-auto space-y-4 mb-10 pr-2 custom-scrollbar-dark">
                        {cart.map((item, idx) => (
                            <div key={idx} className="bg-white/10 p-5 rounded-2xl border border-white/5 flex justify-between items-center group">
                                <div className="flex-1">
                                    <p className="font-black text-emerald-50 truncate">{item.productName}</p>
                                    <p className="text-[10px] text-emerald-400 font-bold uppercase">{item.quantity} mg × {item.price} ج.م</p>
                                </div>
                                <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="text-red-400 p-2 hover:bg-red-500/20 rounded-lg transition-all"><Trash2 className="w-4 h-4"/></button>
                            </div>
                        ))}
                    </div>
                    <div className="pt-8 border-t border-white/10 space-y-4 mb-10">
                        <div className="flex justify-between items-center">
                            <span className="text-xl font-black text-emerald-100/50 uppercase">الإجمالي النهائي</span>
                            <span className="text-4xl font-black text-emerald-400">
                                {(cart.reduce((s, i) => s + (i.price * i.quantity), 0) * (1 - (discount / 100)) + Number(shipping)).toLocaleString()}
                            </span>
                        </div>
                    </div>
                    <button onClick={handleConfirmOrder} className="w-full py-5 bg-emerald-500 text-emerald-950 rounded-[1.5rem] font-black text-xl hover:bg-emerald-400 shadow-2xl transition-all shadow-emerald-500/20 flex items-center justify-center gap-3"><Check className="w-6 h-6"/> تأكيد وحفظ الفاتورة</button>
                </div>
            </div>
        </div>
    );
}


    

    