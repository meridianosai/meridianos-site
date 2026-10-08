---
id: 0002
slug: tabler-file-type-icons
date: 2026-10-08
title: Agent 面板的文件卡用 @tabler/icons-react 的文件类型图标，和 fleet web-next 同一套
status: Accepted
tags: [landing, agent-panel, icons, dependency, web-next]
supersedes: []
superseded_by:
---

## Status
Accepted —— 2026-10-08 随 Agent 面板按 fleet #415 重排一起提交。

## Context
fleet `apps/web-next` 在 #415 把 Agent 面板改成聊天面板的结构，用户附带的文件变成一排三张的小文件卡：类型图标坐在同色 10% 的浅底方块里，图标本身画出 PDF / XLS 等字样，按类型着色（fleet ADR 0057）。落地页「理解你的业务」的对话面板要照这个样子复刻声谷示例的两份文件。

落地页其余图标都是 lucide-react。lucide 没有画出扩展名的文件类型图标。

## Decision
- 新增依赖 `@tabler/icons-react`（MIT），版本和 fleet 一致（^3.49.0）。只在 `product-ui.tsx` 的 `FileCard` 里用 `IconFileType*` / `IconFile`，`stroke` 1.75 与 lucide 对齐；别处不混用两套图标。
- 颜色照 fleet 的表：PDF #A6443C，表格 success 绿，Word signal 蓝，幻灯片 policy 琥珀，其余 slate。
- 长文件名省略后用 `title` 显示全名，不引入 fleet 用的 radix Tooltip：落地页的面板只做展示，不放可聚焦的控件。

## Alternatives considered
- **用 lucide 的 `FileText` / `FileSpreadsheet` 加一个小字标签**：不加依赖，但和 fleet 的文件卡长得不一样，复刻的意义打折。
- **把两个 Tabler 图标的 SVG 路径抄进代码**：只有几百字节，但要手工跟着上游更新，还要在代码里保留 MIT 署名；以后想多加一种类型还得再抄。

## Consequences
- 正面：文件卡和 fleet 视觉一致；按需导入，只打包用到的几个图标。
- 负面：多一个图标依赖，落地页同时有 lucide 和 Tabler 两套，靠「只在文件卡用」的约定约束。
- 中性：fleet 若再换文件卡图标，这里跟着改 `FILE_TYPES` 一处即可。
