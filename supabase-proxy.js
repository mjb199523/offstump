const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
app.use(cors({ origin: true, credentials: true }));

const SUPABASE_HOST = 'mdopzwhzofuasaittzzz.supabase.co';
const CLOUDFLARE_IP = 'https://104.18.38.10';

app.use('/', createProxyMiddleware({
    target: CLOUDFLARE_IP,
    changeOrigin: true,
    secure: false,
    headers: {
        Host: SUPABASE_HOST
    },
    // Ensure we don't send the Host header of localhost to the target
    onProxyReq: (proxyReq) => {
        proxyReq.setHeader('Host', SUPABASE_HOST);
    }
}));

const PORT = 54321;
app.listen(PORT, () => {
    console.log(`✅ Supabase Proxy running on http://localhost:${PORT}`);
});
