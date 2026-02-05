import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    fs: {
      allow: ['..'],
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'Learnify',
        short_name: 'Learnify',
        description: 'AI-Powered Learning Platform with VR, Smart Notes, and Gamification',
        theme_color: '#8b5cf6',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

        // ✅ FIX — allow large assets to be cached
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,

        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5
              },
              networkTimeoutSeconds: 10
            }
          }
        ]
      }
    }),

    // Custom plugin to handle CWASA file requests
    {
      name: 'cwasa-file-handler',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || '';
          const jasMatch = url.match(/\/jas\/loc2021\/(.*)/);

          if (jasMatch) {
            const relativePath = jasMatch[1].split('?')[0];
            const filePath = path.join(__dirname, 'public', 'jas', 'loc2021', relativePath);

            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              let contentType = 'application/octet-stream';
              if (url.endsWith('.json')) contentType = 'application/json';
              else if (url.endsWith('.jar')) contentType = 'application/java-archive';
              else if (url.endsWith('.properties')) contentType = 'text/plain';
              else if (url.endsWith('.sigml')) contentType = 'application/xml';

              res.setHeader('Content-Type', contentType);
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Cache-Control', 'no-cache');
              return fs.createReadStream(filePath).pipe(res);
            }
          }

          next();
        });
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  assetsInclude: ['**/*.jar', '**/*.sigml', '**/*.properties'],
}));
