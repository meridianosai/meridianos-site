"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

/** 首屏输入框带给内测表单的东西：官网（识别到才有）和附件个数（只有名字，文件不离开浏览器） */
export interface Prefill {
  site: string | null;
  files: number;
}

interface LandingState {
  prefill: Prefill | null;
  setPrefill(p: Prefill): void;
  /** 首屏「用示例公司试试」发送后，让理解区从头放一遍那段资料理解 */
  runDemo(): void;
  /** 理解区挂上自己的重放函数；返回注销函数 */
  registerDemo(fn: () => void): () => void;
}

const LandingContext = createContext<LandingState | null>(null);

/** 首屏、理解区、内测表单分在不同组件里，用一个页面级 context 串起来 */
export function LandingProvider({ children }: { children: ReactNode }) {
  const [prefill, setPrefill] = useState<Prefill | null>(null);
  const demo = useRef<(() => void) | null>(null);
  const runDemo = useCallback(() => demo.current?.(), []);
  const registerDemo = useCallback((fn: () => void) => {
    demo.current = fn;
    return () => {
      if (demo.current === fn) demo.current = null;
    };
  }, []);
  const value = useMemo(() => ({ prefill, setPrefill, runDemo, registerDemo }), [prefill, runDemo, registerDemo]);
  return <LandingContext.Provider value={value}>{children}</LandingContext.Provider>;
}

export function useLanding(): LandingState {
  const ctx = useContext(LandingContext);
  if (!ctx) throw new Error("useLanding must be used inside <LandingProvider>");
  return ctx;
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** 滚到某一节；固定导航的让位靠 CSS 的 scroll-margin-top */
export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}
