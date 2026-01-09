'use client';
import React, { useMemo } from 'react';
import type { Order, SalesRep, User } from '@/lib/types';
import { TrendingUp, Clock, Sparkles, History } from 'lucide-react';

interface DashboardTabProps {
    currentUser: User;
    salesReps: SalesRep[];
    orders: Order[];
}

const DashboardTab: React.FC<DashboardTabProps> = ({ currentUser, salesReps, orders }) => {

    const stats = useMemo(() => {
        const isAdminView = currentUser?.role === 'admin' || currentUser?.role === 'supervisor';
        const currentRep = salesReps.find(r => r.userId === currentUser?.id);
        
        const totalSales = salesReps.reduce((sum, rep) => sum + rep.monthlyHistory.reduce((s, h) => s + h.amount, 0) + rep.totalCommission, 0);

        const pendingOrdersCount = orders.filter(o => o.status === 'قيد التنفيذ').length;

        const totalCommissions = salesReps.reduce((sum, r) => sum + r.totalCommission, 0);
        
        const pendingCommissions = salesReps.reduce((sum, r) => sum + r.pendingCommission, 0);

        // For sales rep view
        const myTotalSales = (currentRep?.monthlyHistory.reduce((s, h) => s + h.amount, 0) || 0) + (currentRep?.totalCommission || 0);
        const myPendingOrders = orders.filter(o => o.salesRepId === currentRep?.id && o.status === 'قيد التنفيذ').length;
        
        if (isAdminView) {
            return { totalSales, pending: pendingOrdersCount, commissions: totalCommissions, pendingComms: pendingCommissions };
        }
        
        return { 
            totalSales: myTotalSales,
            pending: myPendingOrders, 
            commissions: currentRep?.totalCommission || 0,
            pendingComms: currentRep?.pendingCommission || 0
        };
    }, [orders, salesReps, currentUser]);

    return (
        <div className="space-y-10 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 border-r-4 border-emerald-500"><TrendingUp className="text-emerald-600 mb-4" /><p className="text-xs text-gray-400 font-black mb-1 uppercase">إجمالي المبيعات المكتملة</p><p className="text-3xl font-black text-gray-900">{stats.totalSales.toLocaleString()}</p></div>
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 border-r-4 border-amber-500"><Clock className="text-amber-600 mb-4" /><p className="text-xs text-gray-400 font-black mb-1 uppercase">طلبات قيد التجهيز</p><p className="text-3xl font-black text-gray-900">{stats.pending}</p></div>
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 border-r-4 border-indigo-500"><Sparkles className="text-indigo-600 mb-4" /><p className="text-xs text-indigo-400 font-black mb-1 uppercase">عمولات مكتسبة</p><p className="text-3xl font-black text-gray-900">{stats.commissions.toLocaleString()}</p></div>
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 border-r-4 border-amber-400"><History className="text-amber-400 mb-4" /><p className="text-xs text-amber-400 font-black mb-1 uppercase">عمولات معلقة</p><p className="text-3xl font-black text-gray-900">{stats.pendingComms.toLocaleString()}</p></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-white p-10 rounded-[3rem] border border-gray-100">
                    <h3 className="text-xl font-black mb-8 flex items-center gap-3"><div className="w-2 h-8 bg-emerald-600 rounded-full"></div> أحدث الفواتير</h3>
                    <div className="space-y-4">
                        {orders.slice(0, 5).map(o => (
                            <div key={o.id} className="flex justify-between items-center p-5 bg-gray-50 rounded-2xl hover:bg-emerald-50/50 transition-all border border-transparent hover:border-emerald-100">
                                <div><p className="font-black text-emerald-950">{o.customerName}</p><p className="text-[10px] text-gray-400 font-bold tracking-widest">#{o.id.substring(0,6)} • {o.totalAmount.toLocaleString()} ج.م</p></div>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black ${o.status === 'تم التسليم' ? 'bg-green-100 text-green-700' : o.status === 'ملغي' || o.status === 'مرتجع' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{o.status}</span>
                            </div>
                        ))}
                        {orders.length === 0 && <p className="text-center py-10 text-gray-300 font-bold">لا توجد فواتير بعد</p>}
                    </div>
                </div>
                <div className="bg-white p-10 rounded-[3rem] border border-gray-100">
                    <h3 className="text-xl font-black mb-8 flex items-center gap-3"><div className="w-2 h-8 bg-indigo-600 rounded-full"></div> المتصدرون (العمولات)</h3>
                    <div className="space-y-6">
                        {salesReps.sort((a,b) => b.totalCommission - a.totalCommission).slice(0, 5).map(r => (
                            <div key={r.id} className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center font-black text-indigo-600">{r.name[0]}</div>
                                <div className="flex-1">
                                    <p className="text-sm font-black text-gray-800">{r.name}</p>
                                    <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                                        <div className="h-full bg-indigo-500 rounded-full" style={{width: `${Math.min((r.totalCommission / (stats.commissions || 1)) * 100, 100)}%`}}></div>
                                    </div>
                                </div>
                                <span className="text-sm font-black text-emerald-600">{r.totalCommission.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardTab;
