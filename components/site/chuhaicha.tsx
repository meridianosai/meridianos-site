import { Reveal } from "./reveal";

/** 出海查 AI：已上线的免费入口，静态展示一屏深度报告 */
export function Chuhaicha() {
  return (
    <section className="sec chq" id="chuhaicha">
      <div className="wrap chq-in">
        <Reveal>
          <p className="tagline">
            <span className="tg-live">已上线</span>微信小程序 · 免费
          </p>
          <h2>先免费查一家：出海查 AI</h2>
          <p className="lead">
            国内做生意先查企查查，出海做生意先用出海查。输入一家海外公司，拿到工商信息、经营信号和一份 AI 深度报告，告诉你该从哪里切入。
          </p>
          <ul className="chq-list">
            <li>
              <b>工商信息核验</b>注册信息、董事结构、存续状态，对接官方数据库
            </li>
            <li>
              <b>AI 深度调研</b>采购动向、渠道结构、决策人，每条结论标注来源与置信度
            </li>
            <li>
              <b>切入路径建议</b>上传你的产品资料，报告直接告诉你这家客户该怎么谈
            </li>
          </ul>
          <div className="qr-row">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/chuhaicha-qr.jpg" alt="出海查AI 小程序码" width={104} height={104} loading="lazy" decoding="async" />
            <p>
              <b>微信扫一扫</b>，或搜索小程序「出海查AI」
              <br />
              免费开始第一次调研
            </p>
          </div>
        </Reveal>
        <Reveal className="phone">
          <div className="ph-body" aria-hidden="true">
            <div className="ph-scr">
              <div className="ph-st">
                <span>9:41</span>
                <span>●●●</span>
              </div>
              <div className="ph-eb">深度报告 · 已生成</div>
              <div className="ph-rh">TESCO PLC 调研报告</div>
              <div className="ph-toc">
                <span className="on">合作可行性</span>
                <span>采购情报</span>
                <span>切入路径</span>
                <span>风险</span>
              </div>
              <p className="ph-p">
                Tesco 是英国最大连锁超市，母婴品类年采购额预估 <b>£3–5 亿</b>，是中国母婴品牌进入英国的核心渠道。
                <br />
                <span className="hl2">合作可行性：高</span>
              </p>
              <p className="ph-p">
                <b>建议切入：</b>先通过自有品牌（Own Label）代工切入，再谈品牌入驻；需要 BSCI / SEDEX 和 UKCA。
              </p>
              <div className="ph-src">来源 · Companies House / Kantar 2025 / GLEIF</div>
            </div>
          </div>
          <p className="ph-cap">演示数据 · TESCO 为公开信息</p>
        </Reveal>
      </div>
    </section>
  );
}
