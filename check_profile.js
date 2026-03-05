const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

async function verifyProfile() {
    const supabaseUrl = 'https://mdopzwhzofuasaittzzz.supabase.co';
    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const email = 'offstump26@gmail.com';

    const supabase = createClient(supabaseUrl, adminKey);

    console.log(`Verifying profile for ${email}...`);

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email);

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    if (profiles.length === 0) {
        console.log('No profile found for this email.');
    } else {
        console.log('Found profiles:', JSON.stringify(profiles, null, 2));
    }
}

verifyProfile();
