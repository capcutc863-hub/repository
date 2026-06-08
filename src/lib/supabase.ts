import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // في حالة أن المشروع متوقف أو البيانات غير صحيحة، نظهر تحذير ولا نعطل التطبيق بالكامل
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
    if (typeof window !== 'undefined') {
      console.warn('تنبيه: السايت مش مربوط بقاعدة بيانات حالياً أو المشروع توقف على Supabase.');
    }
  }

  return createBrowserClient(
    supabaseUrl || 'https://your-new-project.supabase.co',
    supabaseAnonKey || 'your-new-anon-key'
  )
}
