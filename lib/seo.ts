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
export const SITE_TITLE_DEFAULT = "子午纪 Meridian — 出海全流程拓客引擎";
export const SITE_TITLE_TEMPLATE = "%s · 子午纪 Meridian";
export const SITE_DESCRIPTION =
  "子午纪 Meridian:用 AI Agent 主动开发海外 B 端客户。出海查 AI 看透任意海外公司,拓客引擎从市场调研、找联系人到开发信触达替你跑完全程——人做决策,Agent 跑腿。";

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
