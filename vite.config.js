import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5173,
    strictPort: true, // 이 포트가 사용 중이면 자동으로 다음 포트로 넘어가지 않고 에러를 냄
  },
  plugins: [
    react(),
    tailwindcss()
  ]
})
