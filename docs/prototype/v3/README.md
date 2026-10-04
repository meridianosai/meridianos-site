# 子午纪 · 落地页原型 v3（MeridianAI Fleet）

> 已落地到 `app/` 与 `components/site/`。落地时首屏又改过：主张换成「人，在信号的另一端」、引题用 slogan「让天下没有难做的海外生意」，地球上的卡改为「信号 → 联系人」成对出现。以代码为准，本原型只作视觉参照。

主推 meridianos-fleet 正在实施的新店面 `apps/web-next`。静态原型，不接后端：首屏输入和内测表单只在本页给出结果，不发请求。

## 怎么看

直接双击 `index.html`（file:// 可用），或者：

```bash
python3 -m http.server 8139 --directory docs/prototype/v3
# 打开 http://localhost:8139
```

需要联网：d3 / topojson-client 走 cdnjs / jsdelivr，衬线标题字走 Google Fonts。断网时地球退回一张静态经纬网，其余内容和交互照常。

## 产品画面以本地实现为准

页面外壳（衬线标题、冷白纸面、子午线母题、投资方、出海查、创始人、表单、页脚）延续线上版。产品画面按 2026-10-03 本机 `feat/web-next-scaffold` 工作区里跑起来的 web-next 复刻，不再用 leo-test 远程原型（v76）的组件：

| 落地页段落 | 对应的 web-next 组件 / 页面 |
|---|---|
| 首屏地球与三种卡 | 登录页 `auth-globe.tsx`、`auth-globe-signals.ts`（信号 / 商机 / 联系人，284×120 玻璃卡，头像素材同源） |
| 首屏输入框 | 欢迎页 `welcome-composer.tsx`（附件 chip、+、纸飞机发送、「用示例公司试试」只装资料不代发） |
| 1 理解你的业务 | `/understanding` 的资料理解对话：工具调用卡（读取文件 / 读取网页 / 搜索公开信息，调用中 → 已返回）、四段判断带依据、「找海外买家 / 看看适合的市场」 |
| 2 发现合适市场 | `explore-panel.tsx` 各层：区域卡 → 国家卡（优先验证 / 供货切入 / 先确认）→ 国家详情（供货切入、城市卡）→ 城市候选公司卡；右侧 Agent 的工具执行记录与 `ask_user` 选择卡；三栏 + 左侧导航 |
| 3 找到目标客户 | `record-page.tsx` 的公司页与 `contact-profile.tsx` 的人物页（头部、吸顶锚点、各段一页排开）；`business-workbench.tsx` 的「我的业务」标签 |
| 来源 | `source-window.tsx` + `sandbox-screen.tsx`：来源标签、摘录卡（荧光笔色竖条）、定位摘录、缩放、沙箱浏览器 |
| 4 准备联系与跟进 | `crm-table.tsx` 客户工作区：工具栏、任务列（▶ 运行、查询中、查询失败）、底部公司 / 联系人 / 业务信号页签；Agent 收起后的右缘玻璃入口 |

颜色、圆角、字号取自 `apps/web-next/src/app/globals.css` 的 `--color-meridian-*`、`--meridian-glass` 与 12 / 14 / 16 / 22 字阶；示例数据（声谷电子、Lotus Sound、Alex Morgan、登录页各国卡片）取自 web-next 的演示数据，公司、人物、事件均为虚构。来源网页 `lotussound.vn` 是为原型新写的虚构页面（web-next 里只有欧盟 CE / RoHS 两页真实网页能在沙箱打开）。

## 文件

| 文件 | 用途 |
|---|---|
| `index.html` | 页面结构与全部样式 |
| `app.js` | 地球渲染、滚动下钻、各段的演示交互 |
| `data/world-110m.js` | world-atlas@2 的拓扑数据，包成脚本以便 file:// 直接打开 |
| `assets/` | 线上版的投资方 logo、创始人照片、二维码；web-next 的产品标识 `fleet-mark.png` 与 8 张示例头像（缩到 112px） |

## 上线前要定的事

- **对外名称**：原型首屏和表单用 web-next 的「MeridianAI Fleet」；线上落地页现在叫「拓客引擎」，PRD 叫「出海地图」。
- **地图合规**：公开页面展示世界地图受《地图管理条例》约束。原型只画合并后的陆地，不画国界线、不单独给中国上色，也不点亮边界有争议的国家；正式上线前需要复核，或换成有审图号的底图。
- **能力口径**：web-next 目前是本地示例（界面上自己也写着「示例工具 · 未联网」「演示对话 · 未接入模型」）。落地页文案要和对外开放时的实际能力对齐。
- **接表单**：沿用现有 `POST /api/waitlist`（contact / company / name），首屏带过来的官网并进 company。
