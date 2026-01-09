'use client';
import React from 'react';
import type { UserRole } from '@/lib/types';
import { createClient } from '@/lib/supabase';

interface AddUserFormProps {
    onClose: () => void;
    onAddUser: () => void;
}

export function AddUserForm({ onClose, onAddUser }: AddUserFormProps) {
    const supabase = createClient();

    const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const username = formData.get('username') as string;
        const role = formData.get('role') as UserRole;
    
        if (!name || !username) {
            alert('الرجاء إدخال الاسم واسم المستخدم.');
            return;
        }

        try {
            const { data: userData, error: userError } = await supabase
                .from('users')
                .insert({
                    name,
                    username: username.toLowerCase(),
                    role,
                    nickname: name,
                    is_suspended: false,
                    can_edit_inventory: false,
                    can_confirm_delivery: false,
                    online: false,
                    start_date: new Date().toISOString(),
                })
                .select()
                .single();

            if (userError) throw userError;

            if (userData && role === 'sales') {
                const { error: repError } = await supabase.from('sales_reps').insert({
                    user_id: userData.id,
                    name: userData.name,
                    // Default values
                    total_commission: 0,
                    pending_commission: 0,
                    orders_count: 0,
                    max_discount_allowed: 5,
                    custom_commission_rate: 0.05,
                    monthly_history: [],
                });

                if (repError) {
                    await supabase.from('users').delete().eq('id', userData.id);
                    throw repError;
                }
            }
            
            alert('تمت إضافة المستخدم بنجاح ✅');
            onAddUser();
            onClose();

        } catch (error: any) {
            console.error('Error adding user:', error);
            alert(`حدث خطأ أثناء إضافة المستخدم: ${error.message}`);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[500] p-4">
            <form onSubmit={handleAddUser} className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in">
                <h3 className="text-2xl font-black mb-8 text-emerald-950">إضافة مستخدم جديد</h3>
                <div className="space-y-6">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 mr-2 uppercase">الاسم الكامل</p>
                        <input name="name" placeholder="مثال: محمد عبدالله" className="w-full p-4 bg-gray-50 rounded-2xl font-black outline-none border-2 border-transparent focus:border-emerald-500" required />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 mr-2 uppercase">اسم المستخدم (للدخول)</p>
                        <input name="username" placeholder="مثال: mohamed" className="w-full p-4 bg-gray-50 rounded-2xl font-black outline-none border-2 border-transparent focus:border-emerald-500" required />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 mr-2 uppercase">الرتبة</p>
                        <select name="role" defaultValue="sales" className="w-full p-4 bg-gray-50 rounded-2xl font-black outline-none">
                            <option value="sales">مندوب مبيعات</option>
                            <option value="supervisor">مشرف نظام</option>
                            <option value="admin">مدير عام</option>
                        </select>
                    </div>
                </div>
                <div className="flex gap-4 mt-10">
                    <button type="submit" className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg">إضافة المستخدم</button>
                    <button type="button" onClick={onClose} className="px-6 py-4 bg-gray-100 text-gray-400 rounded-xl font-black border">إلغاء</button>
                </div>
            </form>
        </div>
    );
}
