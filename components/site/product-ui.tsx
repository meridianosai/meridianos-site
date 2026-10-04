/**
 * 落地页里的产品画面用到的小件，照 fleet apps/web-next 的实现复刻：左侧导航、工作台标签、
 * 面包屑、Agent 面板的消息 / 工具执行记录 / 已回答的选择 / 推荐追问 / 输入框。
 * 只做展示，不接任何接口；样式在 globals.css 的 `.k` 一节。
 */
import {
  BookOpen,
  Bookmark,
  Building2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleCheck,
  Check,
  Compass,
  FolderOpen,
  History,
  MapPin,
  PanelRightClose,
  Plus,
  Send,
  X,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

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
    <span className={`k-tab${on ? " on" : ""}`} style={{ "--tc": color } as CSSProperties}>
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

export function AgentHeader({ current }: { current: string }) {
  return (
    <>
      <div className="k-ag-h">
        <FleetMark />
        Meridian Agent
        <span className="ibtn">
          <PanelRightClose className="i" />
        </span>
      </div>
      <div className="k-ag-cur">当前查看 · {current}</div>
    </>
  );
}

export function UserMsg({ children }: { children: ReactNode }) {
  return <div className="k-um">{children}</div>;
}

export function AgentMsg({ children, source = true }: { children: ReactNode; source?: boolean }) {
  return (
    <div className="k-am">
      <FleetMark />
      <p>{children}</p>
      {source ? <SourceButton /> : null}
    </div>
  );
}

/** 一次工具执行记录；steps 有值时展开显示做了哪几步 */
export function ToolRecord({ title, steps }: { title: string; steps?: readonly string[] }) {
  const Chevron = steps ? ChevronUp : ChevronDown;
  return (
    <div className="k-tool">
      <FleetMark />
      <div className="k-tc">
        <div className="k-tc-h">
          <MapPin className="i" />
          <span>
            <b>{title}</b>
            <span className="s">示例工具 · 未联网</span>
          </span>
          <span className="okc">
            <CircleCheck className="i" />
            已返回
          </span>
          <Chevron className="i cv" />
        </div>
        {steps ? (
          <div className="k-tc-steps">
            {steps.map((s) => (
              <span key={s}>
                <Check className="i" />
                {s}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** 已回答过的选择卡，折叠留在对话里 */
export function AnsweredAsk({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="k-tool">
      <FleetMark />
      <div className="k-done">
        <MapPin className="i" />
        <span>
          <b>{question}</b>
          <span>已选 {answer}</span>
        </span>
        <ChevronDown className="i" />
      </div>
    </div>
  );
}

export function Suggestions({ items }: { items: readonly string[] }) {
  return (
    <div className="k-sugs">
      {items.map((s) => (
        <span key={s} className="k-sug">
          {s}
        </span>
      ))}
    </div>
  );
}

export function AgentInput() {
  return (
    <>
      <div className="k-input">
        继续问，或告诉我下一步…
        <span className="k-send">
          <Send className="i" />
        </span>
      </div>
      <div className="k-ag-ft">演示对话 · 未接入模型</div>
    </>
  );
}
