"use client";

import { useEffect, useState, type CSSProperties } from "react";

const LINKS = [
  ["#understand", "理解业务"],
  ["#explore", "发现市场"],
  ["#account", "找到客户"],
  ["#crm", "跟进"],
  ["#chuhaicha", "出海查 AI"],
  ["#founder", "关于我们"],
] as const;

/** 顶部导航：滚动后才有底色；跳转靠锚点 + CSS 的 scroll-margin-top / smooth 滚动 */
export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const sync = () => setScrolled(window.scrollY > 8);
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, []);

  return (
    <nav className={`site-nav${scrolled ? " scrolled" : ""}`} aria-label="主导航">
      <div className="wrap nav-in">
        <a className="brand" href="#top" aria-label="子午纪 Meridian">
          <svg className="logo" viewBox="0 0 200 200" aria-hidden="true">
            <g className="ln" stroke="currentColor" strokeWidth="10" fill="none" strokeLinecap="round">
              {["M29 155 50 44", "M50 44 171 155", "M142 44 29 155", "M142 44 97 109", "M97 109 171 155", "M142 44 171 155"].map((d, i) => (
                <path key={d} d={d} style={{ "--i": i } as CSSProperties} />
              ))}
            </g>
            <g className="nd" fill="currentColor">
              {[
                [50, 44],
                [142, 44],
                [97, 109],
                [29, 155],
                [171, 155],
              ].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="15" style={{ "--i": i } as CSSProperties} />
              ))}
            </g>
          </svg>
          <span>
            <span className="nm">子午纪</span>
            <span className="en">MERIDIAN</span>
          </span>
        </a>
        <div className="nav-links">
          {LINKS.map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </div>
        <div className="nav-ctas">
          <a className="btn btn-ghost nav-free" href="#chuhaicha">
            免费用出海查
          </a>
          <a className="btn btn-primary" href="#waitlist">
            申请内测
          </a>
        </div>
      </div>
    </nav>
  );
}
