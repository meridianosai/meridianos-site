/**
 * 元素在视口内、标签页可见时跑 requestAnimationFrame 循环，离开或切走就停；
 * 窗口尺寸变化防抖 120ms 后回调 resize。首屏地球和「发现合适市场」的下钻共用。
 */
export interface VisibleLoop {
  stop(): void;
}

export function startVisibleLoop(
  target: Element,
  {
    frame,
    resize,
    animate = true,
    rootMargin = "0px",
  }: {
    frame: (now: number) => void;
    resize: () => void;
    /** false 时只响应尺寸变化，不跑逐帧循环（减少动态效果） */
    animate?: boolean;
    rootMargin?: string;
  },
): VisibleLoop {
  let raf = 0;
  let onScreen = false;
  let stopped = false;
  let resizeTimer: ReturnType<typeof setTimeout> | undefined;

  const schedule = () => {
    if (animate && !stopped && onScreen && !document.hidden && !raf) raf = requestAnimationFrame(loop);
  };
  const loop = (now: number) => {
    raf = 0;
    frame(now);
    schedule();
  };
  const io = new IntersectionObserver(
    (entries) => {
      onScreen = entries[0].isIntersecting;
      schedule();
    },
    { rootMargin },
  );
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      schedule();
    }, 120);
  };

  io.observe(target);
  document.addEventListener("visibilitychange", schedule);
  window.addEventListener("resize", onResize);

  return {
    stop() {
      stopped = true;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      io.disconnect();
      document.removeEventListener("visibilitychange", schedule);
      window.removeEventListener("resize", onResize);
    },
  };
}
