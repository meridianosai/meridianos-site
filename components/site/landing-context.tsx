"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { prefersReducedMotion } from "./motion";

/** 首屏输入框交给内测表单的东西：只有识别到的官网（文件只在首屏显示名字，不离开浏览器） */
export interface Prefill {
  site: string | null;
}

/**
 * 首屏、理解区、内测表单分在不同组件里。首屏的提交是一次事件：用一个小的事件通道把它
 * 交给订阅方，订阅方在回调里处理（改自己的 state、聚焦），不经过 effect 去「对比 prop 变化」。
 */
export interface LandingBus {
  /** 首屏普通提交：内测表单预填官网并聚焦联系方式 */
  prefill(p: Prefill): void;
  /** 首屏用示例公司提交：理解区从头放一遍资料理解 */
  replayDemo(): void;
  onPrefill(fn: (p: Prefill) => void): () => void;
  onReplayDemo(fn: () => void): () => void;
}

function createLandingBus(): LandingBus {
  const prefillers = new Set<(p: Prefill) => void>();
  const demos = new Set<() => void>();
  return {
    prefill: (p) => prefillers.forEach((fn) => fn(p)),
    replayDemo: () => demos.forEach((fn) => fn()),
    onPrefill(fn) {
      prefillers.add(fn);
      return () => {
        prefillers.delete(fn);
      };
    },
    onReplayDemo(fn) {
      demos.add(fn);
      return () => {
        demos.delete(fn);
      };
    },
  };
}

const LandingContext = createContext<LandingBus | null>(null);

export function LandingProvider({ children }: { children: ReactNode }) {
  // 通道建一次，value 永远是同一个对象，订阅方不会因为它重渲染
  const [bus] = useState(createLandingBus);
  return <LandingContext.Provider value={bus}>{children}</LandingContext.Provider>;
}

export function useLanding(): LandingBus {
  const bus = useContext(LandingContext);
  if (!bus) throw new Error("useLanding must be used inside <LandingProvider>");
  return bus;
}

/** 滚到某一节；固定导航的让位靠 CSS 的 scroll-margin-top */
export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

/** 内测区的锚点：沿用线上版的 #principles，外部已有的链接不失效 */
export const WAITLIST_ID = "principles";
