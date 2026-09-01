import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const key = env.VITE_GROQ_API_KEY || env.VITE_GEMINI_API_KEY || ''
  return {
    plugins: [react()],
    define: {
      '__GROQ_KEY__': JSON.stringify(key),
    },
  }
})
