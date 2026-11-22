import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config();

const apiNotificationPlugin = () => ({
  name: 'api-notification-plugin',
  apply: 'serve',
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
          const { default: handler } = await import('./api/notify-admin.js');
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
