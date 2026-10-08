"use client";

import { useEffect, useRef } from "react";
import { ChevronDown, Earth, FileText, PenLine, Search, Users, type LucideIcon } from "lucide-react";
import { ActivityGroup, ActivityRow, FileRow, SourceLink, type ActivityState } from "./product-ui";
import { scrollToSection, useLanding } from "./landing-context";
import { usePlayback } from "./use-once-visible";

type Kind = "file" | "website" | "search";

const TOOLS: Record<Kind, { icon: LucideIcon; title: string; unit?: string }> = {
  file: { icon: FileText, title: "读取文件", unit: "份文件" },
  website: { icon: Earth, title: "读取网页", unit: "个网页" },
  search: { icon: Search, title: "搜索公开信息" },
};

interface Call {
  kind: Kind;
  object: string;
  /** 网页和搜索在展开区先写处理对象：网址或搜索词 */
  input?: string;
  /** 调用中写这一步在做什么，返回后换成返回内容 */
  detail: string;
  output: string;
  start: number;
  end: number;
}

// 调用内容照 web-next 声谷示例（profile-research.ts）：文件与网页并行读取，三次搜索等读取结果。
// 时间按落地页压缩到约一半，是演示节奏，不是实际服务耗时
const CALLS: Call[] = [
  { kind: "file", object: "声谷电子 · 产品目录.pdf", detail: "提取产品与业务范围", output: "提取到耳机、音箱三条产品线与规格。", start: 600, end: 2400 },
  {
    kind: "website",
    object: "shenggu-audio.com",
    input: "https://shenggu-audio.com",
    detail: "查看业务介绍、服务方式与出口记录",
    output: "找到业务介绍、OEM / ODM 服务和已有出口记录。",
    start: 750,
    end: 3500,
  },
  { kind: "file", object: "声谷电子 · 产品报价.xlsx", detail: "核对价格、起订与合作条件", output: "找到报价和起订条件；材料没有给出交期与打样方式。", start: 900, end: 3000 },
  {
    kind: "search",
    object: "客户与采购方式",
    input: "音频品牌 贴牌采购 / 进口分销 批量补货",
    detail: "比较品牌采购与进口分销的合作方式",
    output: "品牌采购关注贴牌协作；进口分销关注批量补货与交付条件。",
    start: 3800,
    end: 6000,
  },
  {
    kind: "search",
    object: "业务定位与差异",
    input: "音频 OEM ODM 供应商 合作能力 案例",
    detail: "对照产品展示与合作能力的表达",
    output: "找到两种表达方式：按产品参数展示，或按设计、打样、交付能力展示。",
    start: 4100,
    end: 6600,
  },
  {
    kind: "search",
    object: "合作条件与信息缺口",
    input: "贴牌采购 样品评估 交期 检验条件",
    detail: "结合已有结果，核对首次合作条件",
    output: "首次采购流程涉及样品评估、交期确认与检验要求。",
    start: 6900,
    end: 8800,
  },
];

/** 返回后展开区再留这么久给人读，然后收起 */
const RESULT_HOLD = 1200;
/** 最后一项返回后，记录停在「整理本轮发现」这么久，再折成一行、给出结论 */
const SETTLE = 1600;
const USER_AT = 150;
const RETURNED_AT = Math.max(...CALLS.map((c) => c.end));
const SETTLED_AT = RETURNED_AT + SETTLE;
// 回放只在这些时刻有变化
const TIMES = [...new Set([USER_AT, ...CALLS.flatMap((c) => [c.start, c.end, c.end + RESULT_HOLD]), RETURNED_AT, SETTLED_AT])].sort((a, b) => a - b);

/** 折好的一行：「读取 2 份文件、1 个网页，搜索 3 次」 */
function describeCalls() {
  const count = (kind: Kind) => CALLS.filter((c) => c.kind === kind).length;
  const read = (["file", "website"] as const).map((k) => `${count(k)} ${TOOLS[k].unit}`).join("、");
  return `读取 ${read}，搜索 ${count("search")} 次`;
}

const INSIGHTS: { title: string; tag?: string; text: string }[] = [
  {
    title: "贴牌协作与批量供货",
    tag: "初步判断",
    text: "从贴牌服务、千件级起订和 FOB 报价来看，批量采购的企业客户值得优先验证。可以把产品选型、贴牌方式和交付条件一起讲清楚，帮助买家判断怎样与你合作。",
  },
  {
    title: "我会先验证两类客户",
    text: "我会先验证品牌采购与进口分销商：前者看贴牌协作，后者看选品、补货与交付。千件级起订量是筛选线索，具体采购规模和需求仍需逐家确认。",
  },
  {
    title: "已有经历可以成为合作依据",
    text: "材料提到美国、越南和德国的出口经历。我会继续核实客户类型与交付案例，把这些经历转成可展示的合作依据；目前还不能据此判断你在当地已有稳定客户。",
  },
  {
    title: "合作前还需要补齐这些条件",
    text: "交期、打样费用和报价有效期还不清楚。这些会影响买家评估首次合作，建议优先补齐，再确认检验要求；寻找客户方向可以先开始。",
  },
];

