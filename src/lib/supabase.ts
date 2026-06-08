import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  /**
   * تعليمات بسيطة للربط:
   * 1. اذهب لـ Settings (الترس ⚙️) ثم API في Supabase.
   * 2. انسخ Project URL وضعه في الخانة الأولى بالأسفل.
   * 3. انسخ anon public key وضعه في الخانة الثانية بالأسفل.
   */
  
  // الخانة الأولى: ضع الرابط (URL) هنا
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-new-project-url.supabase.co';
  
  // الخانة الثانية: ضع المفتاح (Anon Key) هنا
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-new-anon-key';

  // تنبيه بسيط في المتصفح إذا لم يتم التحديث بعد
  if (supabaseUrl.includes('your-new-project-url')) {
    console.warn('تنبيه: بانتظار إدخال بيانات مشروع Supabase الجديد ليعمل النظام.');
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
