"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Compass,
  ExternalLink,
  Globe,
  Headphones,
  LocateFixed,
  Lock,
  Maximize2,
  Minus,
  Plus,
  RotateCcw,
  RotateCw,
  X,
} from "lucide-react";
import { LOTUS } from "./demo-data";
import { Tab, TAB_COLORS } from "./product-ui";
import { usePlayback } from "./use-once-visible";

type Phase = "opening" | "live" | "scrolled" | "found";
const PHASES: Phase[] = ["opening", "live", "scrolled", "found"];
// 冷启动时沙箱要十几秒；示例里缩短成一秒多：打开 → 网页出现 → 滚到摘录 → 定位成功
const TIMES = [1100, 1500, 4200];

const QUOTE =
  "Lotus Sound plans to expand its portable audio range this autumn, adding new true wireless earbuds and a compact speaker for commuters.";

/**
 * 来源演示框：照 web-next 的来源标签（source-window）与沙箱浏览器（sandbox-screen）。网页打开后滚到摘录，
 * 用荧光笔划出那一句。示例网页是为落地页写的虚构页面。右侧 Agent 栏由服务端渲染后传进来。
 */
export function SourceDemo({ agent }: { agent: ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const { step, replay } = usePlayback(frameRef, TIMES, 0.4);
  const phase = PHASES[step];

  // 网页滚到摘录那一句：位移写在 CSS 变量上（React 不管这个节点的 style），过渡交给样式
  useEffect(() => {
    const aim = () => {
      const page = pageRef.current;
      const mark = markRef.current;
      const view = viewRef.current;
      if (!page || !mark || !view) return;
      page.style.setProperty("--scroll", `-${Math.max(0, Math.round(mark.offsetTop - view.clientHeight * 0.4))}px`);
    };
    if (step >= 1) aim();
    window.addEventListener("resize", aim);
    return () => window.removeEventListener("resize", aim);
  }, [step]);

  const reached = (p: Phase) => PHASES.indexOf(phase) >= PHASES.indexOf(p);
  const cls = ["k", "srcx-frame", reached("live") && "live", reached("scrolled") && "scrolled", reached("found") && "found", phase === "opening" && "reset"]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={frameRef} className={cls} role="group" aria-label="示例：在来源标签里打开网页并划出摘录">
      <div className="pane k-wb">
        <div className="k-tabs">
          <Tab icon={Compass} color={TAB_COLORS.explore}>
            探索
          </Tab>
          <Tab icon={Building2} color={TAB_COLORS.company} closable>
            {LOTUS.name}
          </Tab>
          <Tab icon={Globe} color={TAB_COLORS.source} on closable>
            {LOTUS.signals[0].title}
          </Tab>
          <span className="k-tools">
            <span className="ibtn">
              <Maximize2 className="i" />
            </span>
          </span>
        </div>
        <div className="sw-h">
          <Globe className="i" />
          <div className="t">
            <b>{LOTUS.name} · 新品动态（示例网页）</b>
            <span>lotussound.vn/news/portable-audio</span>
          </div>
          <div className="sw-grp">
            <span className="ibtn">
              <ChevronLeft className="i" />
            </span>
            <span className="n">1 / 2</span>
            <span className="ibtn">
              <ChevronRight className="i" />
            </span>
          </div>
          <div className="sw-grp">
            <span className="ibtn">
              <Minus className="i" />
            </span>
            <span className="n">80%</span>
            <span className="ibtn">
              <Plus className="i" />
            </span>
          </div>
          <button type="button" className="ibtn" aria-label="回到来源网页" title="回到来源网页" onClick={() => replay(0)}>
            <RotateCcw className="i" />
          </button>
          <span className="ibtn">
            <ExternalLink className="i" />
          </span>
        </div>
        <div className="sw-qw">
          <figure className="sw-q">
            <div className="qt">
              <blockquote>{QUOTE}</blockquote>
              <figcaption>lotussound.vn · 示例网页，内容为虚构</figcaption>
            </div>
            <span className="ibtn loc" title="在网页里定位摘录">
              <LocateFixed className="i" />
            </span>
            <span className="ibtn">
              <ChevronDown className="i" />
            </span>
          </figure>
        </div>
        <div className="sw-screen">
          <div className="sw-open" role="status">
            <span className="spin" />
            正在打开网页
          </div>
          <div className="cw">
            <div className="cw-tabs">
              <span className="cw-tab">
                <i />
                <span>Lotus Sound · Portable audio</span>
                <X className="i" />
              </span>
              <span className="cw-plus">
                <Plus className="i" />
              </span>
            </div>
            <div className="cw-bar">
              <ArrowLeft className="i" />
              <ArrowRight className="i" />
              <RotateCw className="i" />
              <span className="cw-url">
                <Lock className="i" />
                lotussound.vn/news/portable-audio
              </span>
            </div>
            <div className="cw-view" ref={viewRef}>
              <div className="cw-page" ref={pageRef}>
                <div className="cw-site">
                  <b>LOTUS SOUND</b>
                  <span>Products</span>
                  <span>Stores</span>
                  <span>News</span>
                  <span>Partners</span>
                </div>
                <div className="cw-hero">
                  <Headphones className="cw-hero-ic" strokeWidth={1} />
                </div>
                <div className="cw-art">
                  <div className="cw-crumb">News › Product updates</div>
                  <h1>A new season of portable audio</h1>
                  <div className="cw-meta">18 September 2026 · Product updates</div>
                  <p>
                    Commuters are our fastest-growing customers in Ho Chi Minh City and Hanoi. They want earbuds that last a full day and speakers that fit in a backpack.
                  </p>
                  <p>
                    <mark className="hl" ref={markRef}>
                      {QUOTE}
                    </mark>
                  </p>
                  <p>We are talking to manufacturing partners who can support our own branding and retail packaging, starting with a single model and colour.</p>
                  <p>Launch dates will be announced in our stores and on this page.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {agent}
    </div>
  );
}
