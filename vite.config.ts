import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  base: mode === 'developement' ? '' : '/service-worker-tech-session/', // Github Repo name
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'sw_demo_bundle.js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name][extname]'
      }
    }
  }
}));
