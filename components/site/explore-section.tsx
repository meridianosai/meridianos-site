import { ArrowLeft, ArrowUpRight, BookOpen, CircleHelp, Earth, FileText, MapPin, Package, Radar, TriangleAlert, Users } from "lucide-react";
import { LOTUS, MEKONG, PRODUCTS } from "./demo-data";
import { ExploreStage } from "./explore-stage";
import { ActivityGroup, ActivityRow, AgentMsg, AskUser, SourceButton, UserMsg, type AskOption } from "./product-ui";
import { Reveal } from "./reveal";
import { StepKicker } from "./step-kicker";

const NAMES = ["全球", "东南亚", "越南", "胡志明市"];

const CAPTIONS: [string, string][] = [
  ["先选区域。", "越南有出货记录，德国有相关材料，美国在业务介绍里提过，所以先推荐这三个方向，每个都附了理由。"],
  ["再选国家。", "先找哪类买家、带哪款产品去谈，每个国家都给了建议。出过货的市场，一眼就能认出来。"],
  ["到了城市，对照你的产品。", "每家公司都拿你的型号和起订量对照过；量对不上的，联系之前就会提醒你。"],
  ["最后是一家公司。", "它最近可能在买什么、开口前该先问哪一句，都替你准备好了。"],
];

// 每一层 Agent 末尾的提问（ask_user），下一层开头折成「问题 → 选择」
const ASKS: { q: string; options: AskOption[] }[] = [
  {
    q: "先从哪个区域找买家？",
    options: [
      ["东南亚", "从资料提及的越南足迹出发，先看周边进口商与分销渠道。 · 3 个国家"],
      ["西欧", "已有德国相关材料，可先围绕耳机品牌和音频产品渠道验证需求。 · 3 个国家"],
    ],
  },
  {
    q: "东南亚，想先看哪个国家？",
    options: [
      ["越南", "2 座城市 · 6 家公司"],
      ["泰国", "1 座城市 · 3 家公司"],
      ["印度尼西亚", "1 座城市 · 3 家公司"],
    ],
  },
  {
    q: "越南，先看哪座城市？",
    options: [
      ["胡志明市", "消费电子分销 · 3 家公司"],
      ["河内", "零售与进口渠道 · 3 家公司"],
    ],
  },
  {
    q: "胡志明市，先了解哪家公司？",
    options: [
      [LOTUS.name, `${LOTUS.kind} · 2 条信号 · 2 位联系人`],
      [MEKONG.name, `${MEKONG.kind} · 2 条信号 · 2 位联系人`],
    ],
  },
];

/**
 * 2 发现合适市场：文案、各层视图、Agent 的每段对话都在服务端渲染好，
 * 交给客户端的 ExploreStage 按滚动切换并驱动地球。
 */
export function ExploreSection() {
  return (
    <section className="ex" id="explore" aria-label="发现合适市场">
      <div className="wrap ex-intro">
        <Reveal>
          <StepKicker icon={Earth} step={2}>
            发现合适市场
          </StepKicker>
          <div className="sec-h">
            <h2>从区域一路找到具体的公司。</h2>
            <p>每往下一层，它都会说清为什么推荐这里。想继续往下，点一下或回它一句都行。</p>
          </div>
        </Reveal>
      </div>
      <ExploreStage
        names={NAMES}
        captions={CAPTIONS}
        suggestions={[
          ["比较推荐区域", "适合哪些买家", "整理成报告"],
          ["比较国家方向", "为什么推荐这里", "整理成报告"],
          ["适合哪些买家", "先看哪些城市", "整理成报告"],
          ["比较候选公司", "采购规模", "整理成报告"],
        ]}
        views={[<WorldView key="world" />, <RegionView key="region" />, <CountryView key="country" />, <CityView key="city" />]}
        logs={[<WorldLog key="world" />, <RegionLog key="region" />, <CountryLog key="country" />, <CityLog key="city" />]}
      />
    </section>
  );
}

function ViewTitle({ title, back }: { title: string; back?: boolean }) {
  return (
    <div className="k-vt">
      {back ? (
        <span className="back">
          <ArrowLeft className="i" />
        </span>
      ) : null}
      <div>
        <h4>{title}</h4>
        <span className="mi mu">示例</span>
      </div>
    </div>
  );
}

const REGIONS = [
  ["东南亚", "从资料提及的越南足迹出发，先看周边进口商与分销渠道。"],
  ["西欧", "已有德国相关材料，可先围绕耳机品牌和音频产品渠道验证需求。"],
  ["北美", "资料提及美国业务，可先验证采购型客户，再按具体产品核对准入要求。"],
] as const;

