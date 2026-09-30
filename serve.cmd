@echo off
rem 本地预览脚本：双击运行，浏览器打开 http://localhost:1313/
rem 优先用 PATH 里的 hugo，找不到就用工作区里自带的那个
setlocal
set "HUGO=hugo"
where hugo >nul 2>nul || set "HUGO=%~dp0..\.tools\hugo\hugo.exe"

if not exist "%HUGO%" if /i not "%HUGO%"=="hugo" (
  echo [错误] 没找到 hugo，请先安装 Hugo extended，或把 hugo.exe 放到 ..\.tools\hugo\ 下
  pause
  exit /b 1
)

"%HUGO%" server -D --navigateToChanged --port 1313
endlocal
