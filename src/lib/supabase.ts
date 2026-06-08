import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  /**
   * تعليمات هامة:
   * بمجرد إنشاء مشروع Supabase الجديد، قم بنسخ الـ URL والـ Anon Key
   * وضعهما مكان القيم الموجودة أدناه.
   */
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-new-project.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-new-anon-key';

  if (supabaseUrl.includes('your-new-project')) {
    console.warn('تنبيه: بانتظار وضع مفاتيح Supabase الجديدة في سطر 10 و 11...');
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
