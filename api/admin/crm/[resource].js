module.exports = async (req, res) => {
    const { resource } = req.query;

    // Safety check against path traversal
    if (!resource || typeof resource !== 'string' || resource.includes('.') || resource.includes('/')) {
        return res.status(400).json({ error: "Invalid resource path" });
    }

    try {
        const handler = require(`../../../api/_lib/crm/${resource}.js`);
        return await handler(req, res);
    } catch (err) {
        console.error("Failed to load CRM resource:", err.message);
        return res.status(404).json({ error: "Endpoint not found or error loading handler" });
    }
};
