import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Resolve proxy target from .env: API_PROXY_TARGET, VITE_PROXY_TARGET, or VITE_API_URL
  const rawTarget =
    env.API_PROXY_TARGET ||
    env.VITE_PROXY_TARGET ||
    process.env.API_PROXY_TARGET ||
    (env.VITE_API_URL && /^https?:\/\//i.test(env.VITE_API_URL) ? env.VITE_API_URL : '') ||
    'http://localhost:5000';

  // Strip trailing /api and slashes since Vite proxy forwards the /api path
  const proxyTarget = rawTarget.replace(/\/api\/?$/, '').replace(/\/+$/, '') || 'http://localhost:5000';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Dev: forward API calls to the Express server (see server/README.md).
      proxy: {
        // `ws: true` also forwards the chat WebSocket at /api/ws.
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          ws: true,
        },
      },
    },
  };
});
