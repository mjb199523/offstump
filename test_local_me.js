const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

async function testMe() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, anonKey);

    const email = 'offstump26@gmail.com';
    const password = '...'; // I don't know the password.

    // I'll use the admin key to get a session without password if possible?
    // No, I'll just check the profile status directly via service role.
    const adminSupabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { data: profile } = await adminSupabase.from('profiles').select('*').eq('email', email).single();
    console.log('API-Check Profile:', profile);
}

testMe();
