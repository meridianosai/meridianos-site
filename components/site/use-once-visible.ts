"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";

/** 元素第一次进入视口（按 threshold 比例）时调一次 onVisible */
export function useOnVisible(ref: RefObject<Element | null>, threshold: number, onVisible: () => void) {
  const latest = useRef(onVisible);
  useEffect(() => {
    latest.current = onVisible;
  });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          latest.current();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);
}

/** 元素第一次进入视口后返回 true，之后不再变化 */
export function useOnceVisible(ref: RefObject<Element | null>, threshold = 0.3): boolean {
  const [seen, setSeen] = useState(false);
  useOnVisible(ref, threshold, () => setSeen(true));
  return seen;
}

const noSubscribe = () => () => {};

/**
 * 能不能放动效：服务端与首次水合按「不能」渲染（直接给终态，没有脚本也看得到全部内容），
 * 浏览器里没开「减少动态效果」时才为 true。
 */
export function useMotionAllowed(): boolean {
  return useSyncExternalStore(
    noSubscribe,
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

/**
 * 进入视口后按时间表（毫秒，从开始算）逐步推进的回放。返回走过了几步：
 * 不能放动效时恒为终态；能放但还没开始时是 0（不先露出终态再闪回开头）。
 * replay(delay) 从头再放一遍，用于「回到来源网页」、首屏的示例等手动触发。
 */
export function usePlayback(ref: RefObject<Element | null>, times: readonly number[], threshold = 0.35) {
  const motion = useMotionAllowed();
  const [t0, setT0] = useState<number | null>(null);
  const [step, setStep] = useState(0);
  const started = useRef(false);

  const replay = useCallback((delay = 0) => {
    started.current = true;
    setStep(0);
    setT0(performance.now() + delay);
  }, []);

  useOnVisible(ref, threshold, () => {
    if (!started.current) replay(0);
  });

  useEffect(() => {
    if (t0 === null || !motion) return;
    const timers = times.map((at, i) => setTimeout(() => setStep(i + 1), Math.max(0, t0 + at - performance.now())));
    return () => timers.forEach(clearTimeout);
  }, [t0, times, motion]);

  return { step: !motion ? times.length : t0 === null ? 0 : step, replay, motion };
}
