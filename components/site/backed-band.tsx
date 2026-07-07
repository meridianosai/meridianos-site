import { Reveal } from "./reveal";

export function BackedBand() {
  return (
    <Reveal className="backed">
      <div className="wrap">
        <div className="backed-row">
          <span className="backed-label">投资方</span>
          <div className="backed-logos">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mp-logo.png" alt="奇绩创坛 MiraclePlus" className="mp-logo" width={1515} height={369} />
            <span className="backed-batch">S26</span>
            <span className="backed-div" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/antler-logo.png" alt="Antler" className="antler-logo" width={4000} height={961} />
          </div>
        </div>
      </div>
    </Reveal>
  );
}
