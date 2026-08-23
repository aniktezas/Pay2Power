import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[SmartPay] Supabase credentials not configured. Running in mock/demo mode.\n' +
    'Create a .env file from .env.example and add your Supabase project URL and anon key.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey &&
  !supabaseUrl.includes('placeholder');
