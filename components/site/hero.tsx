import { HeroComposer } from "./hero-composer";
import { HeroGlobe } from "./hero-globe";

/**
 * 首屏：文案是服务端组件；地球（hero-globe）和输入框（hero-composer）是两个客户端叶子。
 * 地球按 `.hero-copy` 里文字的实际右缘让出安全区，所以文字要放在 `.hero-copy` 里。
 */
export function Hero() {
  return (
    <header className="hero" id="top">
      <HeroGlobe />
      <div className="wrap hero-in">
        <div className="hero-copy">
          {/* 品牌 slogan 做引题：先读到为什么做，再读到做什么 */}
          <p className="kicker" style={{ "--d": 0 }}>
            让天下没有难做的海外生意
          </p>
          <h1>
            <span className="l" style={{ "--d": 1 }}>
              人，
            </span>
            <span className="l" style={{ "--d": 2 }}>
              在<em>信号</em>的另一端。
            </span>
          </h1>
          <p className="hero-sub" style={{ "--d": 3 }}>
            找准和你产品有关的采购信号，顺着它，找到该联系的那个人。
          </p>
          <HeroComposer />
        </div>
      </div>
      <p className="hero-note">地球上的公司与人物均为示例</p>
    </header>
  );
}
