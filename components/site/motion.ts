"use client";

import { useSyncExternalStore } from "react";

// 「减少动态效果」只在这一处判断；事件和 effect 里用 prefersReducedMotion，渲染里用 useMotionAllowed
const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia(REDUCE_QUERY).matches;
}

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(REDUCE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * 能不能放动效：服务端与首次水合按「不能」渲染（直接给终态，没有脚本也看得到全部内容），
 * 浏览器里没开「减少动态效果」时才为 true。
 */
export function useMotionAllowed(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => !prefersReducedMotion(),
    () => false,
  );
}
