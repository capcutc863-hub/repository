
'use client';
import React from 'react';
import type { SalesRep } from '@/lib/types';
import { RefreshCcw, Zap, History, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface PerformanceTabProps {
    salesReps: SalesRep[];
    refreshData: () => void;
}

const PerformanceTab: React.FC<PerformanceTabProps> = ({ salesReps = [], refreshData }) => {
    const supabase = createClient();

    const formatAmount = (val: number) => {
        return val.toLocaleString('en-US', { 
            minimumFractionDigits: 0, 
            maximumFractionDigits: 2 
        });
    };
    
    const handleSalesRepUpdate = async (repId: string, field: 'maxDiscountAllowed' | 'customCommissionRate', value: any) => {
        let updateValue = field === 'customCommissionRate' ? parseFloat(value) / 100 : Number(value);
        if (isNaN(updateValue)) return;
        
        const dbField = field === 'maxDiscountAllowed' ? { max_discount_allowed: updateValue } : { custom_commission_rate: updateValue };
        
        const { error } = await supabase.from('sales_reps').update(dbField).eq('id', repId);
        if (error) {
            alert(`فشل تحديث بيانات المندوب: ${error.message}`);
        } else {
            alert('تم تحديث بيانات المندوب بنجاح');
            refreshData();
        }
    };

    const resetMonth = (repId?: string) => {
        const label = repId ? 'لهذا المندوب' : 'للجميع';
        if (!window.confirm(`تنبيه هام: هل أنت متأكد من أرشفة وتصفير الشهر ${label}؟ سيتم نقل العمولات المكتسبة للسجل وتصفير العدادات.`)) return;
        alert('هذه الميزة تتطلب تنفيذها كدالة بقاعدة البيانات (Stored Procedure) لضمان أمان العمليات المالية.');
    };

    const instantResetCommissions = async (repId: string) => {
        if (!window.confirm('هل أنت متأكد من تصفير العمولات المكتسبة والمعلقة لهذا المندوب فوراً؟')) return;
        const { error } = await supabase.from('sales_reps').update({ total_commission: 0, pending_commission: 0 }).eq('id', repId);

        if (error) {
            alert(`فشل تصفير العمولات: ${error.message}`);
        } else {
            alert('تم تصفير العمولات لهذا المندوب فوراً ✅');
            refreshData();
        }
    };

    if (!salesReps || salesReps.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-gray-100">
                <p className="text-gray-400 font-bold">لا يوجد مناديب مبيعات مسجلين حالياً لعرض أدائهم.</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in">
            <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h3 className="text-xl font-black text-gray-900">تصفير الشهور والأداء المالي</h3>
                <button onClick={() => resetMonth()} className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-red-700 transition-all shadow-red-200"><RefreshCcw className="w-5 h-5"/> أرشفة وتصفير الكل</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {salesReps.map(rep => (
                    <div key={rep.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 relative shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h5 className="font-black text-xl text-emerald-950">{rep.name || 'مستخدم مجهول'}</h5>
                                <div className="flex gap-0.5 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-3 h-3 ${i < 4 ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => instantResetCommissions(rep.id)} 
                                    className="p-3 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm" 
                                    title="تصفير فوري"
                                >
                                    <Zap className="w-4 h-4"/>
                                </button>
                                <button onClick={() => resetMonth(rep.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm" title="أرشفة وتصفير"><RefreshCcw className="w-4 h-4"/></button>
                            </div>
                        </div>
                        
                        <div className="space-y-4 mb-8 pt-4 border-t">
                            <div className="flex items-center gap-4">
                                <label className="text-[10px] font-black text-gray-500 uppercase whitespace-nowrap">نسبة الخصم القصوى (%):</label>
                                <input 
                                    type="number" 
                                    defaultValue={rep.maxDiscountAllowed || 0}
                                    onBlur={(e) => handleSalesRepUpdate(rep.id, 'maxDiscountAllowed', e.target.value)}
                                    className="w-full p-2 bg-gray-50 rounded-lg font-black text-emerald-900 text-sm outline-none border focus:border-emerald-500"
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="text-[10px] font-black text-gray-500 uppercase whitespace-nowrap">نسبة العمولة الافتراضية (%):</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    defaultValue={(rep.customCommissionRate || 0) * 100}
                                    onBlur={(e) => handleSalesRepUpdate(rep.id, 'customCommissionRate', e.target.value)}
                                    className="w-full p-2 bg-gray-50 rounded-lg font-black text-emerald-900 text-sm outline-none border focus:border-emerald-500"
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                <p className="text-[10px] text-indigo-400 font-black uppercase mb-1">مكتسبة (تم التسليم)</p>
                                <p className="text-xl font-black text-indigo-700">{formatAmount(rep.totalCommission)} <span className="text-xs">ج.م</span></p>
                            </div>
                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                <p className="text-[10px] text-amber-400 font-black uppercase mb-1">معلقة (قيد التنفيذ)</p>
                                <p className="text-xl font-black text-amber-700">{formatAmount(rep.pendingCommission)} <span className="text-xs">ج.م</span></p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><History className="w-3 h-3"/> سجل العمولات السابقة</p>
                            <div className="max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                {rep.monthlyHistory && rep.monthlyHistory.length > 0 ? rep.monthlyHistory.map((h, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl mb-2 border border-gray-100">
                                        <span className="text-xs font-bold text-gray-600">{h.month}</span>
                                        <span className="text-xs font-black text-emerald-600">{formatAmount(h.amount)} ج.م</span>
                                    </div>
                                )) : <p className="text-[10px] text-center text-gray-300 py-4">لا يوجد سجل تاريخي بعد</p>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PerformanceTab;
