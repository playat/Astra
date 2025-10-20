
# 确保脚本在出错时停止执行
set -e

# 定义目标目录（可修改为你的目标路径）
TARGET_DIR="/usr/share/nginx/html/TABS"

echo -e "\033[33m -------------------启动前端构建部署------------------- \033[0m"
echo -e "目标路径：\033[33m $TARGET_DIR \033[0m"

# 先拉取更改
echo -e "\033[33m 拉取更新... \033[0m"
git pull --rebase
echo -e "\033[32m 拉取完成 \033[0m"

# 执行npm install
echo -e "\033[33m 安装依赖... \033[0m"
pnpm install
echo -e "\033[32m 安装完成 \033[0m"

# 执行npm run build
echo -e "\033[33m 构建项目... \033[0m"
pnpm run build
echo -e "\033[32m 构建完成 \033[0m"

# 确保目标目录存在
echo -e "\033[33m 准备目录... \033[0m"
mkdir -p "$TARGET_DIR"
echo -e "\033[32m 准备完成 \033[0m"

# 移除原有的版本
echo -e "\033[33m 移除上一个版本... \033[0m"
rm -rf "$TARGET_DIR/dist"
echo -e "\033[32m 移除完成 \033[0m"

# 移动dist目录到目标位置
echo -e "\033[32m 部署中... \033[0m"
mv -f dist "$TARGET_DIR"
echo -e "\033[32m 部署完成！ \033[0m"    
