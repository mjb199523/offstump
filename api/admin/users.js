const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

module.exports = async (req, res) => {
    // Shared setup
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(supabaseUrl, adminKey);

    // Auth Middleware Checking
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' });

    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden. Admin access required' });
    }

    if (req.method === 'GET') {
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        return res.json({ users: data });
    }

    if (req.method === 'PATCH') {
        const { id, is_active } = req.body;
        if (!id) return res.status(400).json({ error: 'Missing ID' });

        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update({ is_active })
            .eq('id', id)
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });
        return res.json({ success: true, user: data });
    }

    if (req.method === 'DELETE') {
        const { id } = req.body;
        if (!id) return res.status(400).json({ error: 'Missing ID' });

        // Hard Delete from Auth (Will cascade to profiles if DB is set up that way)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

        // Also explicitly delete from profiles just in case ON DELETE CASCADE is missing
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', id);

        if (authError && profileError) {
            return res.status(500).json({ error: 'Failed to delete user completely: ' + (authError?.message || profileError?.message) });
        }

        return res.json({ success: true, message: 'User hard deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
};
