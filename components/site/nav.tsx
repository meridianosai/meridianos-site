"use client";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function SiteNav() {
  return (
    <nav className="site-nav">
      <div className="nav-in">
        <a
          className="brand"
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            scrollToId("top");
          }}
        >
          <svg viewBox="0 0 200 200" aria-hidden="true">
            <g stroke="#26304F" strokeWidth="10" fill="none">
              <path d="M29 155 50 44M50 44 171 155M142 44 29 155M142 44 97 109M97 109 171 155M142 44 171 155" />
            </g>
            <g fill="#26304F">
              <circle cx="50" cy="44" r="15" />
              <circle cx="142" cy="44" r="15" />
              <circle cx="97" cy="109" r="15" />
              <circle cx="29" cy="155" r="15" />
              <circle cx="171" cy="155" r="15" />
            </g>
          </svg>
          <span>
            <span className="nm">子午纪</span>
            <span className="en">MERIDIAN</span>
          </span>
        </a>
        <div className="nav-links">
          <a href="#chuhaicha">出海查 AI</a>
          <a href="#flow">拓客全流程</a>
          <a href="#founder">关于我们</a>
        </div>
        <button className="nav-cta" onClick={() => scrollToId("chuhaicha")}>
          免费用出海查
        </button>
      </div>
    </nav>
  );
}
