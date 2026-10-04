"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Bookmark,
  Briefcase,
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Compass,
  FileText,
  ListChecks,
  Maximize2,
  PenLine,
  Pencil,
  Plus,
  Radar,
  RotateCcw,
  ShieldCheck,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { AgentHeader, AgentInput, AgentMsg, AnsweredAsk, Crumb, SourceButton, Suggestions, TAB_COLORS, ToolRecord, UserMsg } from "./product-ui";
import { prefersReducedMotion } from "./landing-context";
import { Reveal } from "./reveal";
import { StepKicker } from "./step-kicker";
import { useOnceVisible } from "./use-once-visible";

type RecId = "co" | "pe" | "biz";

const TABS: { id: RecId; label: string; icon: LucideIcon; color: string }[] = [
  { id: "co", label: "Lotus Sound", icon: Building2, color: TAB_COLORS.company },
  { id: "pe", label: "Alex Morgan", icon: UserRound, color: TAB_COLORS.person },
  { id: "biz", label: "我的业务", icon: Briefcase, color: TAB_COLORS.business },
];
const CURRENT: Record<RecId, string> = { co: "Lotus Sound", pe: "Alex Morgan · Lotus Sound", biz: "声谷电子" };
const ANCHORS: Record<"co" | "pe", [string, string, number?][]> = {
  co: [
    ["co-sum", "概况"],
    ["co-ppl", "联系人", 2],
    ["co-sig", "信号", 2],
    ["co-draft", "联系草稿"],
    ["co-prog", "推进"],
    ["co-task", "任务"],
  ],
  pe: [
    ["pe-sum", "概况"],
    ["pe-org", "所属公司"],
    ["pe-exp", "经历"],
    ["pe-sig", "信号", 2],
  ],
};

