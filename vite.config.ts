import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

/**
 * Origin of the backend's local media driver (`MEDIA_PUBLIC_BASE_URL`), whose image URLs are
 * absolute. Dev/preview only: production serves media from Cloudinary (docs/csp.md).
 */
const LOCAL_MEDIA_ORIGIN = 'http://localhost:3000';

const csp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  `img-src 'self' data: blob: https://res.cloudinary.com ${LOCAL_MEDIA_ORIGIN}`,
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const proxy = {
  '/admin/v1': { target: 'http://localhost:3000', changeOrigin: false },
  '/media-files': { target: 'http://localhost:3000' },
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    // CSP `font-src 'self'` blocks `data:` fonts, so never inline them (Vite inlines files < 4 KiB).
    assetsInlineLimit: (file) => (/\.woff2?$/.test(file) ? false : undefined),
  },
  server: { port: 5173, strictPort: true, proxy },
  preview: { port: 5173, proxy, headers: { 'Content-Security-Policy': csp } },
  test: {
    environment: 'jsdom',
    // Same origin as the MSW base URL (http://localhost/admin/v1) so jsdom's XHR skips CORS.
    environmentOptions: { jsdom: { url: 'http://localhost/' } },
    globals: true,
    setupFiles: ['src/test/setup.ts'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
  },
});
