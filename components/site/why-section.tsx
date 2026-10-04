import { MeridianLines } from "./meridian-lines";
import { Reveal } from "./reveal";

const ROWS = [
  ["记得什么", "这一次对话", "业务档案、看过的市场、关注的公司、每条客户记录，跨会话都在。今天看过的，下周还在原处。"],
  ["怎么做事", "你问一句，它答一句", "按区域、国家、城市、公司一层层推进；每一步的工具调用都摊开；在工作台里点和在对话里答，走同一条路。"],
  ["说的话从哪来", "很难追到原文", "每段判断、每条信号都挂着来源；有网页的在沙箱浏览器里打开，摘录那句已经划好。"],
] as const;

/** 和通用 AI 的区别 */
export function WhySection() {
  return (
    <section className="why" id="why">
      <svg className="why-mer" viewBox="-310 -310 620 620" aria-hidden="true">
        <MeridianLines />
      </svg>
      <div className="wrap">
        <Reveal as="h2">
          <span className="dim">通用 AI 给你一双手。</span>
          <br />
          子午纪，再给你一张图。
        </Reveal>
        <Reveal as="table" className="vs">
          <thead>
            <tr>
              <th />
              <th>通用 AI</th>
              <th className="us">MeridianAI Fleet</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([k, gen, us]) => (
              <tr key={k}>
                <th>{k}</th>
                <td className="gen">{gen}</td>
                <td className="us">{us}</td>
              </tr>
            ))}
          </tbody>
        </Reveal>
      </div>
    </section>
  );
}
