import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const env = loadEnv(process.env.NODE_ENV, process.cwd(), ""); // 第三个参数为空表示加载所有变量

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    // 在导入模块时，如果模块路径不包含文件扩展名，则会尝试添加下面这些扩展名
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 8989,
    proxy: {
      "/api": {
        target: env.VITE_API_URL,
        rewrite(path) {
          return path.replace(/^\/api/, "");
        },
      },
      "/su": {
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/su/, ""),
        target: env.VITE_SEARCH_SU_API,
        ws: false,
      },
    },
  },
  build: {
    // 自定义缓存目录（可选）
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // 优化长期缓存（关键！）
        chunkFileNames: "assets/chunks/[name]-[hash].js",
        // 资源文件（图片、字体等）
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name?.split(".").at(1);
          const isFont = ["ttf", "woff", "woff2"].includes(extType);
          const isImage = ["png", "jpg", "jpeg", "gif", "svg"].includes(
            extType
          );

          if (isImage) {
            return "assets/img/[name]-[hash][extname]";
          }
          if (isFont) {
            return "assets/fonts/[name]-[hash][extname]";
          }
          return "assets/[ext]/[name]-[hash][extname]";
        },
        manualChunks(id: any): string | undefined {
          if (id.includes("node_modules")) {
            const parts = id.toString().split("node_modules/");

            if (parts.length > 2) {
              return parts[2].split("/")[0].toString();
            }
          }
          return undefined;
        },
      },
    },
  },
});
