
'use client';
import React, { useMemo } from 'react';
import type { Order, SalesRep, User } from '@/lib/types';
import { TrendingUp, Clock, Sparkles, History } from 'lucide-react';

interface DashboardTabProps {
    currentUser: User;
    salesReps: SalesRep[];
    orders: Order[];
}

const DashboardTab: React.FC<DashboardTabProps> = ({ currentUser, salesReps = [], orders = [] }) => {

    const stats = useMemo(() => {
        const isAdminView = currentUser?.role === 'admin' || currentUser?.role === 'supervisor';
        const currentRep = salesReps.find(r => r.userId === currentUser?.id);
        
        // Safety check for totals and history
        const totalSales = orders.filter(o => o.status === 'تم التسليم').reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
        const pendingOrdersCount = orders.filter(o => o.status === 'قيد التنفيذ').length;

        const totalCommissions = salesReps.reduce((sum, r) => sum + (Number(r.totalCommission) || 0), 0);
        const pendingCommissions = salesReps.reduce((sum, r) => sum + (Number(r.pendingCommission) || 0), 0);

        // For sales rep view
        const myTotalSales = orders.filter(o => o.salesRepId === currentRep?.id && o.status === 'تم التسليم').reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
        const myPendingOrders = orders.filter(o => o.salesRepId === currentRep?.id && o.status === 'قيد التنفيذ').length;
        
        if (isAdminView) {
            return { totalSales, pending: pendingOrdersCount, commissions: totalCommissions, pendingComms: pendingCommissions };
        }
        
        return { 
            totalSales: myTotalSales,
            pending: myPendingOrders, 
            commissions: Number(currentRep?.totalCommission) || 0,
            pendingComms: Number(currentRep?.pendingCommission) || 0
        };
    }, [orders, salesReps, currentUser]);

    const formatAmount = (val: number) => {
        return val.toLocaleString('en-US', { 
            minimumFractionDigits: 0, 
            maximumFractionDigits: 2 
        });
    };

    return (
        <div className="space-y-10 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 border-r-8 border-emerald-500">
                    <TrendingUp className="text-emerald-600 mb-4 w-6 h-6" />
                    <p className="text-[10px] text-gray-400 font-black mb-1 uppercase tracking-widest">إجمالي المبيعات (تم التسليم)</p>
                    <p className="text-3xl font-black text-gray-900">{formatAmount(stats.totalSales)} <span className="text-xs font-bold text-gray-400">ج.م</span></p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 border-r-8 border-amber-500">
                    <Clock className="text-amber-600 mb-4 w-6 h-6" />
                    <p className="text-[10px] text-gray-400 font-black mb-1 uppercase tracking-widest">طلبات قيد التنفيذ</p>
                    <p className="text-3xl font-black text-gray-900">{stats.pending} <span className="text-xs font-bold text-gray-400">طلب</span></p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 border-r-8 border-indigo-500">
                    <Sparkles className="text-indigo-600 mb-4 w-6 h-6" />
                    <p className="text-[10px] text-indigo-400 font-black mb-1 uppercase tracking-widest">عمولات مكتسبة</p>
                    <p className="text-3xl font-black text-indigo-700">{formatAmount(stats.commissions)} <span className="text-xs font-bold text-indigo-400">ج.م</span></p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 border-r-8 border-amber-400">
                    <History className="text-amber-400 mb-4 w-6 h-6" />
                    <p className="text-[10px] text-amber-400 font-black mb-1 uppercase tracking-widest">عمولات معلقة</p>
                    <p className="text-3xl font-black text-amber-700">{formatAmount(stats.pendingComms)} <span className="text-xs font-bold text-amber-300">ج.م</span></p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-black mb-8 flex items-center gap-4"><div className="w-2.5 h-10 bg-emerald-600 rounded-full"></div> أحدث الفواتير</h3>
                    <div className="space-y-4">
                        {(orders || []).slice(0, 5).map(o => (
                            <div key={o.id} className="flex justify-between items-center p-6 bg-gray-50 rounded-3xl hover:bg-emerald-50/50 transition-all border-2 border-transparent hover:border-emerald-100 group">
                                <div>
                                    <p className="font-black text-emerald-950 group-hover:text-emerald-700 transition-colors">{o.customerName || 'عميل مجهول'}</p>
                                    <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">#{o.id.toString().substring(0,6)} • {formatAmount(Number(o.totalAmount))} ج.م</p>
                                </div>
                                <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-tighter ${o.status === 'تم التسليم' ? 'bg-green-100 text-green-700 shadow-sm' : o.status === 'ملغي' || o.status === 'مرتجع' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700 shadow-sm'}`}>{o.status}</span>
                            </div>
                        ))}
                        {(!orders || orders.length === 0) && <p className="text-center py-12 text-gray-300 font-bold italic">لا توجد فواتير مسجلة في المخزن حالياً</p>}
                    </div>
                </div>
                
                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-black mb-8 flex items-center gap-4"><div className="w-2.5 h-10 bg-indigo-600 rounded-full"></div> المتصدرون (العمولات المكتسبة)</h3>
                    <div className="space-y-8">
                        {[...(salesReps || [])].sort((a,b) => (b.totalCommission || 0) - (a.totalCommission || 0)).slice(0, 5).map((r, idx) => (
                            <div key={r.id} className="flex items-center gap-5">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm ${idx === 0 ? 'bg-amber-100 text-amber-700 border-2 border-amber-200' : 'bg-indigo-50 text-indigo-600'}`}>
                                    {idx === 0 ? '🏆' : (r.name || 'U')[0]}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-end mb-2">
                                        <p className="text-sm font-black text-gray-800">{r.name}</p>
                                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{formatAmount(r.totalCommission)} <span className="text-[10px]">ج.م</span></span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{width: `${Math.min(((r.totalCommission || 0) / (stats.commissions || 1)) * 100, 100)}%`}}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(!salesReps || salesReps.length === 0) && <p className="text-center py-12 text-gray-300 font-bold italic">لا يوجد مناديب مسجلين بعد</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardTab;
