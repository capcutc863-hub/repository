'use client';
import React from 'react';
import type { User, UserRole } from '@/lib/types';
import { ShieldAlert, Trash2, UserPlus, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface AdminUsersTabProps {
    currentUser: User;
    users: User[];
    refreshData: () => void;
    onAddUser: () => void;
}

const RoleStars = ({ role }: { role: User['role'] }) => {
    const count = role === 'admin' ? 5 : role === 'supervisor' ? 4 : 1;
    return (
        <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${i < count ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
            ))}
        </div>
    );
};


const AdminUsersTab: React.FC<AdminUsersTabProps> = ({ currentUser, users, refreshData, onAddUser }) => {
    const supabase = createClient();
    
    const updateUserField = async (userId: string, field: Partial<User>) => {
         const dbField: any = {};
         if ('canEditInventory' in field) dbField.can_edit_inventory = field.canEditInventory;
         if ('canConfirmDelivery' in field) dbField.can_confirm_delivery = field.canConfirmDelivery;
         if ('role' in field) dbField.role = field.role;
         if ('isSuspended' in field) dbField.is_suspended = field.isSuspended;

        const { error } = await supabase.from('users').update(dbField).eq('id', userId);
        if (error) {
            alert(`فشل تحديث المستخدم: ${error.message}`);
        } else {
            alert('تم تحديث المستخدم بنجاح ✅');
            refreshData();
        }
    };
    
    const handleDeleteUser = async (userId: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذا المستخدم نهائياً؟ هذا الإجراء سيحذف أيضاً مندوب المبيعات المرتبط به.')) {
            // In a real app, you'd want to handle this with more care, maybe a DB function.
            // First delete the sales_rep if one exists.
            const { error: repError } = await supabase.from('sales_reps').delete().eq('user_id', userId);
            if (repError) {
                 alert(`فشل حذف المندوب المرتبط: ${repError.message}`);
                 return; // Stop if we can't delete the dependant
            }
            
            const { error: userError } = await supabase.from('users').delete().eq('id', userId);
            if (userError) {
                alert(`فشل حذف المستخدم: ${userError.message}`);
            } else {
                alert('تم حذف المستخدم بنجاح.');
                refreshData();
            }
        }
    }

    return (
        <div className="space-y-10 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-gray-900">إدارة الفريق والصلاحيات</h3>
                {currentUser.role === 'admin' && (
                    <button onClick={onAddUser} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl hover:bg-indigo-700 transition-all"><UserPlus className="w-5 h-5"/> مستخدم جديد</button>
                )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {users.map(u => (
                    <div key={u.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 flex flex-col sm:flex-row gap-6 items-start relative overflow-hidden group">
                        <div className="w-24 h-24 bg-emerald-600 text-white rounded-3xl flex items-center justify-center text-4xl font-black shadow-xl shrink-0 overflow-hidden">
                            {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" alt="User Avatar" /> : u.name[0]}
                        </div>
                        <div className="flex-1 space-y-4 w-full">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h4 className="text-xl font-black text-emerald-950 flex items-center gap-2">{u.name} <RoleStars role={u.role} /></h4>
                                    <p className="text-xs text-emerald-600 font-bold tracking-widest">@{u.username} • {u.online ? 'متصل' : 'أوفلاين'}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => updateUserField(u.id, { isSuspended: !u.isSuspended })} className={`p-2 rounded-xl transition-all ${u.isSuspended ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-red-50'}`} title="تعليق الحساب"><ShieldAlert className="w-4 h-4"/></button>
                                    {currentUser.role === 'admin' && u.id !== currentUser.id && (
                                        <button onClick={() => handleDeleteUser(u.id)} className="p-2 bg-gray-100 text-gray-400 hover:bg-red-600 hover:text-white rounded-xl transition-all"><Trash2 className="w-4 h-4"/></button>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-4 pt-4 border-t border-gray-50">
                                <div className="flex flex-wrap gap-3">
                                    <button 
                                        onClick={() => updateUserField(u.id, { canEditInventory: !u.canEditInventory })}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all ${u.canEditInventory ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-400 border-gray-200'}`}
                                        >
                                        تعديل المخزن
                                    </button>
                                    <button 
                                        onClick={() => updateUserField(u.id, { canConfirmDelivery: !u.canConfirmDelivery })}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all ${u.canConfirmDelivery ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-400 border-gray-200'}`}
                                        >
                                        تأكيد التسليم
                                    </button>
                                </div>
                                {currentUser.role === 'admin' && u.id !== currentUser.id && (
                                    <div className="flex items-center gap-2">
                                        <p className="text-[10px] font-black text-gray-400 uppercase">تغيير الرتبة:</p>
                                        <select 
                                            value={u.role}
                                            onChange={(e) => updateUserField(u.id, { role: e.target.value as UserRole })}
                                            className="bg-gray-50 p-2 rounded-lg text-xs font-black text-emerald-900 outline-none border border-gray-100"
                                            >
                                            <option value="sales">مندوب مبيعات</option>
                                            <option value="supervisor">مشرف نظام</option>
                                            <option value="admin">مدير عام</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminUsersTab;

    