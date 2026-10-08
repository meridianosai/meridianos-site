import { LOTUS } from "./demo-data";
import { AgentHeader, AgentInput, AgentMsg, UserMsg } from "./product-ui";
import { Reveal } from "./reveal";
import { SourceDemo } from "./source-demo";

/** 来源：文案和 Agent 对话在服务端，打开网页、滚到摘录的演示框是客户端叶子 */
export function SourceSection() {
  return (
    <section className="sec srcx" id="source">
      <div className="wrap">
        <Reveal className="sec-h">
          <h2>
            不用信它，
            <br />
            点开原页自己看。
          </h2>
          <p>
            每句判断都连着原网页，引用的那句已经用荧光笔划好，你只管核对。网页改过、找不到那句了，它会直说。
          </p>
        </Reveal>
      </div>
      <div className="wrap-wide">
        <Reveal>
          <SourceDemo agent={<SourceAgent />} />
          <p className="frame-cap">示例 · 网页和公司都是虚构的。想再看一遍，点 ↺。</p>
        </Reveal>
      </div>
    </section>
  );
}

function SourceAgent() {
  return (
    <aside className="pane k-agent" aria-hidden="true">
      <AgentHeader />
      <div className="k-ag-body">
        <div className="k-log">
          <UserMsg context={LOTUS.name}>这条信号有原页吗？</UserMsg>
          <AgentMsg>有，已在来源标签里打开。摘录那句在页面中段，已经划出来了。</AgentMsg>
          <UserMsg>这页还说了什么？</UserMsg>
          <AgentMsg>
            还有两件事：通勤用户在胡志明市和河内增长最快；他们在找能做自有标识和零售包装的代工伙伴，先从单一型号、单一颜色开始。目标价没写，联系时要问。
          </AgentMsg>
        </div>
      </div>
      <AgentInput context={LOTUS.name} suggestions={["核对合作条件", "起草联系开场"]} />
    </aside>
  );
}
