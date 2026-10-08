"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";
import { Bookmark, Briefcase, Building2, Check, Compass, Maximize2, Pencil, Plus, ShieldCheck, UserRound, X, type LucideIcon } from "lucide-react";
import { ALEX, LOTUS, PRODUCTS } from "./demo-data";
import { prefersReducedMotion } from "./motion";
import { AgentHeader, AgentInput, Crumb, SourceButton, TAB_COLORS } from "./product-ui";
import { useOnceVisible } from "./use-once-visible";

export type RecordId = "co" | "pe" | "biz";
export type Anchor = readonly [id: string, label: string, count?: number];

export interface RecordPageContent {
  /** 头部（名称、身份行），在服务端渲染好 */
  head: ReactNode;
  /** 各段内容，每段 section 的 id 要和 anchors 对上 */
  body: ReactNode;
  anchors: readonly Anchor[];
}

/** 右侧 Agent：服务端渲染好的对话，加上输入框上方的推荐追问 */
export interface AgentContent {
  log: ReactNode;
  suggestions: readonly string[];
}

// current 是输入框左下角的上下文标签：跟着当前标签换对象
const TABS: { id: RecordId; label: string; icon: LucideIcon; color: string; current: string }[] = [
  { id: "co", label: LOTUS.name, icon: Building2, color: TAB_COLORS.company, current: LOTUS.name },
  { id: "pe", label: ALEX.name, icon: UserRound, color: TAB_COLORS.person, current: `${ALEX.name} · ${LOTUS.name}` },
  { id: "biz", label: "我的业务", icon: Briefcase, color: TAB_COLORS.business, current: "声谷电子" },
];

// 服务端渲染的页面里，「打开这个人 / 这家公司」的按钮经它切标签
const OpenRecordContext = createContext<(id: RecordId) => void>(() => {});

export function OpenRecordButton({ to, className, children }: { to: RecordId; className: string; children: ReactNode }) {
  const open = useContext(OpenRecordContext);
  return (
    <button type="button" className={className} onClick={() => open(to)}>
      {children}
    </button>
  );
}

export function FollowButton() {
  const [followed, setFollowed] = useState(false);
  return (
    <button type="button" className={`rec-follow${followed ? " on" : ""}`} aria-pressed={followed} onClick={() => setFollowed((f) => !f)}>
      <Bookmark className="i" />
      <span>{followed ? "已关注" : "关注"}</span>
    </button>
  );
}

/**
 * 3 找到目标客户的演示框：公司页、人的页面、我的业务是工作台里的三个标签（APG Tabs 模式）。
 * 公司页和人的页面由服务端渲染后传进来，这里只管切换、锚点和「我的业务」的就地修改。
 */
export function AccountDemo({ company, person, agent }: { company: RecordPageContent; person: RecordPageContent; agent: AgentContent }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const companyPage = useRef<RecordPageHandle>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const visible = useOnceVisible(frameRef, 0.3);
  const [rec, setRec] = useState<RecordId>("co");

  // 这一节要讲的是信号：第一次看到时停到信号段
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => companyPage.current?.jumpTo("co-sig"), prefersReducedMotion() ? 0 : 900);
    return () => clearTimeout(t);
  }, [visible]);

  function onTabKey(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = TABS.length - 1;
    const next =
      e.key === "ArrowRight" ? (index === last ? 0 : index + 1) : e.key === "ArrowLeft" ? (index === 0 ? last : index - 1) : e.key === "Home" ? 0 : e.key === "End" ? last : -1;
    if (next < 0) return;
    e.preventDefault();
    setRec(TABS[next].id);
    tabRefs.current[next]?.focus();
  }

  return (
    <OpenRecordContext.Provider value={setRec}>
      <div ref={frameRef} className={`k acc-frame${rec === "biz" ? " biz" : ""}`} role="group" aria-label="示例：Lotus Sound 的公司页、Alex Morgan 的人物页与我的业务">
        <div className="pane k-wb">
          <div className="k-tabs">
            <span className="k-tab" style={{ "--tc": TAB_COLORS.explore }}>
              <Compass className="i" />
              探索
            </span>
            <div className="k-tablist" role="tablist" aria-label="工作台标签">
              {TABS.map(({ id, label, icon: Icon, color }, i) => (
                <button
                  key={id}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  id={`acc-tab-${id}`}
                  type="button"
                  role="tab"
                  aria-selected={rec === id}
                  aria-controls={`acc-panel-${id}`}
                  tabIndex={rec === id ? 0 : -1}
                  className={`k-tab${rec === id ? " on" : ""}`}
                  style={{ "--tc": color }}
                  onClick={() => setRec(id)}
                  onKeyDown={(e) => onTabKey(e, i)}
                >
                  <Icon className="i" />
                  {label}
                  <X className="i x" />
                </button>
              ))}
            </div>
            <span className="k-tools">
              <span className="ibtn">
                <Maximize2 className="i" />
              </span>
            </span>
          </div>
          <Crumb path={["全球", "东南亚", "越南", "胡志明市"]} className="k-crumb acc-crumb" />
          <div className="k-body">
            <RecordPage ref={companyPage} id="co" hidden={rec !== "co"} content={company} label="公司页分段" />
            <RecordPage id="pe" hidden={rec !== "pe"} content={person} label="人的页面分段" />
            <div className="rec" id="acc-panel-biz" role="tabpanel" aria-labelledby="acc-tab-biz" tabIndex={0} hidden={rec !== "biz"}>
              <BusinessPage />
            </div>
          </div>
        </div>
        <aside className="pane k-agent acc-ag" aria-hidden="true">
          <AgentHeader />
          <div className="k-ag-body">{agent.log}</div>
          <AgentInput context={TABS.find((t) => t.id === rec)!.current} suggestions={agent.suggestions} />
        </aside>
      </div>
    </OpenRecordContext.Provider>
  );
}

