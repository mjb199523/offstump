window.supabaseClient = null;

// Start fetching immediately to save time
let envPromise = (async () => {
    try {
        // Try to get from cache first
        const cached = sessionStorage.getItem('offstump_env');
        if (cached) {
            return JSON.parse(cached);
        }

        const res = await fetch('/api/env');
        const env = await res.json();

        if (env.supabaseUrl && env.supabaseAnonKey) {
            sessionStorage.setItem('offstump_env', JSON.stringify(env));
        }
        return env;
    } catch (err) {
        console.error('Failed to pre-fetch env', err);
        return null;
    }
})();

async function initSupabase() {
    if (window.supabaseClient) return window.supabaseClient;

    const env = await envPromise;

    if (!env || !env.supabaseUrl || !env.supabaseAnonKey) {
        console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
        return null;
    }

    try {
        if (!window.supabase || !window.supabase.createClient) {
            // Wait a bit if SDK is not yet loaded (though it should be via script tags)
            await new Promise(r => setTimeout(r, 100));
        }
        window.supabaseClient = window.supabase.createClient(env.supabaseUrl, env.supabaseAnonKey);
        return window.supabaseClient;
    } catch (err) {
        console.error('Failed to init Supabase client', err);
    }
}

async function getCachedProfile(token) {
    const cached = sessionStorage.getItem('offstump_profile');
    if (cached) {
        const { profile, timestamp, cachedToken } = JSON.parse(cached);
        // Cache profile for 5 minutes, BUT ONLY IF THE TOKEN MATCHES
        if (Date.now() - timestamp < 300000 && cachedToken === token) {
            return profile;
        }
    }

    try {
        const res = await fetch('/api/me', { headers: { 'Authorization': `Bearer ${token}` } });
        const { profile } = await res.json();
        if (profile) {
            // Store the token with the profile so we know who it belongs to
            sessionStorage.setItem('offstump_profile', JSON.stringify({ profile, timestamp: Date.now(), cachedToken: token }));
        }
        return profile;
    } catch (e) {
        return null;
    }
}

function clearSessionCache() {
    sessionStorage.removeItem('offstump_env');
    sessionStorage.removeItem('offstump_profile');
}

window.initSupabase = initSupabase;
window.getCachedProfile = getCachedProfile;
window.clearSessionCache = clearSessionCache;

// Trigger init as soon as possible
(async () => {
    await initSupabase();
})();
