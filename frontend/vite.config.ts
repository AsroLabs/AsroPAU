import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		host: '0.0.0.0',
		port: 5173,
		strictPort: false,
		hmr: {
			host: 'localhost',
			port: 5173,
			protocol: 'ws'
		},
		proxy: {
			// Math solver must be listed first — more specific prefix wins
			'/api/solve': {
				target: process.env.MATH_SOLVER_PROXY_TARGET ?? 'http://localhost:8001',
				changeOrigin: true,
			},
			'/api/critical-points': {
				target: process.env.MATH_SOLVER_PROXY_TARGET ?? 'http://localhost:8001',
				changeOrigin: true,
			},
			'/api': {
				target: process.env.API_PROXY_TARGET ?? 'http://localhost:3000',
				changeOrigin: true,
			}
		}
	},


});
