import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "子午纪 Meridian — 出海全流程拓客引擎";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// OG 图用到的全部字符(传给 Google Fonts text= 以取最小子集)
const GLYPHS =
  "子午纪 Meridian不等询盘上门，主动把海外客户谈进来。出海查AI·拓客引擎meridianos.ai";

// 用旧 UA 让 Google Fonts 返回 satori 可用的 ttf(而非 woff2)
async function loadFont(weight: number, text: string): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@${weight}&text=${encodeURIComponent(
    text,
  )}`;
  const css = await (
    await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)",
      },
    })
  ).text();
  const src = css.match(/src:\s*url\((.+?)\)/)?.[1];
  if (!src) throw new Error("Noto Serif SC font url not found");
  return fetch(src).then((r) => r.arrayBuffer());
}

export default async function OpengraphImage() {
  const [serif700, serif900] = await Promise.all([
    loadFont(700, GLYPHS),
    loadFont(900, GLYPHS),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F8FAFD",
          padding: "72px 80px",
          fontFamily: "Noto Serif SC",
        }}
      >
        {/* 品牌行 */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="56" height="56" viewBox="0 0 200 200">
            <g stroke="#26304F" strokeWidth="12" fill="none">
              <path d="M29 155 50 44M50 44 171 155M142 44 29 155M142 44 97 109M97 109 171 155M142 44 171 155" />
            </g>
            <g fill="#26304F">
              <circle cx="50" cy="44" r="16" />
              <circle cx="142" cy="44" r="16" />
              <circle cx="97" cy="109" r="16" />
              <circle cx="29" cy="155" r="16" />
              <circle cx="171" cy="155" r="16" />
            </g>
          </svg>
          <div style={{ fontSize: 38, fontWeight: 700, color: "#1A1F2E" }}>
            子午纪 Meridian
          </div>
        </div>

        {/* 主张 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 78,
            fontWeight: 900,
            color: "#1A1F2E",
            lineHeight: 1.28,
          }}
        >
          <div style={{ display: "flex" }}>不等询盘上门，</div>
          <div style={{ display: "flex" }}>
            <span style={{ color: "#3E63DD" }}>主动</span>
            把海外客户谈进来。
          </div>
        </div>

        {/* 底部 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 28,
            fontWeight: 700,
            color: "#4A5268",
          }}
        >
          <div style={{ display: "flex" }}>出海查 AI · 拓客引擎</div>
          <div style={{ display: "flex", color: "#3E63DD" }}>meridianos.ai</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Noto Serif SC", data: serif700, weight: 700, style: "normal" },
        { name: "Noto Serif SC", data: serif900, weight: 900, style: "normal" },
      ],
    },
  );
}
