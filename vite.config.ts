import { defineConfig } from "vite";

export default defineConfig({
  // GitHub Pages repository name
  base: "/MyImmersiveExperience/",
  
  // Target modern browsers for WebGPU support
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks: {
          // Keep game logic separate for better caching
          game: [
            './src/modules/canvas.ts',
            './src/modules/player.ts',
            './src/modules/roomManager.ts'
          ]
        }
      }
    }
  },
  
  // Development server configuration
  server: {
    port: 5173,
    open: true
  },
  
  // TypeScript configuration
  esbuild: {
    target: 'es2022'
  }
});
