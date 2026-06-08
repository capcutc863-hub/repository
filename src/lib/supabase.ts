import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  /**
   * تعليمات هامة للربط:
   * 1. بعد إنشاء المشروع، اذهب لـ Project Settings ثم API.
   * 2. انسخ Project URL وضعه مكان الرابط أدناه.
   * 3. انسخ anon public key وضعه مكان المفتاح أدناه.
   */
  
  // ضع الرابط الجديد هنا بين العلامتين ''
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project-url.supabase.co';
  
  // ضع المفتاح الجديد هنا بين العلامتين ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

  if (supabaseUrl.includes('your-project-url')) {
    console.warn('تنبيه: بانتظار إدخال بيانات مشروع Supabase الجديد في ملف src/lib/supabase.ts');
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
