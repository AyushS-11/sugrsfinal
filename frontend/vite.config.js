import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist',
        sourcemap: false,
        minify: 'terser',
        rollupOptions: {
            output: {
                manualChunks: undefined
            }
        }
    },
    server: {
        proxy: {
            '/api': 'http://localhost:8080',
            '/uploads': 'http://localhost:8080',
        }
    }
})
