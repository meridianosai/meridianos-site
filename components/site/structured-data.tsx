import {
  SITE_URL,
  SITE_NAME,
  SITE_TITLE_DEFAULT,
  ORG_LEGAL_NAME,
  ORG_EMAIL,
  SITE_DESCRIPTION,
} from "@/lib/seo";

/**
 * JSON-LD 结构化数据(Organization + WebSite + WebPage + SoftwareApplication),
 * 各节点用 @id 互相引用形成实体图谱。
 */
export function StructuredData() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        legalName: ORG_LEGAL_NAME,
        url: SITE_URL,
        email: ORG_EMAIL,
        description: SITE_DESCRIPTION,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/apple-icon`,
          width: 180,
          height: 180,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: "zh-CN",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: SITE_TITLE_DEFAULT,
        description: SITE_DESCRIPTION,
        inLanguage: "zh-CN",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "SoftwareApplication",
        name: "出海查 AI",
        applicationCategory: "BusinessApplication",
        operatingSystem: "微信小程序",
        url: SITE_URL,
        inLanguage: "zh-CN",
        description:
          "输入一家海外公司,拿到工商信息、经营信号,和一份 AI 深度调研报告——含切入路径建议。",
        offers: { "@type": "Offer", price: "0", priceCurrency: "CNY" },
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
