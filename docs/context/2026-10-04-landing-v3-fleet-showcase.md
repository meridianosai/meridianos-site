---
date: 2026-10-04
slug: landing-v3-fleet-showcase
title: 落地页 v3：主推 MeridianAI Fleet，产品画面照 fleet web-next 本地实现复刻，首屏改为「人，在信号的另一端」
tags: [landing, web-next, globe, hero, copywriting, prototype]
related: [0001-globe-d3-canvas-for-landing]
---

## 背景 / 触发动机
落地页要更新一版，核心突出 meridianos-fleet 正在实施的新店面 `apps/web-next`（PRD 叫「出海地图」）。先做了 HTML 原型 `docs/prototype/v3/`：第一版照 leo-test 远程原型 v76 的组件做，用户指出应该用本地最新实现的组件，于是在本机跑起 web-next（示例模式）逐页对照重做；用户确认后落进 Next 应用。首屏文案按用户反馈改了四轮，目标用户定为 C 端的一线销售。

## 关键决策
- **页面结构**：首屏 → 投资方 → 1 理解你的业务 → 2 发现合适市场（滚动下钻）→ 3 找到目标客户（公司页 / 人物页 / 我的业务三个标签）→ 来源（沙箱浏览器划出摘录）→ 4 准备联系与跟进（客户表格任务列）→ 和通用 AI 的区别 → 出海查 → 创始人 → 内测 → 页脚。四步的小标题照 web-next 登录页流程轮播的四步。
- **产品画面以 web-next 本地实现为准**：组件结构、颜色 / 圆角 / 字号取自它的 `globals.css`（`--color-meridian-*`、`--meridian-glass`、12/14/16/22 字阶）；示例数据（声谷电子、Lotus Sound、Alex Morgan、登录页各国的公司与人物、示例头像）取自它的演示数据，全部虚构。来源网页 `lotussound.vn` 是为落地页新写的虚构页。
- **首屏**：引题用品牌 slogan「让天下没有难做的海外生意」；主标题「人，在信号的另一端。」；副文「找准和你产品有关的采购信号，顺着它，找到该联系的那个人。」。被否的方向：「哪里在买，谁在买，为什么是现在」（太单薄）、「采购之前，先有信号」（只是常识）、「别等询盘」（打的是询盘型业务员，PRD 列为先不打）、「别再群发，带着信号去开口」「信号找对了，人就找对了」（太直白）。
- **首屏地球**：卡片从信号 / 商机 / 联系人三种随机出现，改为「一条信号 → 这家公司负责这件事的人」成对出现，用连线从信号卡画到联系人卡，和标题互相印证。
- **内测表单**：接口、落库、飞书通知不变；首屏输入里识别到的官网预填进「公司 / 官网」，仍走原来的 `company` 字段。
- **字体**：只保留标题用的 Noto Serif SC，正文用系统中文字体（与 web-next 一致），不再加载 Inter 与 JetBrains Mono。
- 地球的技术选型与地图合规做法见 ADR 0001。

## 影响范围
- 页面：`app/page.tsx`、`app/globals.css`（3115 → 约 1040 行，法务页样式原样保留）、`app/layout.tsx`、`app/opengraph-image.tsx`、`lib/seo.ts`。
- 组件：新增 `understand-section` / `explore-section` / `account-section` / `source-section` / `crm-section` / `why-section` / `product-ui` / `landing-context` / `use-once-visible` / `step-kicker` / `meridian-lines` / `hero-cards`；重写 `hero` / `nav` / `waitlist` / `chuhaicha` / `founder` / `footer` / `backed-band`；删除 `contrast-band` / `bridge` / `flow-section`。
- 新增 `lib/globe.ts`、`public/geo/countries-110m.json`、`public/fleet/`（web-next 标识与 8 张示例头像，缩到 112px）；依赖 `d3-geo`、`topojson-client` 及类型包。
- 原型 `docs/prototype/v3/`（HTML 单页）一并提交，作为视觉参照。
- 没有改 `/api/waitlist`、数据库、飞书通知、法务页、robots / sitemap。

## 已知遗留 / 后续待办
- 对外名称未定：页面、SEO、OG 图用「MeridianAI Fleet」，替换了线上的「拓客引擎」；PRD 叫「出海地图」。
- 地图合规只是降低风险，正式对外前按《地图管理条例》复核或换审图号底图（ADR 0001）。
- 文案对能力的口径要和开放时的实际能力对齐：web-next 现在是示例数据，信号持续监控在 fleet 侧还没做。
- 未测 Safari 与真机；真实提交到数据库 / 飞书未测（回归里拦截了请求）。
- `docs/prototype/v3/` 的首屏仍是早期文案和三种随机卡，以代码为准。
- 本分支未 push：仓库 push 到 main 即自动部署 EC2。

## 规则摩擦
- 第一版原型照 fleet `AGENTS.md` 路由表里「界面正本是 leo-test worldmap-v76」去做，但 web-next 的实现已经走得更远（`apps/web-next/docs/design/DESIGN.md` 写明依据是本地 v78 且以实现为准）；用户指出后改为直接跑起 web-next 对照。展示类工作应先看跑起来的实现，再看 PRD 截图。
- 本机 `ls` 被 alias 到 ugrep，带参数的 `ls dir` 静默返回空，须用 `/bin/ls`。

## 验证
- `npx tsc --noEmit`、`npx eslint app components lib`、`npx next build` 均通过。
- 本地 `next start` 生产构建 + 无头 Chrome：1440 / 1280 / 390 宽度逐段截图，无控制台报错、无横向溢出。
- 交互回归：首屏示例发送后理解区重放；首屏官网预填进表单且焦点落到联系方式；空提交报错、正常提交的 payload 与原格式一致（请求被拦截，未写库）；公司页 ↔ 人物页 ↔ 我的业务切换、锚点跟随滚动、字段就地改；来源「回到来源网页」重放。
- 降级：地理数据被挡时首屏退回静态经纬网；减少动态效果直接给终态；关掉 JS 时理解区内容完整可见。
- 首屏成对卡：60 秒采样始终 1–2 对在屏、每对完整展示；连线端点与卡片边偏差 0px。
