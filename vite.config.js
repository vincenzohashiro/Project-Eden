import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the site from /Project-Eden/; Vercel and dev serve from /
  base: process.env.GITHUB_PAGES ? '/Project-Eden/' : '/',
  plugins: [react()],
})
