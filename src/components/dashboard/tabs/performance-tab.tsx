
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
        return (val / 100).toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
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

    return (
        <div className="space-y-10 animate-in fade-in">
            <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h3 className="text-xl font-black text-gray-900">الأداء المالي</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {salesReps.map(rep => (
                    <div key={rep.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 relative shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h5 className="font-black text-xl text-emerald-950">{rep.name || 'مستخدم مجهول'}</h5>
                            </div>
                            <button 
                                onClick={() => instantResetCommissions(rep.id)} 
                                className="p-3 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm" 
                                title="تصفير فوري"
                            >
                                <Zap className="w-4 h-4"/>
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-8 pt-4 border-t">
                            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                <p className="text-[10px] text-indigo-400 font-black uppercase mb-1">مكتسبة (تم التسليم)</p>
                                <p className="text-xl font-black text-indigo-700">{formatAmount(rep.totalCommission)} <span className="text-xs">ج.م</span></p>
                            </div>
                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                <p className="text-[10px] text-amber-400 font-black uppercase mb-1">معلقة (قيد التنفيذ)</p>
                                <p className="text-xl font-black text-amber-700">{formatAmount(rep.pendingCommission)} <span className="text-xs">ج.م</span></p>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <label className="text-[10px] font-black text-gray-500 uppercase">نسبة الخصم (%):</label>
                                <input type="number" defaultValue={rep.maxDiscountAllowed || 0} onBlur={(e) => handleSalesRepUpdate(rep.id, 'maxDiscountAllowed', e.target.value)} className="w-full p-2 bg-gray-50 rounded-lg font-black text-sm outline-none border focus:border-emerald-500" />
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="text-[10px] font-black text-gray-500 uppercase">نسبة العمولة (%):</label>
                                <input type="number" step="0.01" defaultValue={(rep.customCommissionRate || 0) * 100} onBlur={(e) => handleSalesRepUpdate(rep.id, 'customCommissionRate', e.target.value)} className="w-full p-2 bg-gray-50 rounded-lg font-black text-sm outline-none border focus:border-emerald-500" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PerformanceTab;
