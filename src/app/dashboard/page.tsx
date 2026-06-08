'use client';
import React, { useState, useEffect } from 'react';
import {
  Package, ChevronRight, Users as UsersIcon, DatabaseBackup, AlertTriangle
} from 'lucide-react';
import type { User, SalesRep, Product, Order, Customer, UserRole } from '@/lib/types';
import Dashboard from '@/components/dashboard/dashboard';
import { createClient } from '@/lib/supabase';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const LoginPage: React.FC = () => {
    const supabase = createClient();
    const [loginUsername, setLoginUsername] = useState('');
    const [authLoading, setAuthLoading] = useState(false);
    const [dbError, setDbError] = useState<string | null>(null);
    
    // App state
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    
    // State for listing registered users on login screen
    const [registeredUserNames, setRegisteredUserNames] = useState<string[]>([]);

    const fetchInitialUsers = async () => {
        try {
            const { data, error } = await supabase.from('users').select('username');
            if (error) {
                console.error("Supabase Error:", error);
                setDbError("فشل الاتصال بقاعدة البيانات. تأكد من إعدادات الربط.");
                return;
            }
            if (data) {
                setRegisteredUserNames(data.map(u => u.username));
                setDbError(null);
            }
        } catch (err) {
            console.error("Error fetching user list:", err);
        }
    };

    const fetchData = async () => {
        setLoadingData(true);
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
                supabase.from('orders').select('*'),
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
                totalCommission: rep.total_commission, 
                pendingCommission: rep.pending_commission, 
                ordersCount: rep.orders_count, 
                monthlyHistory: rep.monthly_history || [] 
            })));
            
            setProducts((productsData || []).map(p => ({...p, pricePerMg: p.price_per_mg})));
            
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
                discountPercentage: o.discount_percentage,
                discountAmount: o.discount_amount,
                shippingCost: o.shipping_cost,
                totalAmount: o.total_amount,
            })));
            
            setCustomers((customersData || []).map(c => ({...c, id: c.id.toString(), totalSpent: c.total_spent, lastOrderDate: c.last_order_date})));
            
        } catch (error: any) {
            console.error("Error fetching data:", error);
        } finally {
            setLoadingData(false);
        }
    };
    
    useEffect(() => {
        fetchInitialUsers();
    }, []);

    useEffect(() => {
        if (currentUser) {
            fetchData();
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
                alert('اسم المستخدم غير موجود. تأكد من أنك قمت برفع ملف الـ Backup بشكل صحيح.');
            }
        } catch (err: any) {
            alert(`خطأ: ${err.message}`);
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
            fetchInitialUsers();
        }
    };
    
    if (currentUser) {
        if (loadingData) {
             return (
                <div className="h-screen bg-[#064E3B] flex items-center justify-center p-6" dir="rtl">
                    <div className="text-white text-center">
                        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                        <h1 className="text-xl font-bold">جاري تحميل البيانات...</h1>
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
            refreshData={fetchData}
        />
      );
    }

    return (
        <div className="h-screen bg-[#064E3B] flex items-center justify-center p-6 font-cairo overflow-y-auto" dir="rtl">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl flex flex-col items-center animate-in zoom-in">
                <div className="bg-emerald-500 p-5 rounded-2xl shadow-xl mb-6"><Package className="w-10 h-10 text-white" /></div>
                <h1 className="text-2xl font-black text-gray-900 mb-1">مؤسسة العطور الملكية</h1>
                <p className="text-gray-400 font-bold mb-8 text-sm">تسجيل الدخول للنظام</p>
                
                {dbError && (
                    <Alert variant="destructive" className="mb-6 rounded-2xl border-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle className="font-black">تنبيه النظام</AlertTitle>
                        <AlertDescription className="text-xs font-bold">
                            {dbError}
                        </AlertDescription>
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
                        />
                    </div>
                    <button type="submit" disabled={authLoading} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                       {authLoading ? 'جاري التحقق...' : 'دخول للنظام'}
                       <ChevronRight className="w-5 h-5"/>
                    </button>
                </form>

                <div className="mt-8 w-full border-t pt-6">
                    <h3 className="text-[10px] font-black text-gray-400 mb-3 uppercase flex items-center gap-2">
                        <UsersIcon className="w-3 h-3"/> المستخدمون المتاحون:
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {registeredUserNames.length > 0 ? registeredUserNames.map(name => (
                            <button 
                                key={name} 
                                onClick={() => setLoginUsername(name)}
                                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-black hover:bg-emerald-100 border border-emerald-100"
                            >
                                {name}
                            </button>
                        )) : (
                            <p className="text-xs text-gray-300 font-bold">لا يوجد مستخدمون حالياً. يرجى التأكد من رفع الـ Backup.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
