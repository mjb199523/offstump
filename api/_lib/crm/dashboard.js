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
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        supabaseAdmin = createClient(supabaseUrl, adminKey);

        // Auth Middleware Checking
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

            // 1. Total Revenue (COMPLETED bookings)
            const { data: totalRevenueData } = await supabaseAdmin
                .from('bookings')
                .select('amount')
                .eq('status', 'COMPLETED');

            const totalRevenue = (totalRevenueData || []).reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

            // Monthly Revenue (COMPLETED bookings this month)
            const { data: monthRevenueData } = await supabaseAdmin
                .from('bookings')
                .select('amount')
                .eq('status', 'COMPLETED')
                .gte('date', startOfMonth.toISOString().split('T')[0]);

            const monthRevenue = (monthRevenueData || []).reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

            // 2. Total Customers
            const { count: totalCustomers } = await supabaseAdmin
                .from('customers')
                .select('*', { count: 'exact', head: true });

            // 3. Bookings this month
            const { count: currentMonthBookings } = await supabaseAdmin
                .from('bookings')
                .select('*', { count: 'exact', head: true })
                .gte('date', startOfMonth.toISOString().split('T')[0]);

            // 4. Weekly Revenue (mock data)
            const revenueData = [
                { name: "Mon", revenue: Math.floor(Math.random() * 5000), bookings: Math.floor(Math.random() * 8) + 2 },
                { name: "Tue", revenue: Math.floor(Math.random() * 5000), bookings: Math.floor(Math.random() * 8) + 2 },
                { name: "Wed", revenue: Math.floor(Math.random() * 5000), bookings: Math.floor(Math.random() * 8) + 2 },
                { name: "Thu", revenue: Math.floor(Math.random() * 5000), bookings: Math.floor(Math.random() * 8) + 2 },
                { name: "Fri", revenue: Math.floor(Math.random() * 8000), bookings: Math.floor(Math.random() * 12) + 2 },
                { name: "Sat", revenue: Math.floor(Math.random() * 12000) + 4000, bookings: Math.floor(Math.random() * 18) + 5 },
                { name: "Sun", revenue: Math.floor(Math.random() * 14000) + 4000, bookings: Math.floor(Math.random() * 20) + 5 },
            ];

            // 5. Source Data (placeholder)
            const sourceData = [
                { name: "Walk In", value: 4 },
                { name: "Instagram", value: 3 },
                { name: "Referral", value: 2 },
                { name: "Website", value: 1 },
            ];

            // 6. Payment Modes (placeholder)
            const paymentData = [
                { name: "UPI", value: 5 },
                { name: "Cash", value: 3 },
                { name: "Card", value: 2 },
            ];

            // 7. Service Data (placeholder)
            const serviceData = [
                { name: "Cricket", bookings: 10 },
                { name: "Football", bookings: 7 },
                { name: "Badminton", bookings: 5 },
            ];

            // 8. Peak Hours (mock)
            const peakHoursData = [
                { time: "08:00", walkins: 2, prepay: 4 },
                { time: "10:00", walkins: 4, prepay: 1 },
                { time: "12:00", walkins: 1, prepay: 2 },
                { time: "16:00", walkins: 8, prepay: 5 },
                { time: "18:00", walkins: 15, prepay: 10 },
                { time: "20:00", walkins: 20, prepay: 25 },
            ];

            const bookingCount = currentMonthBookings || 0;

            return res.json({
                revenue: {
                    total: totalRevenue,
                    thisMonth: monthRevenue,
                    trend: "+5.1%",
                },
                customers: {
                    total: totalCustomers || 0,
                    trend: "+2.4%"
                },
                bookings: {
                    thisMonth: bookingCount,
                    avgValue: bookingCount > 0 ? Math.round(totalRevenue / bookingCount) : 0,
                    trend: "+12.1%"
                },
                sourceData,
                paymentData,
                serviceData,
                revenueData,
                peakHoursData
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Failed to fetch analytics" });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
};
