import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // استبدل القيم دي بالقيم اللي هتاخدها من مشروع Supabase الجديد
  // هتلاقيها في Settings -> API
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-new-project.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-new-anon-key';

  if (supabaseUrl.includes('your-new-project')) {
    console.warn('تنبيه: يرجى وضع رابط مشروع Supabase الجديد في ملف .env أو في ملف supabase.ts');
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
