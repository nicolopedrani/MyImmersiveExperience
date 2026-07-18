import { defineConfig } from "vite";

export default defineConfig({
  base: "/MyImmersiveExperience/",
  build: {
    target: "es2022",
    sourcemap: false,
    chunkSizeWarningLimit: 900,
  },
  server: {
    port: 5173,
    open: false,
  },
});
