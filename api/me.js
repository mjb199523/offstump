const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(supabaseUrl, adminKey);

    // Debug logging
    console.log(`[api/me] Method: ${req.method}, Action: ${req.body?.action || 'none'}`);

    // Manual body parsing if needed (sometimes req.body is a string in certain environments)
    let body = req.body;
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) { }
    }

    // 1. PUBLIC ACTION: Verify and consume ticket (Atomic One-Time)
    if (req.method === 'POST' && body?.action === 'verify_ticket') {
        const { ticket } = body;

        // SECURITY: Never cache this verification attempt
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('X-Security-Version', '2.0.0-Atomic');

        if (!ticket || ticket === "null" || ticket === "undefined") {
            return res.status(403).json({ verified: false, error: 'Access Denied: Ticket ID missing' });
        }

        console.log(`[SECURITY] Atomic attempt for ticket: ${ticket}`);

        // Call the Atomic DB Function (Verify + Wipe)
        const { data, error: rpcErr } = await supabaseAdmin.rpc('verify_and_consume_bmi_ticket', {
            p_ticket: ticket
        });

        // If data is empty, it means the ticket was ALREADY wiped or doesn't exist
        if (rpcErr || !data || data.length === 0) {
            console.error(`[SECURITY] BLOCKED: Ticket ${ticket} is already CONSUMED.`);
            return res.status(403).json({
                verified: false,
                error: 'SECURE LINK EXPIRED: This link can only be used once.'
            });
        }

        const emailFound = data[0].verified_email;
        console.log(`[SECURITY] GRANTED: One-time access for ${emailFound}`);

        return res.status(200).json({
            verified: true,
            email: emailFound,
            consumed: true,
            timestamp: Date.now()
        });
    }

    // AUTHENTICATED ACTIONS (Needs token from headers)
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });

    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' });

    // 2. Action: Generate a new One-Time Ticket
    if (req.method === 'POST' && body?.action === 'generate_ticket') {
        const ticketId = require('crypto').randomUUID();
        const expiresAt = new Date(Date.now() + 15000).toISOString(); // 15 seconds

        const { error: updateErr } = await supabaseAdmin
            .from('profiles')
            .update({ bmi_ticket: ticketId, bmi_ticket_expires: expiresAt })
            .eq('id', user.id);

        if (updateErr) return res.status(500).json({ error: updateErr.message });
        return res.status(200).json({ ticket: ticketId });
    }

    // Default for POST (if no action matched)
    if (req.method === 'POST') {
        return res.status(400).json({ error: 'Invalid action' });
    }

    // Default: Fetch the profile (usually GET)
    const { data: profile, error: profileErr } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileErr) return res.status(500).json({ error: profileErr.message });
    return res.status(200).json({ profile });
};
