'use client';
import React, { useState, useMemo } from 'react';
import type { Customer, User } from '@/lib/types';
import { Search, Download } from 'lucide-react';

interface CustomersTabProps {
    currentUser: User;
    customers: Customer[];
}

const CustomersTab: React.FC<CustomersTabProps> = ({ currentUser, customers }) => {
    const [customerSearch, setCustomerSearch] = useState('');

    const filteredCustomers = useMemo(() => {
        if (!customerSearch) return customers;
        return customers.filter(c =>
            c.name.includes(customerSearch) || c.phone.includes(customerSearch)
        );
    }, [customers, customerSearch]);

    const handleExport = () => {
        const headers = ['الاسم', 'الهاتف', 'العنوان', 'إجمالي المسحوبات', 'التصنيف', 'آخر طلب'];
        const rows = customers.map(c => [
            c.name,
            c.phone,
            c.address || '',
            c.totalSpent,
            c.classification,
            new Date(c.lastOrderDate).toLocaleDateString('ar-EG')
        ]);
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
            + [headers.join(','), ...rows.map(e => e.join(","))].join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "customers_list.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-10 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-8 rounded-[2.5rem] border border-gray-100">
                <div className="flex-1 relative w-full">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                    <input value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} placeholder="بحث باسم العميل أو رقم الهاتف..." className="w-full pr-12 p-4 bg-gray-50 rounded-2xl font-bold outline-none border focus:border-emerald-500" />
                </div>
                {currentUser.role === 'admin' && (
                    <button onClick={handleExport} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-indigo-700 transition-all"><Download className="w-5 h-5"/> تصدير القائمة</button>
                )}
            </div>
            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-right">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-8 text-xs font-black text-gray-400 uppercase">العميل</th>
                            <th className="p-8 text-xs font-black text-gray-400 uppercase">الهاتف</th>
                            <th className="p-8 text-xs font-black text-gray-400 uppercase text-center">التصنيف</th>
                            <th className="p-8 text-xs font-black text-gray-400 uppercase text-center">إجمالي المسحوبات</th>
                            <th className="p-8 text-xs font-black text-gray-400 uppercase text-center">آخر تفاعل</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredCustomers.map(c => (
                            <tr key={c.id} className="hover:bg-gray-50 transition-all">
                                <td className="p-8 font-black text-emerald-950">{c.name}</td>
                                <td className="p-8 font-bold text-gray-500">{c.phone}</td>
                                <td className="p-8 text-center">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black ${c.classification === 'ذهبي' ? 'bg-amber-100 text-amber-700' : c.classification === 'فضي' ? 'bg-gray-200 text-gray-700' : 'bg-blue-50 text-blue-600'}`}>{c.classification}</span>
                                </td>
                                <td className="p-8 text-center font-black text-emerald-900">{c.totalSpent.toLocaleString()} ج.م</td>
                                <td className="p-8 text-center text-[10px] font-bold text-gray-400">{new Date(c.lastOrderDate).toLocaleDateString('ar-EG')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomersTab;
