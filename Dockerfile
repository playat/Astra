# =========================
# 1. 构建阶段（Build Stage）
# =========================
FROM node:20 AS build

WORKDIR /app

# 启用 pnpm
RUN corepack enable && corepack prepare pnpm@10.12.3 --activate

# 先复制依赖文件
COPY package.json ./

RUN pnpm install

# 再复制全部源码
COPY . .

# 构建前端项目
RUN pnpm run build

# =========================
# 2. 运行阶段（Nginx Stage）
# =========================
FROM nginx:alpine

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 把构建产物 dist 放进 nginx 静态目录
COPY --from=build /app/dist /usr/share/nginx/html/TABS

# 暴露端口
EXPOSE 8080