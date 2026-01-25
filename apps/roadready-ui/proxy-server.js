const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;
const API_URL = 'http://127.0.0.1:8888';

app.use(cors());

app.use('/api', createProxyMiddleware({
  target: API_URL,
  changeOrigin: true,
  logLevel: 'debug',
}));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔄 Proxy server running on http://0.0.0.0:${PORT}`);
  console.log(`📡 Forwarding requests to ${API_URL}`);
  console.log(`📱 Android emulator: use http://10.0.0.2:${PORT}`);
});
