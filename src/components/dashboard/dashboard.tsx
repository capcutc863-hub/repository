
'use client';
import React, { useState, useMemo, useEffect } from 'react';
import {
  LayoutDashboard, ShoppingCart, Users, Package, TrendingUp, PlusCircle,
  X, LogOut, UserCircle, MessageSquare, Edit3, Star, Download, ShieldCheck
} from 'lucide-react';
import type { User, SalesRep, Product, Order as OrderType, Customer } from '@/lib/types';
import { createClient } from '@/lib/supabase';

// UI Components
import DashboardTab from '@/components/dashboard/tabs/dashboard-tab';
import OrdersTab from '@/components/dashboard/tabs/orders-tab';
import InventoryTab from '@/components/dashboard/tabs/inventory-tab';
import CustomersTab from '@/components/dashboard/tabs/customers-tab';
import AdminUsersTab from '@/components/dashboard/tabs/admin-users-tab';
import PerformanceTab from '@/components/dashboard/tabs/performance-tab';
import { OrderForm } from '@/components/dashboard/forms/order-form';
import { ProductForm } from '@/components/dashboard/forms/product-form';
import { AddUserForm } from '@/components/dashboard/forms/add-user-form';
import { ProfileEditForm } from '@/components/dashboard/forms/profile-edit-form';
import { ChatWindow } from '@/components/dashboard/chat-window';
import { OrderReceipt } from '@/components/dashboard/receipts/order-receipt';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';