function WorldView() {
  return (
    <>
      <ViewTitle title="探索市场" />
      <p className="k-q">先从哪个区域找买家？</p>
      {REGIONS.map(([name, reason]) => (
        <article key={name} className="kcard k-rc">
          <div className="k-rc-h">
            <MapPin className="i" />
            {name}
            <SourceButton />
          </div>
          <p>{reason}</p>
          <span className="go">
            查看 3 个国家
            <ArrowUpRight className="i" />
          </span>
        </article>
      ))}
    </>
  );
}

const COUNTRIES = [
  { flag: "🇻🇳", name: "越南", status: "有出口记录", angle: "从已有出货经历验证补货合作", buyers: "进口商与分销商", supply: [PRODUCTS.A6, PRODUCTS.S3], check: "渠道试单与起订量", foot: "胡志明市 · 河内 · 6 家公司", cities: 2 },
  { flag: "🇹🇭", name: "泰国", status: "待验证方向", angle: "用通勤与便携组合验证选品", buyers: "品牌采购与零售渠道", supply: [PRODUCTS.A6, PRODUCTS.H2], check: "品牌包装与样品评审", foot: "曼谷 · 3 家公司", cities: 1 },
  { flag: "🇮🇩", name: "印度尼西亚", status: "待验证方向", angle: "先对照首单规模和渠道补货方式", buyers: "电商供货与分销渠道", supply: [PRODUCTS.A6, PRODUCTS.S3], check: "混装与分批交付", foot: "雅加达 · 3 家公司", cities: 1 },
];

function RegionView() {
  return (
    <>
      <ViewTitle title="东南亚" back />
      <p className="k-q sm">东南亚 · 选择切入市场</p>
      {COUNTRIES.map((c, i) => (
        <article key={c.name} className="kcard k-cc">
          <div className="k-cc-h">
            <span className="k-flag">{c.flag}</span>
            <b>{c.name}</b>
            <span className={`k-st${i === 0 ? " ok" : ""}`}>{c.status}</span>
            <SourceButton />
          </div>
          <h5>{c.angle}</h5>
          <dl className="k-kv">
            <dt>优先验证</dt>
            <dd>{c.buyers}</dd>
            <dt>供货切入</dt>
            <dd>
              {c.supply.map((p) => p.id).join(" / ")} · {c.supply.map((p) => p.name).join("、")}
            </dd>
            <dt>先确认</dt>
            <dd className="warn">{c.check}</dd>
          </dl>
          <div className="k-cc-f">
            <span>{c.foot}</span>
            <span className="go">
              查看 {c.cities} 座城市
              <ArrowUpRight className="i" />
            </span>
          </div>
        </article>
      ))}
    </>
  );
}

function CountryView() {
  return (
    <>
      <ViewTitle title="越南" back />
      <article className="kcard k-buyer">
        <span className="mi">优先验证的买家</span>
        <b>进口商与分销商</b>
        <p>材料提及越南出口经历，可先整理对应交付案例。</p>
        <SourceButton />
      </article>
      <article className="kcard k-sup">
        <div className="k-sup-h">
          <Package className="i" />
          供货切入
          <SourceButton />
        </div>
        {[PRODUCTS.A6, PRODUCTS.S3].map((p) => (
          <div key={p.id} className="k-prod">
            <div>
              <b>
                {p.id} · {p.name}
              </b>
              <span className="mi">{p.specs}</span>
            </div>
            <div className="r">
              <b>{p.price}</b> <span className="mi inl">FOB</span>
              <span className="mi">{p.moq} 件起订</span>
            </div>
          </div>
        ))}
        <p className="k-askq">
          <CircleHelp className="i" />
          客户希望先小批量试销，还是能接受整批采购？
        </p>
      </article>
      <p className="k-q sm">越南 · 2 座城市</p>
      <CityCard name="胡志明市" angle="消费电子分销" example={`${LOTUS.name} 等`} />
      <CityCard name="河内" angle="零售与进口渠道" example="Red River Audio 等" />
    </>
  );
}

function CityCard({ name, angle, example }: { name: string; angle: string; example: string }) {
  return (
    <article className="kcard k-city">
      <MapPin className="i" />
      <div>
        <b>{name}</b>
        <span className="a">{angle}</span>
        <span className="e">{example}</span>
      </div>
      <span className="k-gb">3 家公司</span>
      <span className="ibtn lk">
        <ArrowUpRight className="i" />
      </span>
      <SourceButton />
    </article>
  );
}

