const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });

    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || profile.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    const id = req.query.id;

    try {
        if (req.method === 'GET') {
            const { data, error } = await supabaseAdmin.from('services').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            return res.json(data);
        }

        if (req.method === 'POST') {
            const body = req.body;
            if (!body.name || !body.base_price) return res.status(400).json({ error: 'Name and price are required' });

            const { data, error } = await supabaseAdmin.from('services').insert([{
                name: body.name,
                description: body.description || null,
                base_price: body.base_price,
                duration_minutes: body.duration_minutes || 60,
                is_active: body.is_active !== undefined ? body.is_active : true
            }]).select().single();
            if (error) throw error;
            return res.status(201).json(data);
        }

        if (req.method === 'DELETE') {
            if (!id) return res.status(400).json({ error: 'Missing ID' });
            const { error } = await supabaseAdmin.from('services').delete().eq('id', id);
            if (error) throw error;
            return res.json({ message: 'Deleted successfully' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