interface DashboardProps {
    user: User;
    onLogout: () => void;
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    salesReps: SalesRep[];
    setSalesReps: React.Dispatch<React.SetStateAction<SalesRep[]>>;
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
    orders: OrderType[];
    setOrders: React.Dispatch<React.SetStateAction<OrderType[]>>;
    customers: Customer[];
    setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
    setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
    refreshData: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
    user: currentUser, 
    onLogout,
    users,
    setUsers,
    salesReps,
    setSalesReps,
    products,
    setProducts,
    orders,
    setOrders,
    customers,
    setCustomers,
    setCurrentUser,
    refreshData,
}) => {
    const supabase = createClient();
    
    const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'inventory' | 'customers' | 'admin-users' | 'performance'>('dashboard');
    
    // Modals
    const [showOrderForm, setShowOrderForm] = useState<any | 'new' | null>(null);
    const [showProductModal, setShowProductModal] = useState<any | 'new' | null>(null);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showProfileEdit, setShowProfileEdit] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<OrderType | null>(null);
    const [exporting, setExporting] = useState(false);
    const receiptRef = React.useRef<HTMLDivElement>(null);

    const currentRep = useMemo(() =>
        salesReps.find(r => r.userId === currentUser?.id),
        [salesReps, currentUser]
    );

    // دالة التنسيق المالية: تقسم على 100 وتظهر خانتين عشريتين
    const formatAmount = (val: number) => {
        return (val / 100).toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
    };

    const handleDownloadBackup = () => {
        const backupData = {
            exportDate: new Date().toISOString(),
            users,
            products,
            orders,
            customers,
            salesReps
        };
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup_royal_perfumes_${new Date().toLocaleDateString('en-US').replace(/\//g, '-')}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert('تم تحميل نسخة احتياطية شاملة لبياناتك بنجاح ✅');
    };
    
    const handleUpdateUser = async (updatedUser: User) => {
        const { error } = await supabase
            .from('users')
            .update({
                nickname: updatedUser.nickname,
                avatar_url: updatedUser.avatar,
            })
            .eq('id', updatedUser.id);
        if (error) {
            alert(`فشل تحديث الملف الشخصي: ${error.message}`);
        } else {
            setCurrentUser(updatedUser);
            refreshData();
            alert('تم تحديث الملف الشخصي بنجاح ✅');
        }
    }

    const handleSaveOrder = async (orderData: Omit<OrderType, 'id' | 'createdAt' | 'salesRepName'>, orderId?: string) => {
        const isEditing = !!orderId;
    
        try {
            const effectiveRepId = (currentUser.role !== 'sales' && 'salesRepId' in orderData) ? orderData.salesRepId : currentRep?.id;
            const repForOrder = salesReps.find(r => r.id === effectiveRepId);
            
            if (!effectiveRepId || !repForOrder) {
                throw new Error("لم يتم العثور على المندوب المحدد.");
            }
    
            // البيانات مخزنة أصلاً كأرقام صحيحة (قروش) من الـ Form
            const dbPayload = {
                customer_name: orderData.customerName,
                customer_phone: orderData.customerPhone,
                customer_address: orderData.customerAddress,
                customer_notes: orderData.customerNotes || null,
                items: orderData.items || [],
                subtotal: Math.round(orderData.subtotal),
                discount_percentage: Number(orderData.discountPercentage || 0),
                discount_amount: Math.round(orderData.discountAmount || 0),
                shipping_cost: Math.round(orderData.shippingCost || 0),
                total_amount: Math.round(orderData.totalAmount || 0),
                status: orderData.status || 'قيد التنفيذ',
                commission: Math.round(orderData.commission || 0),
                sales_rep_id: effectiveRepId,
                sales_rep_name: repForOrder.name,
            };
    
            let result;
            if (isEditing) {
                result = await supabase.from('orders').update(dbPayload).eq('id', orderId).select().single();
            } else {
                result = await supabase.from('orders').insert(dbPayload).select().single();
            }
            
            const { data: savedOrder, error } = result;
            if (error) throw new Error(error.message);

            // 1. تحديث بيانات العميل تلقائياً
            const { data: existingCustomer } = await supabase.from('customers').select('*').eq('phone', orderData.customerPhone).maybeSingle();
            if (existingCustomer) {
                await supabase.from('customers').update({
                    total_spent: Math.round(Number(existingCustomer.total_spent || 0) + Number(orderData.totalAmount)),
                    last_order_date: new Date().toISOString(),
                    address: orderData.customerAddress
                }).eq('id', existingCustomer.id);
            } else {
                await supabase.from('customers').insert({
                    name: orderData.customerName,
                    phone: orderData.customerPhone,
                    address: orderData.customerAddress,
                    total_spent: Math.round(orderData.totalAmount),
                    last_order_date: new Date().toISOString(),
                    classification: 'عادي'
                });
            }

            // 2. تحديث عمولة المندوب (المعلقة)
            if (!isEditing && orderData.status === 'قيد التنفيذ') {
                await supabase.from('sales_reps').update({
                    pending_commission: Math.round(Number(repForOrder.pending_commission || 0) + Number(orderData.commission)),
                    orders_count: Number(repForOrder.orders_count || 0) + 1
                }).eq('id', effectiveRepId);
            }
            
            refreshData();
            setShowOrderForm(null);
            
            if (savedOrder) {
                setSelectedOrderForPrint({
                    ...orderData,
                    id: savedOrder.id.toString(),
                    createdAt: savedOrder.created_at,
                    salesRepName: repForOrder.name
                } as OrderType);
            }
            
            alert('تم حفظ الفاتورة وتحديث بيانات العميل بنجاح ✅');
    
        } catch (error: any) {
            alert(`فشل حفظ الفاتورة: ${error.message}`);
        }
    };

    const downloadAs = async (format: 'png' | 'pdf') => {
        if (!receiptRef.current || !selectedOrderForPrint) return;
        setExporting(true);
        try {
            const canvas = await html2canvas(receiptRef.current, { scale: 3, useCORS: true, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            if (format === 'png') {
                const link = document.createElement('a');
                link.href = imgData;
                link.download = `فاتورة-${selectedOrderForPrint.customerName}.png`;
                link.click();
            } else {
                const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: [canvas.width / 3, canvas.height / 3] });
                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 3, canvas.height / 3);
                pdf.save(`فاتورة-${selectedOrderForPrint.customerName}.pdf`);
            }
        } catch (error) {
            alert("خطأ في تصدير الملف.");
        } finally {
            setExporting(false);
        }
    };

    const tabs = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'الرئيسية' },
        { id: 'orders', icon: ShoppingCart, label: 'الفواتير' },
        { id: 'inventory', icon: Package, label: 'المخزن' },
        { id: 'customers', icon: Users, label: 'العملاء' },
        { id: 'admin-users', icon: UserCircle, label: 'إدارة الفريق', admin: true },
        { id: 'performance', icon: TrendingUp, label: 'العمولات والأداء', admin: true },
    ]

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-cairo" dir="rtl">
            <aside className="w-80 bg-[#064E3B] text-white flex-shrink-0 flex flex-col shadow-2xl no-print z-40">
                <div className="p-8 border-b border-white/10 flex items-center gap-4">
                    <div className="bg-emerald-500 p-6 rounded-2xl shadow-lg"><Package className="w-8 h-8" /></div>
                    <div><h1 className="text-2xl font-black">إدارة الزيوت</h1></div>
                </div>
                <nav className="mt-8 px-6 space-y-2 flex-1 overflow-y-auto">
                    {tabs.map(tab => {
                        if (tab.admin && currentUser.role === 'sales') return null;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === tab.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-emerald-100/60 hover:bg-white/5'}`}>
                                <tab.icon className="w-6 h-6" /> <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>
                <div className="p-6 border-t border-white/10 bg-black/10">
                     <div onClick={() => setShowProfileEdit(true)} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl mb-4 cursor-pointer hover:bg-white/10 transition-all border border-transparent hover:border-white/20">
                        <div className="bg-emerald-500 w-12 h-12 rounded-xl flex items-center justify-center shadow-xl overflow-hidden relative">
                            {currentUser.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover" alt="User Avatar" /> : <UserCircle className="w-7 h-7" />}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="font-black text-sm truncate text-emerald-50">{currentUser.nickname || currentUser.name}</p>
                            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">{currentUser.online ? 'متصل الآن' : 'غير متصل'}</p>
                        </div>
                        <Edit3 className="w-4 h-4 text-emerald-500 opacity-50" />
                    </div>
                    <button onClick={onLogout} className="w-full py-4 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl font-black border border-red-500/20 transition-all shadow-lg"><LogOut className="w-5 h-5 ml-2 inline"/> تسجيل الخروج</button>
                </div>
            </aside>
            
            <main className="flex-1 overflow-y-auto p-10 relative">
                 <header className="flex justify-between items-center mb-12 no-print">
                    <div>
                        <h2 className="text-4xl font-black text-gray-900">{tabs.find(t=>t.id===activeTab)?.label}</h2>
                        <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-tighter">مؤسسة العطور الملكية</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={handleDownloadBackup} className="p-4 bg-white rounded-2xl shadow-sm border border-emerald-100 text-emerald-600 hover:bg-emerald-50 transition-all flex items-center gap-2">
                            <Download className="w-5 h-5" />
                            <span className="text-xs font-black">باك أب</span>
                        </button>
                        {(currentUser.role === 'admin' || currentUser.role === 'supervisor' || currentUser.role === 'sales') && (
                            <button onClick={() => setShowOrderForm('new')} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-2xl flex items-center gap-3 hover:scale-105 transition-all"><PlusCircle/> فاتورة جديدة</button>
                        )}
                    </div>
                </header>
                
                {activeTab === 'dashboard' && <DashboardTab currentUser={currentUser} salesReps={salesReps} orders={orders} />}
                {activeTab === 'orders' && <OrdersTab currentUser={currentUser} currentRep={currentRep} salesReps={salesReps} orders={orders} onEditOrder={(order) => setShowOrderForm(order)} refreshData={refreshData} />}
                {activeTab === 'inventory' && <InventoryTab currentUser={currentUser} products={products} onEditProduct={(product) => setShowProductModal(product)} onAddNewProduct={() => setShowProductModal('new')} refreshData={refreshData} />}
                {activeTab === 'customers' && <CustomersTab currentUser={currentUser} customers={customers} />}
                {activeTab === 'admin-users' && (currentUser.role === 'admin' || currentUser.role === 'supervisor') && <AdminUsersTab currentUser={currentUser} users={users} onAddUser={() => setShowAddUserModal(true)} refreshData={refreshData} />}
                {activeTab === 'performance' && (currentUser.role === 'admin' || currentUser.role === 'supervisor') && <PerformanceTab salesReps={salesReps} refreshData={refreshData} />}
            </main>

            {/* Modals */}
            {showOrderForm && <OrderForm order={showOrderForm} salesReps={salesReps} currentRep={currentRep} currentUser={currentUser} products={products} onClose={() => setShowOrderForm(null)} onSave={handleSaveOrder} />}
            {showProductModal && <ProductForm product={showProductModal} onClose={() => setShowProductModal(null)} onSave={() => { refreshData(); setShowProductModal(null); }} />}
            {showAddUserModal && <AddUserForm onClose={() => setShowAddUserModal(false)} onAddUser={() => { refreshData(); setShowAddUserModal(false); }} />}
            {showProfileEdit && <ProfileEditForm user={currentUser} onClose={() => setShowProfileEdit(false)} onUpdate={handleUpdateUser} />}
            {showChat && <ChatWindow currentUser={currentUser} users={users} onClose={() => setShowChat(false)} />}

            {/* Receipt Preview Modal */}
            {selectedOrderForPrint && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[1000] p-4 animate-in fade-in">
                    <div className="bg-white rounded-[3rem] p-10 shadow-2xl w-full max-w-4xl relative animate-in zoom-in overflow-hidden">
                        <button onClick={() => setSelectedOrderForPrint(null)} className="absolute top-8 left-8 p-4 bg-gray-100 rounded-2xl hover:bg-red-100 hover:text-red-500 transition-all z-20"><X/></button>
                        <h3 className="text-3xl font-black text-emerald-950 mb-10 text-center">الفاتورة الملكية</h3>
                        <div className="bg-gray-100/50 rounded-[2.5rem] p-8 border border-gray-200 overflow-y-auto max-h-[65vh] flex justify-center">
                             <div ref={receiptRef} className="shadow-2xl"><OrderReceipt order={selectedOrderForPrint} /></div>
                        </div>
                        <div className="flex gap-4 justify-center mt-10">
                            <button disabled={exporting} onClick={() => downloadAs('png')} className="bg-emerald-600 text-white px-10 py-5 rounded-[1.5rem] font-black text-lg flex items-center gap-3 shadow-xl hover:bg-emerald-700 transition-all">
                                <Download/> {exporting ? 'جاري التجهيز...' : 'تحميل صورة'}
                            </button>
                            <button disabled={exporting} onClick={() => downloadAs('pdf')} className="bg-indigo-600 text-white px-10 py-5 rounded-[1.5rem] font-black text-lg flex items-center gap-3 shadow-xl hover:bg-indigo-700 transition-all">
                                <Download/> {exporting ? 'جاري التجهيز...' : 'تحميل PDF'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
