#!/usr/bin/env bash
set -euo pipefail
export LANG=en_US.UTF-8

ESC=$'\033'
TERM_W=$(tput cols 2>/dev/null || echo 80)
CONTENT_W=$((TERM_W - 6))

# ── 参数解析 ──────────────────────────────────────────────
MSG=""
TAGS=()
VERSION=false
TEST=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        -m) MSG="$2"; shift 2 ;;
        -v) VERSION=true; shift ;;
        -t) TEST=true; shift ;;
        *)  TAGS+=("$1"); shift ;;
    esac
done

# ── 工具函数 ──────────────────────────────────────────────

# 计算字符串显示宽度（CJK 字符算 2 列）
display_width() {
    local str="$1"
    local chars=${#str}
    # 快速路径：字节数=字符数 → 纯 ASCII
    local bytes
    bytes=$(printf '%s' "$str" | wc -c)
    bytes=${bytes// /}
    if [[ "$bytes" -eq "$chars" ]]; then
        echo "$chars"
        return
    fi
    # 有宽字符：用 byte_len - char_len 估算（3字节UTF-8=宽字符=2列）
    # 每个宽字符比 ASCII 多占 2 字节，显示占 2 列
    # total_width = chars + wide_count
    # wide_count = (bytes - chars) / 2
    echo $(( chars + (bytes - chars) / 2 ))
}

# 命名颜色 → HEX 映射
declare -A COLOR_MAP=(
    [Black]="#000000" [Red]="#FF0000" [Green]="#00FF00" [Yellow]="#FFFF00"
    [Blue]="#0000FF" [Magenta]="#FF00FF" [Cyan]="#00FFFF" [White]="#FFFFFF"
    [DarkGray]="#808080" [Orange]="#FF8800"
)

# HEX 颜色 → ANSI 转义码（统一入口）
ansi_color() {
    local color="$1"
    local hex

    # 命名颜色转 HEX
    if [[ -v COLOR_MAP["$color"] ]]; then
        hex="${COLOR_MAP[$color]}"
    else
        hex="$color"
    fi

    # 补全无 # 前缀
    [[ "$hex" =~ ^[0-9A-Fa-f]{6}$ ]] && hex="#$hex"

    # 解析 #RRGGBB
    if [[ "$hex" =~ ^#([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$ ]]; then
        printf '%s[38;2;%d;%d;%dm' "$ESC" "0x${BASH_REMATCH[1]}" "0x${BASH_REMATCH[2]}" "0x${BASH_REMATCH[3]}"
    else
        printf '%s[37m' "$ESC"
    fi
}

# 打印一行带边框的文本
write_line() {
    local line_text="$1"
    local width="$2"
    local border_color="$3"
    local text_color="$4"

    local dw bc tc
    dw=$(display_width "$line_text")
    local pad=$((width - dw))
    [[ $pad -lt 0 ]] && pad=0
    bc=$(ansi_color "$border_color")
    tc=$(ansi_color "$text_color")

    printf '%s|  %s%s%*s%s  |%s\n' "$bc" "${ESC}[0m" "$tc$line_text" "$pad" "" "${ESC}[0m$bc" "${ESC}[0m"
}

# 自动换行的彩色框文本
write_boxed_text() {
    local text="$1"
    local border_color="${2:-White}"
    local text_color="${3:-Green}"

    local current_line=""
    local word
    for word in $text; do
        local candidate
        if [[ -z "$current_line" ]]; then
            candidate="$word"
        else
            candidate="$current_line $word"
        fi
        if [[ $(display_width "$candidate") -le $CONTENT_W ]]; then
            current_line="$candidate"
        else
            [[ -n "$current_line" ]] && write_line "$current_line" "$CONTENT_W" "$border_color" "$text_color"
            current_line="$word"
        fi
    done

    [[ -n "$current_line" ]] && write_line "$current_line" "$CONTENT_W" "$border_color" "$text_color"
}

# 顶部/底部装饰线
write_separator() {
    local color="$1"
    local c
    c=$(ansi_color "$color")
    local dashes
    printf -v dashes '%*s' $((TERM_W - 2)) ''
    dashes=${dashes// /-}
    printf '%s+%s+%s\n' "$c" "$dashes" "${ESC}[0m"
}

# ── Tag 功能 ──────────────────────────────────────────────

new_and_push_tag() {
    local base_tag="$1"
    write_separator "Yellow"

    local tag="${base_tag}-$(date '+%Y-%m-%d-%H-%M-%S')"
    write_boxed_text "tag: $tag" "Yellow" "Green"

    if [[ -n "$(git tag -l "$tag")" ]]; then
        write_boxed_text "tag already exists, skipping" "Yellow" "Yellow"
        return
    fi

    write_boxed_text ">> GIT WRITE" "Yellow" "Yellow"
    git tag "$tag"

    git push origin "$tag" 2>&1 | while IFS= read -r line; do
        if [[ "${line,,}" =~ error|failed|fatal ]]; then
            write_boxed_text "$line" "Red" "Red"
        elif [[ "${line,,}" =~ done|success|"up to date" ]]; then
            write_boxed_text "$line" "Green" "Green"
        else
            write_boxed_text "$line" "Yellow" "White"
        fi
    done

    write_boxed_text "$tag created and pushed" "Yellow" "Green"
    write_separator "Yellow"
}

# 处理 git 输出，按颜色分类显示
process_git_output() {
    local border_color="$1"
    local text_color="$2"
    local error_exit="${3:-false}"

    while IFS= read -r line; do
        if [[ "${line,,}" =~ error|failed|fatal ]]; then
            write_boxed_text "$line" "$border_color" "Red"
            $error_exit && return 1
        else
            write_boxed_text "$line" "$border_color" "$text_color"
        fi
    done
}

# ── test ──────────────────────────────────────────────────

if $TEST; then
    write_separator "Yellow"
    write_boxed_text "Commit message: 到最深处纵然那只是一瞬间" "Blue" "#d7834f"
    write_boxed_text "-" "Red" "Green"
    write_boxed_text "Named: Red border, Green text" "Red" "Green"
    write_boxed_text "HEX with #: #d7834f border, #3498db text" "#d7834f" "#3498db"
    write_boxed_text "HEX without #: d7834f border, 3498db text" "d7834f" "3498db"
    write_boxed_text "HEX short: #FF0000 border, #00FF00 text" "#FF0000" "#00FF00"
    write_boxed_text "RGB: 255,128,0 border, 0,200,255 text" "255,128,0" "0,200,255"
    write_separator "Yellow"
    exit 0
fi

# ── version ───────────────────────────────────────────────

if $VERSION; then
    echo -e "${ESC}[32mVersion: 0.0.1${ESC}[0m"
    exit 0
fi

# ── commit ────────────────────────────────────────────────

if [[ -n "$MSG" ]]; then
    write_separator "Blue"
    write_boxed_text "Commit message: $MSG" "Blue" "#d7834f"

    git add . 2>&1 | process_git_output "Blue" "#d7834f" true
    git commit -m "$MSG" 2>&1 | process_git_output "Blue" "#d7834f" true
    git pull 2>&1 | process_git_output "Blue" "#d7834f" true
    git push 2>&1 | process_git_output "Blue" "#d7834f" false

    write_boxed_text "Code pushed to origin" "Blue" "d7834f"
    write_separator "Blue"
fi

# ── tags ──────────────────────────────────────────────────

for tag_name in "${TAGS[@]}"; do
    [[ -z "$tag_name" ]] && continue
    new_and_push_tag "$tag_name"
done

echo -e "${ESC}[34mDone${ESC}[0m"
