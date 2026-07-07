"use client";

import { useEffect, useRef } from "react";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

/**
 * Hero 工作台真跑动画:一句指令 → 左侧子任务累加执行 → 右侧工作台跟随 → 吐出询盘,循环。
 * 逻辑忠实移植自 docs/prototype/index.html 的 IIFE,查询作用域收敛到组件根节点。
 */
export function Hero() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const q = <T extends Element = HTMLElement>(id: string) =>
      root.querySelector<T>("#" + id);

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cpUser = q("cpUser");
    const cpInput = q("cpInput");
    const cpCr = q<HTMLElement>("cpCr");
    const cpWorkLbl = q("cpWorkLbl");
    const cpProg = q("cpProg");
    const cpTl = q<HTMLElement>("cpTl");
    const cpWork = root.querySelector<HTMLElement>(".cp-work");
    const cpCover = q("cpCover");
    const tkEnd = q("tkEnd");
    const tasks = [0, 1, 2, 3].map((i) => q("tk" + i));
    const cards = [1, 2, 3, 4].map((i) => q("wc" + i));
    if (!cpUser || !cpInput || !cpCr || !cpWork || !cpTl || !cpWorkLbl || !cpProg)
      return;

    const query = "我做扫地机器人,想主动打进德国零售渠道";
    const meta = [
      { lbl: "德国渠道下钻", prog: "1 / 6" },
      { lbl: "锁定连锁买家", prog: "3 / 6" },
      { lbl: "撰写开发信", prog: "4 / 6" },
      { lbl: "收到询盘", prog: "6 / 6" },
    ];
    let timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));

    function growLine(toEl: Element | null) {
      if (!cpTl || !toEl) return;
      const tlTop = cpTl.getBoundingClientRect().top;
      const dot = toEl.querySelector<HTMLElement>(".dot");
      if (!dot) return;
      const dotY = dot.getBoundingClientRect().top + dot.offsetHeight / 2;
      cpTl.style.setProperty("--line-h", Math.max(0, dotY - tlTop - 7) + "px");
    }
    function reset() {
      timers.forEach(clearTimeout);
      timers = [];
      cpInput!.textContent = "";
      cpCr!.style.display = "inline-block";
      cpUser!.textContent = "";
      cpUser!.style.opacity = "0";
      cpWorkLbl!.textContent = "待命中";
      cpProg!.textContent = "就绪";
      cpWork!.classList.remove("running");
      cpCover?.classList.remove("hide");
      tasks.forEach((t) => t?.classList.remove("show", "running", "done"));
      tkEnd?.classList.remove("show");
      cpTl!.style.setProperty("--line-h", "0px");
      cards.forEach((c) => c?.classList.remove("on"));
    }
    function typeQuery(cb: () => void) {
      if (reduce) {
        cpInput!.textContent = query;
        cb();
        return;
      }
      let c = 0;
      const t = setInterval(() => {
        cpInput!.textContent = query.slice(0, ++c);
        if (c >= query.length) {
          clearInterval(t);
          at(650, cb);
        }
      }, 70);
      timers.push(t);
    }
    function activate(i: number) {
      for (let k = 0; k < i; k++) {
        tasks[k]?.classList.remove("running");
        tasks[k]?.classList.add("show", "done");
      }
      tasks[i]?.classList.add("show", "running");
      cards.forEach((c, k) => c?.classList.toggle("on", k === i));
      cpWorkLbl!.textContent = meta[i].lbl;
      cpProg!.textContent = meta[i].prog;
      requestAnimationFrame(() => growLine(tasks[i]));
    }
    function finish() {
      tasks[3]?.classList.remove("running");
      tasks[3]?.classList.add("done");
      tkEnd?.classList.add("show");
      requestAnimationFrame(() => growLine(tkEnd));
    }
    function run() {
      reset();
      if (reduce) {
        cpCover?.classList.add("hide");
        cpCr!.style.display = "none";
        cpUser!.textContent = query;
        cpUser!.style.opacity = "1";
        tasks.forEach((t) => t?.classList.add("show", "done"));
        tkEnd?.classList.add("show");
        requestAnimationFrame(() => growLine(tkEnd));
        cards[3]?.classList.add("on");
        cpWorkLbl!.textContent = meta[3].lbl;
        cpProg!.textContent = meta[3].prog;
        return;
      }
      at(1500, () => cpCover?.classList.add("hide"));
      at(2100, () =>
        typeQuery(() => {
          cpCr!.style.display = "none";
          cpUser!.textContent = query;
          cpUser!.style.transition = "opacity .4s";
          cpUser!.style.opacity = "1";
          cpInput!.textContent = "等待下一条指令…";
          cpWork!.classList.add("running");
          at(500, () => activate(0));
          at(4200, () => activate(1));
          at(7900, () => activate(2));
          at(11600, () => activate(3));
          at(13200, () => finish());
          at(17400, () => run());
        }),
      );
    }

    const cockpit = root.querySelector(".cockpit");
    if (!cockpit) return;
    const ioC = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            run();
            ioC.disconnect();
          }
        });
      },
      { threshold: 0.3 },
    );
    ioC.observe(cockpit);
    return () => {
      ioC.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <header className="hero" id="top" ref={rootRef}>
      <svg
        className="grid-ref"
        viewBox="0 0 640 620"
        preserveAspectRatio="xMaxYMid slice"
        aria-hidden="true"
      >
        <line x1="90" y1="0" x2="90" y2="620" />
        <text className="lon-num" x="94" y="600">90°E</text>
        <line x1="210" y1="0" x2="210" y2="620" />
        <text className="lon-num" x="214" y="600">108°E</text>
        <line x1="330" y1="0" x2="330" y2="620" />
        <text className="lon-num" x="334" y="600">120°E</text>
        <line x1="450" y1="0" x2="450" y2="620" />
        <text className="lon-num" x="454" y="600">135°E</text>
        <line x1="570" y1="0" x2="570" y2="620" />
        <text className="lon-num" x="574" y="600">150°E</text>
        <line x1="0" y1="140" x2="640" y2="140" />
        <text className="lon-num" x="8" y="134">40°N</text>
        <line x1="0" y1="300" x2="640" y2="300" />
        <text className="lon-num" x="8" y="294">20°N</text>
        <line x1="0" y1="460" x2="640" y2="460" />
        <text className="lon-num" x="8" y="454">0°</text>
      </svg>

      <div className="wrap hero-in">
        <div className="hero-copy">
          <div className="coord">B2B OUTBOUND · 中国 → 全球</div>
          <h1>
            不等询盘上门,
            <br />
            <span className="em">主动</span>把海外客户谈进来。
          </h1>
          <p className="hero-sub">
            不投广告、不等询盘——用自然语言指挥 Agent,
            <b>主动锁定海外 B 端买家、逐个谈进去</b>
            。从零起步的团队用它搭线,已有打法的团队用它复刻。
          </p>
          <div className="hero-ctas">
            <a
              className="btn-primary"
              href="#chuhaicha"
              onClick={(e) => {
                e.preventDefault();
                scrollToId("chuhaicha");
              }}
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path
                  d="M11 1H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle cx="8" cy="12" r="1" fill="currentColor" />
              </svg>
              出海查 AI · 已上线
            </a>
            <a
              className="btn-ghost"
              href="#flow"
              onClick={(e) => {
                e.preventDefault();
                scrollToId("flow");
              }}
            >
              <span className="dot" />
              看完整拓客流程
            </a>
          </div>
          <div className="hero-stats">
            <div className="s">
              <div className="num">
                10<span>+</span>
              </div>
              <div className="lbl">已服务头部企业</div>
            </div>
            <div className="s">
              <div className="num">
                200<span>+</span>
              </div>
              <div className="lbl">深度调研已交付</div>
            </div>
            <div className="s">
              <div className="num">
                6<span>步</span>
              </div>
              <div className="lbl">拓客全自动闭环</div>
            </div>
          </div>
          <div className="hero-industries">
            已服务 智能硬件 · 软件服务 · AI 出海 等领域的头部企业
          </div>
        </div>

        <div className="cockpit" aria-hidden="true">
          <div className="cp-bar">
            <span className="d" />
            <span className="d" />
            <span className="d" />
            <span className="t">meridian.app / 外联工作台</span>
            <span className="live">LIVE</span>
          </div>
          <div className="cp-cover" id="cpCover">
            <div className="cc-inner">
              <span className="cc-badge">
                <span className="cc-dot" />
                LIVE DEMO
              </span>
              <div className="cc-title">演示中</div>
              <div className="cc-sub">看 Agent 如何把海外客户一步步谈进来</div>
              <div className="cc-hint">即将开始…</div>
            </div>
          </div>
          <div className="cp-body">
            <div className="cp-chat">
              <div className="cp-log">
                <div className="cp-umsg" id="cpUser" />
                <div className="cp-tl" id="cpTl">
                  <div className="cp-task" id="tk0">
                    <span className="dot" />
                    <div className="tt">
                      德国渠道下钻<span className="badge">research</span>
                    </div>
                    <div className="desc">锁定线下家电连锁 · 首打 NRW / 巴伐利亚</div>
                  </div>
                  <div className="cp-task" id="tk1">
                    <span className="dot" />
                    <div className="tt">
                      锁定连锁买家<span className="badge">targets</span>
                    </div>
                    <div className="desc">MediaHaus 等三家连锁,正招募供应商</div>
                  </div>
                  <div className="cp-task" id="tk2">
                    <span className="dot" />
                    <div className="tt">
                      撰写开发信<span className="badge">outreach</span>
                    </div>
                    <div className="desc">逐家定制,引用各自采购信号</div>
                  </div>
                  <div className="cp-task" id="tk3">
                    <span className="dot" />
                    <div className="tt">
                      收到高意向询盘<span className="badge">reply</span>
                    </div>
                    <div className="desc">MediaHaus 采购回复,已归入收件箱</div>
                  </div>
                  <div className="cp-end" id="tkEnd">
                    <span className="dot" />
                    <span className="lbl">全流程跑通 · 等待你的下一条指令</span>
                  </div>
                </div>
              </div>
              <div className="cp-input">
                <span id="cpInput" />
                <span className="cr" id="cpCr" />
                <span className="snd">↑</span>
              </div>
            </div>
            <div className="cp-work">
              <div className="cp-work-h">
                <span className="lbl">
                  <span className="pin" />
                  <span id="cpWorkLbl">工作台</span>
                </span>
                <span className="prog" id="cpProg" />
              </div>
              <div className="wcard" id="wc1">
                <div className="wcard-title">
                  德国零售渠道 · 下钻
                  <span className="st" id="wc1st">分析中…</span>
                </div>
                <div className="wm pick" style={{ animationDelay: ".1s" }}>
                  <div className="l">
                    <span className="fg">线下</span>
                    <span className="cn">家电连锁</span>
                  </div>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="bar">
                      <i style={{ width: "52%" }} />
                    </span>
                    <span className="pct">52%</span>
                  </span>
                </div>
                <div className="wm" style={{ animationDelay: ".3s" }}>
                  <div className="l">
                    <span className="fg">电商</span>
                    <span className="cn">平台零售</span>
                  </div>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="bar">
                      <i style={{ width: "33%" }} />
                    </span>
                    <span className="pct">33%</span>
                  </span>
                </div>
                <div className="wm" style={{ animationDelay: ".5s" }}>
                  <div className="l">
                    <span className="fg">分销</span>
                    <span className="cn">区域分销</span>
                  </div>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="bar">
                      <i style={{ width: "15%" }} />
                    </span>
                    <span className="pct">15%</span>
                  </span>
                </div>
                <div className="wm-note" style={{ animationDelay: ".7s" }}>
                  ◆ 首打区域 <b>NRW / 巴伐利亚</b> · 门店密度最高、集采集中 · CleanMax
                  提价后半价档真空
                </div>
              </div>
              <div className="wcard" id="wc2">
                <div className="wcard-title">
                  锁定连锁买家
                  <span className="st ok" id="wc2st">已校验</span>
                </div>
                <div className="wc" style={{ animationDelay: ".1s" }}>
                  <span className="av">MH</span>
                  <span>
                    <div className="nm">MediaHaus</div>
                    <div className="ro">家电连锁 · NRW · 正招募供应商</div>
                  </span>
                  <span className="ck">✓ 高匹配</span>
                </div>
                <div className="wc" style={{ animationDelay: ".3s" }}>
                  <span className="av">EX</span>
                  <span>
                    <div className="nm">Expert SE</div>
                    <div className="ro">家电连锁 · 全德 · 集采决策</div>
                  </span>
                  <span className="ck">✓ 高匹配</span>
                </div>
                <div className="wc" style={{ animationDelay: ".5s" }}>
                  <span className="av">EP</span>
                  <span>
                    <div className="nm">EP:Group</div>
                    <div className="ro">家电连锁 · 巴伐利亚 · 门店密</div>
                  </span>
                  <span className="ck">✓ 高匹配</span>
                </div>
              </div>
              <div className="wcard" id="wc3">
                <div className="wcard-title">
                  撰写开发信
                  <span className="st ok" id="wc3st">EN · 已生成</span>
                </div>
                <div className="we">
                  <div className="to">TO: S. BRANDT · Buyer · MEDIAHAUS</div>
                  <div className="ln" style={{ animationDelay: ".2s" }}>
                    Dear Ms. Brandt,
                  </div>
                  <div className="ln" style={{ animationDelay: ".9s" }}>
                    Saw you&apos;re{" "}
                    <span className="ev">
                      sourcing robot vacuums for the fall lineup
                    </span>{" "}
                    — with CleanMax&apos;s price hike leaving the mid-tier open,
                  </div>
                  <div className="ln" style={{ animationDelay: "1.7s" }}>
                    we ship from our DE warehouse in <span className="ev">12 days</span>…
                  </div>
                </div>
              </div>
              <div className="wcard" id="wc4">
                <div className="wcard-title">
                  高意向询盘 · 收件箱<span className="st ok">回复处理</span>
                </div>
                <div className="wr">
                  <div className="rh">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16v12H5.2L4 17.2z" />
                    </svg>
                    S. Brandt · MediaHaus 回复了
                  </div>
                  <div className="rq">
                    &quot;Interesting. Can you send your catalog and MOQ for the S9?&quot;
                  </div>
                  <div className="rf">
                    <span>意向等级 高</span>
                    <span>NRW · 家电连锁采购</span>
                  </div>
                  <div className="wxpush">✓ 已归入收件箱 · 高意向已置顶</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
