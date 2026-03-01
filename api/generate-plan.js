const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
const { userInputSchema } = require('./_lib/schemas');
const { generatePlan } = require('./_lib/plan-generator');
const { sendNotificationEmail } = require('./_lib/sendEmail');

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

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const body = req.body;
        const parsed = userInputSchema.safeParse(body);

        if (!parsed.success) {
            return res.status(400).json({
                error: "Invalid input.",
                details: parsed.error.issues.map((i) => i.message),
            });
        }

        const plan = generatePlan(parsed.data);

        // Notify admin via email
        // We don't await this if we want fast response, but for reliability we can.
        await sendNotificationEmail(parsed.data, plan).catch(console.error);

        return res.status(200).json(plan);
    } catch (err) {
        console.error("[generate-plan]", err);
        return res.status(500).json({ error: "Internal server error." });
    }
};
