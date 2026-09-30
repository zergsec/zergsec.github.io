# zergsec 的博客

个人博客，用 [Hugo](https://gohugo.io/) + [PaperMod](https://github.com/adityatelange/hugo-PaperMod) 搭建，托管在 GitHub Pages 上。
推送到 `main` 分支后由 GitHub Actions 自动构建发布。

线上地址：<https://zergsec.github.io/>

## 目录结构

```
.
├── hugo.yaml                  # 站点配置：标题、简介、菜单、社交链接
├── content/
│   ├── posts/                 # 文章（Markdown）
│   ├── about.md               # 「关于」页
│   ├── archives.md            # 「归档」页
│   └── search.md              # 「搜索」页
├── static/
│   ├── images/                # 文章图片、头像
│   └── favicon.ico
├── assets/css/extended/
│   └── custom.css             # 自定义样式（覆盖主题默认值）
├── themes/PaperMod/           # 主题（随仓库一起版本管理）
├── serve.cmd                  # Windows 本地预览脚本
└── .github/workflows/hugo.yaml # 自动部署配置
```

## 本地预览

需要 [Hugo extended](https://gohugo.io/installation/)（v0.167 或更高）。

```bash
# Windows：直接双击 serve.cmd
# 或者手动执行
hugo server -D
```

然后打开 <http://localhost:1313/>。修改文件会自动刷新。

## 写一篇新文章

**最省事的方式**：双击工作区根目录（`blog` 的上一级）的 `new-post.cmd`，
输入一个英文文件名（例如 `hdctf-2026`），它会生成模板并用编辑器打开。
改标题、写正文、把 `draft` 改成 `false`，保存即可。

也可以手动执行（在 `blog` 目录下）：

```bash
# 用工作区里自带的 hugo，或 PATH 里的 hugo
../.tools/hugo/hugo.exe new content/posts/我的新文章.md
```

编辑生成的文件，把 `draft` 改成 `false`（草稿不会发布），然后提交：

```bash
git add .
git commit -m "post: 我的新文章"
git push
```

推送后 GitHub Actions 会自动构建，约一分钟左右上线。

## 主题说明

`themes/PaperMod/` 是 PaperMod 主题的一份快照，直接放在仓库里而不是用 git submodule，
这样 GitHub Actions 构建时不需要额外联网拉取主题，本地也不会有「忘了 init submodule」的问题。

升级主题时，下载新版本覆盖该目录即可。

## 许可

文章内容采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可协议。
`themes/PaperMod/` 遵循其自身的 MIT 许可。
