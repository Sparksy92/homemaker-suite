import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [
        react(),
        VitePWA({
            registerType: 'prompt',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
            manifest: {
                name: 'Homemaker Suite',
                short_name: 'Homemaker',
                description: 'Live Off the Land - Hybrid Knowledgebase & Tool Suite',
                theme_color: '#364d36',
                background_color: '#f4f1de',
                display: 'standalone',
                orientation: 'portrait',
                scope: '/',
                start_url: '/',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
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
                cleanupOutdatedCaches: true,
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com/,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'google-fonts-stylesheets'
                        }
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-webfonts',
                            expiration: {
                                maxEntries: 30,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    }
                ]
            }
        })
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        host: true,
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                if (req.url.startsWith('/offline-survival-library/')) {
                    const relativePath = decodeURIComponent(req.url.substring('/offline-survival-library/'.length).split('?')[0]);
                    const absolutePath = path.join('C:\\Users\\Blair\\Downloads\\survival\\picked out material for app', relativePath);
                    
                    if (fs.existsSync(absolutePath)) {
                        const stat = fs.statSync(absolutePath);
                        if (stat.isFile()) {
                            const ext = path.extname(absolutePath).toLowerCase();
                            let contentType = 'application/octet-stream';
                            if (ext === '.pdf') contentType = 'application/pdf';
                            else if (ext === '.mp4') contentType = 'video/mp4';
                            else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
                            else if (ext === '.png') contentType = 'image/png';
                            else if (ext === '.txt') contentType = 'text/plain; charset=utf-8';
                            else if (ext === '.epub') contentType = 'application/epub+zip';

                            res.writeHead(200, {
                                'Content-Type': contentType,
                                'Content-Length': stat.size,
                                'Access-Control-Allow-Origin': '*'
                            });
                            fs.createReadStream(absolutePath).pipe(res);
                            return;
                        }
                    } else {
                        const ext = path.extname(absolutePath).toLowerCase();
                        if (ext === '.pdf') {
                            const zipPath = absolutePath.substring(0, absolutePath.length - 4) + '.zip';
                            if (fs.existsSync(zipPath)) {
                                try {
                                    const folderPath = path.dirname(zipPath);
                                    const escapedZip = zipPath.replace(/'/g, "''");
                                    const escapedFolder = folderPath.replace(/'/g, "''");
                                    const cmd = `powershell.exe -Command "Expand-Archive -Path '${escapedZip}' -DestinationPath '${escapedFolder}' -Force"`;
                                    execSync(cmd);

                                    if (fs.existsSync(absolutePath)) {
                                        const stat = fs.statSync(absolutePath);
                                        res.writeHead(200, {
                                            'Content-Type': 'application/pdf',
                                            'Content-Length': stat.size,
                                            'Access-Control-Allow-Origin': '*'
                                        });
                                        fs.createReadStream(absolutePath).pipe(res);
                                        return;
                                    }
                                } catch (error) {
                                    console.error("Error unzipping PDF on-demand:", error);
                                }
                            }
                        }
                    }
                }
                next();
            });
        }
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.js'
    }
})
