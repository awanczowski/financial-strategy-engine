import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Replace 'strategy-engine' with your EXACT GitHub repository name
  base: '/financial-strategy-engine/', 
})