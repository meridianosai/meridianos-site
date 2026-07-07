"use client";

import { useEffect, useRef } from "react";
import { Reveal } from "./reveal";

/**
 * 出海查 AI:手机三屏演示(搜索 → 公司详情 → 深度报告),自动轮播 + 手动切换 + 缩放适配。
 * 逻辑忠实移植自 docs/prototype/index.html,查询作用域收敛到组件根节点。
 */
export function Chuhaicha() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const byId = (id: string) => root.querySelector<HTMLElement>("#" + id);

    const screens = Array.from(root.querySelectorAll<HTMLElement>(".ph-s"));
    const dots = Array.from(root.querySelectorAll<HTMLElement>(".ph-dots button"));
    const phQ = byId("phQ");
    const phRes = byId("phRes");
    const phoneWrap = root.querySelector<HTMLElement>(".phone-wrap");
    const phoneSc = byId("phoneSc");
    if (!phQ || !phRes || !phoneWrap || !phoneSc) return;

    let phT: ReturnType<typeof setTimeout>[] = [];
    let phAuto = true;
    const pAt = (ms: number, fn: () => void) => phT.push(setTimeout(fn, ms));

    function phGo(i: number) {
      phT.forEach(clearTimeout);
      phT = [];
      screens.forEach((s, k) => s.classList.toggle("on", k === i));
      dots.forEach((d, k) => d.classList.toggle("on", k === i));
      if (i === 0) {
        phQ!.textContent = "";
        phRes!.classList.remove("show");
        if (reduce) {
          phQ!.textContent = "TESCO PLC";
          phRes!.classList.add("show");
          return;
        }
        const query = "TESCO PLC";
        let c = 0;
        const t = setInterval(() => {
          phQ!.textContent = query.slice(0, ++c);
          if (c >= query.length) {
            clearInterval(t);
            pAt(400, () => phRes!.classList.add("show"));
          }
        }, 90);
        phT.push(t);
        if (phAuto) pAt(3200, () => phGo(1));
      }
      if (i === 1 && phAuto && !reduce) pAt(3000, () => phGo(2));
      if (i === 2) {
        ["phP1", "phP2"].forEach((id, k) => {
          const el = byId(id);
          el?.classList.remove("show");
          pAt(reduce ? 0 : 400 + k * 650, () => el?.classList.add("show"));
        });
        if (phAuto && !reduce) pAt(4400, () => phGo(0));
      }
    }

    const onDot = (d: HTMLElement) => () => {
      phAuto = false;
      phGo(Number(d.dataset.ps));
    };
    const handlers = dots.map((d) => {
      const h = onDot(d);
      d.addEventListener("click", h);
      return [d, h] as const;
    });

    const ioP = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            phGo(0);
            ioP.disconnect();
          }
        });
      },
      { threshold: 0.3 },
    );
    ioP.observe(phoneWrap);

    function fitPhone() {
      const w = phoneWrap!.clientWidth;
      const s = Math.min(w / 342, 1);
      phoneSc!.style.transform = `scale(${s})`;
      phoneSc!.style.height = 590 * s + 14 + "px";
    }
    addEventListener("resize", fitPhone);
    fitPhone();

    return () => {
      phT.forEach(clearTimeout);
      ioP.disconnect();
      removeEventListener("resize", fitPhone);
      handlers.forEach(([d, h]) => d.removeEventListener("click", h));
    };
  }, []);

  return (
    <section id="chuhaicha" ref={rootRef}>
      <div className="wrap">
        <div className="p1">
          <Reveal className="p1-copy">
            <div className="coord">PRODUCT 01 · 已上线</div>
            <h2
              style={{
                fontFamily: "var(--serif)",
                fontWeight: 900,
                fontSize: "clamp(28px,3.4vw,40px)",
                lineHeight: 1.3,
                margin: "16px 0 14px",
              }}
            >
              出海查 AI<span className="tag live">微信小程序</span>
            </h2>
            <p className="lead">
              国内做生意,你先查企查查。出海做生意,先用出海查。输入一家海外公司,拿到工商信息、经营信号,和一份
              AI 深度报告——包括<b>你的产品该从哪里切入</b>。
            </p>
            <ul className="flist">
              <li>
                <span className="fi">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4" />
                  </svg>
                </span>
                <div>
                  <b>工商信息核验</b>
                  <span>注册信息、董事结构、存续状态,对接官方数据库</span>
                </div>
              </li>
              <li>
                <span className="fi">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                </span>
                <div>
                  <b>AI 深度调研</b>
                  <span>采购动向、渠道结构、决策人——每条结论标注来源与置信度</span>
                </div>
              </li>
              <li>
                <span className="fi">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <circle cx="12" cy="12" r="9" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="12" cy="12" r="1" fill="currentColor" />
                  </svg>
                </span>
                <div>
                  <b>切入路径建议</b>
                  <span>上传你的产品资料,报告直接告诉你:这家客户该怎么谈</span>
                </div>
              </li>
            </ul>
            <div className="qr-row">
              <div className="qr-slot">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/chuhaicha-qr.jpg" alt="出海查AI 小程序码" loading="lazy" decoding="async" />
              </div>
              <div className="qr-note">
                <b>微信扫一扫</b>,或搜索小程序
                <br />
                「<b>出海查AI</b>」——免费开始第一次调研
              </div>
            </div>
          </Reveal>

          <Reveal className="phone-wrap">
            <div className="phone-sc" id="phoneSc">
              <PhoneScreens />
            </div>
            <div className="ph-dots">
              <button className="on" data-ps="0" />
              <button data-ps="1" />
              <button data-ps="2" />
            </div>
            <div className="ph-cap">演示数据 · TESCO 为公开信息</div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function PhoneScreens() {
  return (
    <div className="phone">
      <div className="ph-s on" id="ps0">
        <div className="ph-st">
          <span>9:41</span>
          <span>◉ ◉ ◉</span>
        </div>
        <div className="ph-eb">AI-POWERED · 出海查</div>
        <div className="ph-h">
          全球公司,
          <br />
          一查便知。
        </div>
        <div className="ph-search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3552C0" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <span className="q" id="phQ" />
          <span className="ph-cr" id="phCr" />
        </div>
        <div className="ph-card" id="phRes">
          <div className="ph-co">
            <div className="ph-mk">TE</div>
            <div>
              <div className="ph-nm">TESCO PLC</div>
              <div className="ph-sb">英国 · 连锁零售 · 1919</div>
            </div>
          </div>
          <div className="ph-tags">
            <span className="ph-t g">ACTIVE 存续</span>
            <span className="ph-t">COMPANIES HOUSE</span>
            <span className="ph-t">市占 27.4%</span>
          </div>
        </div>
      </div>
      <div className="ph-s" id="ps1">
        <div className="ph-st">
          <span>9:41</span>
          <span>◉ ◉ ◉</span>
        </div>
        <div className="ph-eb">公司详情</div>
        <div className="ph-h" style={{ fontSize: "20px" }}>
          TESCO PLC
        </div>
        <div className="ph-card show" style={{ marginTop: "12px" }}>
          <div className="ph-kv">
            <span className="k">注册编号</span>
            <span className="v mono" style={{ fontFamily: "var(--mono)", fontSize: "11px" }}>
              00445790
            </span>
          </div>
          <div className="ph-kv">
            <span className="k">状态</span>
            <span className="v" style={{ color: "#2F6B4F" }}>
              Active · 存续
            </span>
          </div>
          <div className="ph-kv">
            <span className="k">母婴品类年采购</span>
            <span className="v">£3–5 亿</span>
          </div>
          <div className="ph-kv">
            <span className="k">供应商准入</span>
            <span className="v">BSCI / UKCA</span>
          </div>
        </div>
        <div className="ph-btn">AI 深度调研 · 结合你的产品</div>
        <div style={{ fontSize: "10px", color: "#9AA4BE", textAlign: "center", marginTop: "9px" }}>
          已结合你的业务资料:跨境母婴 · 婴幼儿护理
        </div>
      </div>
      <div className="ph-s" id="ps2">
        <div className="ph-st">
          <span>9:41</span>
          <span>◉ ◉ ◉</span>
        </div>
        <div className="ph-eb">深度报告 · 已生成</div>
        <div className="ph-rh">TESCO PLC 调研报告</div>
        <div className="ph-toc">
          <span>合作可行性</span>
          <span>采购情报</span>
          <span>切入路径</span>
          <span>风险</span>
        </div>
        <div className="ph-p" id="phP1">
          Tesco 是英国最大连锁超市,母婴品类年采购额预估 <b>£3–5 亿</b>,是中国母婴品牌进入英国的核心渠道。
          <span className="hl">合作可行性:高</span>
        </div>
        <div className="ph-p" id="phP2">
          <b>建议切入:</b>先通过自有品牌(Own Label)代工切入,再谈品牌入驻——需 BSCI/SEDEX + UKCA。
        </div>
        <div className="ph-src" id="phSrc">
          来源 · COMPANIES HOUSE / KANTAR 2025 / GLEIF
        </div>
      </div>
    </div>
  );
}