/**
 * 1 理解你的业务里的对话面板：照 web-next 的资料理解对话（#414/#415）。工具调用一行一条地回放，
 * 全部返回、记录折起之后，结论才一次给出。首屏用示例公司发送时，经事件通道让它从头再放一遍。
 */
export function UnderstandPanel() {
  const bus = useLanding();
  const panelRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const { step, replay, motion } = usePlayback(panelRef, TIMES, 0.35);
  // 回放走到的时刻；还没开始是 -1。所有状态都由它推出来
  const now = step ? TIMES[step - 1] : -1;

  // 首屏的示例发送后从头放一遍；先等滚动停下
  useEffect(() => bus.onReplayDemo(() => replay(700)), [bus, replay]);

  // 像真的对话一样跟着最新内容走（滚动的是面板自己的消息区，外部 DOM）
  useEffect(() => {
    if (!motion) return;
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [step, motion]);

  const settled = now >= SETTLED_AT;
  const running = CALLS.filter((c) => now >= c.start && now < c.end);
  const summary = settled
    ? describeCalls()
    : now >= RETURNED_AT
      ? "整理本轮发现"
      : running.length > 1
        ? `并行调用 · ${running.length} 项`
        : running.length
          ? `正在${TOOLS[running[0].kind].title}…`
          : "准备下一次查找";

  return (
    <div ref={panelRef} className="k pane und-panel" role="group" aria-label="示例：Agent 读取声谷电子的资料">
      <div className="und-h">和 Meridian 聊聊</div>
      <div className="und-sub">
        <span>示例演示</span>
        <span>
          我的业务
          <ChevronDown className="i" />
        </span>
      </div>
      <div className="und-log" ref={logRef}>
        {now >= USER_AT ? (
          <div className="und-turn">
            <FileRow
              files={[
                ["声谷电子 · 产品目录.pdf", "2 KB"],
                ["声谷电子 · 产品报价.xlsx", "8 KB"],
              ]}
            />
            <div className="k-um und-url">https://shenggu-audio.com</div>
          </div>
        ) : null}
        {now >= CALLS[0].start ? (
          <ActivityGroup state={settled ? "complete" : "running"} summary={summary} open={!settled}>
            {CALLS.filter((c) => now >= c.start).map((c) => (
              <ToolCall key={c.object} call={c} now={now} />
            ))}
          </ActivityGroup>
        ) : null}
        {settled ? (
          <div className="und-reply">
            {INSIGHTS.map(({ title, tag, text }, i) => (
              <section key={title} style={{ animationDelay: `${i * 90}ms` }}>
                <h6>
                  {title}
                  {tag ? <small>{tag}</small> : null}
                </h6>
                <p>
                  {text} <SourceLink />
                </p>
              </section>
            ))}
            <p className="und-next" style={{ animationDelay: `${INSIGHTS.length * 90}ms` }}>
              下一步，我会先验证哪些客户的采购方式与你匹配，再逐步缩小市场与客户范围。
            </p>
          </div>
        ) : null}
      </div>
      <div className="und-acts">
        <button type="button" className="und-act" disabled={!settled} onClick={() => scrollToSection("explore")}>
          <Users className="i" />
          找海外买家
        </button>
        <button type="button" className="und-act" disabled={!settled} onClick={() => scrollToSection("explore")}>
          <Earth className="i" />
          看看适合的市场
        </button>
      </div>
      <div className="und-fix">
        <PenLine className="i" />
        补充或纠正
      </div>
    </div>
  );
}

function ToolCall({ call, now }: { call: Call; now: number }) {
  const { kind, object, input, detail, output, end } = call;
  const done = now >= end;
  const state: ActivityState = done ? "complete" : "running";
  const tool = TOOLS[kind];
  return (
    <ActivityRow state={state} icon={tool.icon} title={tool.title} object={object} open={!done || now < end + RESULT_HOLD}>
      {input ? <span className="in">{input}</span> : null}
      {done ? (
        <p>
          {output} <SourceLink />
        </p>
      ) : (
        <p className="mu">{detail}</p>
      )}
    </ActivityRow>
  );
}
