import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  /**
   * تعليمات بسيطة للربط:
   * 1. اذهب لـ Settings (الترس ⚙️) ثم API في Supabase.
   * 2. انسخ Project URL وضعه في الخانة الأولى بالأسفل.
   * 3. انسخ anon public key وضعه في الخانة الثانية بالأسفل.
   */
  
  // الخانة الأولى: ضع الرابط (URL) هنا
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hyyznzimuavvukjamxmu.supabase.co';
  
  // الخانة الثانية: ضع المفتاح (Anon Key) هنا
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY_HERE';

  // تنبيه بسيط في المتصفح إذا لم يتم التحديث بعد
  if (supabaseAnonKey === 'YOUR_ANON_KEY_HERE') {
    console.warn('تنبيه: بانتظار إدخال مفتاح الـ Anon Key الجديد من سوبابيز ليعمل النظام.');
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
