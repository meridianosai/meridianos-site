/**
 * 落地页里的产品画面用到的小件，照 fleet apps/web-next 的实现复刻：左侧导航、工作台标签、
 * 面包屑、Agent 面板的消息 / 工具调用记录 / 内嵌提问 / 推荐追问 / 输入框 / 文件卡。
 * 只做展示，不接任何接口；样式在 globals.css 的 `.k` 一节。
 */
import {
  BookOpen,
  Bookmark,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  CircleDashed,
  Compass,
  FolderOpen,
  History,
  MapPin,
  MessageCircleQuestion,
  PanelRightClose,
  Plus,
  Send,
  Square,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  IconFile,
  IconFileTypeCsv,
  IconFileTypeDoc,
  IconFileTypeDocx,
  IconFileTypePdf,
  IconFileTypePpt,
  IconFileTypeXls,
  type Icon as TablerIcon,
} from "@tabler/icons-react";
import type { ReactNode } from "react";

/** 产品标识（web-next 的 app/icon.png），叠在玻璃上用 multiply 去掉白底 */
export function FleetMark({ className = "mark" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={className} src="/fleet/fleet-mark.png" alt="" width={256} height={256} />;
}

export function SourceButton() {
  return (
    <span className="ibtn">
      <BookOpen className="i" />
    </span>
  );
}

/** 左侧窄栏：探索 · 已关注 · 我的业务 · 资料库，底部新探索 */
export function Rail({ active }: { active: "explore" | "saved" | "business" | "library" }) {
  const items: [typeof active, LucideIcon][] = [
    ["explore", Compass],
    ["saved", Bookmark],
    ["business", Building2],
    ["library", FolderOpen],
  ];
  return (
    <aside className="pane k-rail" aria-hidden="true">
      <FleetMark />
      {items.map(([key, Icon]) => (
        <span key={key} className={`k-ri${key === active ? " on" : ""}`}>
          <Icon className="i" />
        </span>
      ))}
      <span className="sp" />
      <span className="k-ri">
        <Plus className="i" />
      </span>
    </aside>
  );
}

/** 工作台标签的颜色按窗口种类：探索 / 公司 / 人 / 我的业务 / 来源（web-next DESIGN.md「工作台窗口」） */
export const TAB_COLORS = {
  explore: "#245ea8",
  company: "#167367",
  person: "#5354a0",
  business: "#f0712d",
  source: "#04a3e8",
} as const;

export function Tab({
  icon: Icon,
  color,
  on,
  closable,
  children,
}: {
  icon: LucideIcon;
  color: string;
  on?: boolean;
  closable?: boolean;
  children: ReactNode;
}) {
  return (
    <span className={`k-tab${on ? " on" : ""}`} style={{ "--tc": color }}>
      <Icon className="i" />
      {children}
      {closable ? <X className="i x" /> : null}
    </span>
  );
}

/** 面包屑：第一段之后每段都能下拉切换同级，最后挂「最近查看」 */
export function Crumb({ path, className = "k-crumb" }: { path: readonly string[]; className?: string }) {
  return (
    <div className={className}>
      {path.map((name, i) => (
        <span key={name} className="k-crumb-seg">
          {i ? <ChevronRight className="i sep" /> : null}
          <span className="c">
            {name}
            {i ? <ChevronDown className="i" /> : null}
          </span>
        </span>
      ))}
      {path.length > 1 ? (
        <span className="ibtn">
          <History className="i" />
        </span>
      ) : null}
    </div>
  );
}

/* ---------- Agent 面板：照 web-next #415 按聊天面板重排 ----------
 * 一轮 = 用户一句浅底短块 + Agent 一段正文（不带头像）；工具调用一行一条，归在一条可折叠的汇总行下；
 * ask_user 内嵌在这一轮末尾，答过原地折成「问题 → 选择」；依据是句末小字；推荐追问是输入框上方的灰字 chip；
 * 当前查看的对象收进输入框左下角。只做展示，所以全是 span，不放可聚焦的按钮。 */

/** 标题栏：标识、名称、「演示」小标（取代原来底部那行「演示对话 · 未接入模型」） */
export function AgentHeader() {
  return (
    <div className="k-ag-h">
      <FleetMark />
      <span className="t">Meridian Agent</span>
      <span className="k-badge" title="演示对话，未接入模型">
        演示
      </span>
      <span className="ibtn">
        <PanelRightClose className="i" />
      </span>
    </div>
  );
}

/** 用户这一句；context 是提问对象，只在和上一句不同时标（选择类消息本身已点名对象，不标） */
export function UserMsg({ context, children }: { context?: string; children: ReactNode }) {
  return (
    <div className="k-um">
      {context ? (
        <span className="k-um-ctx">
          <MapPin className="i" />
          {context}
        </span>
      ) : null}
      {children}
    </div>
  );
}

/** 句末的「依据」：点开来源标签的入口 */
export function SourceLink() {
  return <span className="k-src">依据</span>;
}

export function AgentMsg({ children, source = true }: { children: ReactNode; source?: boolean }) {
  return (
    <p className="k-am">
      {children}
      {source ? (
        <>
          {" "}
          <SourceLink />
        </>
      ) : null}
    </p>
  );
}

export type ActivityState = "pending" | "running" | "complete";

/** 状态：进行中是一个呼吸的蓝点，返回后是绿勾，还没开始是虚线圈 */
export function ActivityGlyph({ state }: { state: ActivityState }) {
  return (
    <span className={`k-glyph ${state}`} aria-hidden="true">
      {state === "complete" ? <Check className="i" /> : state === "pending" ? <CircleDashed className="i" /> : <i />}
    </span>
  );
}

/** 一轮执行的工具调用：汇总行（「越南 · 调用了 3 个工具」）+ 展开后一行一条 */
export function ActivityGroup({
  state,
  summary,
  open = false,
  children,
}: {
  state: ActivityState;
  summary: string;
  open?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className={`k-act${open ? " open" : ""}`}>
      <div className="k-act-h">
        <ActivityGlyph state={state} />
        <span className="t">{summary}</span>
        <ChevronDown className="i cv" />
      </div>
      <div className="k-act-b">
        <div>{children}</div>
      </div>
    </div>
  );
}

/** 一次调用一行：「读取网页 · shenggu-audio.com」；open 时下面是这一步在做什么，或返回了什么 */
export function ActivityRow({
  state,
  icon: Icon,
  title,
  object,
  open = false,
  children,
}: {
  state: ActivityState;
  icon?: LucideIcon;
  title: string;
  object?: string;
  open?: boolean;
  children?: ReactNode;
}) {
  const expandable = children !== undefined && children !== null && children !== false;
  return (
    <div className={`k-row ${state}${expandable && open ? " open" : ""}`}>
      <div className="k-row-h">
        <ActivityGlyph state={state} />
        {Icon ? <Icon className="i ic" /> : null}
        <span className="t">
          {title}
          {object ? <span className="o"> · {object}</span> : null}
        </span>
        {expandable ? <ChevronDown className="i cv" /> : null}
      </div>
      {expandable ? (
        <div className="k-row-b">
          <div>{children}</div>
        </div>
      ) : null}
    </div>
  );
}

export type AskOption = readonly [label: string, detail: string];

/** Agent 的提问内嵌在这一轮末尾：问题一行、选项逐行；给了 answer 就是答过的样子 */
export function AskUser({ question, options = [], answer }: { question: string; options?: readonly AskOption[]; answer?: string }) {
  if (answer) {
    return (
      <div className="k-askd">
        <MessageCircleQuestion className="i" />
        <span className="t">
          {question}
          <span className="a"> → {answer}</span>
        </span>
        <ChevronDown className="i cv" />
      </div>
    );
  }
  return (
    <div className="k-ask">
      <p className="k-ask-q">
        <MessageCircleQuestion className="i" />
        {question}
      </p>
      {options.map(([label, detail]) => (
        <span key={label} className="k-ask-o">
          <Circle className="i" />
          <span>
            <b>{label}</b>
            <span>{detail}</span>
          </span>
        </span>
      ))}
    </div>
  );
}

/** 推荐追问：最多 3 个，只跟随最新一轮回复 */
export function Suggestions({ items }: { items: readonly string[] }) {
  return (
    <div className="k-chips">
      {items.slice(0, 3).map((s) => (
        <span key={s} className="k-chip">
          {s}
        </span>
      ))}
    </div>
  );
}

/** 底部：推荐追问 + 输入框；左下角是上下文标签（当前查看的对象），执行中发送键变停止键 */
export function AgentInput({
  context,
  suggestions,
  busy = false,
}: {
  context?: string;
  suggestions?: readonly string[];
  busy?: boolean;
}) {
  return (
    <div className="k-compose">
      {suggestions?.length && !busy ? <Suggestions items={suggestions} /> : null}
      <div className="k-input">
        <span className="ph">继续问，或告诉我下一步…</span>
        <div className="k-input-f">
          {context ? (
            <span className="k-ctx">
              <MapPin className="i" />
              <span>{context}</span>
            </span>
          ) : (
            <span />
          )}
          <span className={`k-send${busy ? " stop" : ""}`}>{busy ? <Square className="i" /> : <Send className="i" />}</span>
        </div>
      </div>
    </div>
  );
}

// 文件卡的类型图标用 Tabler（MIT）：它把扩展名画在图标里，lucide 没有 PDF / XLS 这类图标（web-next ADR 0057）。
// 颜色按人们认文件的习惯：红 PDF、绿表格、蓝 Word、琥珀幻灯片。
const FILE_TYPES: Record<string, [TablerIcon, "pdf" | "sheet" | "doc" | "slide"]> = {
  pdf: [IconFileTypePdf, "pdf"],
  xls: [IconFileTypeXls, "sheet"],
  xlsx: [IconFileTypeXls, "sheet"],
  csv: [IconFileTypeCsv, "sheet"],
  doc: [IconFileTypeDoc, "doc"],
  docx: [IconFileTypeDocx, "doc"],
  ppt: [IconFileTypePpt, "slide"],
  pptx: [IconFileTypePpt, "slide"],
};

/** 一份文件一张小卡：类型图标 + 文件名 + 「PDF · 2 KB」，一排三张（照 web-next features/library/file-card.tsx） */
export function FileCard({ name, size }: { name: string; size?: string }) {
  const ext = /\.([a-z0-9]{1,5})$/i.exec(name)?.[1].toLowerCase() ?? "";
  const [Icon, tone] = FILE_TYPES[ext] ?? [IconFile, "other"];
  return (
    <span className={`k-file ${tone}`} title={name}>
      <span className="ic">
        <Icon stroke={1.75} aria-hidden="true" />
      </span>
      <span className="tx">
        <b>{name}</b>
        <span>
          {ext.toUpperCase() || "文件"}
          {size ? <span className="sz"> · {size}</span> : null}
        </span>
      </span>
    </span>
  );
}

/** 用户这一轮附带的文件：独立一排，和气泡同侧靠右 */
export function FileRow({ files }: { files: readonly (readonly [name: string, size: string])[] }) {
  return (
    <div className="k-files">
      {files.map(([name, size]) => (
        <span key={name} className="k-file-cell">
          <FileCard name={name} size={size} />
        </span>
      ))}
    </div>
  );
}
