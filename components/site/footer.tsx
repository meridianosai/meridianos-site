import { Reveal } from "./reveal";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <Reveal as="p" className="foot-slog">
          让天下没有难做的海外生意。
        </Reveal>

        <Reveal className="foot-contact">
          <div className="fc-qrs">
            <div className="fc-qr">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/chuhaicha-qr.jpg" alt="出海查AI 小程序码" width={84} height={84} loading="lazy" decoding="async" />
              <span>
                扫码免费用
                <br />
                出海查 AI
              </span>
            </div>
            <div className="fc-qr">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/wechat-qr.jpg" alt="创始人微信二维码" width={84} height={84} loading="lazy" decoding="async" />
              <span>
                加创始人微信
                <br />
                聊聊你的出海
              </span>
            </div>
          </div>
          <div className="fc-info">
            <div className="fc-row">
              <span className="fc-k">公司</span>
              <span>
                MeridianOS, Inc.
                <span className="fc-sub">Delaware C-Corp</span>
              </span>
            </div>
            <div className="fc-row">
              <span className="fc-k">邮箱</span>
              <a className="fc-link" href="mailto:info@meridianos.ai">
                info@meridianos.ai
              </a>
            </div>
            <div className="fc-row">
              <span className="fc-k">微信</span>
              <span>leo971217</span>
            </div>
          </div>
        </Reveal>

        <div className="foot-b">
          <span>© 2026 子午纪 Meridian · MeridianOS, Inc.</span>
          <nav aria-label="法律">
            <a href="/privacy">隐私政策</a>
            <a href="/terms">服务条款</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
