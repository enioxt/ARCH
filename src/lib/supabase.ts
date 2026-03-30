import { createClient } from '@supabase/supabase-js';

// These variables should be added to your .env file when you export to Windsurf
// For now, they are placeholders so the app doesn't crash in the preview.
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
