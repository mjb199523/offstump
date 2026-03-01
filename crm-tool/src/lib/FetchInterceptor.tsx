"use client";

if (typeof window !== 'undefined' && !(window as any)._fetchProxied) {
    (window as any)._fetchProxied = true;
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
        let [resource, config] = args;

        let url = typeof resource === 'string' ? resource : resource instanceof URL ? resource.toString() : (resource as Request).url;

        if (url.startsWith('/api/')) {
            if (url.startsWith('/api/analytics/dashboard')) {
                url = '/api/admin/crm/dashboard';
            } else {
                const urlParts = url.split('?');
                const pathParts = urlParts[0].split('/').filter(Boolean);

                // api, entity, id
                if (pathParts.length === 2) {
                    url = `/api/admin/crm/${pathParts[1]}`;
                } else if (pathParts.length === 3) {
                    url = `/api/admin/crm/${pathParts[1]}?id=${pathParts[2]}`;
                }
            }

            config = config || {};
            const newHeaders = new Headers(config.headers || {});

            try {
                const sbTokenRaw = sessionStorage.getItem('offstump_profile');
                if (sbTokenRaw) {
                    const parsed = JSON.parse(sbTokenRaw);
                    if (parsed.cachedToken) {
                        newHeaders.set('Authorization', `Bearer ${parsed.cachedToken}`);
                    }
                }
            } catch (e) { }

            config.headers = newHeaders;
            if (typeof resource !== 'string' && !(resource instanceof URL)) {
                return originalFetch(url, config);
            }
            return originalFetch(url, config);
        }

        return originalFetch(...args);
    };
}

export default function FetchInterceptor() {
    return null;
}
