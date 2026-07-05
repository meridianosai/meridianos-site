# 子午纪 Meridian · 官网落地页

## 文件说明

| 文件 | 用途 |
|---|---|
| `index.html` | 落地页主文件(单文件,内含所有 CSS 和 JS) |
| `founder-photo.jpg` | 创始人区块照片(路演日 / 奇绩 / Antler 拼图) |
| `mp-logo.png` | 奇绩创坛 logo(已转墨色单色) |
| `antler-logo.png` | Antler logo(已转墨色单色) |
| `chuhaicha-qr.jpg` | 出海查 AI 小程序码(Footer + 出海查板块) |
| `wechat-qr.jpg` | 创始人微信二维码(Footer 联系我们) |

## 部署方式

这是一个纯静态页面,无需后端、无需构建。所有图片都用相对路径引用,
只要把**整个文件夹**放到 Web 服务器或静态托管(如 Vercel / Netlify / 对象存储 + CDN)即可。

- HTML 与 5 张图片必须**保持在同一目录**(相对路径引用)。
- 入口文件是 `index.html`,可直接作为主页。
- 外部依赖仅 Google Fonts(Noto Serif SC / JetBrains Mono / Inter),
  已在 `<head>` 中通过 CDN 引入;如目标市场在中国大陆访问 Google Fonts 不稳,
  建议技术侧把字体自托管或替换为国内 CDN 镜像。

## 页面结构(从上到下)

1. 导航栏
2. Hero(主张 + 工作台演示动画 + 数据背书)
3. 投资方背书带(奇绩创坛 S26 · Antler)
4. 对比带(两种活法)
5. 出海查 AI(产品一,已上线)
6. 拓客引擎(产品二,内测 · 六步手风琴)
7. 创始人区块(为什么是我们)
8. 内测排队 CTA(表单)
9. Footer(实体信息 + 邮箱 + 微信)

## 需技术侧接入的动态部分

- **内测排队表单**(#principles 区块内的 `<form id="wlForm">`):
  目前是纯前端占位,提交后需要接后端 / 表单服务(如飞书多维表格、
  Formspree、或自建接口)来真正收集线索。请技术负责人对接。

## 联系信息(已写入页面,如需修改在 Footer 部分)

- 公司:MeridianOS, Inc.(Delaware C-Corp)
- 邮箱:info@meridianos.ai
- 微信:leo971217
