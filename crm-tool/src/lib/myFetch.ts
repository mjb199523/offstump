export async function myFetch(url: string, options: any = {}) {
    const isClient = typeof window !== 'undefined';
    let token = '';

    if (isClient) {
        // 1. Try auth-client's custom storage first
        try {
            const sbTokenRaw = sessionStorage.getItem('offstump_profile') || localStorage.getItem('offstump_profile');
            if (sbTokenRaw) {
                const parsed = JSON.parse(sbTokenRaw);
                token = parsed.cachedToken || '';
            }
        } catch (e) {
            console.error('Failed to get token from profile cache', e);
        }

        // 2. If no token, scan for native supabase keys in localStorage
        if (!token) {
            try {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
                        const raw = localStorage.getItem(key);
                        if (raw) {
                            const parsed = JSON.parse(raw);
                            if (parsed.access_token) {
                                token = parsed.access_token;
                                break;
                            }
                        }
                    }
                }
            } catch (e) {
                console.error('Failed to get native supabase token', e);
            }
        }
    }

    const headers = {
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    // Rewrite URL to hit the main app's admin endpoints
    let newUrl = url;
    if (newUrl.startsWith('/api/analytics/dashboard')) {
        newUrl = '/api/admin/crm/dashboard';
    } else if (newUrl.startsWith('/api/')) {
        const parts = newUrl.split('/');
        // e.g. /api/customers -> /api/admin/crm/customers
        // e.g. /api/customers/123 -> /api/admin/crm/customers?id=123
        if (parts.length === 3) {
            newUrl = `/api/admin/crm/${parts[2]}`;
        } else if (parts.length === 4) {
            newUrl = `/api/admin/crm/${parts[2]}?id=${parts[3]}`;
        }
    }

    return fetch(newUrl, { ...options, headers });
}
