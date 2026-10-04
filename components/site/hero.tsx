"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type RefObject } from "react";
import { Building2, FileText, Plus, Radar, Send, UserRound, X } from "lucide-react";
import { createGlobe, GLOBE_COLORS, loadWorld, mixHex, paintGlobe } from "@/lib/globe";
import { HERO_PAIRS, type HeroPair } from "./hero-cards";
import { prefersReducedMotion, scrollToSection, useLanding } from "./landing-context";
import { MeridianLines } from "./meridian-lines";

const SLOTS = 2; // 同屏最多两对
const CARD_W = 284; // 与 web-next 登录页的卡同尺寸
const CARD_H = 120;
const GAP = 28; // 信号卡与联系人卡之间
const INDENT = 48; // 联系人卡相对信号卡往右缩进，像从它分出去的一枝
const BRANCH_X = 22; // 连线从信号卡底边的这个位置垂下
const PAIR_W = INDENT + CARD_W;
const PAIR_H = CARD_H * 2 + GAP;
const BRANCH_LEN = GAP + CARD_H / 2 + (INDENT - BRANCH_X);
const NAV_H = 64;

/**
 * 首屏：web-next 登录页那颗浅色地球，可见国家上成对出现「一条信号 → 负责这件事的人」；
 * 左边是主张和欢迎页样式的输入框。
 */
export function Hero() {
  const copyRef = useRef<HTMLDivElement>(null);
  return (
    <header className="hero" id="top">
      <HeroGlobe copyRef={copyRef} />
      <div className="wrap hero-in">
        <div className="hero-copy" ref={copyRef}>
          {/* 品牌 slogan 做引题：先读到为什么做，再读到做什么 */}
          <p className="kicker" style={{ "--d": 0 } as CSSProperties}>
            让天下没有难做的海外生意
          </p>
          <h1>
            <span className="l" style={{ "--d": 1 } as CSSProperties}>
              人，
            </span>
            <span className="l" style={{ "--d": 2 } as CSSProperties}>
              在<em>信号</em>的另一端。
            </span>
          </h1>
          <p className="hero-sub" style={{ "--d": 3 } as CSSProperties}>
            找准和你产品有关的采购信号，顺着它，找到该联系的那个人。
          </p>
          <Composer />
        </div>
      </div>
      <p className="hero-note">地球上的公司与人物均为示例</p>
    </header>
  );
}

/* ---------- 输入框：照 web-next 欢迎页（welcome-composer），示例只装资料，不替用户发送 ---------- */

const DEMO_TEXT = "https://shenggu-audio.com";
const DEMO_FILES = ["声谷电子 · 产品目录.pdf", "声谷电子 · 产品报价.xlsx"];
const URL_RE = /(?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s，。,]*)?/i;

