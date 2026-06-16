param (
    [switch]$v,
    [switch]$t
)

$ESC = [char]27

# 手动解析参数
$m = $null
$argsList = @()

for ($i = 0; $i -lt $args.Count; $i++) {
    $curArg = $args[$i]
    if ($curArg -eq "-m") {
        # 获取 -m 后面的值
        if ($i + 1 -lt $args.Count) {
            $m = $args[$i + 1]
            $i++  # 跳过下一个参数
        }
    }
    else {
        if ($curArg -notlike "-*") {
            # 非 -m 参数收集到 $argsList
            $argsList += $args[$i]
        }
    }
}

# 测试输出
# Write-Host "`$m = '$m'"
# Write-Host "`$argsList = @($($argsList -join ', '))"
# Write-Host "$($v)"

# exit 1

function Get-AnsiColor {
    param([string]$Color)

    # 已经是 ANSI
    if ($Color -match "^$ESC\[") {
        return $Color
    }

    # RGB: 255,0,0
    if ($Color -match '^(\d{1,3}),(\d{1,3}),(\d{1,3})$') {
        return "$ESC[38;2;$($Matches[1]);$($Matches[2]);$($Matches[3])m"
    }

    # 补全无 # 前缀的 HEX
    $hex = $Color
    if ($hex -match '^[0-9A-Fa-f]{3,6}$') {
        $hex = "#$hex"
    }

    # HEX: #FF0000 或 #F00
    if ($hex -match '^#([0-9A-Fa-f]{6})$') {
        $h = $Matches[1]
        $r = [Convert]::ToInt32($h.Substring(0,2),16)
        $g = [Convert]::ToInt32($h.Substring(2,2),16)
        $b = [Convert]::ToInt32($h.Substring(4,2),16)
        return "$ESC[38;2;$r;$g;${b}m"
    }
    if ($hex -match '^#([0-9A-Fa-f]{3})$') {
        $h = $Matches[1]
        $r = [Convert]::ToInt32($h[0]+$h[0],16)
        $g = [Convert]::ToInt32($h[1]+$h[1],16)
        $b = [Convert]::ToInt32($h[2]+$h[2],16)
        return "$ESC[38;2;$r;$g;${b}m"
    }

    # ConsoleColor映射
    $map = @{
        Black   = "30"
        Red     = "31"
        Green   = "32"
        Yellow  = "33"
        Blue    = "34"
        Magenta = "35"
        Cyan    = "36"
        White   = "37"
    }

    if ($map.ContainsKey($Color)) {
        return "$ESC[$($map[$Color])m"
    }

    return "$ESC[37m"
}

function Write-Line {
    param(
        $lineText,
        $width,
        $borderColor,
        $textColor
    )

    $line = $lineText.PadRight($width)

    $bc = Get-AnsiColor $borderColor
    $tc = Get-AnsiColor $textColor

    Write-Host "$bc|  $ESC[0m$tc$line$ESC[0m$bc  |$ESC[0m"
}

function Write-BoxedText {
    param(
        [string]$Text,
        [string]$BorderColor = "DarkGray",
        [string]$TextColor = "Green"
    )

    $width = $Host.UI.RawUI.WindowSize.Width
    $contentWidth = $width - 6

    $words = $Text -split "\s+"
    $currentLine = ""

    foreach ($word in $words) {
        if (($currentLine + " " + $word).Trim().Length -le $contentWidth) {
            $currentLine = ($currentLine + " " + $word).Trim()
        }
        else {
            Write-Line $currentLine $contentWidth $BorderColor $TextColor
            $currentLine = $word
        }
    }

    if ($currentLine) {
        Write-Line $currentLine $contentWidth $BorderColor $TextColor
    }
}

function New-AndPushTag {
    param (
        [string]$BaseTag
    )

    Write-Host ("+$('-' * ($Host.UI.RawUI.WindowSize.Width - 2))+") -ForegroundColor Yellow

    $tag = "$BaseTag-$(Get-Date -Format 'yyyy-MM-dd-HH-mm-ss')"

    Write-BoxedText "tag: $tag" -BorderColor Yellow -TextColor Green

    $exists = git tag -l $tag

    if ($exists) {
        Write-BoxedText "tag already exists, skipping" -BorderColor Yellow -TextColor Yellow
        return
    }

    Write-BoxedText ">> GIT WRITE" "Yellow" "Yellow"

    git tag $tag

    git push origin $tag 2>&1 | ForEach-Object {
        $line = $_.ToString()

        if ($line -match "error|failed|fatal") {
            Write-BoxedText $line "Red" "Red"
        }
        elseif ($line -match "done|success|up to date") {
            Write-BoxedText $line "Green" "Green"
        }
        else {
            Write-BoxedText $line "Yellow" "White"
        }
    }

    Write-BoxedText "$tag created and pushed" -BorderColor Yellow -TextColor Green

    Write-Host ("+$('-' * ($Host.UI.RawUI.WindowSize.Width - 2))+") -ForegroundColor Yellow
}

# test
if ($t) {
    Write-BoxedText "Named: Red border, Green text" -BorderColor Red -TextColor Green
    Write-BoxedText "HEX with #: #d7834f border, #3498db text" -BorderColor '#d7834f' -TextColor '#3498db'
    Write-BoxedText "HEX without #: d7834f border, 3498db text" -BorderColor 'd7834f' -TextColor '3498db'
    Write-BoxedText "Short HEX: #F00 border, #0F0 text" -BorderColor '#F00' -TextColor '#0F0'
    Write-BoxedText "RGB: 255,128,0 border, 0,200,255 text" -BorderColor '255,128,0' -TextColor '0,200,255'
    exit 0
}

# version
if ($v) {
    Write-Host "Version: 0.0.1" -ForegroundColor Green
    exit 0
}

# commit
if ($m) {
    Write-Host ("+$('-' * ($Host.UI.RawUI.WindowSize.Width - 2))+") -ForegroundColor Blue 
    Write-BoxedText "Commit message: $m" -BorderColor Blue -TextColor '#d7834f'

    git add .

    git commit -m "$m" 2>&1 | ForEach-Object {
        $line = $_.ToString()
        if ($line -match "error|failed|fatal") {
            Write-BoxedText $line -BorderColor Blue -TextColor Red
            exit 1
        } else {
            Write-BoxedText $line -BorderColor Blue -TextColor '#d7834f'
        }
    }

    git pull 2>&1 | ForEach-Object {
        $line = $_.ToString()
        if ($line -match "error|failed|fatal") {
            Write-BoxedText $line -BorderColor Blue -TextColor Red
            exit 1
        } else {
            Write-BoxedText $line -BorderColor Blue -TextColor '#d7834f'
        }
    }
    
    git push 2>&1 | ForEach-Object {
        $line = $_.ToString()

        if ($line -match "error|failed|fatal") {
            Write-BoxedText $line "Blue" "Red"
        }
        elseif ($line -match "done|success|up to date") {
            Write-BoxedText $line "Blue" "Green"
        }
        else {
            Write-BoxedText $line "Blue" "#d7834f"
        }
    }

    Write-BoxedText "Code pushed to origin" -BorderColor Blue -TextColor "d7834f"
    Write-Host ("+$('-' * ($Host.UI.RawUI.WindowSize.Width - 2))+") -ForegroundColor Blue
}

# tags
foreach ($tagName in $argsList) {

    if (-not $tagName) {
        continue
    }

    New-AndPushTag -BaseTag $tagName
}

Write-Host "Done" -ForegroundColor Blue