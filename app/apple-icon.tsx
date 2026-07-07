import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#26304F",
        }}
      >
        <svg width="118" height="118" viewBox="0 0 200 200">
          <g stroke="#ffffff" strokeWidth="10" fill="none">
            <path d="M29 155 50 44M50 44 171 155M142 44 29 155M142 44 97 109M97 109 171 155M142 44 171 155" />
          </g>
          <g fill="#ffffff">
            <circle cx="50" cy="44" r="15" />
            <circle cx="142" cy="44" r="15" />
            <circle cx="97" cy="109" r="15" />
            <circle cx="29" cy="155" r="15" />
            <circle cx="171" cy="155" r="15" />
          </g>
        </svg>
      </div>
    ),
    { ...size },
  );
}