function Composer() {
  const { setPrefill, runDemo } = useLanding();
  const [text, setText] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [demo, setDemo] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const typing = useRef<ReturnType<typeof setInterval> | null>(null);
  const empty = !text.trim() && files.length === 0;

  useEffect(() => () => {
    if (typing.current) clearInterval(typing.current);
  }, []);
  // 输入框随内容长高，到上限后滚动
  useEffect(() => {
    const ta = textRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(150, ta.scrollHeight)}px`;
  }, [text]);

  function stopTyping() {
    if (typing.current) clearInterval(typing.current);
    typing.current = null;
  }

  function submit(e?: { preventDefault(): void }) {
    e?.preventDefault();
    if (empty) return;
    if (demo) {
      runDemo();
      scrollToSection("understand");
      return;
    }
    setPrefill({ site: text.trim().match(URL_RE)?.[0] ?? null, files: files.length });
    scrollToSection("waitlist");
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  }

  function loadDemo() {
    stopTyping();
    setFiles([]);
    setDemo(false);
    const done = () => {
      setFiles(DEMO_FILES);
      setDemo(true);
      textRef.current?.focus();
    };
    if (prefersReducedMotion()) {
      setText(DEMO_TEXT);
      done();
      return;
    }
    let i = 0;
    setText("");
    typing.current = setInterval(() => {
      i += 1;
      setText(DEMO_TEXT.slice(0, i));
      if (i >= DEMO_TEXT.length) {
        stopTyping();
        done();
      }
    }, 34);
  }

  return (
    <>
      <form className="wc k" style={{ "--d": 4 } as CSSProperties} autoComplete="off" onSubmit={submit}>
        {files.length ? (
          <div className="wc-files">
            {files.map((name) => (
              <span key={name} className="wc-file">
                <FileText className="i" />
                <span>{name}</span>
                <button
                  type="button"
                  aria-label={`移除 ${name}`}
                  onClick={() => {
                    setFiles((f) => f.filter((x) => x !== name));
                    textRef.current?.focus();
                  }}
                >
                  <X className="i" />
                </button>
              </span>
            ))}
          </div>
        ) : null}
        <label className="vh" htmlFor="heroInput">
          官网、客户链接，或说说你想了解什么
        </label>
        <textarea
          id="heroInput"
          ref={textRef}
          rows={2}
          value={text}
          placeholder="贴官网、客户链接或添加资料，告诉我你想了解什么"
          onChange={(e) => {
            stopTyping();
            setDemo(false);
            setText(e.target.value);
          }}
          onKeyDown={onKeyDown}
        />
        {/* 只取文件名显示成 chip，文件不离开浏览器 */}
        <input
          ref={fileRef}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            const names = Array.from(e.target.files ?? []).map((f) => f.name);
            setFiles((f) => [...f, ...names.filter((n) => !f.includes(n))]);
            setDemo(false);
            e.target.value = "";
          }}
        />
        <button type="button" className="wc-plus" aria-label="添加附件" onClick={() => fileRef.current?.click()}>
          <Plus className="i" />
        </button>
        <button type="submit" className="wc-send" aria-label="发送消息" disabled={empty}>
          <Send className="i" />
        </button>
      </form>
      <p className="wc-ex k" style={{ "--d": 5 } as CSSProperties}>
        <button type="button" onClick={loadDemo}>
          <Building2 className="i" />
          用示例公司试试
        </button>
        <span className="wc-beta">
          <span className="dot new" />
          MeridianAI Fleet · 内测中
        </span>
      </p>
    </>
  );
}

/* ---------- 地球与成对的卡：先亮一条信号，再连出这家公司里负责这件事的人 ---------- */

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

interface LivePair {
  pair: HeroPair;
  slot: number;
  born: number;
  op: number;
  side: 1 | -1;
  /** 这一对卡的上沿相对锚点的纵向偏移，出生时定下，之后跟着锚点走 */
  dy: number;
}

interface SlotRefs {
  sig: HTMLDivElement | null;
  ct: HTMLDivElement | null;
  pin: HTMLDivElement | null;
  leader: SVGLineElement | null;
  branch: SVGPathElement | null;
}

function HeroGlobe({ copyRef }: { copyRef: RefObject<HTMLDivElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const linesRef = useRef<SVGSVGElement>(null);
  const refs = useRef<SlotRefs[]>(Array.from({ length: SLOTS }, () => ({ sig: null, ct: null, pin: null, leader: null, branch: null })));
  const [slots, setSlots] = useState<(HeroPair | null)[]>(() => Array(SLOTS).fill(null));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = canvas?.closest<HTMLElement>(".hero");
    const svg = linesRef.current;
    if (!canvas || !hero || !svg) return;
    const reduce = prefersReducedMotion();
    let disposed = false;
    let cleanup = () => {};

    loadWorld()
      .then((world) => {
        if (disposed) return;
        const g = createGlobe(canvas);
        const SPEED = 3; // 度 / 秒
        const LAT = 18;
        const LIFE = reduce ? Infinity : 9000;
        const FADE = 650;
        // 一对卡的节奏：信号淡入 → 连线从信号画向联系人 → 联系人淡入
        const BRANCH_AT = 900;
        const BRANCH_MS = 600;
        const CONTACT_AT = 1400;
        let lon = 18; // 视线中心经度，逐帧减小：地物自西向东移动，和地球自转同向
        let R = 300;
        let cx = 0;
        let cy = 0;
        let safeL = 0;
        let maxLive = SLOTS;
        let raf = 0;
        let last = 0;
        let nextSpawn = 0;
        let queue = 0;
        let onScreen = true;
        let speed = SPEED;
        let lastAlive = 0;
        const live: LivePair[] = [];

        const layout = () => {
          g.resize();
          const { width: W, height: H } = g;
          if (W < 900) {
            R = Math.min(W * 0.66, H * 0.36);
            cx = W * 0.5;
            cy = H + R * 0.1;
            maxLive = 0;
          } else {
            R = Math.min(H * 0.64, W * 0.4);
            cx = Math.max(W * 0.69, W - R * 0.8);
            cy = H * 0.56;
            // 卡片不压标题、副文和输入框：安全区从它们实际的右缘开始
            const copy = copyRef.current;
            const left = hero.getBoundingClientRect().left;
            const rights = copy
              ? Array.from(copy.querySelectorAll<HTMLElement>("h1 .l, .hero-sub, .wc")).map((el) => el.getBoundingClientRect().right)
              : [W * 0.5];
            safeL = Math.max(...rights) - left + 32;
            maxLive = W < 1200 ? 1 : SLOTS;
          }
          svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
          if (live.length > maxLive) live.slice(maxLive).forEach(kill);
        };
        const boxAt = (c: LivePair, p: [number, number]) => ({
          x: c.side > 0 ? p[0] + 28 : p[0] - 28 - PAIR_W,
          y: p[1] + c.dy,
          w: PAIR_W,
          h: PAIR_H,
        });
        type Box = ReturnType<typeof boxAt>;
        const overlap = (a: Box, b: Box, m: number) => a.x < b.x + b.w + m && b.x < a.x + a.w + m && a.y < b.y + b.h + m && b.y < a.y + a.h + m;
        const project = (pair: HeroPair) => g.proj(pair.at) as [number, number] | null;
        /** 按常速转 ms 毫秒之后，这个锚点的屏幕位置；背面返回 null */
        const futureAt = (pair: HeroPair, ms: number) => {
          g.view([lon - (SPEED * ms) / 1000, LAT], R, cx, cy);
          const q = g.angle(pair.at) < 1.1 ? project(pair) : null;
          g.view([lon, LAT], R, cx, cy);
          return q;
        };

        /** 放出一对卡；放成功返回 true */
        function trySpawn(now: number): boolean {
          if (live.length >= maxLive) return false;
          const slot = [...Array(SLOTS).keys()].find((i) => !live.some((c) => c.slot === i));
          if (slot === undefined) return false;
          for (let i = 0; i < HERO_PAIRS.length; i++) {
            const pair = HERO_PAIRS[(queue + i) % HERO_PAIRS.length];
            if (live.some((c) => c.pair.id === pair.id)) continue;
            if (g.angle(pair.at) > 0.9) continue;
            const p = project(pair);
            if (!p || p[0] < safeL || p[0] > g.width - 40 || p[1] < NAV_H + 30 || p[1] > g.height - 60) continue;
            // 地球一直往右转：预测这一对卡寿命结束时锚点在哪，开头和结尾都放得下才出场
            const end = reduce ? p : futureAt(pair, LIFE);
            if (!end || g.angle(pair.at) > 0.9) continue;
            // 信号卡与锚点大致齐平，联系人在它下面；整对卡不出首屏上下边
            const top = clamp(p[1] - CARD_H / 2 - 10, NAV_H + 12, g.height - 24 - PAIR_H);
            const fits = (side: 1 | -1) =>
              [p, end].every((q) => {
                const x = side > 0 ? q[0] + 28 : q[0] - 28 - PAIR_W;
                return x >= safeL - 8 && x + PAIR_W <= g.width - 16;
              });
            // 优先放在锚点左边：往右转时它离右边缘更远，能完整待满寿命
            const side: 1 | -1 | 0 = fits(-1) ? -1 : fits(1) ? 1 : 0;
            if (!side) continue;
            const c: LivePair = { pair, slot, born: now, op: 0, side, dy: top - p[1] };
            const b = boxAt(c, p);
            if (live.some((o) => overlap(b, boxAt(o, project(o.pair) ?? p), 16))) continue;
            live.push(c);
            queue = (queue + i + 1) % HERO_PAIRS.length;
            setSlots((prev) => prev.map((x, k) => (k === slot ? pair : x)));
            return true;
          }
          return false;
        }
        function hide(slot: number) {
          const r = refs.current[slot];
          for (const el of [r.sig, r.ct, r.pin, r.leader, r.branch]) if (el) el.style.opacity = "0";
        }
        function kill(c: LivePair) {
          hide(c.slot);
          const k = live.indexOf(c);
          if (k >= 0) live.splice(k, 1);
        }
        function place(c: LivePair, now: number) {
          const p = project(c.pair);
          if (!p) {
            kill(c);
            return;
          }
          const age = now - c.born;
          const b = boxAt(c, p);
          let env = Math.min(1, (LIFE - age) / FADE);
          env *= 1 - smoothstep(1.15, 1.4, g.angle(c.pair.at)); // 转向球背面前先淡出
          env *= clamp((g.width - 8 - (b.x + b.w)) / 40 + 1, 0, 1); // 被转出右边缘时淡出
          env = clamp(env, 0, 1);
          const sigOp = env * clamp(age / FADE, 0, 1);
          const ctOp = env * clamp((age - CONTACT_AT) / FADE, 0, 1);
          const grow = easeOut(clamp((age - BRANCH_AT) / BRANCH_MS, 0, 1));
          c.op = sigOp;
          if (age >= LIFE || (age > FADE && sigOp <= 0.002)) {
            kill(c);
            return;
          }
          const r = refs.current[c.slot];
          // 信号卡总在靠近锚点的一侧，联系人往外缩进；放在锚点左边时整对左右镜像
          const sx = c.side > 0 ? b.x : b.x + INDENT;
          const sy = b.y;
          const ctx = c.side > 0 ? b.x + INDENT : b.x;
          const cty = b.y + CARD_H + GAP;
          if (r.sig) {
            r.sig.style.transform = `translate3d(${sx.toFixed(1)}px,${sy.toFixed(1)}px,0)`;
            r.sig.style.opacity = sigOp.toFixed(3);
          }
          if (r.ct) {
            r.ct.style.transform = `translate3d(${ctx.toFixed(1)}px,${(cty + (1 - clamp((age - CONTACT_AT) / FADE, 0, 1)) * 8).toFixed(1)}px,0)`;
            r.ct.style.opacity = ctOp.toFixed(3);
          }
          if (r.pin) {
            r.pin.style.transform = `translate3d(${p[0].toFixed(1)}px,${p[1].toFixed(1)}px,0)`;
            r.pin.style.opacity = sigOp.toFixed(3);
          }
          if (r.leader) {
            // 锚点连到信号卡靠近它的那条竖边
            const ex = c.side > 0 ? sx + 2 : sx + CARD_W - 2;
            r.leader.setAttribute("x1", p[0].toFixed(1));
            r.leader.setAttribute("y1", p[1].toFixed(1));
            r.leader.setAttribute("x2", ex.toFixed(1));
            r.leader.setAttribute("y2", clamp(p[1], sy + 20, sy + CARD_H - 20).toFixed(1));
            r.leader.style.opacity = sigOp.toFixed(3);
          }
          if (r.branch) {
            // 从信号卡底边垂下来，拐进联系人卡朝里那条边的中线
            const bx = c.side > 0 ? sx + BRANCH_X : sx + CARD_W - BRANCH_X;
            const hx = c.side > 0 ? ctx : ctx + CARD_W;
            const midY = cty + CARD_H / 2;
            r.branch.setAttribute("d", `M ${bx.toFixed(1)} ${(sy + CARD_H).toFixed(1)} V ${midY.toFixed(1)} H ${hx.toFixed(1)}`);
            r.branch.style.strokeDashoffset = (BRANCH_LEN * (1 - grow)).toFixed(1);
            r.branch.style.opacity = (env * (grow > 0 ? 1 : 0)).toFixed(3);
          }
        }
        function draw() {
          const fills = new Map<string, string>();
          for (const c of live) if (c.op > 0.01) fills.set(c.pair.iso, mixHex(GLOBE_COLORS.land, GLOBE_COLORS.strong, c.op));
          g.view([lon, LAT], R, cx, cy);
          paintGlobe(g, world, { fills, outline: 0.6 });
        }
        function frame(now: number) {
          raf = 0;
          const dt = last ? Math.min(64, now - last) : 16;
          last = now;
          // 可见范围里没有能展示的卡时，地球加快转向下一处示例区域；有卡时回到常速
          if (live.length) lastAlive = now;
          const target = now - lastAlive > 2500 ? SPEED * 3.2 : SPEED;
          speed += (target - speed) * Math.min(1, dt / 700);
          lon -= (speed * dt) / 1000;
          g.view([lon, LAT], R, cx, cy);
          // 能完整放下一对卡的位置窗口很窄：没放成就很快再试，放成了再隔一段放下一对
          if (now >= nextSpawn) nextSpawn = now + (trySpawn(now) ? 2600 : 250);
          live.slice().forEach((c) => place(c, now));
          draw();
          if (onScreen && !document.hidden) raf = requestAnimationFrame(frame);
        }
        function renderStatic() {
          g.view([lon, LAT], R, cx, cy);
          live.slice().forEach(kill);
          const now = performance.now();
          // 减少动态效果：直接给成对的终态，连线画满
          for (let k = 0; k < maxLive; k++) trySpawn(now - CONTACT_AT - FADE * 2);
          live.forEach((c) => place(c, now));
          draw();
        }
        const kick = () => {
          if (reduce || raf || !onScreen || document.hidden) return;
          last = 0;
          raf = requestAnimationFrame(frame);
        };

        layout();
        setReady(true);
        if (reduce) renderStatic();
        else {
          nextSpawn = performance.now() + 1200;
          kick();
        }
        const io = new IntersectionObserver((es) => {
          onScreen = es[0].isIntersecting;
          kick();
        });
        io.observe(hero);
        document.addEventListener("visibilitychange", kick);
        // 衬线字体换上后标题变宽，安全区要重算
        document.fonts?.ready.then(() => {
          if (disposed) return;
          layout();
          if (reduce) renderStatic();
        });
        let rt: ReturnType<typeof setTimeout> | undefined;
        const onResize = () => {
          clearTimeout(rt);
          rt = setTimeout(() => {
            layout();
            if (reduce) renderStatic();
          }, 120);
        };
        window.addEventListener("resize", onResize);
        cleanup = () => {
          cancelAnimationFrame(raf);
          clearTimeout(rt);
          io.disconnect();
          document.removeEventListener("visibilitychange", kick);
          window.removeEventListener("resize", onResize);
        };
      })
      .catch(() => {
        // 地理数据没取到：保留首屏文字与输入框，地球位置退回静态经纬网（见 .hero-fallback）
        if (!disposed) hero.classList.add("no-globe");
      });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [copyRef]);

  return (
    <>
      <canvas ref={canvasRef} className={`hero-globe${ready ? " ready" : ""}`} aria-hidden="true" />
      <svg className="hero-fallback" viewBox="-310 -310 620 620" aria-hidden="true">
        <MeridianLines />
      </svg>
      <div className="hero-fx" aria-hidden="true">
        <svg ref={linesRef} className="hero-lines">
          {slots.map((_, i) => (
            <g key={i}>
              <line ref={(el) => void (refs.current[i].leader = el)} style={{ opacity: 0 }} />
              <path
                ref={(el) => void (refs.current[i].branch = el)}
                className="ac-branch"
                style={{ opacity: 0, strokeDasharray: BRANCH_LEN, strokeDashoffset: BRANCH_LEN }}
              />
            </g>
          ))}
        </svg>
        {slots.map((pair, i) => (
          <div key={`s${i}`} ref={(el) => void (refs.current[i].sig = el)} className="ac ac-body" style={{ opacity: 0 }}>
            {pair ? <SignalCard pair={pair} /> : null}
          </div>
        ))}
        {slots.map((pair, i) => (
          <div key={`c${i}`} ref={(el) => void (refs.current[i].ct = el)} className="ac ac-body" style={{ opacity: 0 }}>
            {pair ? <ContactCard pair={pair} /> : null}
          </div>
        ))}
        {slots.map((_, i) => (
          <div key={`p${i}`} ref={(el) => void (refs.current[i].pin = el)} className="ac" style={{ opacity: 0 }}>
            <span className="ac-pin" />
          </div>
        ))}
      </div>
    </>
  );
}

function clamp(v: number, a: number, b: number) {
  return Math.min(b, Math.max(a, v));
}
function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
function smoothstep(a: number, b: number, x: number) {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}
