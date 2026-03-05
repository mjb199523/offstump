const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
    // Shared setup
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });

    let supabaseAdmin;
    let user;

    try {
        const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);
        const adminKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY);
        supabaseAdmin = createClient(supabaseUrl, adminKey);

        const { data: authData, error: authErr } = await supabaseAdmin.auth.getUser(token);
        if (authErr || !authData.user) return res.status(401).json({ error: 'Unauthorized' });
        user = authData.user;

        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || profile.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden. Admin access required' });
        }
    } catch (e) {
        console.error("Auth / Supabase Error:", e.name, e.message);
        return res.status(500).json({ error: `Server auth init error: ${e.message}` });
    }

    if (req.method === 'GET') {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 7);

            // 1. KPI Calculations
            const { data: totalRevenueData } = await supabaseAdmin.from('bookings').select('amount').eq('status', 'COMPLETED');
            const totalRevenue = (totalRevenueData || []).reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

            const { data: monthRevenueData } = await supabaseAdmin.from('bookings').select('amount')
                .eq('status', 'COMPLETED')
                .gte('date', startOfMonth.toISOString().split('T')[0]);
            const monthRevenue = (monthRevenueData || []).reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

            const { count: totalCustomers } = await supabaseAdmin.from('customers').select('*', { count: 'exact', head: true });
            const { count: currentMonthBookings } = await supabaseAdmin.from('bookings').select('*', { count: 'exact', head: true })
                .gte('date', startOfMonth.toISOString().split('T')[0]);

            // 2. Dynamic Weekly Trend
            const { data: weeklyData } = await supabaseAdmin.from('bookings').select('date, amount')
                .gte('date', sevenDaysAgo.toISOString().split('T')[0]);

            const dayMap = {};
            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            for (let i = 0; i < 7; i++) {
                const d = new Date(sevenDaysAgo);
                d.setDate(sevenDaysAgo.getDate() + i);
                dayMap[d.toISOString().split('T')[0]] = { name: days[d.getDay()], revenue: 0, bookings: 0 };
            }

            (weeklyData || []).forEach(b => {
                if (dayMap[b.date]) {
                    dayMap[b.date].revenue += Number(b.amount) || 0;
                    dayMap[b.date].bookings += 1;
                }
            });
            const revenueData = Object.values(dayMap);

            // 3. Dynamic Lead Sources
            const { data: leadSources } = await supabaseAdmin.from('leads').select('source');
            const sourceCounts = {};
            (leadSources || []).forEach(l => {
                const s = l.source || 'Direct';
                sourceCounts[s] = (sourceCounts[s] || 0) + 1;
            });
            const sourceData = Object.entries(sourceCounts).map(([name, value]) => ({ name, value }));

            // 4. Dynamic Payment Modes
            const { data: payments } = await supabaseAdmin.from('bookings').select('payment_method');
            const paymentCounts = {};
            (payments || []).forEach(p => {
                const mode = p.payment_method || 'Other';
                paymentCounts[mode] = (paymentCounts[mode] || 0) + 1;
            });
            const paymentData = Object.entries(paymentCounts).map(([name, value]) => ({ name, value }));

            // 5. Dynamic Service Distribution
            const { data: serviceBookings } = await supabaseAdmin.from('bookings').select('service_type');
            const serviceCounts = {};
            (serviceBookings || []).forEach(s => {
                const type = s.service_type || 'Uncategorized';
                serviceCounts[type] = (serviceCounts[type] || 0) + 1;
            });
            const serviceData = Object.entries(serviceCounts).map(([name, bookings]) => ({ name, bookings }))
                .sort((a, b) => b.bookings - a.bookings).slice(0, 5);

            // 6. Dynamic Peak Hours (Slot Analysis)
            const { data: slotData } = await supabaseAdmin.from('bookings').select('slot');
            const hourMap = {};
            (slotData || []).forEach(s => {
                const slot = s.slot || 'N/A';
                hourMap[slot] = (hourMap[slot] || 0) + 1;
            });
            const peakHoursData = Object.entries(hourMap).map(([time, walkins]) => ({ time, walkins, prepay: 0 }));

            return res.json({
                revenue: { total: totalRevenue, thisMonth: monthRevenue, trend: "+0%" },
                customers: { total: totalCustomers || 0, trend: "+0%" },
                bookings: {
                    thisMonth: currentMonthBookings || 0,
                    avgValue: currentMonthBookings > 0 ? Math.round(monthRevenue / currentMonthBookings) : 0,
                    trend: "+0%"
                },
                sourceData: sourceData.length ? sourceData : [{ name: 'None', value: 0 }],
                paymentData: paymentData.length ? paymentData : [{ name: 'None', value: 0 }],
                serviceData: serviceData.length ? serviceData : [{ name: 'None', bookings: 0 }],
                revenueData,
                peakHoursData: peakHoursData.length ? peakHoursData : [{ time: 'N/A', walkins: 0, prepay: 0 }]
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Failed to generate dynamic dashboard" });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
};
