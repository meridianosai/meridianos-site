"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Compass, Earth, List, Maximize2, Users } from "lucide-react";
import { createGlobe, GLOBE_COLORS, geoInterpolate, loadWorld, mixHex, paintGlobe, paintPin, type LonLat, type World } from "@/lib/globe";
import { clamp, easeInOut, lerp, seededRandom } from "@/lib/math";
import { startVisibleLoop } from "@/lib/visible-loop";
import { AgentHeader, AgentInput, Crumb, Rail, SourceButton, Tab, TAB_COLORS } from "./product-ui";
import { prefersReducedMotion } from "./motion";

// 镜头：区域方向 → 东南亚 → 越南 → 胡志明市（城市层由示意街区图接替地球）
const KEYFRAMES: { c: LonLat; k: number }[] = [
  { c: [52, 26], k: 1 },
  { c: [109, 9], k: 2.5 },
  { c: [106.4, 15.6], k: 5.3 },
  { c: [106.7, 10.8], k: 9 },
];
const SEA = ["704", "764", "360"];
const WEU = ["276", "250", "528"];
const NAM = ["840", "124", "484"];
const FILLS: Map<string, string>[] = [
  new Map([...SEA, ...WEU, ...NAM].map((id) => [id, GLOBE_COLORS.rec])),
  new Map(SEA.map((id) => [id, GLOBE_COLORS.strong])),
  new Map([
    ["704", GLOBE_COLORS.strong],
    ["764", GLOBE_COLORS.rec],
    ["360", GLOBE_COLORS.rec],
  ]),
  new Map([["704", GLOBE_COLORS.strong]]),
];
const PINS: (LonLat | null)[] = [null, [107.5, 16], [106.7, 10.8], [106.7, 10.8]];
const GRATICULE = [1, 0.7, 0.45, 0.3];
const LEVELS = KEYFRAMES.length;

/** 每一段先停留读字，再进下一层：前 28% 不动，中间 55% 过渡 */
function camera(progress: number) {
  const b = clamp(Math.ceil(progress), 1, LEVELS - 1);
  const a = b - 1;
  return { a, b, t: easeInOut(clamp((progress - a - 0.28) / 0.55, 0, 1)) };
}

/** 城市层的示意街区图：web-next 没配地图 Key 时就是这样一张「城市分布示意 · 非真实地址」 */
function citySvg(W: number, H: number, focus: { x: number; y: number; w: number; h: number }) {
  const rnd = seededRandom(11);
  let s = `<rect width="${W}" height="${H}" fill="#EEF1EB"/>`;
  for (let i = 0; i < 9; i++)
    s += `<rect x="${(rnd() * W).toFixed(0)}" y="${(rnd() * H).toFixed(0)}" width="${(50 + rnd() * 110).toFixed(0)}" height="${(36 + rnd() * 80).toFixed(0)}" rx="12" fill="#DCEBD3"/>`;
  s += `<path d="M -40 ${H * 0.16} C ${W * 0.16} ${H * 0.02}, ${W * 0.14} ${H * 0.62}, ${W * 0.36} ${H * 0.52} S ${W * 0.62} ${H * 0.98}, ${W + 40} ${H * 0.8}" fill="none" stroke="#AAD3EA" stroke-width="30" stroke-linecap="round"/>`;
  s += '<g stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" opacity=".95">';
  for (let x = -H; x < W + H; x += 46 + rnd() * 30) s += `<path d="M ${x.toFixed(0)} ${H} L ${(x + H * 0.42).toFixed(0)} 0"/>`;
  for (let y = 0; y < H + W * 0.3; y += 40 + rnd() * 28) s += `<path d="M 0 ${y.toFixed(0)} L ${W} ${(y - W * 0.22).toFixed(0)}"/>`;
  s += '</g><g fill="none" stroke-linecap="round">';
  for (const d of [
    `M 0 ${H * 0.72} C ${W * 0.3} ${H * 0.6}, ${W * 0.5} ${H * 0.4}, ${W} ${H * 0.34}`,
    `M ${W * 0.16} 0 C ${W * 0.2} ${H * 0.4}, ${W * 0.3} ${H * 0.7}, ${W * 0.28} ${H}`,
  ])
    s += `<path d="${d}" stroke="#E6DCC2" stroke-width="12"/><path d="${d}" stroke="#FFF6DA" stroke-width="8"/>`;
  s += "</g>";
  [
    [0.42, 0.42],
    [0.66, 0.3],
    [0.56, 0.6],
  ].forEach(([px, py], i) => {
    const x = focus.x + focus.w * px;
    const y = focus.y + focus.h * py;
    s += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle r="17" fill="${i ? "rgba(31,111,92,.82)" : "#1F6F5C"}" stroke="#fff" stroke-width="3"/><text y="5" text-anchor="middle" font-size="14" font-weight="600" fill="#fff" font-family="-apple-system,PingFang SC,sans-serif">${i + 1}</text></g>`;
  });
  return s;
}

/**
 * 「发现合适市场」的滚动舞台：按滚动位置切到第几层，驱动地球镜头与城市示意图。
 * 各层视图与 Agent 对话由服务端组件渲染好传进来，这里只决定显示哪一份；
 * 输入框跟着层级换当前对象和推荐追问。
 */