const CANDIDATES = [
  {
    n: 1,
    name: LOTUS.name,
    kind: `${LOTUS.kind} · ${LOTUS.contacts[0].role}`,
    buy: LOTUS.demand.use,
    buyNote: `拟试单 ${LOTUS.demand.firstOrder} · A6 起订 ${PRODUCTS.A6.moq} 件`,
    lead: LOTUS.signals[0].title,
    date: LOTUS.signals[0].date,
    check: LOTUS.check,
    warn: false,
  },
  {
    n: 2,
    name: MEKONG.name,
    kind: `${MEKONG.kind} · ${MEKONG.contact.role}`,
    buy: MEKONG.demand.use,
    buyNote: `拟试单 ${MEKONG.demand.firstOrder} · S3 起订 ${PRODUCTS.S3.moq} 件`,
    lead: MEKONG.signal.title,
    date: MEKONG.signal.date,
    check: MEKONG.check,
    warn: true,
  },
];

function CityView() {
  return (
    <>
      <ViewTitle title="胡志明市" back />
      <p className="k-q sm">
        <span>胡志明市 · 候选公司</span>
        <span className="mi mu k-q-aside">
          3 家示例
          <BookOpen className="i" />
        </span>
      </p>
      {CANDIDATES.map((c) => (
        <article key={c.name} className="kcard k-co">
          <div className="k-co-h">
            <span className="k-num">{c.n}</span>
            <div>
              <b>{c.name}</b>
              <span className="mi">{c.kind}</span>
              <span className="chip">待评估</span>
            </div>
            <SourceButton />
          </div>
          <div className="k-co-sub">
            <div className="buy">
              <span className="lb">示例采购方向</span>
              <b>{c.buy}</b>
              <span className="mi">{c.buyNote}</span>
            </div>
            <div className="lead">
              <span className="lb">
                <Radar className="i" />
                近期线索
              </span>
              <b>{c.lead}</b>
              <span className="mi">{c.date}</span>
            </div>
          </div>
          <p className={`k-co-q${c.warn ? " warn" : ""}`}>
            {c.warn ? <TriangleAlert className="i" /> : <FileText className="i" />}
            {c.check}
          </p>
          <div className="k-co-f">
            <span>
              <Radar className="i" />2 条信号
              <Users className="i" />2 位联系人
            </span>
            <span className="go">
              查看公司
              <ArrowUpRight className="i" />
            </span>
          </div>
        </article>
      ))}
    </>
  );
}

/* 右侧 Agent：每一层一段对话，照 web-next 的对话流：上一题折成「问题 → 选择」，工具调用折成一行，本层的提问接在末尾 */

function WorldLog() {
  return (
    <>
      <UserMsg>找海外买家</UserMsg>
      <AgentMsg source={false}>好，从区域开始找海外买家。</AgentMsg>
      <ActivityGroup state="complete" summary="全球 · 调用了 2 个工具" />
      <AgentMsg>3 个区域方向已整理，接下来在地球上逐步展开。</AgentMsg>
      <AskUser question={ASKS[0].q} options={ASKS[0].options} />
    </>
  );
}

function RegionLog() {
  return (
    <>
      <AskUser question={ASKS[0].q} answer="东南亚" />
      <UserMsg>先看东南亚</UserMsg>
      <ActivityGroup state="complete" summary="东南亚 · 调用了 2 个工具" />
      <AgentMsg>东南亚的 3 个国家方向已整理。</AgentMsg>
      <AskUser question={ASKS[1].q} options={ASKS[1].options} />
    </>
  );
}

function CountryLog() {
  return (
    <>
      <AskUser question={ASKS[1].q} answer="越南" />
      <UserMsg>先看越南</UserMsg>
      <ActivityGroup state="complete" summary="越南 · 调用了 3 个工具" open>
        <ActivityRow state="complete" title="读取资料线索" object="声谷电子 · 产品目录.pdf、声谷电子 · 产品报价.xlsx" />
        <ActivityRow state="complete" title="核对市场切入点" object="越南" />
        <ActivityRow state="complete" title="查找城市方向" object="越南" />
      </ActivityGroup>
      <AgentMsg>越南的 2 座城市方向已整理。</AgentMsg>
      <AskUser question={ASKS[2].q} options={ASKS[2].options} />
    </>
  );
}

function CityLog() {
  return (
    <>
      <AskUser question={ASKS[2].q} answer="胡志明市" />
      <UserMsg>先看胡志明市</UserMsg>
      <ActivityGroup state="complete" summary="胡志明市 · 调用了 3 个工具" />
      <AgentMsg>胡志明市的 3 家候选公司已整理。</AgentMsg>
      <AskUser question={ASKS[3].q} options={ASKS[3].options} />
    </>
  );
}
