import type { Metadata, Viewport } from "next";
import { Noto_Serif_SC } from "next/font/google";
import "./globals.css";
import {
  SITE_URL,
  SITE_NAME,
  SITE_TITLE_DEFAULT,
  SITE_TITLE_TEMPLATE,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SEO_NOINDEX,
  ORG_LEGAL_NAME,
  OG_LOCALE,
  THEME_COLOR,
} from "@/lib/seo";

// 只有标题用衬线；正文走系统中文字体（与 fleet web-next 一致），不再加载 Inter / JetBrains Mono。
// CJK 字体体量大,不预加载(否则 next/font 需要显式 subset),用 swap 避免阻塞首屏
const notoSerifSC = Noto_Serif_SC({
  weight: ["700", "900"],
  variable: "--font-noto-serif",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE_DEFAULT, template: SITE_TITLE_TEMPLATE },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: ORG_LEGAL_NAME }],
  creator: ORG_LEGAL_NAME,
  publisher: ORG_LEGAL_NAME,
  category: "technology",
  alternates: { canonical: "/" },
  robots: SEO_NOINDEX
    ? { index: false, follow: false }
    : {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
          "max-video-preview": -1,
        },
      },
  openGraph: {
    type: "website",
    locale: OG_LOCALE,
    url: "/",
    siteName: SITE_NAME,
    title: SITE_TITLE_DEFAULT,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE_DEFAULT,
    description: SITE_DESCRIPTION,
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={notoSerifSC.variable}
    >
      <body>
        <noscript>
          <style dangerouslySetInnerHTML={{ __html: ".reveal{opacity:1!important;transform:none!important}" }} />
        </noscript>
        {children}
      </body>
    </html>
  );
}
