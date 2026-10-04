"use client";

import { useEffect, useRef } from "react";
import {
  BookOpen,
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  CircleCheck,
  CircleHelp,
  Clock,
  Compass,
  Earth,
  FileScan,
  FileText,
  PenLine,
  Search,
  Users,
  type LucideIcon,
} from "lucide-react";
import { FleetMark, SourceButton } from "./product-ui";
import { MeridianLines } from "./meridian-lines";
import { scrollToSection, useLanding } from "./landing-context";
import { Reveal } from "./reveal";
import { StepKicker } from "./step-kicker";
import { usePlayback } from "./use-once-visible";

interface Tool {
  icon: LucideIcon;
  name: string;
  target: string;
  /** 展开时显示的输入与返回 */
  detail?: { query: string; result: string; found: boolean };
}

const TOOLS: Tool[] = [
  { icon: FileText, name: "读取文件", target: "声谷电子 · 产品目录.pdf" },
  {
    icon: Earth,
    name: "读取网页",
    target: "shenggu-audio.com",
    detail: { query: "https://shenggu-audio.com", result: "找到业务介绍、OEM / ODM 服务和已有出口记录。", found: true },
  },
  { icon: FileText, name: "读取文件", target: "声谷电子 · 产品报价.xlsx" },
  {
    icon: Search,
    name: "搜索公开信息",
    target: "客户与采购方式",
    detail: { query: "音频品牌 贴牌采购 / 进口分销 批量补货", result: "比较品牌采购与进口分销的合作方式", found: false },
  },
];

const JUDGMENTS: { icon: LucideIcon; color: string; title: string; tag?: string; body: string }[] = [
  {
    icon: Building2,
    color: "#245ea8",
    title: "贴牌协作与批量供货",
    tag: "初步判断",
    body: "从贴牌服务、千件级起订和 FOB 报价来看，批量采购的企业客户值得优先验证。可以把产品选型、贴牌方式和交付条件一起讲清楚，帮助买家判断怎样与你合作。",
  },
  {
    icon: Users,
    color: "#167367",
    title: "我会先验证两类客户",
    body: "我会先验证品牌采购与进口分销商：前者看贴牌协作，后者看选品、补货与交付。千件级起订量是筛选线索，具体采购规模和需求仍需逐家确认。",
  },
  {
    icon: Compass,
    color: "#5354a0",
    title: "已有经历可以成为合作依据",
    body: "材料提到美国、越南和德国的出口经历。我会继续核实客户类型与交付案例，把这些经历转成可展示的合作依据；目前还不能据此判断你在当地已有稳定客户。",
  },
  {
    icon: CircleHelp,
    color: "#4c5776",
    title: "合作前还需要补齐这些条件",
    body: "交期、打样费用和报价有效期还不清楚。这些会影响买家评估首次合作，建议优先补齐，再确认检验要求；寻找客户方向可以先开始。",
  },
];

// 回放时间线（毫秒）。演示节奏：文件与网页并行读取，搜索等读取结果；不是实际服务耗时
type EventKey = "user" | "task" | `on${number}` | `ok${number}` | "collapse" | `sec${number}` | "next" | "acts";
const TIMELINE: [number, EventKey][] = (
  [
    [150, "user"],
    [600, "task"],
    [900, "on0"],
    [1250, "on1"],
    [1600, "on2"],
    [2300, "ok0"],
    [2900, "ok2"],
    [3300, "ok1"],
    [3600, "on3"],
    [5600, "ok3"],
    [6300, "collapse"],
    ...JUDGMENTS.map((_, i) => [6800 + i * 650, `sec${i}`] as [number, EventKey]),
    [6800 + JUDGMENTS.length * 650, "next"],
    [7000 + JUDGMENTS.length * 650, "acts"],
  ] as [number, EventKey][]
).sort((a, b) => a[0] - b[0]);
const TIMES = TIMELINE.map(([at]) => at);

