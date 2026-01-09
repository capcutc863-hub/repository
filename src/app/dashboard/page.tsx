'use client';
import React, { useState, useEffect } from 'react';
import {
  Package, UserCircle, ChevronRight, Info, UserPlus
} from 'lucide-react';
import type { User, SalesRep, Product, Order, Customer, UserRole } from '@/lib/types';
import Dashboard from '@/components/dashboard/dashboard';
import { createClient } from '@/lib/supabase';

const LoginPage: React.FC = () => {
    const supabase = createClient();
    const [loginUsername, setLoginUsername] = useState('');
    const [authLoading, setAuthLoading] = useState(false);
    
    // App state will now be fetched from Supabase
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    const fetchData = async () => {
        setLoadingData(true);
        try {
            const [
                { data: usersData, error: usersError },
                { data: salesRepsData, error: salesRepsError },
                { data: productsData, error: productsError },
                { data: ordersData, error: ordersError },
                { data: customersData, error: customersError }
            ] = await Promise.all([
                supabase.from('users').select('*'),
                supabase.from('sales_reps').select('*'),
                supabase.from('products').select('*'),
                supabase.from('orders').select('*'),
                supabase.from('customers').select('*')
            ]);

            if (usersError) throw usersError;
            if (salesRepsError) throw salesRepsError;
            if (productsError) throw productsError;
            if (ordersError) throw ordersError;
            if (customersError) throw customersError;

            // Map snake_case from DB to camelCase for the app state
            setUsers(usersData.map(dbUser => ({
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
            setSalesReps(salesRepsData.map(rep => ({ ...rep, userId: rep.user_id, maxDiscountAllowed: rep.max_discount_allowed, customCommissionRate: rep.custom_commission_rate, totalCommission: rep.total_commission, pendingCommission: rep.pending_commission, ordersCount: rep.orders_count, monthlyHistory: rep.monthly_history || [] })));
            setProducts(productsData.map(p => ({...p, pricePerMg: p.price_per_mg})));
            setOrders(ordersData.map(o => ({
                ...o,
                id: o.id.toString(), // Ensure ID is a string for consistency
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
            setCustomers(customersData.map(c => ({...c, id: c.id.toString(), totalSpent: c.total_spent, lastOrderDate: c.last_order_date})));
            
        } catch (error: any) {
            console.error("Error fetching initial data:", error);
            alert(`فشل تحميل البيانات الأولية من قاعدة البيانات: ${error.message}`);
        } finally {
            setLoadingData(false);
        }
    };
    
    // Fetch data when component mounts after login
    useEffect(() => {
        if (currentUser) {
            fetchData();
        }
    }, [currentUser]);


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const usernameInput = loginUsername.trim();
        if (!usernameInput) {
            alert('يرجى إدخال اسم المستخدم.');
            return;
        }
        setAuthLoading(true);
        
        try {
            const { data: dbUser, error } = await supabase
                .from('users')
                .select('*')
                .eq('username', usernameInput)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Supabase login error:', error);
                throw new Error(error.message);
            }

            if (dbUser) {
                if (dbUser.is_suspended) { 
                    alert('هذا الحساب معلق حالياً.');
                } else {
                    // Map snake_case from DB to camelCase for the app state
                    const appUser: User = {
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
                        salesRepId: dbUser.sales_rep_id,
                    };
                    
                    // Update user's online status in DB
                    await supabase.from('users').update({ online: true }).eq('id', appUser.id);
                    
                    setCurrentUser(appUser);
                }
            } else {
                alert('اسم المستخدم غير صحيح. لم يتم العثور عليه في قاعدة البيانات.');
            }
        } catch (err: any) {
            console.error('Login process failed:', err);
            alert(`حدث خطأ أثناء تسجيل الدخول: ${err.message || 'خطأ غير معروف'}`);
        } finally {
            setAuthLoading(false);
        }
    };

    const handleRegister = async () => {
        const usernameInput = loginUsername.trim();
        if (!usernameInput) {
            alert('يرجى إدخال اسم مستخدم للتسجيل.');
            return;
        }
        setAuthLoading(true);

        try {
            const newUserPayload = {
                username: usernameInput,
                name: usernameInput,
                nickname: usernameInput,
                role: 'sales' as UserRole,
                is_suspended: false,
                is_muted: false,
                can_edit_inventory: false,
                can_confirm_delivery: false,
                online: false,
                start_date: new Date().toISOString(),
            };

            const { data, error } = await supabase.from('users').insert(newUserPayload).select().single();

            if (error) {
                console.error('Supabase registration error:', error);
                throw new Error(error.message);
            }
            
            if (data && data.role === 'sales') {
                const newRepPayload = {
                    user_id: data.id,
                    name: data.name,
                };
                const { error: repError } = await supabase.from('sales_reps').insert(newRepPayload);
                if (repError) {
                    console.error('Supabase sales rep creation error:', repError);
                    // Might want to delete the user here for consistency
                    throw new Error(repError.message);
                }
            }

            alert(`تم تسجيل المستخدم "${usernameInput}" بنجاح! يمكنك الآن تسجيل الدخول به.`);
            fetchData(); // Refresh data

        } catch (err: any) {
            console.error('Registration process failed:', err);
            alert(`فشلت عملية التسجيل: ${err.message || 'خطأ غير معروف'}`);
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
        if (loadingData) {
             return (
                <div className="h-screen bg-[#064E3B] flex items-center justify-center p-6 font-cairo" dir="rtl">
                    <div className="text-white text-center">
                        <h1 className="text-3xl font-black mb-4">جاري تحميل البيانات...</h1>
                        <p>الرجاء الانتظار قليلاً.</p>
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
        <div className="h-screen bg-[#064E3B] flex items-center justify-center p-6 font-cairo" dir="rtl">
            <div className="bg-white w-full max-w-md rounded-[3rem] p-12 shadow-2xl flex flex-col items-center animate-in zoom-in">
                <div className="bg-emerald-500 p-6 rounded-[2rem] shadow-xl mb-8"><Package className="w-12 h-12 text-white" /></div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">مؤسسة العطور الملكية</h1>
                <p className="text-gray-400 font-bold mb-10 text-center text-sm">أهلاً بك مجدداً، يرجى تسجيل الدخول للمتابعة</p>
                <form onSubmit={handleLogin} className="w-full space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 mr-2 uppercase flex items-center gap-2"><UserCircle className="w-3 h-3"/> اسم المستخدم</label>
                        <input
                            value={loginUsername}
                            onChange={(e) => setLoginUsername(e.target.value)}
                            placeholder="أدخل اسم المستخدم..."
                            className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-black text-emerald-900 border-2 border-transparent focus:border-emerald-500 transition-all shadow-sm"
                            required
                        />
                    </div>
                    <div className="flex flex-col space-y-4">
                        <button type="submit" disabled={authLoading} className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black text-xl hover:bg-emerald-700 shadow-2xl transition-all shadow-emerald-500/20 flex items-center justify-center gap-3 disabled:bg-emerald-800">
                           {authLoading ? 'جاري التحقق...' : 'دخول للنظام'}
                           <ChevronRight className="w-6 h-6"/>
                        </button>
                        <button type="button" onClick={handleRegister} disabled={authLoading} className="w-full py-4 bg-white border-2 border-emerald-600 text-emerald-600 rounded-[1.5rem] font-black text-lg hover:bg-emerald-50 transition-all flex items-center justify-center gap-3 disabled:bg-gray-200">
                           <UserPlus className="w-5 h-5"/>
                           {authLoading ? 'جاري التسجيل...' : 'تسجيل مستخدم جديد'}
                        </button>
                    </div>
                </form>
                <div className="mt-12 p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center gap-4">
                    <Info className="text-emerald-600 w-5 h-5 shrink-0"/>
                    <p className="text-[10px] font-bold text-emerald-800 leading-relaxed">في حال فقدان كلمة المرور أو مشاكل الوصول، يرجى التواصل مع المسؤول التقني.</p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
