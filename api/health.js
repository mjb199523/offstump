// =============================================
// OFFSTUMP — Vercel Serverless Function
// GET /api/health
// =============================================

module.exports = (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    res.json({
        success: true,
        status: 'running',
        platform: 'Vercel',
        emailConfigured: !!process.env.EMAIL_PASS,
        emailUser: process.env.EMAIL_USER ? 'set' : 'missing',
        emailPass: process.env.EMAIL_PASS ? 'set (' + process.env.EMAIL_PASS.length + ' chars)' : 'missing',
        adminEmail: process.env.ADMIN_EMAIL ? 'set' : 'missing',
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    });
};