export function ExploreStage({
  names,
  captions,
  suggestions,
  views,
  logs,
}: {
  names: readonly string[];
  captions: readonly [string, string][];
  suggestions: readonly (readonly string[])[];
  views: readonly ReactNode[];
  logs: readonly ReactNode[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<HTMLDivElement>(null);
  const colRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cityRef = useRef<SVGSVGElement>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    const app = appRef.current;
    const col = colRef.current;
    const canvas = canvasRef.current;
    const city = cityRef.current;
    if (!track || !stage || !app || !col || !canvas || !city) return;
    const still = prefersReducedMotion();
    const globe = createGlobe(canvas);
    let world: World | null = null;
    let current = 0;
    let disposed = false;
    let focus = { x: 0, y: 0, w: 1, h: 1 };
    let baseRadius = 200;

    const progress = () => {
      const r = track.getBoundingClientRect();
      return clamp(-r.top / (r.height - stage.offsetHeight), 0, 1) * (LEVELS - 1);
    };
    const layout = () => {
      globe.resize();
      const ar = app.getBoundingClientRect();
      const cr = col.getBoundingClientRect();
      focus = { x: cr.left - ar.left, y: cr.top - ar.top, w: cr.width, h: cr.height };
      baseRadius = Math.max(70, Math.min(focus.h * 0.6, focus.w * 1.35));
      const W = Math.round(globe.width);
      const H = Math.round(globe.height);
      city.setAttribute("viewBox", `0 0 ${W} ${H}`);
      city.innerHTML = citySvg(W, H, focus);
    };
    const frame = (now: number) => {
      const { a, b, t } = camera(progress());
      const next = t > 0.5 ? b : a;
      if (next !== current) {
        current = next;
        setStep(next);
      }
      if (!world) return;
      const A = KEYFRAMES[a];
      const B = KEYFRAMES[b];
      const k = Math.exp(lerp(Math.log(A.k), Math.log(B.k), t));
      // 窄屏地图只剩一条横幅，球心放正中
      const cy = focus.y + focus.h * (focus.w < 400 && focus.h < 260 ? 0.5 : 0.46);
      globe.view(geoInterpolate(A.c, B.c)(t), baseRadius * k, focus.x + focus.w / 2, cy);
      const fills = new Map<string, string>();
      for (const id of new Set([...FILLS[a].keys(), ...FILLS[b].keys()])) {
        fills.set(id, mixHex(FILLS[a].get(id) ?? GLOBE_COLORS.land, FILLS[b].get(id) ?? GLOBE_COLORS.land, t));
      }
      paintGlobe(globe, world, { fills, graticule: lerp(GRATICULE[a], GRATICULE[b], t), outline: 0.7 });
      for (let i = 1; i < 3; i++) {
        const pin = PINS[i];
        const weight = (a === i ? 1 - t : 0) + (b === i ? t : 0);
        if (pin) paintPin(globe, pin, weight, now, still);
      }
    };

    layout();
    // 舞台在视口附近时持续绘制（定位点要呼吸，镜头跟着滚动走）；离开就停
    const loop = startVisibleLoop(track, { frame, resize: layout, rootMargin: "120px 0px" });
    loadWorld()
      .then((w) => {
        if (!disposed) world = w;
      })
      .catch(() => {
        // 没有地理数据也照常按滚动切换右侧内容，只是左侧没有地球
      });
    return () => {
      disposed = true;
      loop.stop();
    };
  }, []);

  return (
    <div className="ex-track" ref={trackRef}>
      <div className="ex-stage" ref={stageRef}>
        <div className="ex-capbar">
          {captions.map(([h, p], i) => (
            <div key={h} className={`ex-cap${i === step ? " on" : ""}`}>
              <div className="wrap">
                <h3>{h}</h3>
                <p>{p}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="ex-ticks" aria-hidden="true">
          {names.map((n, i) => (
            <i key={n} className={i <= step ? "on" : undefined} />
          ))}
        </div>

        <div ref={appRef} className={`k ex-app${step === LEVELS - 1 ? " city" : ""}`} role="group" aria-label="示例：探索工作台从全球下钻到胡志明市">
          <canvas ref={canvasRef} className="ex-map" aria-hidden="true" />
          <svg ref={cityRef} className="ex-city" aria-hidden="true" />
          <Rail active="explore" />
          <div className="ex-col" ref={colRef} aria-hidden="true">
            <span className="src">
              <SourceButton />
            </span>
            <div className="ex-ctitle">
              <b>{names[LEVELS - 1]}</b>
              <span>3 家示例公司</span>
            </div>
            <div className="ex-lbl">{names[Math.min(step, LEVELS - 2)]}</div>
            <div className="ex-btns">
              <span className="k-mapbtn on">
                <Users className="i" />
                找海外买家
              </span>
              <span className="k-mapbtn">
                <Earth className="i" />
                看看适合的市场
              </span>
            </div>
          </div>
          <div className="pane k-wb">
            <div className="k-tabs">
              <Tab icon={Compass} color={TAB_COLORS.explore} on>
                探索
              </Tab>
              <span className="k-tools">
                <span className="ibtn">
                  <List className="i" />
                </span>
                <span className="ibtn">
                  <Maximize2 className="i" />
                </span>
              </span>
            </div>
            <Crumb path={names.slice(0, step + 1)} />
            <div className="k-body">
              {views.map((view, i) => (
                <div key={i} className={`ex-view${i === step ? " on" : ""}`}>
                  {view}
                </div>
              ))}
            </div>
          </div>
          <aside className="pane k-agent" aria-hidden="true">
            <AgentHeader />
            <div className="k-ag-body">
              {logs.map((log, i) => (
                <div key={i} className={`k-log ex-log${i === step ? " on" : ""}`}>
                  {log}
                </div>
              ))}
            </div>
            <AgentInput context={names[step]} suggestions={suggestions[step]} />
          </aside>
          <p className="ex-note">城市分布示意 · 非真实地址</p>
        </div>
      </div>
    </div>
  );
}
