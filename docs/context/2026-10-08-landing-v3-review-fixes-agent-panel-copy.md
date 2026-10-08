---
date: 2026-10-08
slug: landing-v3-review-fixes-agent-panel-copy
title: 落地页 v3 收尾：按代码审查重构为服务端外壳 + 客户端叶子，Agent 面板跟 fleet #415 重排，整页文案去 AI 味
tags: [landing, react, agent-panel, web-next, copywriting, refactor]
related: [2026-10-04-landing-v3-fleet-showcase, 0002-tabler-file-type-icons, 0001-globe-d3-canvas-for-landing]
---

## 背景 / 触发动机
v3 提交（4f1a320）后又做了四轮，压成这一笔：
1. `/code-review` 查 React 最佳实践，得到 11 条代码规范问题、7 条需求实现问题，用户要求全部修复。
2. fleet web-next 在 #415（fdf79aa3，10-07）把 Agent 面板按聊天面板重排，用户要求落地页跟上。
3. 用户觉得整页文案 AI 味重，逐节讨论改写。
4. 「准备联系与跟进」里的 ▶ 改成可感知的引导。

## 关键决策
- **组件分层**：各区块外壳改为服务端组件，交互部分拆成客户端叶子（`hero-globe` / `hero-composer` / `understand-panel` / `explore-stage` / `account-demo` / `source-demo` / `crm-demo`）。服务端渲染好的内容以 props / children 传进叶子。
  - 动效检测统一到 `motion.ts`（`useSyncExternalStore`，服务端快照为 false）。
  - 播放循环抽到 `lib/visible-loop.ts`，数学工具抽到 `lib/math.ts`，首屏卡片的排布逻辑抽到 `lib/hero-pairs.ts`（不碰 DOM），示例数据集中到 `demo-data.ts`。
  - 标签页按 APG Tabs 模式实现。
  - 跨组件事件走 `LandingBus`：首屏把官网预填进内测表单、首屏示例发送后重放理解业务的对话。
- **需求实现的修正**：
  - 导航「申请内测」指向 `#principles`。
  - 预填提示只说真带过来的东西。
  - 首屏卡片对数按屏宽限制（<900 不出，<1300 最多 1 对）。
  - 卡片寿命的预测算进了地球减速那一段。
  - 打字动画中途点发送，补全示例后再重放。
  - 手机上显示城市层的「示意」说明。
- **Agent 面板照 #415**：以 fleet 工作区当时的实现为准，在本机 web-next 示例流程截图对照。
  - `product-ui.tsx` 新的小件：
    - 标题栏 +「演示」小标，取代底部那行说明。
    - 用户浅底短块；对象变化时标上下文。
    - Agent 正文 + 句末「依据」。
    - `ActivityGroup` / `ActivityRow`：工具调用一行一条，挂在汇总行下。
    - `AskUser`：提问内嵌在这一轮末尾，答后折成「问题 → 选择」。
    - 推荐追问最多 3 个灰字 chip，放在输入框上方。
    - 输入框左下角显示上下文标签，执行中发送键变停止键。
    - `FileCard` / `FileRow`：图标依赖见 ADR 0002。
  - 资料理解面板照 fleet 的 6 次调用（两份文件和网页并行读取，三次搜索等读取结果）和 #414 的规则：全部返回、记录折起之后，结论才一次给出。回放时间压到约一半，10.4s 收束，fleet 是 21.1s。
  - 客户页的 Agent 改为贴底，并带上前一层的结尾，像是接着探索那一路聊下来的。
- **文案规则（用户逐条拍板）**：
  - 有态度的句子只留三处：首屏标题、口号、「不用信它，点开原页自己看。」。其余标题改平实，句式错开。
  - 少用三项并列；一个意思只说一次；去掉空泛大词。
  - 不写界面说明书：不用「列头 / 卡片 / 旁边 / 标签 / 点开」去讲界面在哪，改成「做一个动作，得到什么」。例如「只需点击 ▶，它就一家一家替你查」。
  - 创始人那节精简到两句，第一人称，与署名「周玉林」对上。
  - 页脚只留口号。
  - 背书条文字暂作占位，代码里留了 TODO。
  - 「和通用 AI 的区别」对比表按用户要求保留，只改措辞。
- **正文里的 ▶**：画成和表格列头一样的深色圆按钮，外加两圈错开的波纹循环（只动 transform / opacity，减弱动效时不出）。

## 影响范围
- 组件：
  - 上面 7 个客户端叶子新建，各 section 改为服务端。
  - `product-ui` 的 Agent 部分重写：`ToolRecord` / `AnsweredAsk` 去掉。
  - `explore-stage` 的 `asks` 改为 `suggestions`；`AccountDemo` 的 `agent` 改为 `{ log, suggestions }`。
- `app/globals.css`：
  - 新增 Agent 面板一节（`.k-act` / `.k-row` / `.k-ask*` / `.k-compose` / `.k-file*` 等），以及 `.crm-note`、`.crm-play`。
  - 删掉旧工具卡、要点列表、`.okc` / `.run` 等无人使用的样式。
- 新增 `lib/{math,visible-loop,hero-pairs}.ts`、`types/css.d.ts`（CSS 自定义属性的类型）；`lib/seo.ts` 的描述改写。
- 依赖：`@tabler/icons-react`（ADR 0002）。
- 没有改 `/api/waitlist`、数据库、法务页。

## 已知遗留 / 后续待办
- 正文里的 ▶ 和表格列头的 ▶ 都不能点。文案已经写「只需点击」；提过让它点了重放表格的查询动画，未做。
- fleet 欢迎页输入框的新一版（标题、「开始」按钮、示例卡、输入框里的文件卡）还在 fleet 工作区未提交，首屏输入框没跟。
- 背书条的数字是占位；创始人履历里去掉的「销售冠军 / 明星创业公司 / 500 强」如需恢复，由用户确认。
- 仓库没有 PRODUCT.md，上面的文案规则只记在这里。

## 规则摩擦 / 陷阱
- **用户在自己的 `next dev`（3002）上看效果。** 10-07 那台 dev 三次没跟上 globals.css 的改动，TSX 改动却照常生效。
  - 一次是重启后从 `.next/dev/cache` 恢复了旧编译结果；两次是运行中不再重编。
  - `touch`、换文件、碰 `layout.tsx` 都没用，开发浮层也没有报错。
  - 应对办法：改完 CSS 后，去取 dev 页面的 CSS chunk，grep 新类名；没跟上就让用户 `rm -rf .next/dev && npm run dev`。CSS 本身在不带 `.next` 的副本里验证，生产构建也在副本里跑，不碰用户的 `.next`。
- **审文案时导出脚本漏抓了 `.sign`（署名）和演示框里的说明卡**，一度误判「创始人那节没有署名」。导出文案要覆盖所有文本节点。
- **行内 `inline-grid` 按钮的基线取自里面图标的底边**，会整体偏低。用 `vertical-align: middle` 再 `top: -.1em` 对准中文字框的中心：18px / 16px 下的偏差分别是 0.03px / 0.2px。

## 验证
- `tsc --noEmit`、`eslint app components lib types`、`next build` 全过；build 在不带 `.next` 的副本里跑。
- Playwright 截图：
  - Agent 面板四处在 1440 / 1280 / 390 下和 fleet 截图逐一对照；≤1100px 时 Agent 栏按原有布局隐藏。
  - 禁用 JS、减弱动效时，理解业务直接显示完成态；首屏示例发送后对话从头重放；控制台无报错。
  - 文案改动在用户 dev 上逐节截图，并重新导出全文核对。
