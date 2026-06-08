import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // التحقق من وجود الإعدادات في المتصفح
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
    console.warn('تنبيه: إعدادات Supabase غير مكتملة في ملف .env');
  }

  return createBrowserClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
  )
}
