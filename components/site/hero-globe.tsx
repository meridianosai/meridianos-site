"use client";

import { useEffect, useRef, useState } from "react";
import { Radar, UserRound } from "lucide-react";
import { createGlobe, loadWorld, paintGlobe } from "@/lib/globe";
import { BRANCH_LEN, createPairDirector, PAIR_SLOTS, type PairFrame } from "@/lib/hero-pairs";
import { startVisibleLoop, type VisibleLoop } from "@/lib/visible-loop";
import { HERO_PAIRS, type HeroPair } from "./hero-cards";
import { MeridianLines } from "./meridian-lines";
import { prefersReducedMotion } from "./motion";

// 卡片不压标题、副文和输入框：安全区从它们实际的右缘开始
const COPY_SELECTOR = ".hero-copy h1 .l, .hero-copy .hero-sub, .hero-copy .wc";

interface SlotNodes {
  signal: HTMLDivElement | null;
  contact: HTMLDivElement | null;
  pin: HTMLDivElement | null;
  leader: SVGLineElement | null;
  branch: SVGPathElement | null;
}

/**
 * 首屏地球：web-next 登录页那颗浅色地球，可见国家上成对出现「一条信号 → 负责这件事的人」。
 * 调度和排布在 lib/hero-pairs；这里只负责取数据、画地球、把每帧结果写到卡片上。
 * 卡片的位置与透明度每帧直接写 style（不走 React 渲染），初值（透明）放在 CSS 里，React 不碰这两个属性。
 */
export function HeroGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const linesRef = useRef<SVGSVGElement>(null);
  const nodes = useRef<SlotNodes[]>(Array.from({ length: PAIR_SLOTS }, () => ({ signal: null, contact: null, pin: null, leader: null, branch: null })));
  const [slots, setSlots] = useState<(HeroPair | null)[]>(() => Array(PAIR_SLOTS).fill(null));
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const svg = linesRef.current;
    const hero = canvas?.closest<HTMLElement>(".hero");
    if (!canvas || !svg || !hero) return;
    const still = prefersReducedMotion();
    let disposed = false;
    let loop: VisibleLoop | null = null;

    loadWorld()
      .then((world) => {
        if (disposed) return;
        const globe = createGlobe(canvas);
        const director = createPairDirector(globe, HERO_PAIRS, {
          still,
          onSlot: (slot, pair) => setSlots((prev) => prev.map((x, k) => (k === slot ? pair : x))),
        });

        const measure = () => {
          globe.resize();
          const left = hero.getBoundingClientRect().left;
          const rights = Array.from(hero.querySelectorAll(COPY_SELECTOR), (el) => el.getBoundingClientRect().right);
          director.setStage({ width: globe.width, height: globe.height, safeLeft: Math.max(0, ...rights) - left + 32 });
          svg.setAttribute("viewBox", `0 0 ${globe.width} ${globe.height}`);
        };
        const draw = ({ frames, fills }: ReturnType<typeof director.tick>) => {
          frames.forEach((f, slot) => applyFrame(nodes.current[slot], f));
          paintGlobe(globe, world, { fills, outline: 0.6 });
        };
        const settle = () => draw(director.settle(performance.now()));

        measure();
        setReady(true);
        if (still) settle();
        loop = startVisibleLoop(hero, {
          animate: !still,
          frame: (now) => draw(director.tick(now)),
          resize: () => {
            measure();
            if (still) settle();
          },
        });
        // 衬线字体换上后标题变宽，安全区要重算
        document.fonts?.ready.then(() => {
          if (disposed) return;
          measure();
          if (still) settle();
        });
      })
      .catch(() => {
        // 地理数据没取到：保留首屏文字与输入框，地球的位置换成一张静态经纬网
        if (!disposed) setFailed(true);
      });

    return () => {
      disposed = true;
      loop?.stop();
    };
  }, []);

  const bind = <K extends keyof SlotNodes>(slot: number, key: K) => (el: SlotNodes[K]) => {
    nodes.current[slot][key] = el;
  };

  return (
    <>
      <canvas ref={canvasRef} className={`hero-globe${ready ? " ready" : ""}`} aria-hidden="true" />
      <svg className={`hero-fallback${failed ? " on" : ""}`} viewBox="-310 -310 620 620" aria-hidden="true">
        <MeridianLines />
      </svg>
      <div className="hero-fx" aria-hidden="true">
        <svg ref={linesRef} className="hero-lines">
          {slots.map((_, i) => (
            <g key={i}>
              <line ref={bind(i, "leader")} />
              <path ref={bind(i, "branch")} className="ac-branch" strokeDasharray={BRANCH_LEN} />
            </g>
          ))}
        </svg>
        {slots.map((pair, i) => (
          <div key={`s${i}`} ref={bind(i, "signal")} className="ac ac-body">
            {pair ? <SignalCard pair={pair} /> : null}
          </div>
        ))}
        {slots.map((pair, i) => (
          <div key={`c${i}`} ref={bind(i, "contact")} className="ac ac-body">
            {pair ? <ContactCard pair={pair} /> : null}
          </div>
        ))}
        {slots.map((_, i) => (
          <div key={`p${i}`} ref={bind(i, "pin")} className="ac">
            <span className="ac-pin" />
          </div>
        ))}
      </div>
    </>
  );
}

