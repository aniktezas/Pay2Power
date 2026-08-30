import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Demo mode is active if credentials are missing or clearly placeholder values
const PLACEHOLDER_PATTERNS = ['your-project', 'placeholder', 'example', 'your-anon-key', 'xxxx'];

function isPlaceholder(val: string) {
  if (!val || val.trim() === '') return true;
  return PLACEHOLDER_PATTERNS.some(p => val.toLowerCase().includes(p));
}

export const isSupabaseConfigured =
  !isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.info(
    '[SmartPay] Running in DEMO MODE — all data stored in localStorage.\n' +
    'To connect to Supabase, add your project URL and anon key to .env'
  );
}

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key'
);
