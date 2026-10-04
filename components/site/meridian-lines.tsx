/** 正射投影的经纬网：中间那条是子午线。品牌母题，也是地球加载失败时的替身；放进 viewBox="-310 -310 620 620" 的 svg */
export function MeridianLines() {
  return (
    <>
      <g fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle r="300" />
        {[77.6, 150, 212.1, 259.8, 289.8].map((rx) => (
          <ellipse key={rx} rx={rx} ry="300" />
        ))}
        <path d="M-289.8-77.6h579.6M-259.8-150h519.6M-212.1-212.1h424.2M-150-259.8h300M-300 0h600M-289.8 77.6h579.6M-259.8 150h519.6M-212.1 212.1h424.2M-150 259.8h300" />
      </g>
      <path className="prime" d="M0-300V300" stroke="currentColor" strokeWidth="2.4" fill="none" />
    </>
  );
}
