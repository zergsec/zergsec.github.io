---
title: "这个博客怎么用：写文章与发布流程"
date: 2026-09-30T10:00:00+08:00
draft: false
tags: ["教程"]
categories: ["站务"]
summary: "三步走：新建 Markdown → 本地预览 → push 上线。附常用命令和目录说明。"
ShowToc: true
---

## 目录结构

```
blog/
├── hugo.yaml              # 站点配置：标题、菜单、简介都在这
├── content/
│   ├── posts/             # 所有文章（Markdown）
│   ├── about.md           # 「关于」页
│   ├── archives.md        # 「归档」页
│   └── search.md          # 「搜索」页
├── static/
│   ├── images/            # 文章里用到的图片
│   └── favicon.ico        # 浏览器标签页图标
├── themes/PaperMod/       # 主题（已内置在仓库里）
└── .github/workflows/     # 自动部署配置（不用动）
```

## 写一篇新文章

一条命令生成模板（在 `blog` 目录下执行）：

```bash
../.tools/hugo/hugo.exe new content/posts/我的新文章.md
```

然后在 `content/posts/我的新文章.md` 里改开头这段：

```yaml
---
title: "我的新文章"
date: 2026-09-30T10:00:00+08:00
draft: false        # 写完改成 false 才会发布
tags: ["标签一", "标签二"]
categories: ["分类"]
summary: "列表页显示的一句话摘要"
ShowToc: true       # 想显示目录就打开
---
```

`draft: true` 的文章不会出现在线上站，本地预览时加 `-D` 参数才看得到。

## 本地预览

在 `blog` 目录下双击 `serve.cmd`，或者手动执行：

```bash
../.tools/hugo/hugo.exe server -D
```

浏览器打开 <http://localhost:1313/>，改文件会自动刷新。

## 发布

```bash
git add .
git commit -m "post: 新增文章"
git push
```

推送到 `main` 分支后，GitHub Actions 会自动构建并发布，一两分钟后刷新 <https://zergsec.github.io/> 即可看到。

## 想改样式怎么办

- 改站点信息（标题、简介、菜单、社交链接）：编辑 `hugo.yaml`。
- 改排版细节（字体、行距、图片圆角）：编辑 `assets/css/extended/custom.css`，这个文件会覆盖主题默认样式。
- 换头像：替换 `static/images/avatar.jpg`。
