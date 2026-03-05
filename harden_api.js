const fs = require('fs');
const path = require('path');

const apiRoot = path.join(__dirname, 'api');

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const full = path.join(dir, f);
        if (f.endsWith('.js')) {
            let content = fs.readFileSync(full, 'utf8');

            // Re-bootstrap correctly
            if (!content.includes("require('dotenv')")) {
                content = "const path = require('path');\nrequire('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });\n" + content;
            }

            // Patch lookups to be multi-name compatible
            content = content.replace(/process\.env\.NEXT_PUBLIC_SUPABASE_URL/g, "(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)");
            content = content.replace(/process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY/g, "(process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)");

            // Note: Service Role Key is almost always called exactly that, but let's be safe.
            // If it's already using process.env.SUPABASE_SERVICE_ROLE_KEY, it's fine.

            fs.writeFileSync(full, content);
            // console.log(`Processed ${f}`);
        }
    }
}

// Ensure CRM grouping is fixed as well
walk(path.join(apiRoot));
walk(path.join(apiRoot, 'admin'));
walk(path.join(apiRoot, 'admin', 'crm'));
walk(path.join(apiRoot, '_lib'));
walk(path.join(apiRoot, '_lib', 'crm'));
