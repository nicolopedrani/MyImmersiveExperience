import { defineConfig } from "vite";

export default defineConfig({
  base: "/MyImmersiveExperience/",
  
  // Complete exclusion of transformers from bundling
  optimizeDeps: {
    exclude: ["@xenova/transformers", "onnxruntime-web", "onnxruntime-node", "onnxruntime-common"]
  }
});
