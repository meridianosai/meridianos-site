"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

interface RevealProps {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

/**
 * 滚动浮现:元素进入视口后追加 `.in`,复刻原型的 IntersectionObserver 行为。
 * `.reveal` / `.reveal.in` 的过渡样式定义在 globals.css。
 */
export function Reveal({ as: Tag = "div", className, children }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={["reveal", className].filter(Boolean).join(" ")}>
      {children}
    </Tag>
  );
}
