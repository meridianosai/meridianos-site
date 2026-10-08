import { Play, Send } from "lucide-react";
import { CrmDemo } from "./crm-demo";
import { Reveal } from "./reveal";
import { StepKicker } from "./step-kicker";

/** 4 准备联系与跟进：文案在服务端，表格演示是客户端叶子 */
export function CrmSection() {
  return (
    <section className="sec crmx" id="crm">
      <div className="wrap">
        <div className="crm-top">
          <Reveal>
            <StepKicker icon={Send} step={4}>
              准备联系与跟进
            </StepKicker>
            <div className="sec-h">
              <h2>
                所有要跟的客户
                <br />
                都在这张表里。
              </h2>
              <p>
                只需点击
                {/* 和表格列头的运行按钮同一个样子，波纹提示「点这里」 */}
                <span className="crm-play" role="img" aria-label="运行按钮">
                  <Play className="i" />
                </span>
                ，它就一家一家替你查：谁最近有动静，谁在管采购。查不到的，如实写下「查询失败」。
              </p>
            </div>
          </Reveal>
          <Reveal as="p" className="crm-note">
            跟到哪一步、下一步做什么，都记在一处，不用来回对表。联系草稿已经用它最近的动静开好头、写上你的报价，你看一遍、改好就能发。
          </Reveal>
        </div>
      </div>
      <div className="wrap-wide">
        <Reveal>
          <CrmDemo />
          <p className="frame-cap">示例 · 公司和联系人都是虚构的。</p>
        </Reveal>
      </div>
    </section>
  );
}
