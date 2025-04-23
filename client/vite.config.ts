import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dotenv from 'dotenv';
import { logInfo } from '../server/src/utils/logger'

dotenv.config({ path: "../server/.env" });
logInfo(process.env.FRONTEND_PORT);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    host: '0.0.0.0',
    port: 3001,
  },
})
