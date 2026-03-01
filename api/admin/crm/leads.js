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
            if (id) {
                const { data, error } = await supabaseAdmin.from('leads').select('*').eq('id', id).single();
                if (error) throw error;
                return res.json(data);
            } else {
                const { data, error } = await supabaseAdmin.from('leads').select('*').order('created_at', { ascending: false });
                if (error) throw error;
                return res.json(data);
            }
        }

        if (req.method === 'POST') {
            const body = req.body;
            if (!body.name || !body.phone) return res.status(400).json({ error: 'Name and phone are required' });

            const { data, error } = await supabaseAdmin.from('leads').insert([{
                name: body.name,
                phone: body.phone,
                email: body.email || null,
                source: body.source || null,
                status: body.status || 'NEW',
                notes: body.notes || null
            }]).select().single();
            if (error) throw error;
            return res.status(201).json(data);
        }

        if (req.method === 'PUT') {
            if (!id) return res.status(400).json({ error: 'Missing ID' });
            const { data, error } = await supabaseAdmin.from('leads').update(req.body).eq('id', id).select().single();
            if (error) throw error;
            return res.json(data);
        }

        if (req.method === 'DELETE') {
            if (!id) return res.status(400).json({ error: 'Missing ID' });
            const { error } = await supabaseAdmin.from('leads').delete().eq('id', id);
            if (error) throw error;
            return res.json({ message: 'Deleted successfully' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
