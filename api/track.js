const { createClient } = require('@supabase/supabase-js');
const rateLimit = require('express-rate-limit');

// Simple rate limiter implementation for Vercel Serverless (using memory)
// Vercel serverless keeps global state as long as the instance is warm.
const ipHits = new Map();

function isRateLimited(ip) {
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxHits = 30; // 30 requests per minute

    if (!ipHits.has(ip)) {
        ipHits.set(ip, { count: 1, resetTime: now + windowMs });
        return false;
    }

    const data = ipHits.get(ip);
    if (now > data.resetTime) {
        // Reset window
        data.count = 1;
        data.resetTime = now + windowMs;
        return false;
    }

    if (data.count >= maxHits) {
        return true;
    }

    data.count++;
    return false;
}

// Allowed event names for security
const ALLOWED_EVENTS = [
    'page_view',
    'whatsapp_channel_click',
    'call_click',
    'email_click',
    'service_click',
    'contact_form_submit'
];

module.exports = async (req, res) => {
    // 1. CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); // Or strict to your domain
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 2. Simple Rate limiting
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        if (isRateLimited(ip)) {
            return res.status(429).json({ error: 'Too many requests' });
        }

        const { event_name, page_path, referrer, device, metadata } = req.body;

        // 3. Validation
        if (!event_name || !ALLOWED_EVENTS.includes(event_name)) {
            return res.status(400).json({ error: 'Invalid or missing event_name' });
        }
        if (!page_path) {
            return res.status(400).json({ error: 'Missing page_path' });
        }

        // 4. Supabase Setup
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('Supabase credentials missing');
            return res.status(500).json({ error: 'Server misconfiguration' });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // 5. Insert event
        const { error } = await supabase
            .from('events')
            .insert([
                {
                    event_name,
                    page_path,
                    referrer: referrer || '',
                    device: device || 'unknown',
                    metadata: metadata || null
                }
            ]);

        if (error) {
            console.error('Supabase insert error:', error);
            return res.status(500).json({ error: 'Failed to record event' });
        }

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Tracking API Error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
