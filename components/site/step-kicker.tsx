import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** 四步的小标题，样子照 web-next 登录页流程轮播里当前那一行（auth-workflow.tsx） */
export function StepKicker({ icon: Icon, step, children }: { icon: LucideIcon; step: number; children: ReactNode }) {
  return (
    <p className="stepk">
      <span className="si">
        <Icon className="i" />
      </span>
      {children}
      <em>{step} / 4</em>
    </p>
  );
}
