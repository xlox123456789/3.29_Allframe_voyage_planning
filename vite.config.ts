import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/3.29_Allframe_voyage_planning/', // 前後都要有斜線
})
