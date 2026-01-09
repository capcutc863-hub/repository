'use client';
import React from 'react';
import type { Product, OilGrade } from '@/lib/types';
import { createClient } from '@/lib/supabase';

interface ProductFormProps {
    product: Product | 'new';
    onClose: () => void;
    onSave: () => void;
}

export function ProductForm({ product, onClose, onSave }: ProductFormProps) {
    const supabase = createClient();
    const isEditing = typeof product === 'object';

    const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const grade = formData.get('grade') as OilGrade;
        const price = parseFloat(formData.get('price') as string);
        const stock = parseInt(formData.get('stock') as string);
        
        const productData = { name, grade, price_per_mg: price, stock };
        
        try {
            let error;
            if (isEditing) {
                const { error: updateError } = await supabase.from('products').update(productData).eq('id', product.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase.from('products').insert(productData);
                error = insertError;
            }

            if (error) throw error;
            
            alert('تم حفظ بيانات المنتج بنجاح ✅');
            onSave();
            onClose();

        } catch (error: any) {
            console.error('Error saving product:', error);
            alert(`فشل حفظ المنتج: ${error.message}`);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[500] p-4">
            <form onSubmit={handleSaveProduct} className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in">
                <h3 className="text-2xl font-black mb-8 text-emerald-950">{product === 'new' ? 'إضافة صنف جديد' : 'تعديل بيانات الصنف'}</h3>
                <div className="space-y-6">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 mr-2 uppercase">اسم المنتج</p>
                        <input name="name" defaultValue={isEditing ? product.name : ''} placeholder="اسم الزيت..." className="w-full p-4 bg-gray-50 rounded-2xl font-black outline-none border-2 border-transparent focus:border-emerald-500" required />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 mr-2 uppercase">درجة الجودة</p>
                        <select name="grade" defaultValue={isEditing ? product.grade : 'عالي (Code A)'} className="w-full p-4 bg-gray-50 rounded-2xl font-black outline-none">
                            <option>عالي (Code A)</option><option>وسط (Code B)</option><option>تجاري (Code C)</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 mr-2 uppercase">السعر لكل ملجم</p>
                            <input name="price" type="number" step="0.01" defaultValue={isEditing ? product.pricePerMg : ''} placeholder="0.00" className="w-full p-4 bg-gray-50 rounded-2xl font-black outline-none" required />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 mr-2 uppercase">المخزون المتوفر</p>
                            <input name="stock" type="number" defaultValue={isEditing ? product.stock : ''} placeholder="0" className="w-full p-4 bg-gray-50 rounded-2xl font-black outline-none" required />
                        </div>
                    </div>
                </div>
                <div className="flex gap-4 mt-10">
                    <button type="submit" className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg">حفظ البيانات</button>
                    <button type="button" onClick={onClose} className="px-6 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black border">إلغاء</button>
                </div>
            </form>
        </div>
    );
}

    