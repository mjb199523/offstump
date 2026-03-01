import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    // We won't throw an error locally just in case it breaks the build entirely before you've set them,
    // but be warned that queries will fail without these set.
    console.warn("Missing Supabase environment variables!");
}

// Admin client strictly for server-side usage
export const supabaseAdmin = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseServiceRoleKey || 'placeholder');
