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
            国内做生意先查企查查，出海做生意先用出海查。输入一家海外公司的名字就能查。
          </p>
          <ul className="chq-list">
            <li>
              <b>注册信息</b>公司还在不在经营、董事是谁，数据来自官方数据库。
            </li>
            <li>
              <b>调研报告</b>它在买什么、走哪些渠道、谁拍板，每条结论都标了来源和可信度。
            </li>
            <li>
              <b>怎么谈</b>上传你的产品资料，报告会写这家客户适合从哪里谈起。
            </li>
          </ul>
          <div className="qr-row">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/chuhaicha-qr.jpg" alt="出海查AI 小程序码" width={104} height={104} loading="lazy" decoding="async" />
            <p>
              <b>微信扫码</b>，或搜索小程序「出海查AI」
              <br />
              第一次调研免费。
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
