import { Reveal } from "./reveal";

export function Founder() {
  return (
    <section className="founder-sec" id="founder">
      <Reveal className="wrap founder-in">
        <div className="founder-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/founder-photo.jpg"
            alt="周玉林 · 子午纪创始人 · 路演日 / 奇绩创坛 / Antler"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="founder-copy">
          <div className="coord">为什么是我们</div>
          <h2>
            让每一个中国团队,
            <br />
            都能<span className="em">打进全球市场</span>。
          </h2>
          <p>
            我在多个硅谷明星创业公司做过 B2B 销售冠军,也在 Uber 这样的 500
            强负责过客户增长,还在中国带过一支近 20
            人的出海团队,亲手把中国公司的产品卖给了海外大客户。我见过最好的打法,也踩过所有的坑。
          </p>
          <p>
            但我更清楚一件事:海外市场从来不该只属于那些请得起本地销售老兵的大公司。当
            AI 能接手最重的&quot;调研 + 判断 +
            触达&quot;,出海的门槛会被彻底拉平——外贸老板、第一次做海外的创业者、几个人的小团队,都能像本地老兵一样把客户一个个谈进来。
          </p>
          <p className="founder-vision">
            这就是子午纪在做的事:让出海,变成一件全民都能做成的事。
          </p>
          <div className="founder-sign">周玉林 · 创始人 &amp; CEO</div>
        </div>
      </Reveal>
    </section>
  );
}
