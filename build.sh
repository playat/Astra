
# 确保脚本在出错时停止执行
set -e

# 定义目标目录（可修改为你的目标路径）
TARGET_DIR="/usr/share/nginx/html/TABS/"

echo -e "\033[33m 开始执行前端构建部署... \033[0m"

# 先拉取更改
echo -e "\033[33m 拉取更改中... \033[0m"
git pull --rebase

# 检查是否存在package.json文件
if [ ! -f "package.json" ]; then
    echo -e "\033[31m 错误：当前目录下没有找到package.json文件 \033[0m"
    exit 1
fi

# 执行npm install
echo -e "\033[33m 正在安装依赖... \033[0m"
pnpm install

# 执行npm run build
echo -e "\033[33m 正在构建项目... \033[0m"
pnpm run build

# 检查dist目录是否存在
if [ ! -d "dist" ]; then
    echo -e "\033[31m 错误：构建后未找到dist目录 \033[0m"
    exit 1
fi

# 确保目标目录存在
echo -e "\033[33m 准备目标目录... \033[0m"
mkdir -p "$TARGET_DIR"


# 指定要检查的目录路径
target_dir="/usr/share/nginx/html/TABS/dist"

# 检查目录是否存在
if [ -d "$target_dir" ]; then
    echo -e "\033[33m 目录 $target_dir 存在，准备删除... \033[0m"
    
    # 删除目录及其所有内容
    rm -rf "$target_dir"
    
    # 验证删除结果
    if [ ! -d "$target_dir" ]; then
        echo -e "\033[32m 目录 $target_dir 已成功删除。 \033[0m"
    else
        echo -e "\033[31m 删除目录 $target_dir 失败！ \033[0m"
        exit 1
    fi
else
    echo -e "\033[36m 目录 $target_dir 不存在，无需删除。 \033[0m"
fi

# 移动dist目录到目标位置
echo -e "正在移动dist目录到 \033[32m $TARGET_DIR \033[0m"
# 使用mv命令，如果目标目录已存在dist，则覆盖
mv -f dist "$TARGET_DIR"/

echo -e "\033[32m 部署完成！dist目录已移动到 $TARGET_DIR \033[0m"    
