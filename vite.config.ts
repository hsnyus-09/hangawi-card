import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  base: "./",
  build: {
    outDir: "dist/site",
    emptyOutDir: true,
    rollupOptions: {
      input: "index.html"
    }
  }
});
