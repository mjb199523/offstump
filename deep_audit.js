const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

async function deepAudit() {
    const supabaseUrl = 'https://mdopzwhzofuasaittzzz.supabase.co';
    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, adminKey);

    console.log('--- AUDIT: AUTH USERS ---');
    const { data: { users }, error: authErr } = await supabase.auth.admin.listUsers();
    if (authErr) console.error('Auth Error:', authErr);
    else users.forEach(u => console.log(`User ID: ${u.id}, Email: ${u.email}`));

    console.log('\n--- AUDIT: PUBLIC PROFILES ---');
    const { data: profiles, error: profErr } = await supabase.from('profiles').select('id, email, is_active');
    if (profErr) console.error('Profile Error:', profErr);
    else profiles.forEach(p => console.log(`Profile ID: ${p.id}, Email: ${p.email}, Active: ${p.is_active}`));

    // Check for ID Mismatch for the user
    const targetEmail = 'offstump26@gmail.com';
    const authUser = users.find(u => u.email === targetEmail);
    const profUser = profiles.find(p => p.email === targetEmail);

    if (authUser && profUser) {
        if (authUser.id !== profUser.id) {
            console.log('\n🚨 CRITICAL MISMATCH DETECTED!');
            console.log(`Auth ID:    ${authUser.id}`);
            console.log(`Profile ID: ${profUser.id}`);
            console.log('Reason: The profile row is linked to an old, deleted Auth ID.');
        } else {
            console.log('\n✅ IDs Match.');
        }
    } else {
        console.log('\n⚠️ Could not find both Auth and Profile records for', targetEmail);
    }
}

deepAudit();
