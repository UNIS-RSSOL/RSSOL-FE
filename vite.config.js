import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  build: {
    // 프로덕션 빌드 최적화
    minify: "terser",
    sourcemap: false,
    // HMR 관련 코드가 프로덕션에 포함되지 않도록 보장
    rollupOptions: {
      output: {
        // 청크 파일명 최적화
        manualChunks: undefined,
      },
    },
  },
  // 개발 서버 설정 (프로덕션에는 영향 없음)
  server: {
    host: true,
    strictPort: true,
    hmr: {
      host: 'localhost',
      protocol: 'ws',
      port: 5173,
    }
  },
});