/** 3 找到目标客户：公司页、人的页面、我的业务是工作台里的三个标签（record-page / contact-profile / business-workbench） */
export function AccountSection() {
  const frameRef = useRef<HTMLDivElement>(null);
  const coRef = useRef<HTMLDivElement>(null);
  const peRef = useRef<HTMLDivElement>(null);
  const visible = useOnceVisible(frameRef, 0.3);
  const [rec, setRec] = useState<RecId>("co");
  const [followed, setFollowed] = useState(false);
  const jumpCo = useRef<((section: string) => void) | null>(null);

  // 这一节要讲的是信号：第一次看到时停到信号段
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => jumpCo.current?.("co-sig"), prefersReducedMotion() ? 0 : 900);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <section className="sec acc" id="account">
      <div className="wrap">
        <div className="acc-top">
          <Reveal>
            <StepKicker icon={Users} step={3}>
              找到目标客户
            </StepKicker>
            <div className="sec-h">
              <h2>
                谁在动，
                <br />
                和你有什么关系。
              </h2>
              <p>
                公司页一页排开：概况、联系人、信号、联系草稿、推进、任务。人也有自己的页：现在在哪家、之前做过什么、最近说过什么。点联系人就开人的页，点所属公司再回来。
              </p>
            </div>
          </Reveal>
          <Reveal as="ul" className="legend k">
            <li>
              <span className="lg-k d">
                <Radar className="i" />
                2026-09-18 · 示例动态
              </span>
              <span>什么时候、是哪类动静</span>
            </li>
            <li>
              <span className="lg-k t">准备扩充便携音频系列</span>
              <span>发生了什么</span>
            </li>
            <li>
              <span className="lg-k r">与你的关联</span>
              <span>和你的哪款产品、哪个条件对得上</span>
            </li>
            <li>
              <span className="lg-k n">下一步确认</span>
              <span>联系之前先问清的事</span>
            </li>
            <li>
              <span className="lg-k b">
                <BookOpen className="i" />
                来源
              </span>
              <span>点开就是它引用的原文</span>
            </li>
          </Reveal>
        </div>
      </div>
      <div className="wrap-wide">
        <Reveal>
          <div
            ref={frameRef}
            className={`k acc-frame${rec === "biz" ? " biz" : ""}`}
            role="group"
            aria-label="示例：Lotus Sound 的公司页、Alex Morgan 的人物页与我的业务"
          >
            <div className="pane k-wb">
              <div className="k-tabs" role="tablist" aria-label="工作台标签">
                <span className="k-tab" style={{ "--tc": TAB_COLORS.explore } as CSSProperties}>
                  <Compass className="i" />
                  探索
                </span>
                {TABS.map(({ id, label, icon: Icon, color }) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={rec === id}
                    className={`k-tab${rec === id ? " on" : ""}`}
                    style={{ "--tc": color } as CSSProperties}
                    onClick={() => setRec(id)}
                  >
                    <Icon className="i" />
                    {label}
                    <X className="i x" />
                  </button>
                ))}
                <span className="k-tools">
                  <span className="ibtn">
                    <Maximize2 className="i" />
                  </span>
                </span>
              </div>
              <Crumb path={["全球", "东南亚", "越南", "胡志明市"]} className="k-crumb acc-crumb" />
              <div className="k-body">
                <RecordPage id="co" containerRef={coRef} hidden={rec !== "co"} jumpRef={jumpCo}>
                  <CompanyHead followed={followed} onFollow={() => setFollowed((f) => !f)} />
                  <CompanyBody onOpenPerson={() => setRec("pe")} />
                </RecordPage>
                <RecordPage id="pe" containerRef={peRef} hidden={rec !== "pe"}>
                  <PersonHead />
                  <PersonBody onOpenCompany={() => setRec("co")} />
                </RecordPage>
                <div className="rec" hidden={rec !== "biz"}>
                  <BusinessPage />
                </div>
              </div>
            </div>
            <aside className="pane k-agent acc-ag" aria-hidden="true">
              <AgentHeader current={CURRENT[rec]} />
              <div className="k-ag-body">
                <div className="k-log">
                  <AnsweredAsk question="胡志明市，先了解哪家公司？" answer="Lotus Sound" />
                  <UserMsg>先看Lotus Sound</UserMsg>
                  <ToolRecord title="Lotus Sound · 工具执行记录" />
                  <AgentMsg>Lotus Sound：2 条示例信号、2 位示例联系人已整理。先确认 2,000 件是否按单一型号、单一颜色计算。</AgentMsg>
                  <Suggestions items={["核对合作条件", "看看联系人", "整理成报告", "起草联系开场"]} />
                </div>
              </div>
              <AgentInput />
            </aside>
          </div>
          <p className="frame-cap">示例 · 公司、人物与动态均为虚构；点标签、锚点或联系人卡试试</p>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * 资料页骨架：头部 → 吸顶的一排锚点 → 各段一页排开。锚点点击时平滑滚到对应段，滚动时跟随当前段；
 * 点了哪段就亮哪段，直到用户自己滚动（末尾几段滚不到顶，不能让滚动位置把它改成最后一段）。
 */
