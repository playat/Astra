
# 确保脚本在出错时停止执行
set -e

# 定义目标目录（可修改为你的目标路径）
TARGET_DIR="/usr/share/nginx/html/TABS/"

echo "开始执行前端构建部署..."

# 先拉取更改
echo "拉取更改中..."
git pull --rebase

# 检查是否存在package.json文件
if [ ! -f "package.json" ]; then
    echo "错误：当前目录下没有找到package.json文件"
    exit 1
fi

# 执行npm install
echo "正在安装依赖..."
pnpm install

# 执行npm run build
echo "正在构建项目..."
pnpm run build

# 检查dist目录是否存在
if [ ! -d "dist" ]; then
    echo "错误：构建后未找到dist目录"
    exit 1
fi

# 确保目标目录存在
echo "准备目标目录..."
mkdir -p "$TARGET_DIR"


# 指定要检查的目录路径
target_dir="/usr/share/nginx/html/TABS/dist"

# 检查目录是否存在
if [ -d "$target_dir" ]; then
    echo "目录 $target_dir 存在，准备删除..."
    
    # 删除目录及其所有内容
    rm -rf "$target_dir"
    
    # 验证删除结果
    if [ ! -d "$target_dir" ]; then
        echo "目录 $target_dir 已成功删除。"
    else
        echo "删除目录 $target_dir 失败！"
        exit 1
    fi
else
    echo "目录 $target_dir 不存在，无需删除。"
fi

# 移动dist目录到目标位置
echo "正在移动dist目录到 $TARGET_DIR..."
# 使用mv命令，如果目标目录已存在dist，则覆盖
mv -f dist "$TARGET_DIR"/

echo "部署完成！dist目录已移动到 $TARGET_DIR"    
