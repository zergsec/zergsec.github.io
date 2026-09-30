---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"   # ← 改成你的文章标题
date: {{ .Date }}
draft: true          # ← 写完后必须改成 false 才会发布（草稿只在本机预览里看得见）
tags: []             # ← 例如 ["CTF", "Pwn"]
categories: []       # ← 例如 ["Writeup"]
summary: ""          # ← 列表页显示的一句话摘要，留空则自动截取正文
ShowToc: true        # ← 长文建议开启，右侧会生成目录
---

在这里开始写正文（Markdown 语法）。

<!--
写文章的几个提示：

1. 图片放在 blog/static/images/ 下，用下面的写法引用（路径以 / 开头）：
     ![图片说明](/images/图片名.png)

2. 代码块用三个反引号包起来，开头写上语言名：
      ```python
      print("hello")
      ```

3. 写完后：
   - 把上面的 draft 改成 false
   - 双击 blog/serve.cmd 本地预览（默认 http://localhost:1313/）
   - 双击工作区根目录的 push-blog.cmd 发布上线

4. 这段 HTML 注释不会显示在文章里，可以直接删掉。
-->
