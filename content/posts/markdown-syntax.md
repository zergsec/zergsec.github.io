---
title: "Markdown 语法速查（写作时对照这篇）"
date: 2026-09-29T21:30:00+08:00
draft: false
tags: ["教程", "Markdown"]
categories: ["站务"]
summary: "把常用 Markdown 写法都放在一篇里，写文章时直接复制粘贴改内容就行。"
ShowToc: true
cover:
  image: "/images/og-cover.png"
  alt: "示例封面图"
  caption: "封面图写在 static/images 下，用绝对路径引用"
---

## 标题与正文

`##` 是二级标题，`###` 是三级标题。这篇文章开了 `ShowToc: true`，所以右侧（宽屏时）会自动出现目录。

正文里可以用 **加粗**、*斜体*、~~删除线~~、`行内代码`，以及 [超链接](https://gohugo.io/)。

## 列表

无序列表：

- 第一项
- 第二项
  - 嵌套项

有序列表：

1. 第一步
2. 第二步

## 代码块

写代码用三个反引号包起来，并且在开头写上语言名，这样语法高亮才正常：

```python
def fib(n: int) -> int:
    """返回第 n 个斐波那契数"""
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
```

```bash
# 终端命令
git add . && git commit -m "post: 新文章" && git push
```

行内代码则用单个反引号，例如 `hugo server -D`。

## 引用与提示

> 这是一段引用文字。
>
> 引用可以有多行，也能放列表和代码。

## 表格

| 参数 | 作用 | 常用值 |
| --- | --- | --- |
| `draft` | 是否为草稿 | `true` / `false` |
| `tags` | 标签，用于聚类 | 任意字符串数组 |
| `ShowToc` | 是否显示目录 | `true` / `false` |

## 图片

图片放在 `static/images/` 目录，然后用 `/images/文件名` 引用：

```markdown
![图片说明](/images/og-cover.png)
```

![示例图片](/images/og-cover.png)

## 折叠块与 HTML

Markdown 里可以直接写 HTML（配置中已开启 `unsafe`）：

<details>
<summary>点开看折叠内容</summary>

折叠里的正文同样支持 **Markdown**。

</details>

## 分隔线

---

## 数学公式（可选）

如果以后要写公式，需要额外开启 KaTeX 支持；默认不开启，避免拖慢加载。
