---
id: 0001
slug: globe-d3-canvas-for-landing
date: 2026-10-04
title: 落地页的地球用 d3-geo 正射投影画在 canvas 上，不搬 fleet web-next 的 three.js 地球
status: Accepted
tags: [landing, globe, d3-geo, topojson, dependency, map-compliance]
supersedes: []
superseded_by:
---

## Status
Accepted —— 2026-10-04 随落地页 v3 落地（首屏地球 + 「发现合适市场」滚动下钻），用户确认提交。

## Context
落地页 v3 要在首屏放一颗浅色地球，在「发现合适市场」一节随滚动从全球下钻到东南亚、越南、胡志明市。样子照 fleet `apps/web-next` 的地球（登录页那颗浅色玻璃球、推荐区域 #91B4E5、当前定位 #5B94DD）。

web-next 的地球是 three.js 直写（fleet ADR 0051）：合并几何、状态贴图、Equal Earth 变形、构建期预处理二进制地理数据，代码量大，且和它的导演层 / store 绑在一起。落地页只需要：正射投影、陆地底色、少数国家填色、经纬网、按滚动插值的镜头、卡片按投影坐标摆位。

另一个约束是公开页面的地图合规：国内公开展示世界地图受《地图管理条例》约束，国界线和中国本土的画法都有要求。

## Decision
- 新增依赖 `d3-geo`（正射投影、大圆插值、经纬网）和 `topojson-client`（解 world-atlas 拓扑），外加对应的类型包。实现收在 `lib/globe.ts`，首屏（`hero.tsx`）和探索区（`explore-section.tsx`）共用。
- 地理数据用 world-atlas@2 的 `countries-110m.json`（Natural Earth，公有领域），放 `public/geo/`，页面挂载后再取，不进首屏 JS 包；取不到时首屏退回一张静态经纬网，探索区照常按滚动切换内容。
- 只画合并后的陆地和少数示例国家的填色：不画国界线，不单独给中国上色，也不点亮印度、巴基斯坦、摩洛哥、阿尔及利亚、哈萨克斯坦这类边界有争议的国家。城市层用随机生成的示意街区图，标注「城市分布示意 · 非真实地址」。

## Alternatives considered
- **把 web-next 的 three.js 地球整套搬过来**：视觉最一致，但要带上 three、预处理脚本、二进制数据和一套与导演层耦合的代码；落地页用不到状态贴图、拾取、2D/3D 变形这些能力，维护成本不划算。
- **用 globe.gl 等现成地球库**：fleet ADR 0051 已评估过它的 draw call 和控制权问题；对落地页同样偏重。
- **用一张静态地球图片**：没有下钻和卡片跟随地理位置的动态，撑不起「从信号到人」的叙事。
- **用有审图号的底图服务**：合规最稳，但样式难以做成浅色玻璃球，且要接第三方。先按「只画陆地」的做法上线，正式对外前再复核。

## Consequences
- 正面：两个小依赖（d3-geo + topojson-client），canvas 2D 每帧只画几十条路径，地球与 DOM 卡片共用同一套投影坐标，好对齐。
- 负面：和 web-next 的地球是两套实现，配色等值靠手工对齐（`GLOBE_COLORS` 注释了出处）；110m 数据海岸线较粗，下钻到城市层后由示意街区图接替。
- 中性：合规风险没有消除，只是降低；正式上线前仍需按《地图管理条例》复核，或换成有审图号的底图。
- 陷阱：量画布尺寸必须用 `clientWidth/clientHeight`。首屏地球入场时带 `scale(.97)`，用 `getBoundingClientRect` 会让画布和叠在上面的卡片、连线整体差 3%。
