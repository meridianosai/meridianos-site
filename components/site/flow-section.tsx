"use client";

import { useRef, useState } from "react";
import { Reveal } from "./reveal";

const NAV_OFFSET = 88; // 展开后标题栏滚到固定导航下方的余量

interface AccItem {
  n: string;
  title: string;
  sub: string;
  body: React.ReactNode;
}

export function FlowSection() {
  const [open, setOpen] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  function handleOpen(i: number) {
    if (i === open) return; // 已展开的再点不收起,始终保持一个打开
    setOpen(i);
    // 等展开高度变化 + 其他项收起完成后再滚动,定位才准
    setTimeout(() => {
      const item = itemRefs.current[i];
      if (!item) return;
      const y = item.getBoundingClientRect().top + window.pageYOffset - NAV_OFFSET;
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    }, 340);
  }

  return (
    <section className="flow-sec" id="flow">
      <div className="wrap">
        <Reveal className="sec-head">
          <div className="coord">PRODUCT 02 · 内测排队中</div>
          <h2>
            拓客引擎:从市场调研,到成交前一步<span className="tag soon">内测</span>
          </h2>
          <p>
            不是又一个发邮件工具。是一个覆盖出海拓客全程的工作台——每一步都有 AI
            跑腿、给判断,再由你确认放行。
          </p>
        </Reveal>

        <Reveal>
          <div className="accordion">
            {ITEMS.map((item, i) => {
              const isOpen = i === open;
              return (
                <div
                  key={item.n}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  className={"acc-item" + (isOpen ? " open" : "")}
                >
                  <button
                    className="acc-head"
                    aria-expanded={isOpen}
                    onClick={() => handleOpen(i)}
                  >
                    <span className="acc-n">{item.n}</span>
                    <span className="acc-t">
                      <b>{item.title}</b>
                      <span className="acc-sub">{item.sub}</span>
                    </span>
                    <span className="acc-chev" aria-hidden="true" />
                  </button>
                  <div className="acc-body">
                    <div className="acc-inner">{item.body}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const ITEMS: AccItem[] = [
  {
    n: "01",
    title: "市场调研",
    sub: "锁定市场后,自动下钻到该打的区域和渠道",
    body: (
      <>
        <div className="pane-head">
          <div className="l">
            <div className="k">STEP 01 / RESEARCH_MARKET</div>
            <h3>三个候选市场,已排好序</h3>
          </div>
          <div className="r">
            <span className="confirm-pill">
              <span className="d" />待你确认首打市场
            </span>
            <br />
            <span style={{ opacity: 0.7 }}>Lumo S9 扫地机器人 · 代理</span>
          </div>
        </div>
        <div className="mkt-grid">
          <div className="mkt-cards">
            <div className="mkt-card pick">
              <div className="top">
                <div className="co">
                  <span className="fg">DE</span>
                  <span className="cn">德国</span>
                </div>
                <div className="score">
                  <span className="bar">
                    <i style={{ width: "87%" }} />
                  </span>
                  <span className="pct">87</span>
                </div>
              </div>
              <div className="tags">
                <span className="mt">成熟零售渠道</span>
                <span className="mt">CR5 62% 集中</span>
                <span className="mt">半价档真空</span>
              </div>
            </div>
            <div className="mkt-card">
              <div className="top">
                <div className="co">
                  <span className="fg">FR</span>
                  <span className="cn">法国</span>
                </div>
                <div className="score">
                  <span className="bar">
                    <i style={{ width: "73%" }} />
                  </span>
                  <span className="pct">73</span>
                </div>
              </div>
              <div className="tags">
                <span className="mt">渠道分散</span>
                <span className="mt">分销为主</span>
              </div>
            </div>
            <div className="mkt-card">
              <div className="top">
                <div className="co">
                  <span className="fg">ND</span>
                  <span className="cn">北欧</span>
                </div>
                <div className="score">
                  <span className="bar">
                    <i style={{ width: "69%" }} />
                  </span>
                  <span className="pct">69</span>
                </div>
              </div>
              <div className="tags">
                <span className="mt">客单价高</span>
                <span className="mt">决策周期长</span>
              </div>
            </div>
          </div>
          <div className="mkt-detail">
            <div className="dh">德国 · 深度报告(节选)</div>
            <div className="kpi-grid">
              <div className="kpi">
                <div className="v">€1.9B</div>
                <div className="k">市场规模</div>
              </div>
              <div className="kpi">
                <div className="v">
                  +11.2<sup>%</sup>
                </div>
                <div className="k">智能品类年增速</div>
              </div>
              <div className="kpi">
                <div className="v">
                  34<sup>%</sup>
                </div>
                <div className="k">智能渗透率</div>
              </div>
              <div className="kpi">
                <div className="v">
                  CR5 62<sup>%</sup>
                </div>
                <div className="k">零售集中度</div>
              </div>
            </div>
            <div className="sig-block">
              <div className="sh">买家信号 · 原文摘录</div>
              <div className="sig-item">
                <div className="m">
                  <span>MediaHaus 供应商公告</span>
                  <span>2026-06</span>
                </div>
                <div className="q">
                  秋季档扫地机器人品类扩充,公开招募供应商,预算 €2.4M。
                </div>
              </div>
              <div className="sig-item">
                <div className="m">
                  <span>r/homeautomation</span>
                  <span>近 30 天</span>
                </div>
                <div className="q">
                  多个高赞帖抱怨 CleanMax 涨价后性价比崩塌,求半价替代。
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    ),
  },
  {
    n: "02",
    title: "构建 ICP",
    sub: "把市场拆成具体买家群体,算清规模与决策链",
    body: (
      <>
        <div className="pane-head">
          <div className="l">
            <div className="k">STEP 02 / BUILD_ICP</div>
            <h3>德国市场,拆成两个买家群体</h3>
          </div>
          <div className="r">
            <span className="confirm-pill">
              <span className="d" />待你选定主攻群体
            </span>
            <br />
            <span style={{ opacity: 0.7 }}>依据 产品定位 + 公开采购信号</span>
          </div>
        </div>
        <div className="icp-grid">
          <div className="icp-card">
            <div className="ih">
              <div className="badge">群体 ① · 主力</div>
              <div className="role">零售连锁 · 品类采购总监</div>
            </div>
            <div className="ib">
              <div className="icp-row">
                <span className="k">预估规模</span>
                <span className="icp-count">~1,800</span>
              </div>
              <div className="icp-row">
                <span className="k">价值主张</span>
                <span className="v">经济效益 · 半价对标</span>
              </div>
              <div className="icp-row">
                <span className="k">决策链</span>
                <span className="v mono">采购总监 → 品类 VP</span>
              </div>
              <div className="icp-row">
                <span className="k">触达难度</span>
                <span className="v">中 · 需集采背书</span>
              </div>
            </div>
          </div>
          <div className="icp-card">
            <div className="ih">
              <div className="badge">群体 ② · 补充</div>
              <div className="role">独立家电经销商 · 负责人</div>
            </div>
            <div className="ib">
              <div className="icp-row">
                <span className="k">预估规模</span>
                <span className="icp-count">~3,200</span>
              </div>
              <div className="icp-row">
                <span className="k">价值主张</span>
                <span className="v">竞争优势 · 差异化货源</span>
              </div>
              <div className="icp-row">
                <span className="k">决策链</span>
                <span className="v mono">负责人单点决策</span>
              </div>
              <div className="icp-row">
                <span className="k">触达难度</span>
                <span className="v">低 · 转化快</span>
              </div>
            </div>
          </div>
        </div>
        <div className="icp-basis">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 1v14M1 8h14" />
          </svg>
          依据:产品定位 + 公开采购信号 · 置信度 中 · 群体可在工作台内继续精调
        </div>
      </>
    ),
  },
  {
    n: "03",
    title: "查找联系人",
    sub: "扒出决策人、校验邮箱,给你能直接发的名单",
    body: (
      <>
        <div className="pane-head">
          <div className="l">
            <div className="k">STEP 03 / FIND_CONTACTS</div>
            <h3>决策人 + 可送达邮箱,已校验</h3>
          </div>
          <div className="r">
            从公开源提取 · 逐个去重
            <br />
            <span style={{ opacity: 0.7 }}>邮箱 SMTP 校验通过</span>
          </div>
        </div>
        <div className="simp">
          <div className="simp-copy">
            <div className="big">
              不给你一张<em>过时的名单</em>。
            </div>
            <p>
              从领英、公司官网、行业名录提取群体①里的真实决策人,自动去重、补全职位、校验邮箱可送达性——你拿到的每一条,都能直接发信。
            </p>
            <ul className="feat">
              <li>决策人姓名 + 职位 + 部门</li>
              <li>邮箱经 SMTP 校验,过滤失效地址</li>
              <li>标注信息来源与更新时间</li>
            </ul>
          </div>
          <div className="contact-list">
            <div className="ct-h">
              <span>决策人</span>
              <span>邮箱</span>
              <span>校验</span>
            </div>
            <div className="ct-r">
              <span>
                <span className="who">S. Brandt</span>
                <br />
                <span className="role">采购经理 · MediaHaus</span>
              </span>
              <span className="em">s.brandt@…</span>
              <span className="ct-check">✓ 通过</span>
            </div>
            <div className="ct-r">
              <span>
                <span className="who">K. Fischer</span>
                <br />
                <span className="role">品类 VP · Expert SE</span>
              </span>
              <span className="em">k.fischer@…</span>
              <span className="ct-check">✓ 通过</span>
            </div>
            <div className="ct-r">
              <span>
                <span className="who">T. Hoffmann</span>
                <br />
                <span className="role">采购总监 · EP:Group</span>
              </span>
              <span className="em">t.hoffmann@…</span>
              <span className="ct-check">✓ 通过</span>
            </div>
            <div className="ct-r">
              <span>
                <span className="who">A. Richter</span>
                <br />
                <span className="role">品类采购 · Expert 区域</span>
              </span>
              <span className="em">a.richter@…</span>
              <span className="ct-check">✓ 通过</span>
            </div>
          </div>
        </div>
      </>
    ),
  },
  {
    n: "04",
    title: "撰写序列",
    sub: "每个客户一封专属英文开发信,引用它的采购信号",
    body: (
      <>
        <div className="pane-head">
          <div className="l">
            <div className="k">STEP 04 / DRAFT_SEQUENCE</div>
            <h3>每个客户,一封专属的信</h3>
          </div>
          <div className="r">
            首封 + 3 轮跟进
            <br />
            <span style={{ opacity: 0.7 }}>基于该客户采购信号生成</span>
          </div>
        </div>
        <div className="simp">
          <div className="simp-copy">
            <div className="big">
              不是模板<em>群发一万人</em>。
            </div>
            <p>
              每个目标客户由独立的 Agent
              跟进。它读过这家公司的采购信号,首封信就直击对方当下的痛点——而不是千篇一律的自我介绍。
            </p>
            <ul className="feat">
              <li>逐客户定制,不是变量替换</li>
              <li>首封信引用该客户的真实采购信号</li>
              <li>3 轮跟进节奏按决策周期自动编排</li>
            </ul>
          </div>
          <div className="mailc">
            <div className="to">TO: S. BRANDT · Buyer · MEDIAHAUS (NRW)</div>
            <div className="ln">Dear Ms. Brandt,</div>
            <div className="ln">
              Saw MediaHaus is{" "}
              <span className="ev">sourcing robot vacuums for the fall lineup</span> —
              and with CleanMax&apos;s recent price hike leaving the mid-tier wide open,
            </div>
            <div className="ln">
              we hold stock in a German warehouse and ship in{" "}
              <span className="ev">12 days</span>, positioned right at the half-price mark…
            </div>
            <div className="basis">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 1l2 5h5l-4 3 1.5 5L8 11 3.5 14 5 9 1 6h5z" />
              </svg>
              依据:MediaHaus 招募公告 + 论坛信号 · 置信度 ▮▮▯
            </div>
          </div>
        </div>
      </>
    ),
  },
  {
    n: "05",
    title: "排期发送",
    sub: "按对方时区在工作时间投递,域名预热限流",
    body: (
      <>
        <div className="pane-head">
          <div className="l">
            <div className="k">STEP 05 / SCHEDULE_SEND</div>
            <h3>在对方的早上九点,准时抵达</h3>
          </div>
          <div className="r">
            按时区排期 · 限流投递
            <br />
            <span style={{ opacity: 0.7 }}>发信信誉度托管</span>
          </div>
        </div>
        <div className="simp">
          <div className="simp-copy">
            <div className="big">
              一封都不在<em>半夜打扰</em>。
            </div>
            <p>
              按对方所在时区排期,工作时间投递;新域名自动预热、限流发送,保护你的发信信誉度不被标记为垃圾邮件。
            </p>
            <ul className="feat">
              <li>对方本地工作时间送达</li>
              <li>域名预热曲线,规避拉黑风险</li>
              <li>首封与跟进按最优间隔编排</li>
            </ul>
          </div>
          <div className="tl-wrap">
            <div className="tl-tz">
              <span>CET · 柏林时间</span>
              <span>MON — FRI</span>
            </div>
            <div className="tl-line">
              <span className="tl-tick sent up" style={{ left: "13%" }} />
              <span className="tl-env up" style={{ left: "13%" }}>
                首封 · 周一 09:00
              </span>
              <span className="tl-tick sent down" style={{ left: "50%" }} />
              <span className="tl-env down" style={{ left: "50%" }}>
                跟进 · 周三 09:30
              </span>
              <span className="tl-tick up" style={{ left: "87%" }} />
              <span className="tl-env up end" style={{ left: "87%" }}>
                再跟进 · 周五 10:00
              </span>
            </div>
            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <div style={{ fontFamily: "var(--serif)", fontWeight: 700, fontSize: "28px" }}>
                216{" "}
                <span style={{ fontFamily: "var(--mono)", fontSize: "12px", color: "var(--ink-3)", fontWeight: 400 }}>
                  封已投递 · 本周
                </span>
              </div>
            </div>
          </div>
        </div>
      </>
    ),
  },
  {
    n: "06",
    title: "回复处理",
    sub: "回信自动分级收进收件箱,高意向置顶提醒",
    body: (
      <>
        <div className="pane-head">
          <div className="l">
            <div className="k">STEP 06 / HANDLE_REPLY</div>
            <h3>收件箱自动分级,高意向置顶</h3>
          </div>
          <div className="r">
            回信自动意向分级
            <br />
            <span style={{ opacity: 0.7 }}>该你出场时才提醒</span>
          </div>
        </div>
        <div className="simp">
          <div className="simp-copy">
            <div className="big">
              你只需要处理<em>真正重要的那几封</em>。
            </div>
            <p>
              所有回信自动分级并收进统一收件箱:高意向置顶提醒,礼貌拒绝的存档,自动回复的过滤。你的时间只花在快成的单子上。
            </p>
            <ul className="feat">
              <li>意向分级:高 / 待跟进 / 无效</li>
              <li>高意向置顶,并提醒你接手</li>
              <li>跟进型自动排入下一轮节奏</li>
            </ul>
          </div>
          <div>
            <div className="inbox">
              <div className="ib-r">
                <span className="av">SB</span>
                <span className="tx">
                  <span className="frm">S. Brandt · MediaHaus</span>
                  <span className="pv">Interesting. Send your catalog &amp; MOQ?</span>
                </span>
                <span className="ib-tag hot">高意向</span>
              </div>
              <div className="ib-r">
                <span className="av">LS</span>
                <span className="tx">
                  <span className="frm">L. Sørensen · Nordic Home</span>
                  <span className="pv">Not this quarter, reach out in Sept.</span>
                </span>
                <span className="ib-tag mid">跟进 9 月</span>
              </div>
              <div className="ib-r">
                <span className="av">AR</span>
                <span className="tx">
                  <span className="frm">Auto-reply · Carrefour</span>
                  <span className="pv">Out of office until Monday…</span>
                </span>
                <span className="ib-tag low">自动回复</span>
              </div>
            </div>
            <div className="wx">✓ 1 封高意向已置顶收件箱 · 等你接手</div>
          </div>
        </div>
      </>
    ),
  },
];
