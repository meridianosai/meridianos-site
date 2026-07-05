import { Reveal } from "./reveal";

export function ContrastBand() {
  return (
    <div className="band">
      <div className="wrap">
        <Reveal className="band-lead">
          <div className="coord" style={{ justifyContent: "center" }}>
            同样一件事 · 两种活法
          </div>
          <h2>
            把货卖进海外渠道,
            <br />
            过去要拿命赌,现在动动嘴。
          </h2>
        </Reveal>
        <Reveal className="contrast">
          <div className="ccol past">
            <div className="h">过去 · 又贵又慢又赌命</div>
            <dl>
              <div className="r">
                <span>怎么起步</span>
                <span className="v">飞去当地、雇一支本地队</span>
              </div>
              <div className="r">
                <span>多久见效</span>
                <span className="v">大半年才摸清门道</span>
              </div>
              <div className="r">
                <span>能试几个市场</span>
                <span className="v">预算只够押一个</span>
              </div>
              <div className="r">
                <span>押错了</span>
                <span className="v">几百万打水漂</span>
              </div>
            </dl>
          </div>
          <div className="c-mid">
            <svg viewBox="0 0 44 44" fill="none" stroke="var(--gold)" strokeWidth="1.6">
              <path d="M8 22h28M26 12l10 10-10 10" />
            </svg>
          </div>
          <div className="ccol now">
            <div className="h">现在 · 又快又省又可退</div>
            <dl>
              <div className="r">
                <span>怎么起步</span>
                <span className="v">打一句话给 Agent</span>
              </div>
              <div className="r">
                <span>多久见效</span>
                <span className="v">当天出第一批客户</span>
              </div>
              <div className="r">
                <span>能试几个市场</span>
                <span className="v">想试几个试几个</span>
              </div>
              <div className="r">
                <span>不合适</span>
                <span className="v">换个市场重跑一遍</span>
              </div>
            </dl>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
