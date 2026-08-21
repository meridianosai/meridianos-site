import Link from "next/link";
import type { ReactNode } from "react";

export function LegalDoc({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="legal-page">
      <header className="legal-header">
        <div className="legal-header-in">
          <Link href="/" className="legal-brand">
            <svg viewBox="0 0 200 200" aria-hidden="true">
              <g stroke="currentColor" strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.55">
                <path d="M29 155 50 44M50 44 171 155M142 44 29 155M142 44 97 109M97 109 171 155M142 44 171 155" />
              </g>
              <g fill="currentColor">
                <circle cx="50" cy="44" r="16" />
                <circle cx="142" cy="44" r="16" />
                <circle cx="97" cy="109" r="16" />
                <circle cx="29" cy="155" r="16" />
                <circle cx="171" cy="155" r="16" />
              </g>
            </svg>
            <b>子午纪</b>
          </Link>
          <Link href="/" className="legal-back">返回主页</Link>
        </div>
      </header>

      <main className="legal-main">
        <h1>{title}</h1>
        <p className="legal-updated">更新日期：{updated}</p>
        <div className="legal-body">{children}</div>
      </main>
    </div>
  );
}
