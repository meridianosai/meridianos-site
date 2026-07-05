import type { Metadata } from "next";
import { Inter, Noto_Serif_SC, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

// CJK 字体体量大,不预加载(否则 next/font 需要显式 subset),用 swap 避免阻塞首屏
const notoSerifSC = Noto_Serif_SC({
  weight: ["600", "700", "900"],
  variable: "--font-noto-serif",
  display: "swap",
  preload: false,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "子午纪 Meridian — 出海全流程拓客引擎",
  description:
    "出海查 AI 帮你看透一家海外公司;拓客引擎从市场调研到一键触达,替你跑完全程。人做决策,Agent 跑腿。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${inter.variable} ${notoSerifSC.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
