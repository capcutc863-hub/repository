import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  /**
   * تعليمات بسيطة للربط:
   * 1. من شاشة API Keys اللي إنت واقف عليها، انسخ الـ anon public key.
   * 2. من شاشة Data API (على الشمال)، انسخ الـ Project URL.
   * 3. حطهم مكان الكلام اللي باللون العربي تحت.
   */
  
  // ضع الرابط (URL) اللي بيبدأ بـ https هنا
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'برجاء_وضع_الرابط_هنا';
  
  // ضع المفتاح (Anon Key) اللي بيبدأ بـ sb_publishable هنا
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'برجاء_وضع_المفتاح_هنا';

  // تنبيه في حال نسيان وضع البيانات
  if (supabaseAnonKey === 'برجاء_وضع_المفتاح_هنا' || supabaseUrl === 'برجاء_وضع_الرابط_هنا') {
    console.warn('تنبيه: السايت لسه مش مربوط بسوبابيز. انسخ الـ URL والـ Key وحطهم هنا عشان يشتغل.');
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
