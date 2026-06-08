
'use client';
import React, { useMemo, useState } from 'react';
import type { Product, User } from '@/lib/types';
import { Search, Plus, Edit3 } from 'lucide-react';

interface InventoryTabProps {
    currentUser: User;
    products: Product[];
    onEditProduct: (product: Product) => void;
    onAddNewProduct: () => void;
    refreshData: () => void;
}

const InventoryTab: React.FC<InventoryTabProps> = ({ currentUser, products, onEditProduct, onAddNewProduct, refreshData }) => {
    const [search, setSearch] = useState('');

    const filteredProducts = useMemo(() => {
        if (!search) return products;
        return products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }, [products, search]);

    const formatAmount = (val: number) => {
        return (val / 100).toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
    };

    return (
        <div className="space-y-10 animate-in fade-in">
            <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-gray-100">
                <div className="flex-1 relative max-w-xl">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="البحث في الأصناف..." className="w-full pr-12 p-4 bg-gray-50 rounded-2xl font-bold outline-none border focus:border-emerald-500" />
                </div>
                {currentUser.canEditInventory && (
                    <button onClick={onAddNewProduct} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-indigo-700 transition-all"><Plus className="w-5 h-5"/> إضافة صنف جديد</button>
                )}
            </div>
            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-right">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-8 text-xs font-black text-gray-400 uppercase">الصنف</th>
                            <th className="p-8 text-xs font-black text-gray-400 uppercase">الدرجة</th>
                            <th className="p-8 text-xs font-black text-gray-400 uppercase text-center">السعر / ملجم</th>
                            <th className="p-8 text-xs font-black text-gray-400 uppercase text-center">المخزون الحالي</th>
                            {currentUser.canEditInventory && <th className="p-8 text-xs font-black text-gray-400 uppercase">الإجراء</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredProducts.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50/50 transition-all group">
                                <td className="p-8">
                                    <p className="font-black text-emerald-950">{p.name}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">STOCK_ID: {p.id}</p>
                                </td>
                                <td className="p-8 font-bold text-emerald-600">{p.grade}</td>
                                <td className="p-8 text-center font-black text-emerald-900">{formatAmount(p.pricePerMg)} ج.م</td>
                                <td className="p-8 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className={`font-black ${p.stock < 1000 ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>{p.stock.toLocaleString()} mg</span>
                                        {p.stock < 1000 && <span className="text-[8px] font-black text-red-400 uppercase tracking-widest mt-1">مخزون حرج!</span>}
                                    </div>
                                </td>
                                {currentUser.canEditInventory && (
                                    <td className="p-8">
                                        <button onClick={() => onEditProduct(p)} className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"><Edit3 className="w-5 h-5"/></button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InventoryTab;