/** 1 理解你的业务：照 web-next 的资料理解对话，工具调用逐个回放，再给出四段带依据的判断 */
export function UnderstandSection() {
  const { registerDemo } = useLanding();
  const panelRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const { step: k, replay, motion } = usePlayback(panelRef, TIMES, 0.35);
  const fired = (key: EventKey) => TIMELINE.findIndex(([, e]) => e === key) < k;

  // 首屏的示例发送后从头放一遍；先等滚动停下
  useEffect(() => registerDemo(() => replay(700)), [registerDemo, replay]);

  // 像真的对话一样跟着最新内容走
  useEffect(() => {
    if (!motion) return;
    const log = logRef.current;
    if (log) log.scrollTo({ top: log.scrollHeight, behavior: "smooth" });
  }, [k, motion]);

  const actsEnabled = fired("acts");

  return (
    <section className="sec und" id="understand">
      <div className="wrap und-in">
        <Reveal>
          <StepKicker icon={FileScan} step={1}>
            理解你的业务
          </StepKicker>
          <div className="sec-h">
            <h2>
              先读懂你，
              <br />
              再替你看世界。
            </h2>
            <p>
              官网、产品目录、报价单一起交给它。它读文件、读网页、搜公开信息，调用了什么、拿回了什么都摊开给你看；读完给出几段判断，每段旁边都能点开依据。
            </p>
          </div>
          <ul className="points">
            <li>
              <b>过程摊开</b>
              <span>每一次工具调用都列着：读的哪份文件、哪个网址、搜的什么，调用中还是已返回。</span>
            </li>
            <li>
              <b>判断带依据</b>
              <span>每段结论旁边一本小书，点开就是它引用的原文。</span>
            </li>
            <li>
              <b>整理进「我的业务」</b>
              <span>产品、报价、起订量、资质落成工作台里的一个标签，字段能就地改，原始来源留着。</span>
            </li>
          </ul>
        </Reveal>
        <Reveal className="und-stage">
          <svg className="und-orb" viewBox="-310 -310 620 620" aria-hidden="true">
            <MeridianLines />
          </svg>
          <div
            ref={panelRef}
            className={`k pane und-panel${motion ? " armed" : ""}`}
            role="group"
            aria-label="示例：Agent 读取声谷电子的资料"
          >
            <div className="und-h">和 Meridian 聊聊</div>
            <div className="und-sub">
              <span>示例演示</span>
              <span>
                我的业务
                <ChevronDown className="i" />
              </span>
            </div>
            <div className="und-log" ref={logRef}>
              <div className={`und-user${fired("user") ? " on" : ""}`}>
                <span>https://shenggu-audio.com</span>
                <SourceButton />
                <span className="und-files">
                  <FileText className="i" />2 份资料
                  <ChevronDown className="i" />
                </span>
              </div>
              <div className={`und-task${fired("task") ? " on" : ""}${fired("collapse") ? " collapsed" : ""}`}>
                <div className="und-task-h">
                  <FleetMark />
                  {fired("collapse") ? <Check className="i st-done" /> : <span className="st" />}
                  <span>{fired("collapse") ? "工具调用记录" : "读取资料 · 2 份文件与官网"}</span>
                  <ChevronUp className="i" />
                </div>
                <div className="und-tools-wrap">
                  <div className="und-tools">
                    {TOOLS.map((t, i) => (
                      <ToolCard key={t.target} tool={t} on={fired(`on${i}`)} ok={fired(`ok${i}`)} />
                    ))}
                  </div>
                </div>
              </div>
              <div className={`und-msg${fired("sec0") ? " on" : ""}`}>
                <FleetMark />
                <div>
                  {JUDGMENTS.map(({ icon: Icon, color, title, tag, body }, i) => (
                    <div key={title} className={`und-sec${fired(`sec${i}`) ? " on" : ""}`}>
                      <h6>
                        <Icon className="i" style={{ color }} />
                        {title}
                        {tag ? <small>{tag}</small> : null}
                      </h6>
                      <SourceButton />
                      <p>{body}</p>
                    </div>
                  ))}
                  <p className={`und-next${fired("next") ? " on" : ""}`}>
                    下一步，我会先验证哪些客户的采购方式与你匹配，再逐步缩小市场与客户范围。
                  </p>
                </div>
              </div>
            </div>
            <div className="und-acts">
              <button type="button" className="und-act" disabled={!actsEnabled} onClick={() => scrollToSection("explore")}>
                <Users className="i" />
                找海外买家
              </button>
              <button type="button" className="und-act" disabled={!actsEnabled} onClick={() => scrollToSection("explore")}>
                <Earth className="i" />
                看看适合的市场
              </button>
            </div>
            <div className="und-fix">
              <PenLine className="i" />
              补充或纠正
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ToolCard({ tool, on, ok }: { tool: Tool; on: boolean; ok: boolean }) {
  const { icon: Icon, name, target, detail } = tool;
  return (
    <div className={`und-tool${on ? " on" : ""}${detail ? " open" : ""}`}>
      <div className="und-tool-h">
        <Icon className="i" />
        <span>
          <b>{name}</b>
          <span className="s">{target}</span>
        </span>
        {ok ? (
          <span className="okc">
            <CircleCheck className="i" />
            已返回
          </span>
        ) : (
          <span className="run">
            <Clock className="i" />
            调用中
          </span>
        )}
        {detail ? <ChevronUp className="i cv" /> : <ChevronDown className="i cv" />}
      </div>
      {detail ? (
        <div className="und-x">
          <div className="und-in-q">{detail.query}</div>
          {ok ? (
            <div className="und-res">
              {detail.found ? <Check className="i" /> : <span className="bul" />}
              {detail.result}
              {detail.found ? (
                <span className="ibtn">
                  <BookOpen className="i" />
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
