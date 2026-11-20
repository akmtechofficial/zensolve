import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import handler from './api/notify-admin.js';

dotenv.config();

const apiNotificationPlugin = () => ({
  name: 'api-notification-plugin',
  configureServer(server) {
    server.middlewares.use('/api/notify-admin', async (req, res) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', async () => {
        try {
          req.body = JSON.parse(body || '{}');
        } catch {
          req.body = {};
        }

        res.status = (code) => {
          res.statusCode = code;
          return res;
        };
        res.json = (data) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        };

        try {
          await handler(req, res);
        } catch (err) {
          console.error('API notification error:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    });
  },
});

export default defineConfig({
  plugins: [react(), apiNotificationPlugin()],
  server: {
    port: 3000,
    open: false,
  },
  build: {
    outDir: 'dist',
  },
});
