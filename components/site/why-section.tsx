import { MeridianLines } from "./meridian-lines";
import { Reveal } from "./reveal";

const ROWS = [
  ["记得什么", "只记得这一次对话", "你的业务资料和关注的客户一直存着，下周打开还在原处。"],
  ["怎么做事", "你问一句，它答一句", "从区域一路找到公司，每一步查了什么都列出来。"],
  ["说的话从哪来", "很难追到原文", "每句判断都能点开原网页核对。"],
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
          和直接问通用 AI
          <br />
          有什么不一样？
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
