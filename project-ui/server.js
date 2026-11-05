/**
 * BTR UI — Express server.
 * Serves static files and proxies /api/* to the backend.
 */
const express = require('express');
const compression = require('compression');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_URL = process.env.API_URL || 'http://project-api:8000';

// Proxy API and health requests to the backend
const apiProxy = createProxyMiddleware({
  target: API_URL,
  changeOrigin: true,
  pathFilter: ['/api', '/health'],
});
app.use(apiProxy);

// Gzip/deflate compression for all responses
app.use(compression());

// Serve static files with cache headers (1 hour for dev, increase in prod)
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1h',
  immutable: false,
}));

// SPA fallback — serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`BTR UI running on http://0.0.0.0:${PORT}`);
  console.log(`API proxy → ${API_URL}`);
});
