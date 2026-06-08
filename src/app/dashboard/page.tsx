
'use client';
import React, { useState, useEffect } from 'react';
import {
  Package, ChevronRight, AlertTriangle
} from 'lucide-react';
import type { User, SalesRep, Product, Order, Customer } from '@/lib/types';
import Dashboard from '@/components/dashboard/dashboard';
import { createClient } from '@/lib/supabase';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const LoginPage: React.FC = () => {
    const supabase = createClient();
    const [loginUsername, setLoginUsername] = useState('');
    const [authLoading, setAuthLoading] = useState(false);
    const [dbError, setDbError] = useState<string | null>(null);
    
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [initialLoading, setInitialLoading] = useState(false);

    // التحقق من حالة الاتصال بالمخزن الجديد
    useEffect(() => {
        const checkConnection = async () => {
            try {
                const { error } = await supabase.from('users').select('id').limit(1);
                if (error) setDbError("تنبيه: فشل الاتصال بالمخزن الجديد.");
            } catch (err) {
                setDbError("خطأ في الشبكة أو الاتصال.");
            }
        };
        checkConnection();
    }, [supabase]);

    const fetchData = async (isInitial = false) => {
        // نضع شاشة التحميل فقط في المرة الأولى تماماً
        if (isInitial && orders.length === 0) setInitialLoading(true);
        
        try {
            const [
                { data: usersData },
                { data: salesRepsData },
                { data: productsData },
                { data: ordersData },
                { data: customersData }
            ] = await Promise.all([
                supabase.from('users').select('*'),
                supabase.from('sales_reps').select('*'),
                supabase.from('products').select('*'),
                supabase.from('orders').select('*').order('created_at', { ascending: false }),
                supabase.from('customers').select('*')
            ]);

            setUsers((usersData || []).map(dbUser => ({
                id: dbUser.id,
                name: dbUser.name,
                nickname: dbUser.nickname,
                avatar: dbUser.avatar_url,
                username: dbUser.username,
                role: dbUser.role,
                isSuspended: dbUser.is_suspended,
                isMuted: dbUser.is_muted ?? false,
                canEditInventory: dbUser.can_edit_inventory,
                canConfirmDelivery: dbUser.can_confirm_delivery,
                online: dbUser.online,
                salesRepId: dbUser.sales_rep_id,
                startDate: dbUser.start_date,
                address: dbUser.address,
            })));
            
            setSalesReps((salesRepsData || []).map(rep => ({ 
                ...rep, 
                userId: rep.user_id, 
                maxDiscountAllowed: rep.max_discount_allowed, 
                customCommissionRate: rep.custom_commission_rate, 
                totalCommission: Number(rep.total_commission || 0), 
                pendingCommission: Number(rep.pending_commission || 0), 
                ordersCount: Number(rep.orders_count || 0), 
                monthlyHistory: rep.monthly_history || [] 
            })));
            
            setProducts((productsData || []).map(p => ({
                ...p, 
                pricePerMg: Number(p.price_per_mg || 0),
                stock: Number(p.stock || 0)
            })));
            
            setOrders((ordersData || []).map(o => ({
                ...o,
                id: o.id.toString(),
                createdAt: new Date(o.created_at),
                salesRepId: o.sales_rep_id,
                salesRepName: o.sales_rep_name,
                customerName: o.customer_name,
                customerPhone: o.customer_phone,
                customerAddress: o.customer_address,
                customerNotes: o.customer_notes,
                discountPercentage: Number(o.discount_percentage || 0),
                discountAmount: Number(o.discount_amount || 0),
                shippingCost: Number(o.shipping_cost || 0),
                totalAmount: Number(o.total_amount || 0),
                subtotal: Number(o.subtotal || 0),
                commission: Number(o.commission || 0),
            })));
            
            setCustomers((customersData || []).map(c => ({
                ...c, 
                id: c.id.toString(), 
                totalSpent: Number(c.total_spent || 0), 
                lastOrderDate: c.last_order_date
            })));
            
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setInitialLoading(false);
        }
    };
    
    useEffect(() => {
        if (currentUser) {
            fetchData(true);
        }
    }, [currentUser]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const usernameInput = loginUsername.trim().toLowerCase();
        if (!usernameInput) return;
        setAuthLoading(true);
        
        try {
            const { data: dbUser, error } = await supabase
                .from('users')
                .select('*')
                .eq('username', usernameInput)
                .maybeSingle();

            if (dbUser) {
                if (dbUser.is_suspended) { 
                    alert('هذا الحساب معلق حالياً.');
                } else {
                    await supabase.from('users').update({ online: true }).eq('id', dbUser.id);
                    setCurrentUser({
                        id: dbUser.id,
                        name: dbUser.name,
                        nickname: dbUser.nickname,
                        avatar: dbUser.avatar_url,
                        username: dbUser.username,
                        role: dbUser.role,
                        isSuspended: dbUser.is_suspended,
                        isMuted: dbUser.is_muted ?? false,
                        canEditInventory: dbUser.can_edit_inventory,
                        canConfirmDelivery: dbUser.can_confirm_delivery,
                        online: true,
                    });
                }
            } else {
                alert('اسم المستخدم غير صحيح أو غير موجود.');
            }
        } catch (err: any) {
            alert(`خطأ في الدخول: ${err.message}`);
        } finally {
            setAuthLoading(false);
        }
    };

    const handleLogout = async () => {
        if(currentUser) {
            setAuthLoading(true);
            await supabase.from('users').update({ online: false }).eq('id', currentUser.id);
            setCurrentUser(null);
            setLoginUsername('');
            setAuthLoading(false);
        }
    };
    
    if (currentUser) {
        if (initialLoading) {
             return (
                <div className="h-screen bg-[#064E3B] flex items-center justify-center p-6" dir="rtl">
                    <div className="text-white text-center">
                        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                        <h1 className="text-xl font-bold font-cairo">جاري تحميل البيانات...</h1>
                    </div>
                </div>
            );
        }
      return (
        <Dashboard 
            user={currentUser} 
            onLogout={handleLogout}
            users={users}
            setUsers={setUsers}
            salesReps={salesReps}
            setSalesReps={setSalesReps}
            products={products}
            setProducts={setProducts}
            orders={orders}
            setOrders={setOrders}
            customers={customers}
            setCustomers={setCustomers}
            setCurrentUser={setCurrentUser}
            refreshData={() => fetchData(false)}
        />
      );
    }

    return (
        <div className="h-screen bg-[#064E3B] flex items-center justify-center p-6 font-cairo overflow-y-auto" dir="rtl">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl flex flex-col items-center animate-in zoom-in">
                <div className="bg-emerald-500 p-5 rounded-2xl shadow-xl mb-6"><Package className="w-10 h-10 text-white" /></div>
                <h1 className="text-2xl font-black text-gray-900 mb-1">مؤسسة العطور الملكية</h1>
                <p className="text-gray-400 font-bold mb-8 text-sm">نظام الإدارة المطور - المخزن الجديد</p>
                
                {dbError && (
                    <Alert variant="destructive" className="mb-6 rounded-2xl border-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle className="font-black">تنبيه النظام</AlertTitle>
                        <AlertDescription className="text-xs font-bold">{dbError}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleLogin} className="w-full space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 mr-2 uppercase">اسم المستخدم</label>
                        <input
                            value={loginUsername}
                            onChange={(e) => setLoginUsername(e.target.value)}
                            placeholder="اكتب اسم المستخدم هنا..."
                            className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-emerald-900 border-2 border-transparent focus:border-emerald-500 transition-all shadow-sm"
                            required
                            autoFocus
                        />
                    </div>
                    <button type="submit" disabled={authLoading} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                       {authLoading ? 'جاري التحقق...' : 'دخول للنظام'}
                       <ChevronRight className="w-5 h-5"/>
                    </button>
                </form>

                <div className="mt-12 text-center">
                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">جميع البيانات مشفرة وآمنة ✅</p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