interface RecordPageHandle {
  jumpTo(section: string): void;
}

/**
 * 资料页骨架：头部 → 吸顶的一排锚点 → 各段一页排开。锚点点击时平滑滚到对应段，滚动时跟随当前段；
 * 点了哪段就亮哪段，直到用户自己滚动（末尾几段滚不到顶，不能让滚动位置把它改成最后一段）。
 */
function RecordPage({
  ref,
  id,
  hidden,
  content,
  label,
}: {
  ref?: Ref<RecordPageHandle>;
  id: "co" | "pe";
  hidden: boolean;
  content: RecordPageContent;
  label: string;
}) {
  const { head, body, anchors } = content;
  const boxRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const locked = useRef(false);
  const [active, setActive] = useState(anchors[0][0]);

  const jumpTo = useCallback((section: string) => {
    const box = boxRef.current;
    const target = box?.querySelector<HTMLElement>(`#${section}`);
    if (!box || !target) return;
    locked.current = true;
    setActive(section);
    box.scrollTo({ top: target.offsetTop - (navRef.current?.offsetHeight ?? 0) + 1, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, []);
  useImperativeHandle(ref, () => ({ jumpTo }), [jumpTo]);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const unlock = () => {
      locked.current = false;
    };
    const onScroll = () => {
      if (locked.current) return;
      const y = box.scrollTop + (navRef.current?.offsetHeight ?? 0) + 24;
      let on = anchors[0][0];
      for (const [sid] of anchors) {
        const el = box.querySelector<HTMLElement>(`#${sid}`);
        if (el && el.offsetTop <= y) on = sid;
      }
      if (box.scrollTop + box.clientHeight >= box.scrollHeight - 4) on = anchors[anchors.length - 1][0];
      setActive(on);
    };
    // pointerdown 覆盖拖滚动条；点锚点时 pointerdown 先于 click，锁会在 click 里重新挂上
    const unlockOn = ["wheel", "touchmove", "keydown", "pointerdown"] as const;
    unlockOn.forEach((t) => box.addEventListener(t, unlock, { passive: true }));
    box.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      unlockOn.forEach((t) => box.removeEventListener(t, unlock));
      box.removeEventListener("scroll", onScroll);
    };
  }, [anchors]);

  return (
    <div className="rec" ref={boxRef} id={`acc-panel-${id}`} role="tabpanel" aria-labelledby={`acc-tab-${id}`} tabIndex={0} hidden={hidden}>
      {head}
      <nav className="rec-anc" ref={navRef} aria-label={label}>
        {anchors.map(([sid, text, count]) => (
          <button key={sid} type="button" className={active === sid ? "on" : undefined} onClick={() => jumpTo(sid)}>
            {text}
            {count ? <small>{count}</small> : null}
          </button>
        ))}
      </nav>
      {body}
    </div>
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
    fields: [PRODUCTS.A6, PRODUCTS.H2, PRODUCTS.S3].map((p) => ({ key: p.id, label: `${p.id} · ${p.name}`, value: p.specs })),
  },
  {
    title: "合作条件",
    more: true,
    fields: [PRODUCTS.A6, PRODUCTS.H2].flatMap((p) => [
      { key: `${p.id}-price`, label: `${p.id} 报价`, value: `FOB ${p.price}` },
      { key: `${p.id}-moq`, label: `${p.id} 起订量`, value: `${p.moq} 件` },
    ]),
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
          {/* 修改只在本页有效，不写进浏览器存储，照实说 */}
          <span>
            <Check className="i" />
            示例档案 · 刷新后恢复原样
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
