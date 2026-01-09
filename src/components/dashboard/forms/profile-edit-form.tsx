'use client';
import React, { useState } from 'react';
import type { User } from '@/lib/types';
import { UserCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface ProfileEditFormProps {
    user: User;
    onClose: () => void;
    onUpdate: (user: User) => void;
}

export function ProfileEditForm({ user, onClose, onUpdate }: ProfileEditFormProps) {
    const supabase = createClient();
    const [nickname, setNickname] = useState(user.nickname || '');
    const [avatar, setAvatar] = useState(user.avatar || '');

    const handleUpdateProfile = async () => {
        if (!user) return;
        
        const updatedUser = { ...user, nickname, avatar };
        
        const { error } = await supabase
            .from('users')
            .update({ nickname: updatedUser.nickname, avatar_url: updatedUser.avatar })
            .eq('id', user.id);

        if (error) {
            alert(`فشل تحديث الملف الشخصي: ${error.message}`);
        } else {
            onUpdate(updatedUser);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[500] p-4">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in">
                <h3 className="text-2xl font-black mb-8 text-emerald-950">تعديل ملفك الشخصي</h3>
                <div className="space-y-8">
                    <div className="flex flex-col items-center">
                        <div className="w-32 h-32 bg-gray-100 rounded-[2.5rem] mb-4 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
                            {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="Avatar Preview"/> : <UserCircle className="w-16 h-16 text-gray-300" />}
                        </div>
                        <input value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="رابط صورة الملف الشخصي (URL)..." className="w-full p-3 bg-gray-50 rounded-xl text-[10px] text-center outline-none border focus:border-emerald-500" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-400 mr-2 uppercase">اللقب أو الاسم المستعار</p>
                        <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="مثال: الحريف، أبو فلان..." className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-black text-emerald-900 border-2 border-transparent focus:border-emerald-500" />
                    </div>
                </div>
                <div className="flex gap-4 mt-10">
                    <button onClick={handleUpdateProfile} className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-emerald-700 transition-all">حفظ التغييرات</button>
                    <button onClick={onClose} className="px-6 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black border border-transparent hover:border-gray-200">إغلاق</button>
                </div>
            </div>
        </div>
    );
}

    