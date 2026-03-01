const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

module.exports = async (req, res) => {
    // Basic CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Authenticate request using Supabase JWT
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token' });

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return res.status(500).json({ error: 'Server misconfiguration' });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
        if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' });

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (!profile || profile.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        // Compute dates for filtering
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const startOf7DaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const startOf14DaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

        // 1. Total events today
        const { count: countToday, error: errToday } = await supabase
            .from('events')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startOfToday);

        // 2. Total events (7 days)
        const { count: count7Days, error: err7Days } = await supabase
            .from('events')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startOf7DaysAgo);

        // 3. WhatsApp Clicks
        const { count: whatsappClicks, error: errWhatsapp } = await supabase
            .from('events')
            .select('*', { count: 'exact', head: true })
            .eq('event_name', 'whatsapp_channel_click');

        // 4. Recent 50 events
        const { data: recentEvents, error: errRecent } = await supabase
            .from('events')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        // 5. Events per day (last 14 days)
        const { data: last14DaysEvents, error: err14Days } = await supabase
            .from('events')
            .select('created_at, event_name')
            .gte('created_at', startOf14DaysAgo);

        // 6. Service Clicks Breakdown (from the last14Days or all time?) Let's do all time from 14 days for now, or just all service_clicks.
        const { data: serviceClicks, error: errServices } = await supabase
            .from('events')
            .select('metadata')
            .eq('event_name', 'service_click');

        if (errToday || err7Days || errRecent || errWhatsapp || err14Days || errServices) {
            console.error('Database query error:', errToday, err7Days, errRecent, errWhatsapp, err14Days, errServices);
            return res.status(500).json({ error: 'Database error' });
        }

        // Aggregate 14 days array into charting format { date, count }
        const dailyCounts = {};
        for (let i = 13; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = d.toISOString().split('T')[0];
            dailyCounts[dateStr] = 0;
        }

        last14DaysEvents.forEach(evt => {
            const dateStr = new Date(evt.created_at).toISOString().split('T')[0];
            if (dailyCounts[dateStr] !== undefined) {
                dailyCounts[dateStr]++;
            }
        });

        const chartsData = Object.keys(dailyCounts).map(date => ({
            date,
            events: dailyCounts[date]
        }));

        // Aggregate service clicks
        const serviceCounts = {};
        serviceClicks.forEach(evt => {
            if (evt.metadata && evt.metadata.service) {
                const s = evt.metadata.service;
                serviceCounts[s] = (serviceCounts[s] || 0) + 1;
            }
        });

        let topService = { name: 'None', count: 0 };
        const serviceChartData = Object.keys(serviceCounts).map(key => {
            if (serviceCounts[key] > topService.count) {
                topService = { name: key, count: serviceCounts[key] };
            }
            return { name: key, value: serviceCounts[key] };
        });

        return res.status(200).json({
            todayEvents: countToday || 0,
            sevenDayEvents: count7Days || 0,
            whatsappClicks: whatsappClicks || 0,
            topService: topService.name,
            chartsData,
            serviceChartData,
            recentEvents
        });
    } catch (err) {
        console.error('Analytics API Error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
