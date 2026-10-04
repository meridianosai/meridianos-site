import { Reveal } from "./reveal";

export function BackedBand() {
  return (
    <section className="backed" aria-label="投资方">
      <Reveal className="wrap backed-in">
        <div className="backed-l">
          <span className="backed-k">投资方</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mp-logo.png" alt="奇绩创坛 MiraclePlus" className="mp" width={1515} height={369} />
          <span className="s26">S26</span>
          <span className="sep" aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/antler-logo.png" alt="Antler" className="antler" width={4000} height={961} />
        </div>
        <p className="backed-r">
          已为智能硬件、软件服务、AI 出海等领域的 <b>10+</b> 家头部企业交付 <b>200+</b> 份深度调研
        </p>
      </Reveal>
    </section>
  );
}
