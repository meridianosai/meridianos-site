import { FileScan } from "lucide-react";
import { MeridianLines } from "./meridian-lines";
import { Reveal } from "./reveal";
import { StepKicker } from "./step-kicker";
import { UnderstandPanel } from "./understand-panel";

/** 1 理解你的业务：文案在服务端，右边的对话面板是客户端叶子 */
export function UnderstandSection() {
  return (
    <section className="sec und" id="understand">
      <div className="wrap und-in">
        <Reveal>
          <StepKicker icon={FileScan} step={1}>
            理解你的业务
          </StepKicker>
          <div className="sec-h">
            <h2>
              先读你的
              <br />
              官网和报价单。
            </h2>
            <p>
              把官网链接和产品目录发给它。读完它会告诉你，它理解的你是做什么的、该先找哪类客户；材料里没写的条件，比如交期和打样费，也会单独列出来。每句判断都有出处，哪句不放心就点开看。
            </p>
          </div>
        </Reveal>
        <Reveal className="und-stage">
          <svg className="und-orb" viewBox="-310 -310 620 620" aria-hidden="true">
            <MeridianLines />
          </svg>
          <UnderstandPanel />
        </Reveal>
      </div>
    </section>
  );
}