const px = (n: number) => `${n.toFixed(1)}px`;

function applyFrame(n: SlotNodes, f: PairFrame | null) {
  if (!f) {
    for (const el of [n.signal, n.contact, n.pin, n.leader, n.branch]) if (el) el.style.opacity = "0";
    return;
  }
  if (n.signal) {
    n.signal.style.transform = `translate3d(${px(f.signal.x)},${px(f.signal.y)},0)`;
    n.signal.style.opacity = f.signal.opacity.toFixed(3);
  }
  if (n.contact) {
    n.contact.style.transform = `translate3d(${px(f.contact.x)},${px(f.contact.y)},0)`;
    n.contact.style.opacity = f.contact.opacity.toFixed(3);
  }
  if (n.pin) {
    n.pin.style.transform = `translate3d(${px(f.pin.x)},${px(f.pin.y)},0)`;
    n.pin.style.opacity = f.pin.opacity.toFixed(3);
  }
  if (n.leader) {
    const { x1, y1, x2, y2, opacity } = f.leader;
    n.leader.setAttribute("x1", x1.toFixed(1));
    n.leader.setAttribute("y1", y1.toFixed(1));
    n.leader.setAttribute("x2", x2.toFixed(1));
    n.leader.setAttribute("y2", y2.toFixed(1));
    n.leader.style.opacity = opacity.toFixed(3);
  }
  if (n.branch) {
    n.branch.setAttribute("d", f.branch.d);
    n.branch.style.strokeDashoffset = f.branch.offset.toFixed(1);
    n.branch.style.opacity = f.branch.opacity.toFixed(3);
  }
}

function SignalCard({ pair }: { pair: HeroPair }) {
  return (
    <div className="ac-in">
      <div className="ac-top">
        <span className="ac-tag signal">
          <Radar className="i" />
          信号
        </span>
        <span className="ac-region">{pair.region}</span>
      </div>
      <div className="ac-sig">
        <b>{pair.signal.headline}</b>
        <span>
          {pair.signal.company} · {pair.signal.field}
        </span>
      </div>
    </div>
  );
}

function ContactCard({ pair }: { pair: HeroPair }) {
  const { name, role, company, avatar } = pair.contact;
  return (
    <div className="ac-in">
      <div className="ac-top">
        <span className="ac-tag contact">
          <UserRound className="i" />
          联系人
        </span>
      </div>
      <div className="ac-ct">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/fleet/portrait-${avatar}.jpg`} alt="" width={44} height={44} loading="lazy" decoding="async" />
        <div>
          <b>{name}</b>
          <span>{role}</span>
          <em>{company}</em>
        </div>
      </div>
    </div>
  );
}
