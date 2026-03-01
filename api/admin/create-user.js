const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Auth Middleware Checking
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(supabaseUrl, adminKey);

    // Verify token identity using auth api
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);

    if (authErr || !user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify Is Admin using Profiles
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden. Admin access required' });
    }

    // Proceed to create a new user exactly as requested
    const { email, password, role, is_active } = req.body;

    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: role || 'user', is_active: is_active ?? true }
    });

    if (createError) {
        return res.status(500).json({ error: createError.message });
    }

    return res.status(201).json({ success: true, user: newUser.user });
};