function RecordPage({
  id,
  containerRef,
  hidden,
  jumpRef,
  children,
}: {
  id: "co" | "pe";
  containerRef: RefObject<HTMLDivElement | null>;
  hidden: boolean;
  /** 让外面能把页面停到某一段（进入视口时停到信号段） */
  jumpRef?: RefObject<((section: string) => void) | null>;
  children: [ReactNode, ReactNode];
}) {
  const anchors = ANCHORS[id];
  const [active, setActive] = useState(anchors[0][0]);
  const navRef = useRef<HTMLElement>(null);
  const locked = useRef(false);

  const jump = (section: string) => {
    const box = containerRef.current;
    const target = box?.querySelector<HTMLElement>(`#${section}`);
    if (!box || !target) return;
    locked.current = true;
    setActive(section);
    box.scrollTo({ top: target.offsetTop - (navRef.current?.offsetHeight ?? 0) + 1, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };
  useEffect(() => {
    if (jumpRef) jumpRef.current = jump;
  });

  useEffect(() => {
    const box = containerRef.current;
    if (!box) return;
    const unlock = () => (locked.current = false);
    const onScroll = () => {
      if (locked.current) return;
      const nav = navRef.current?.offsetHeight ?? 0;
      const y = box.scrollTop + nav + 24;
      let on = anchors[0][0];
      for (const [sid] of anchors) {
        const el = box.querySelector<HTMLElement>(`#${sid}`);
        if (el && el.offsetTop <= y) on = sid;
      }
      if (box.scrollTop + box.clientHeight >= box.scrollHeight - 4) on = anchors[anchors.length - 1][0];
      setActive(on);
    };
    // pointerdown 覆盖拖滚动条；点锚点时 pointerdown 先于 click，锁会在 click 里重新挂上
    const unlockEvents = ["wheel", "touchmove", "keydown", "pointerdown"] as const;
    unlockEvents.forEach((t) => box.addEventListener(t, unlock, { passive: true }));
    box.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      unlockEvents.forEach((t) => box.removeEventListener(t, unlock));
      box.removeEventListener("scroll", onScroll);
    };
  }, [containerRef, anchors]);

  const [head, body] = children;
  return (
    <div className="rec" ref={containerRef} hidden={hidden}>
      {head}
      <nav className="rec-anc" ref={navRef} aria-label={id === "co" ? "公司页分段" : "人的页面分段"}>
        {anchors.map(([sid, label, count]) => (
          <button key={sid} type="button" className={active === sid ? "on" : undefined} onClick={() => jump(sid)}>
            {label}
            {count ? <small>{count}</small> : null}
          </button>
        ))}
      </nav>
      {body}
    </div>
  );
}

function CompanyHead({ followed, onFollow }: { followed: boolean; onFollow(): void }) {
  return (
    <>
      <div className="rec-h">
        <span className="back">
          <ArrowLeft className="i" />
        </span>
        <div>
          <h4>Lotus Sound</h4>
          <span className="mi mu">示例</span>
        </div>
        <div className="rec-nav">
          <ChevronDown className="i" />
          <span className="ibtn">
            <ChevronLeft className="i" />
          </span>
          <span>1/3</span>
          <span className="ibtn">
            <ChevronRight className="i" />
          </span>
          <button type="button" className={`rec-follow${followed ? " on" : ""}`} aria-pressed={followed} onClick={onFollow}>
            <Bookmark className="i" />
            <span>{followed ? "已关注" : "关注"}</span>
          </button>
        </div>
      </div>
      <div className="rec-id">
        <span className="rec-mono">LS</span>
        <div>
          <span className="mi mu">音频品牌 · 胡志明市，越南</span>
          <span className="chip">待评估</span>
        </div>
        <SourceButton />
      </div>
    </>
  );
}

const COMPARE: [string, string, string, string, boolean][] = [
  ["产品", "通勤真无线系列", "A6 · 蓝牙 5.3 · 25h · IPX5", "可对照", true],
  ["首单", "2,000 件", "2,000 件起订", "数量可对照", true],
  ["包装", "品牌标识与独立零售包装", "支持 OEM / ODM；具体包装待确认", "待确认", false],
  ["交付", "样品确认后 6–8 周", "材料未给出交期与打样耗时", "待确认", false],
  ["报价", "目标采购价尚未提供", "FOB $12.4–15.8", "待确认", false],
];

function CompanyBody({ onOpenPerson }: { onOpenPerson(): void }) {
  return (
    <>
      <section className="rec-sec" id="co-sum">
        <h5>概况</h5>
        <p className="lead">面向日常通勤与运动场景，销售无线耳机与便携音箱。</p>
        <div className="k-fit">
          <div className="k-fit-top">
            <div>
              <span className="mi">可先评估样品</span>
              <b>先确认 2,000 件是否按单一型号、单一颜色计算。</b>
            </div>
            <SourceButton />
          </div>
          <div className="k-fit-acts">
            <span>
              <Users className="i" />看 2 位联系人
            </span>
            <span>
              <PenLine className="i" />
              准备联系
            </span>
            <span>
              <ListChecks className="i" />
              更新推进
            </span>
          </div>
        </div>
        <h5 className="sub-h">需求与供货对照</h5>
        <table className="cmpt">
          <thead>
            <tr>
              <th>项目</th>
              <th>示例需求</th>
              <th>你的材料</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {COMPARE.map(([item, need, mine, mark, ok]) => (
              <tr key={item}>
                <td>{item}</td>
                <td>{need}</td>
                <td>
                  {mine}
                  <span className={`m${ok ? "" : " q"}`}>
                    {ok ? <FileText className="i" /> : <CircleHelp className="i" />}
                    {mark}
                  </span>
                </td>
                <td>
                  <SourceButton />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="rec-sec" id="co-ppl">
        <h5>
          联系人<small>2</small>
        </h5>
        <div className="ppl">
          <button type="button" className="ppl-c" onClick={onOpenPerson}>
            <PersonCardBody initials="AM" name="Alex Morgan" role="产品采购负责人" duty="确认首单规模、报价与供应商名单" />
          </button>
          <div className="ppl-c static">
            <PersonCardBody initials="SR" name="Sam Rivera" role="产品开发经理" duty="参与样品评估与交付规格确认" />
          </div>
        </div>
      </section>
      <section className="rec-sec" id="co-sig">
        <h5>
          信号<small>2</small>
        </h5>
        <Signal
          date="2026-09-18 · 示例动态"
          title="准备扩充便携音频系列"
          observation="面向日常通勤与运动场景，销售无线耳机与便携音箱。示例业务记录提及准备扩充便携音频系列，尚未发布正式采购单。"
          relevance="可从 A6 真无线耳机的小批量贴牌切入，先核对渠道售价与目标毛利。"
          next="先确认 2,000 件是否按单一型号、单一颜色计算。"
          progress
        />
        <Signal
          date="2026-09-10 · 示例动态"
          title="贴牌合作入口新增包装选项"
          observation="示例合作页面列出自有标识、独立包装和样品评估三个步骤。"
          relevance="OEM / ODM 能力有对照点，但包装打样费用仍未知。"
          next="确认计划是否仍在推进，以及哪一位负责最终采购决策。"
          progress
        />
      </section>
      <section className="rec-sec" id="co-draft">
        <h5>联系草稿</h5>
        <div className="draft-note">
          <span>先确认 2,000 件是否按单一型号、单一颜色计算。</span>
          <SourceButton />
        </div>
        <div className="draft-h">
          <b>给 Alex Morgan 的草稿</b>
          <span>
            <Check className="i" />
            未编辑
          </span>
        </div>
        <div className="draft-b">
          {`Hi Alex,

I’m reaching out from Shenggu Acoustics about a potential collaboration with Lotus Sound. We develop wireless audio products with OEM / ODM support.

Our A6 true wireless earbuds may be relevant to your range. Would an initial order of 2,000 units for one model and color fit your launch plan?

I can share product specifications and a sample proposal once we understand your requirements.

Best regards,
Shenggu Acoustics`}
        </div>
        <p className="draft-f">示例草稿 · 未发送</p>
      </section>
      <section className="rec-sec" id="co-prog">
        <h5>推进</h5>
        <div className="form-k">
          <div className="fk-l">
            对象
            <span className="fk">
              公司 · Lotus Sound
              <ChevronDown className="i" />
            </span>
          </div>
          <div className="row">
            <div className="fk-l">
              跟进状态
              <span className="fk">
                待评估
                <ChevronDown className="i" />
              </span>
            </div>
            <div className="fk-l">
              优先级
              <span className="fk">
                普通
                <ChevronDown className="i" />
              </span>
            </div>
          </div>
          <div className="fk-l">
            下一步行动
            <span className="fk ta">寄两套 A6 样品，附 2,000 件单色报价</span>
          </div>
        </div>
      </section>
      <section className="rec-sec last" id="co-task">
        <h5>任务</h5>
        <TaskRow label="近期信号" value="09-18 准备扩充便携音频系列" />
        <TaskRow label="采购决策人" value="Alex Morgan · 产品采购负责人" />
      </section>
    </>
  );
}

function PersonCardBody({ initials, name, role, duty }: { initials: string; name: string; role: string; duty: string }) {
  return (
    <>
      <span className="ppl-av">{initials}</span>
      <b>{name}</b>
      <ArrowUpRight className="i" />
      <span className="mi">{role}</span>
      <p>{duty}</p>
      <span className="chip">待评估</span>
    </>
  );
}

function Signal({
  date,
  title,
  observation,
  relevance,
  next,
  progress,
}: {
  date: string;
  title: string;
  observation: string;
  relevance: string;
  next?: string;
  progress?: boolean;
}) {
  return (
    <article className="sig">
      <div className="sig-d">
        <Radar className="i" />
        {date}
        <SourceButton />
      </div>
      <h6>{title}</h6>
      <p className="obs mu">{observation}</p>
      <div className="rel">
        <span className="lb">与你的关联</span>
        {relevance}
        {next ? (
          <>
            <span className="lb n">下一步确认</span>
            {next}
          </>
        ) : null}
      </div>
      {progress ? (
        <div className="ft">
          <span className="chip">待评估</span>
          <span className="go">
            <ListChecks className="i" />
            推进
          </span>
        </div>
      ) : null}
    </article>
  );
}

function TaskRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="task-r">
      <div>
        <span className="mi">{label}</span>
        <b>{value}</b>
      </div>
      <SourceButton />
      <span className="ibtn">
        <RotateCcw className="i" />
      </span>
    </div>
  );
}

function PersonHead() {
  return (
    <>
      <div className="rec-h">
        <div>
          <h4>Alex Morgan</h4>
          <span className="mi mu">示例</span>
        </div>
      </div>
      <div className="rec-id">
        <span className="rec-mono p">AM</span>
        <div>
          <span className="mi mu">
            产品采购负责人 · <span className="lk">Lotus Sound</span>
          </span>
          <span className="chip">待评估</span>
        </div>
        <SourceButton />
      </div>
    </>
  );
}

function PersonBody({ onOpenCompany }: { onOpenCompany(): void }) {
  return (
    <>
      <section className="rec-sec" id="pe-sum">
        <h5>概况</h5>
        <p className="lead">确认首单规模、报价与供应商名单</p>
        <div className="k-fit muted">
          <span className="mi">可以先问</span>
          <p>首单数量、目标价和打样时间</p>
        </div>
      </section>
      <section className="rec-sec" id="pe-org">
        <h5>所属公司</h5>
        <button type="button" className="org-c" onClick={onOpenCompany}>
          <span className="rec-mono">LS</span>
          <b>Lotus Sound</b>
          <ArrowUpRight className="i" />
          <span className="mi mu">音频品牌 · 2022 – 至今</span>
          <p>面向日常通勤与运动场景，销售无线耳机与便携音箱。</p>
          <span className="mi ok">可先评估样品</span>
        </button>
      </section>
      <section className="rec-sec" id="pe-exp">
        <h5>经历</h5>
        <ol className="exp">
          {[
            ["产品采购负责人", "Lotus Sound · 2022 – 至今"],
            ["采购经理", "Brightline Retail · 2018 – 2022"],
            ["采购专员", "Coastline Electronics · 2015 – 2018"],
          ].map(([title, where]) => (
            <li key={title}>
              <b>
                <Briefcase className="i" />
                {title}
              </b>
              <span className="mi">{where}</span>
            </li>
          ))}
        </ol>
      </section>
      <section className="rec-sec last" id="pe-sig">
        <h5>
          信号<small>2</small>
        </h5>
        <Signal
          date="2026-09-05 · 个人动态"
          title="在品类交流会上谈到下一季的贴牌计划"
          observation="提到下一季考虑引入贴牌耳机，更关注包装与交期。"
          relevance="与 A6 贴牌方向一致，可以从包装和交期切入。"
        />
        <Signal
          date="2026-08-20 · 个人动态"
          title="职责扩展到全部音频品类"
          observation="职业资料显示负责范围从耳机扩展到全部音频采购。"
          relevance="便携音箱也可能纳入同一次讨论。"
        />
      </section>
    </>
  );
}

/* ---------- 我的业务：字段就地改；改过的值在标签旁标出用户修改，原来的来源按钮不动 ---------- */

type Field = { key: string; label: string; value: string; note?: string };

const BUSINESS: { title: string; icon?: LucideIcon; fields: Field[]; more: boolean }[] = [
  {
    title: "业务与能力",
    more: true,
    fields: [
      { key: "name", label: "业务名称", value: "声谷电子" },
      { key: "direction", label: "业务方向", value: "音频产品研发与制造" },
      { key: "ability", label: "合作能力", value: "OEM / ODM · 贴牌与定制" },
    ],
  },
  {
    title: "产品与服务",
    more: true,
    fields: [
      { key: "a6", label: "A6 · TWS 真无线耳机", value: "蓝牙 5.3 · 25h · IPX5" },
      { key: "h2", label: "H2 · 头戴式主动降噪耳机", value: "ANC · 40mm · 40h" },
      { key: "s3", label: "S3 · 便携蓝牙音箱", value: "10W · IPX7 · 12h" },
    ],
  },
  {
    title: "合作条件",
    more: true,
    fields: [
      { key: "a6p", label: "A6 报价", value: "FOB $12.4–15.8" },
      { key: "a6m", label: "A6 起订量", value: "2,000 件" },
      { key: "h2p", label: "H2 报价", value: "FOB $28.5–36.0" },
      { key: "h2m", label: "H2 起订量", value: "1,000 件" },
    ],
  },
  {
    title: "经验与资质",
    icon: ShieldCheck,
    more: false,
    fields: [
      { key: "markets", label: "已有市场经历", value: "美国、越南、德国" },
      { key: "certs", label: "材料提及的资质", value: "CE、FCC、RoHS、BQB、ISO 9001、BSCI", note: "资质的有效期与覆盖范围待核验。" },
    ],
  },
];

function BusinessPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<string | null>(null);

  function commit(field: Field, raw: string) {
    const v = raw.trim();
    setEditing(null);
    if (v && v !== (values[field.key] ?? field.value)) setValues((s) => ({ ...s, [field.key]: v }));
  }
  function onKey(e: KeyboardEvent<HTMLInputElement>, field: Field) {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) commit(field, e.currentTarget.value);
    if (e.key === "Escape") setEditing(null);
  }

  return (
    <>
      <div className="rec-h">
        <div>
          <h4>我的业务</h4>
        </div>
      </div>
      <div className="bz-card">
        <span className="bz-ic">
          <Building2 className="i" />
        </span>
        <div>
          <b>{values.name ?? "声谷电子"}</b>
          <span>
            <Check className="i" />
            示例档案 · 保存在此浏览器
          </span>
        </div>
      </div>
      {BUSINESS.map(({ title, icon: Icon, fields, more }, si) => (
        <section key={title} className={`rec-sec bz${si === BUSINESS.length - 1 ? " last" : ""}`}>
          <h5>
            {Icon ? <Icon className="i bz-h-ic" /> : null}
            {title}
          </h5>
          {fields.map((f) => {
            const changed = f.key in values;
            return (
              <div key={f.key} className="bz-row">
                <div>
                  <span title={changed ? "你改过这个值，原始来源仍保留" : undefined}>
                    {f.label}
                    {changed ? <Pencil className="i" /> : null}
                  </span>
                  {editing === f.key ? (
                    <input
                      className="bz-input"
                      defaultValue={values[f.key] ?? f.value}
                      aria-label={`修改${f.label}`}
                      autoFocus
                      onBlur={(e) => commit(f, e.currentTarget.value)}
                      onKeyDown={(e) => onKey(e, f)}
                    />
                  ) : (
                    <b>{values[f.key] ?? f.value}</b>
                  )}
                  {f.note ? <em>{f.note}</em> : null}
                </div>
                <button type="button" className="ibtn bz-ed" aria-label={`修改${f.label}`} onClick={() => setEditing(f.key)}>
                  <Pencil className="i" />
                </button>
                <SourceButton />
              </div>
            );
          })}
          {more ? (
            <span className="bz-add">
              <Plus className="i" />
              补充
            </span>
          ) : null}
        </section>
      ))}
    </>
  );
}
