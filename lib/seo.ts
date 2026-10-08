/**
 * 站点级 SEO 常量集中管理。
 * 域名/索引由环境变量驱动:
 *   NEXT_PUBLIC_SITE_URL   canonical / OG / sitemap 使用的正式域名(默认正式主域)
 *   NEXT_PUBLIC_SEO_NOINDEX="true"  预发(staging)防收录
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://meridianos.ai"
).replace(/\/$/, "");

export const SEO_NOINDEX = process.env.NEXT_PUBLIC_SEO_NOINDEX === "true";

export const SITE_NAME = "子午纪 Meridian";
export const SITE_TITLE_DEFAULT = "子午纪 Meridian · 找准海外买家的采购信号";
export const SITE_TITLE_TEMPLATE = "%s · 子午纪 Meridian";
export const SITE_DESCRIPTION =
  "子午纪 Meridian：MeridianAI Fleet 先读你的官网和产品资料，再找出和你产品有关的海外采购信号，以及该联系的人，每条都能点开原文核对。出海查 AI 可以免费查一家海外公司。";

export const SITE_KEYWORDS = [
  "出海",
  "出海拓客",
  "B2B 出海",
  "海外获客",
  "海外客户开发",
  "外贸开发信",
  "AI 外贸",
  "AI 销售",
  "跨境 B2B",
  "出海查",
  "拓客引擎",
  "MeridianAI Fleet",
  "海外买家",
  "采购信号",
  "海外市场调研",
  "外贸 Agent",
  "海外买家开发",
  "询盘",
  "子午纪",
  "Meridian",
  "MeridianOS",
];

export const ORG_LEGAL_NAME = "MeridianOS, Inc.";
export const ORG_EMAIL = "info@meridianos.ai";
export const OG_LOCALE = "zh_CN";
export const THEME_COLOR = "#3E63DD";
export const BACKGROUND_COLOR = "#F8FAFD";
