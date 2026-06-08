import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // الرابط الخاص بمشروعك الجديد على سوبابيز
  const supabaseUrl = 'https://hyyznzimuavvukjamxmu.supabase.co';
  
  // المفتاح العام (Anon Key) الخاص بمشروعك الجديد
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5eXpuemltdWF2dnVramFteG11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NjM5MzUsImV4cCI6MjA5NjQzOTkzNX0.491deX9FQYQG7l9H-UyQbKpyLtUX5T4hJOF0Uao1Yqk';

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
