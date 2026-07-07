import type { MetadataRoute } from "next";
import { SITE_URL, SEO_NOINDEX } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  // 预发(staging):允许抓取,仅靠 layout 的 meta noindex 防收录。
  // 若改用 disallow,一旦该环境曾被收录,Googlebot 将无法再抓到 noindex 标签把它摘除。
  if (SEO_NOINDEX) {
    return { rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
