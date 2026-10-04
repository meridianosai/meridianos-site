"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  ChevronUp,
  CircleHelp,
  Compass,
  Earth,
  FileText,
  List,
  MapPin,
  Maximize2,
  Package,
  Radar,
  TriangleAlert,
  Users,
} from "lucide-react";
import { createGlobe, GLOBE_COLORS, geoInterpolate, loadWorld, mixHex, paintGlobe, paintPin, type LonLat, type World } from "@/lib/globe";
import {
  AgentInput,
  AgentHeader,
  AgentMsg,
  AnsweredAsk,
  Crumb,
  Rail,
  SourceButton,
  Suggestions,
  Tab,
  TAB_COLORS,
  ToolRecord,
  UserMsg,
} from "./product-ui";
import { prefersReducedMotion } from "./landing-context";
import { Reveal } from "./reveal";
import { StepKicker } from "./step-kicker";

const NAMES = ["全球", "东南亚", "越南", "胡志明市"] as const;
const N = NAMES.length;

const CAPTIONS = [
  ["先挑方向，不先挑国家。", "从你的资料出发：越南有出货记录，德国有相关材料，美国提过业务。三个区域，各说一句为什么。"],
  ["每个国家，先说怎么切入。", "优先验证谁、拿哪款产品去谈、先确认什么，一张卡说清；有出口记录的会标出来。"],
  ["落到城市，对照你的产品。", "型号、报价和起订量摆在旁边；联系之前要先问客户的那个问题，也写在卡上。"],
  ["到一家公司为止。", "每家候选公司带着示例采购方向、近期线索，和联系前要先确认的事。"],
] as const;

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

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** 每一段先停留读字，再进下一层：前 28% 不动，中间 55% 过渡 */
function camera(s: number) {
  const b = clamp(Math.ceil(s), 1, N - 1);
  const a = b - 1;
  return { a, b, t: easeInOut(clamp((s - a - 0.28) / 0.55, 0, 1)) };
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 城市层的示意街区图：web-next 没配地图 Key 时就是这样一张「城市分布示意 · 非真实地址」 */
function citySvg(W: number, H: number, foc: { x: number; y: number; w: number; h: number }) {
  const rnd = mulberry32(11);
  let s = `<rect width="${W}" height="${H}" fill="#EEF1EB"/>`;
  for (let i = 0; i < 9; i++)
    s += `<rect x="${(rnd() * W).toFixed(0)}" y="${(rnd() * H).toFixed(0)}" width="${(50 + rnd() * 110).toFixed(0)}" height="${(36 + rnd() * 80).toFixed(0)}" rx="12" fill="#DCEBD3"/>`;
  s += `<path d="M -40 ${H * 0.16} C ${W * 0.16} ${H * 0.02}, ${W * 0.14} ${H * 0.62}, ${W * 0.36} ${H * 0.52} S ${W * 0.62} ${H * 0.98}, ${W + 40} ${H * 0.8}" fill="none" stroke="#AAD3EA" stroke-width="30" stroke-linecap="round"/>`;
  s += '<g stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" opacity=".95">';
  for (let x = -H; x < W + H; x += 46 + rnd() * 30) s += `<path d="M ${x.toFixed(0)} ${H} L ${(x + H * 0.42).toFixed(0)} 0"/>`;
  for (let y = 0; y < H + W * 0.3; y += 40 + rnd() * 28) s += `<path d="M 0 ${y.toFixed(0)} L ${W} ${(y - W * 0.22).toFixed(0)}"/>`;
  s += '</g><g fill="none" stroke-linecap="round">';
  const majors = [
    `M 0 ${H * 0.72} C ${W * 0.3} ${H * 0.6}, ${W * 0.5} ${H * 0.4}, ${W} ${H * 0.34}`,
    `M ${W * 0.16} 0 C ${W * 0.2} ${H * 0.4}, ${W * 0.3} ${H * 0.7}, ${W * 0.28} ${H}`,
  ];
  for (const d of majors) s += `<path d="${d}" stroke="#E6DCC2" stroke-width="12"/><path d="${d}" stroke="#FFF6DA" stroke-width="8"/>`;
  s += "</g>";
  [
    [0.42, 0.42],
    [0.66, 0.3],
    [0.56, 0.6],
  ].forEach(([px, py], i) => {
    const x = foc.x + foc.w * px;
    const y = foc.y + foc.h * py;
    s += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle r="17" fill="${i ? "rgba(31,111,92,.82)" : "#1F6F5C"}" stroke="#fff" stroke-width="3"/><text y="5" text-anchor="middle" font-size="14" font-weight="600" fill="#fff" font-family="-apple-system,PingFang SC,sans-serif">${i + 1}</text></g>`;
  });
  return s;
}

/** 2 发现合适市场：滚动驱动 全球 → 东南亚 → 越南 → 胡志明市，照 web-next 的探索工作台 */
export function ExploreSection() {
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
    const reduce = prefersReducedMotion();
    let world: World | null = null;
    let current = 0;
    let raf = 0;
    let active = false;
    let disposed = false;
    const g = createGlobe(canvas);
    let foc = { x: 0, y: 0, w: 1, h: 1 };
    let R0 = 200;

    const progress = () => {
      const r = track.getBoundingClientRect();
      const total = r.height - stage.offsetHeight;
      return clamp(-r.top / total, 0, 1) * (N - 1);
    };
    const layout = () => {
      g.resize();
      const ar = app.getBoundingClientRect();
      const cr = col.getBoundingClientRect();
      foc = { x: cr.left - ar.left, y: cr.top - ar.top, w: cr.width, h: cr.height };
      R0 = Math.max(70, Math.min(foc.h * 0.6, foc.w * 1.35));
      const W = Math.round(g.width);
      const H = Math.round(g.height);
      city.setAttribute("viewBox", `0 0 ${W} ${H}`);
      city.innerHTML = citySvg(W, H, foc);
    };
    const frame = (now: number) => {
      raf = 0;
      const { a, b, t } = camera(progress());
      const next = t > 0.5 ? b : a;
      if (next !== current) {
        current = next;
        setStep(next);
      }
      if (world) {
        const A = KEYFRAMES[a];
        const B = KEYFRAMES[b];
        const k = Math.exp(lerp(Math.log(A.k), Math.log(B.k), t));
        // 窄屏地图只剩一条横幅，球心放正中
        const cy = foc.y + foc.h * (foc.w < 400 && foc.h < 260 ? 0.5 : 0.46);
        g.view(geoInterpolate(A.c, B.c)(t) as LonLat, R0 * k, foc.x + foc.w / 2, cy);
        const fills = new Map<string, string>();
        for (const id of new Set([...FILLS[a].keys(), ...FILLS[b].keys()])) {
          fills.set(id, mixHex(FILLS[a].get(id) ?? GLOBE_COLORS.land, FILLS[b].get(id) ?? GLOBE_COLORS.land, t));
        }
        paintGlobe(g, world, { fills, graticule: lerp(GRATICULE[a], GRATICULE[b], t), outline: 0.7 });
        for (let i = 1; i < 3; i++) {
          const weight = (a === i ? 1 - t : 0) + (b === i ? t : 0);
          const pin = PINS[i];
          if (pin) paintPin(g, pin, weight, now, reduce);
        }
      }
      // 定位点要呼吸，所以舞台在视口内时持续绘制；离开就停
      if (active && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (active && !document.hidden && !raf) raf = requestAnimationFrame(frame);
    };

    layout();
    loadWorld()
      .then((w) => {
        if (disposed) return;
        world = w;
        kick();
      })
      .catch(() => {
        // 没有地理数据也照常按滚动切换右侧内容，只是左侧没有地球
      });
    const io = new IntersectionObserver(
      (es) => {
        active = es[0].isIntersecting;
        kick();
      },
      { rootMargin: "120px 0px" },
    );
    io.observe(track);
    document.addEventListener("visibilitychange", kick);
    let rt: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        layout();
        kick();
      }, 120);
    };
    window.addEventListener("resize", onResize);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      clearTimeout(rt);
      io.disconnect();
      document.removeEventListener("visibilitychange", kick);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section className="ex" id="explore" aria-label="发现合适市场">
      <div className="wrap ex-intro">
        <Reveal>
          <StepKicker icon={Earth} step={2}>
            发现合适市场
          </StepKicker>
          <div className="sec-h">
            <h2>一层层，落到一家公司。</h2>
            <p>
              从区域、国家、城市，一直到具体的公司。每往下一层，就多一样能拿来判断的东西：先验证谁、拿哪款产品去谈、先确认什么。在工作台里点，还是在对话里回答，走的是同一条路。
            </p>
          </div>
        </Reveal>
      </div>
      <div className="ex-track" ref={trackRef}>
        <div className="ex-stage" ref={stageRef}>
          <div className="ex-capbar">
            {CAPTIONS.map(([h, p], i) => (
              <div key={h} className={`ex-cap${i === step ? " on" : ""}`}>
                <div className="wrap">
                  <h3>{h}</h3>
                  <p>{p}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="ex-ticks" aria-hidden="true">
            {NAMES.map((n, i) => (
              <i key={n} className={i <= step ? "on" : undefined} />
            ))}
          </div>

          <div
            ref={appRef}
            className={`k ex-app${step === 3 ? " city" : ""}`}
            role="group"
            aria-label="示例：探索工作台从全球下钻到胡志明市"
          >
            <canvas ref={canvasRef} className="ex-map" aria-hidden="true" />
            <svg ref={cityRef} className="ex-city" aria-hidden="true" />
            <Rail active="explore" />
            <div className="ex-col" ref={colRef} aria-hidden="true">
              <span className="src">
                <SourceButton />
              </span>
              <div className="ex-ctitle">
                <b>胡志明市</b>
                <span>3 家示例公司</span>
              </div>
              <div className="ex-lbl">{NAMES[Math.min(step, 2)]}</div>
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
              <Crumb path={NAMES.slice(0, step + 1)} />
              <div className="k-body">
                <View on={step === 0}>
                  <WorldView />
                </View>
                <View on={step === 1}>
                  <RegionView />
                </View>
                <View on={step === 2}>
                  <CountryView />
                </View>
                <View on={step === 3}>
                  <CityView />
                </View>
              </div>
            </div>
            <aside className="pane k-agent" aria-hidden="true">
              <AgentHeader current={NAMES[step]} />
              <div className="k-ag-body">
                <AgentLog step={step} />
              </div>
              <AskCard step={step} />
              <AgentInput />
            </aside>
            <p className="ex-note">城市分布示意 · 非真实地址</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function View({ on, children }: { on: boolean; children: ReactNode }) {
  return <div className={`ex-view${on ? " on" : ""}`}>{children}</div>;
}

function ViewTitle({ title, back }: { title: string; back?: boolean }) {
  return (
    <div className="k-vt">
      {back ? (
        <span className="back">
          <ArrowLeft className="i" />
        </span>
      ) : null}
      <div>
        <h4>{title}</h4>
        <span className="mi mu">示例</span>
      </div>
    </div>
  );
}

const REGIONS = [
  ["东南亚", "从资料提及的越南足迹出发，先看周边进口商与分销渠道。"],
  ["西欧", "已有德国相关材料，可先围绕耳机品牌和音频产品渠道验证需求。"],
  ["北美", "资料提及美国业务，可先验证采购型客户，再按具体产品核对准入要求。"],
] as const;

function WorldView() {
  return (
    <>
      <ViewTitle title="探索市场" />
      <p className="k-q">先从哪个区域找买家？</p>
      {REGIONS.map(([name, reason]) => (
        <article key={name} className="kcard k-rc">
          <div className="k-rc-h">
            <MapPin className="i" />
            {name}
            <SourceButton />
          </div>
          <p>{reason}</p>
          <span className="go">
            查看 3 个国家
            <ArrowUpRight className="i" />
          </span>
        </article>
      ))}
    </>
  );
}

const COUNTRIES = [
  { flag: "🇻🇳", name: "越南", status: "有出口记录", angle: "从已有出货经历验证补货合作", buyers: "进口商与分销商", supply: "A6 / S3 · TWS 真无线耳机、便携蓝牙音箱", check: "渠道试单与起订量", foot: "胡志明市 · 河内 · 6 家公司", cities: 2 },
  { flag: "🇹🇭", name: "泰国", status: "待验证方向", angle: "用通勤与便携组合验证选品", buyers: "品牌采购与零售渠道", supply: "A6 / H2 · TWS 真无线耳机、头戴式主动降噪耳机", check: "品牌包装与样品评审", foot: "曼谷 · 3 家公司", cities: 1 },
  { flag: "🇮🇩", name: "印度尼西亚", status: "待验证方向", angle: "先对照首单规模和渠道补货方式", buyers: "电商供货与分销渠道", supply: "A6 / S3 · TWS 真无线耳机、便携蓝牙音箱", check: "混装与分批交付", foot: "雅加达 · 3 家公司", cities: 1 },
] as const;

function RegionView() {
  return (
    <>
      <ViewTitle title="东南亚" back />
      <p className="k-q sm">东南亚 · 选择切入市场</p>
      {COUNTRIES.map((c, i) => (
        <article key={c.name} className="kcard k-cc">
          <div className="k-cc-h">
            <span className="k-flag">{c.flag}</span>
            <b>{c.name}</b>
            <span className={`k-st${i === 0 ? " ok" : ""}`}>{c.status}</span>
            <SourceButton />
          </div>
          <h5>{c.angle}</h5>
          <dl className="k-kv">
            <dt>优先验证</dt>
            <dd>{c.buyers}</dd>
            <dt>供货切入</dt>
            <dd>{c.supply}</dd>
            <dt>先确认</dt>
            <dd className="warn">{c.check}</dd>
          </dl>
          <div className="k-cc-f">
            <span>{c.foot}</span>
            <span className="go">
              查看 {c.cities} 座城市
              <ArrowUpRight className="i" />
            </span>
          </div>
        </article>
      ))}
    </>
  );
}

function CountryView() {
  return (
    <>
      <ViewTitle title="越南" back />
      <article className="kcard k-buyer">
        <span className="mi">优先验证的买家</span>
        <b>进口商与分销商</b>
        <p>材料提及越南出口经历，可先整理对应交付案例。</p>
        <SourceButton />
      </article>
      <article className="kcard k-sup">
        <div className="k-sup-h">
          <Package className="i" />
          供货切入
          <SourceButton />
        </div>
        <Product name="A6 · TWS 真无线耳机" specs="蓝牙 5.3 · 25h · IPX5" price="$12.4–15.8" moq="2,000 件起订" />
        <Product name="S3 · 便携蓝牙音箱" specs="10W · IPX7 · 12h" price="$9.2–14.0" moq="3,000 件起订" />
        <p className="k-askq">
          <CircleHelp className="i" />
          客户希望先小批量试销，还是能接受整批采购？
        </p>
      </article>
      <p className="k-q sm">越南 · 2 座城市</p>
      <CityCard name="胡志明市" angle="消费电子分销" example="Lotus Sound 等" />
      <CityCard name="河内" angle="零售与进口渠道" example="Red River Audio 等" />
    </>
  );
}

function Product({ name, specs, price, moq }: { name: string; specs: string; price: string; moq: string }) {
  return (
    <div className="k-prod">
      <div>
        <b>{name}</b>
        <span className="mi">{specs}</span>
      </div>
      <div className="r">
        <b>{price}</b> <span className="mi inl">FOB</span>
        <span className="mi">{moq}</span>
      </div>
    </div>
  );
}

function CityCard({ name, angle, example }: { name: string; angle: string; example: string }) {
  return (
    <article className="kcard k-city">
      <MapPin className="i" />
      <div>
        <b>{name}</b>
        <span className="a">{angle}</span>
        <span className="e">{example}</span>
      </div>
      <span className="k-gb">3 家公司</span>
      <span className="ibtn lk">
        <ArrowUpRight className="i" />
      </span>
      <SourceButton />
    </article>
  );
}

const CANDIDATES = [
  { n: 1, name: "Lotus Sound", kind: "音频品牌 · 产品采购负责人", buy: "通勤真无线系列", buyNote: "拟试单 2,000 件 · A6 起订 2,000 件", lead: "准备扩充便携音频系列", date: "2026-09-18", check: "先确认 2,000 件是否按单一型号、单一颜色计算。", warn: false },
  { n: 2, name: "Mekong Audio Supply", kind: "渠道分销 · 品类经理", buy: "便携音箱渠道试单", buyNote: "拟试单 1,500 件 · S3 起订 3,000 件", lead: "新增消费电子渠道合作岗位", date: "2026-09-16", check: "先确认能否合单到 3,000 件，或接受分批交付。", warn: true },
] as const;

function CityView() {
  return (
    <>
      <ViewTitle title="胡志明市" back />
      <p className="k-q sm">
        <span>胡志明市 · 候选公司</span>
        <span className="mi mu k-q-aside">
          3 家示例
          <BookOpen className="i" />
        </span>
      </p>
      {CANDIDATES.map((c) => (
        <article key={c.name} className="kcard k-co">
          <div className="k-co-h">
            <span className="k-num">{c.n}</span>
            <div>
              <b>{c.name}</b>
              <span className="mi">{c.kind}</span>
              <span className="chip">待评估</span>
            </div>
            <SourceButton />
          </div>
          <div className="k-co-sub">
            <div className="buy">
              <span className="lb">示例采购方向</span>
              <b>{c.buy}</b>
              <span className="mi">{c.buyNote}</span>
            </div>
            <div className="lead">
              <span className="lb">
                <Radar className="i" />
                近期线索
              </span>
              <b>{c.lead}</b>
              <span className="mi">{c.date}</span>
            </div>
          </div>
          <p className={`k-co-q${c.warn ? " warn" : ""}`}>
            {c.warn ? <TriangleAlert className="i" /> : <FileText className="i" />}
            {c.check}
          </p>
          <div className="k-co-f">
            <span>
              <Radar className="i" />2 条信号
              <Users className="i" />2 位联系人
            </span>
            <span className="go">
              查看公司
              <ArrowUpRight className="i" />
            </span>
          </div>
        </article>
      ))}
    </>
  );
}

/** 右侧 Agent：每一层一段对话，照 web-next 的工具执行记录与已回答的选择 */
function AgentLog({ step }: { step: number }) {
  const logs = [
    <>
      <UserMsg>找海外买家</UserMsg>
      <AgentMsg source={false}>好，从区域开始找海外买家。</AgentMsg>
      <ToolRecord title="全球 · 工具执行记录" />
      <AgentMsg>3 个区域方向已整理，接下来在地球上逐步展开。</AgentMsg>
      <Suggestions items={["比较推荐区域", "适合哪些买家", "整理成报告", "看看供货条件"]} />
    </>,
    <>
      <AnsweredAsk question="先从哪个区域找买家？" answer="东南亚" />
      <UserMsg>先看东南亚</UserMsg>
      <ToolRecord title="东南亚 · 工具执行记录" />
      <AgentMsg>东南亚的 3 个国家方向已整理。</AgentMsg>
      <Suggestions items={["比较国家方向", "为什么推荐这里", "整理成报告", "看看供货条件"]} />
    </>,
    <>
      <AnsweredAsk question="东南亚，想先看哪个国家？" answer="越南" />
      <UserMsg>先看越南</UserMsg>
      <ToolRecord title="越南 · 工具执行记录" steps={["读取资料线索", "核对市场切入点", "查找城市方向"]} />
      <AgentMsg>越南的 2 座城市方向已整理。</AgentMsg>
      <Suggestions items={["适合哪些买家", "先看哪些城市", "整理成报告", "产品与报价"]} />
    </>,
    <>
      <AnsweredAsk question="越南，先看哪座城市？" answer="胡志明市" />
      <UserMsg>先看胡志明市</UserMsg>
      <ToolRecord title="胡志明市 · 工具执行记录" />
      <AgentMsg>胡志明市的 3 家候选公司已整理。</AgentMsg>
      <Suggestions items={["比较候选公司", "采购规模", "整理成报告", "采购联系人"]} />
    </>,
  ];
  return (
    <>
      {logs.map((log, i) => (
        <div key={i} className={`k-log ex-log${i === step ? " on" : ""}`}>
          {log}
        </div>
      ))}
    </>
  );
}

const ASKS: { q: string; options: [string, string][] }[] = [
  {
    q: "先从哪个区域找买家？",
    options: [
      ["东南亚", "从资料提及的越南足迹出发，先看周边进口商与分销渠道。 · 3 个国家"],
      ["西欧", "已有德国相关材料，可先围绕耳机品牌和音频产品渠道验证需求。 · 3 个国家"],
    ],
  },
  {
    q: "东南亚，想先看哪个国家？",
    options: [
      ["越南", "2 座城市 · 6 家公司"],
      ["泰国", "1 座城市 · 3 家公司"],
      ["印度尼西亚", "1 座城市 · 3 家公司"],
    ],
  },
  {
    q: "越南，先看哪座城市？",
    options: [
      ["胡志明市", "消费电子分销 · 3 家公司"],
      ["河内", "零售与进口渠道 · 3 家公司"],
    ],
  },
  {
    q: "胡志明市，先了解哪家公司？",
    options: [
      ["Lotus Sound", "音频品牌 · 2 条信号 · 2 位联系人"],
      ["Mekong Audio Supply", "渠道分销 · 2 条信号 · 2 位联系人"],
    ],
  },
];

/** ask_user：固定在输入框上方，选项全部展开 */
function AskCard({ step }: { step: number }) {
  const { q, options } = ASKS[step];
  return (
    <div className="k-ask" key={step}>
      <div className="k-ask-h">
        <MapPin className="i" />
        {q}
        <ChevronUp className="i cv" />
      </div>
      {options.map(([name, note], i) => (
        <span key={name} className={`k-ask-o${i === 0 ? " on" : ""}`}>
          <b>{name}</b>
          <span>{note}</span>
        </span>
      ))}
    </div>
  );
}
