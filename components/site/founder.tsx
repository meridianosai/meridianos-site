import { Reveal } from "./reveal";

export function Founder() {
  return (
    <section className="sec founder" id="founder">
      <Reveal className="wrap founder-in">
        <div className="founder-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/founder-photo.jpg"
            alt="周玉林 · 子午纪创始人 · 路演日 / 奇绩创坛 / Antler"
            width={1200}
            height={1200}
            loading="lazy"
            decoding="async"
          />
        </div>
        <div>
          <h2>为什么做子午纪</h2>
          <p>我在硅谷的创业公司做过 B2B 销售，在 Uber 负责过客户增长，也在国内带过一支近 20 人的出海团队。</p>
          <p>找海外客户，最花时间的是前期调研：这家公司在买什么，该找谁。我想把这部分交给 AI，让一线销售把时间留给谈客户。</p>
          <div className="sign">周玉林 · 创始人 &amp; CEO</div>
        </div>
      </Reveal>
    </section>
  );
}
