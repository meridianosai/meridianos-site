import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  FileText,
  ListChecks,
  PenLine,
  Radar,
  RotateCcw,
  Users,
} from "lucide-react";
import { AccountDemo, FollowButton, OpenRecordButton, type Anchor } from "./account-demo";
import { ALEX, LOTUS, PRODUCTS, shortDate, type DemoContact, type DemoSignal } from "./demo-data";
import { ActivityGroup, AgentMsg, AskUser, SourceButton, UserMsg } from "./product-ui";
import { Reveal } from "./reveal";
import { StepKicker } from "./step-kicker";

const COMPANY_ANCHORS: Anchor[] = [
  ["co-sum", "概况"],
  ["co-ppl", "联系人", LOTUS.contacts.length],
  ["co-sig", "信号", LOTUS.signals.length],
  ["co-draft", "联系草稿"],
  ["co-prog", "推进"],
  ["co-task", "任务"],
];
const PERSON_ANCHORS: Anchor[] = [
  ["pe-sum", "概况"],
  ["pe-org", "所属公司"],
  ["pe-exp", "经历"],
  ["pe-sig", "信号", ALEX.signals.length],
];

/**
 * 3 找到目标客户：文案、图例、公司页与人的页面都在服务端渲染；
 * 切标签、锚点、关注、「我的业务」的就地修改在客户端的 AccountDemo 里。
 */
export function AccountSection() {
  return (
    <section className="sec acc" id="account">
      <div className="wrap">
        <div className="acc-top">
          <Reveal>
            <StepKicker icon={Users} step={3}>
              找到目标客户
            </StepKicker>
            <div className="sec-h">
              <h2>
                这家公司
                <br />
                最近在做什么，
                <br />
                该找谁谈？
              </h2>
              <p>这家公司最近的动静和该找的人，一页看全。顺着点进联系人，还能知道对方现在管什么、以前在哪做过。</p>
            </div>
          </Reveal>
          <Reveal as="ul" className="legend k">
            <li>
              <span className="lg-k d">
                <Radar className="i" />
                {LOTUS.signals[0].date} · 示例动态
              </span>
              <span>是不是新鲜事</span>
            </li>
            <li>
              <span className="lg-k t">{LOTUS.signals[0].title}</span>
              <span>它在忙什么</span>
            </li>
            <li>
              <span className="lg-k r">与你的关联</span>
              <span>为什么跟你有关</span>
            </li>
            <li>
              <span className="lg-k n">下一步确认</span>
              <span>开口前先问这句</span>
            </li>
            <li>
              <span className="lg-k b">
                <BookOpen className="i" />
                来源
              </span>
              <span>不信就点开原文</span>
            </li>
          </Reveal>
        </div>
      </div>
      <div className="wrap-wide">
        <Reveal>
          <AccountDemo
            company={{ head: <CompanyHead />, body: <CompanyBody />, anchors: COMPANY_ANCHORS }}
            person={{ head: <PersonHead />, body: <PersonBody />, anchors: PERSON_ANCHORS }}
            agent={{ log: <AgentLog />, suggestions: ["核对合作条件", "看看联系人", "起草联系开场"] }}
          />
          <p className="frame-cap">示例 · 公司、人物和动态都是虚构的，随手点点看。</p>
        </Reveal>
      </div>
    </section>
  );
}

/** 右侧 Agent：接着「发现合适市场」最后一层往下，带着上一层的结尾 */
function AgentLog() {
  return (
    <div className="k-log">
      <ActivityGroup state="complete" summary="胡志明市 · 调用了 3 个工具" />
      <AgentMsg>胡志明市的 3 家候选公司已整理。</AgentMsg>
      <AskUser question="胡志明市，先了解哪家公司？" answer={LOTUS.name} />
      <UserMsg>先看{LOTUS.name}</UserMsg>
      <ActivityGroup state="complete" summary={`${LOTUS.name} · 调用了 3 个工具`} />
      <AgentMsg>
        {LOTUS.name}：2 条示例信号、2 位示例联系人已整理。{LOTUS.check}
      </AgentMsg>
    </div>
  );
}

function CompanyHead() {
  return (
    <>
      <div className="rec-h">
        <span className="back">
          <ArrowLeft className="i" />
        </span>
        <div>
          <h4>{LOTUS.name}</h4>
          <span className="mi mu">示例</span>
        </div>
        <div className="rec-nav">
          <ChevronDown className="i" />
          <span className="ibtn">
            <ChevronLeft className="i" />
          </span>
          <span>1/3</span>
          <span className="ibtn">
            <ChevronRight className="i" />
          </span>
          <FollowButton />
        </div>
      </div>
      <div className="rec-id">
        <span className="rec-mono">{LOTUS.initials}</span>
        <div>
          <span className="mi mu">
            {LOTUS.kind} · {LOTUS.place}
          </span>
          <span className="chip">待评估</span>
        </div>
        <SourceButton />
      </div>
    </>
  );
}

const COMPARE: [item: string, need: string, mine: string, mark: string, ok: boolean][] = [
  ["产品", LOTUS.demand.use, `A6 · ${PRODUCTS.A6.specs}`, "可对照", true],
  ["首单", LOTUS.demand.firstOrder, `${PRODUCTS.A6.moq} 件起订`, "数量可对照", true],
  ["包装", LOTUS.demand.packaging, "支持 OEM / ODM；具体包装待确认", "待确认", false],
  ["交付", LOTUS.demand.delivery, "材料未给出交期与打样耗时", "待确认", false],
  ["报价", "目标采购价尚未提供", `FOB ${PRODUCTS.A6.price}`, "待确认", false],
];

const [ALEX_FIRST] = ALEX.name.split(" ");
const DRAFT = `Hi ${ALEX_FIRST},

I’m reaching out from Shenggu Acoustics about a potential collaboration with ${LOTUS.name}. We develop wireless audio products with OEM / ODM support.

Our A6 true wireless earbuds may be relevant to your range. Would an initial order of 2,000 units for one model and color fit your launch plan?

I can share product specifications and a sample proposal once we understand your requirements.

Best regards,
Shenggu Acoustics`;

function CompanyBody() {
  return (
    <>
      <section className="rec-sec" id="co-sum">
        <h5>概况</h5>
        <p className="lead">{LOTUS.summary}</p>
        <div className="k-fit">
          <div className="k-fit-top">
            <div>
              <span className="mi">{LOTUS.fitLabel}</span>
              <b>{LOTUS.check}</b>
            </div>
            <SourceButton />
          </div>
          <div className="k-fit-acts">
            <span>
              <Users className="i" />看 {LOTUS.contacts.length} 位联系人
            </span>
            <span>
              <PenLine className="i" />
              准备联系
            </span>
            <span>
              <ListChecks className="i" />
              更新推进
            </span>
          </div>
        </div>
        <h5 className="sub-h">需求与供货对照</h5>
        <table className="cmpt">
          <thead>
            <tr>
              <th>项目</th>
              <th>示例需求</th>
              <th>你的材料</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {COMPARE.map(([item, need, mine, mark, ok]) => (
              <tr key={item}>
                <td>{item}</td>
                <td>{need}</td>
                <td>
                  {mine}
                  <span className={`m${ok ? "" : " q"}`}>
                    {ok ? <FileText className="i" /> : <CircleHelp className="i" />}
                    {mark}
                  </span>
                </td>
                <td>
                  <SourceButton />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="rec-sec" id="co-ppl">
        <h5>
          联系人<small>{LOTUS.contacts.length}</small>
        </h5>
        <div className="ppl">
          {LOTUS.contacts.map((c, i) =>
            i === 0 ? (
              <OpenRecordButton key={c.name} to="pe" className="ppl-c">
                <PersonCardBody contact={c} />
              </OpenRecordButton>
            ) : (
              // 示例只做了第一位联系人的页面
              <div key={c.name} className="ppl-c static">
                <PersonCardBody contact={c} />
              </div>
            ),
          )}
        </div>
      </section>
      <section className="rec-sec" id="co-sig">
        <h5>
          信号<small>{LOTUS.signals.length}</small>
        </h5>
        {LOTUS.signals.map((s) => (
          <SignalCard key={s.title} signal={s} kind="示例动态" progress />
        ))}
      </section>
      <section className="rec-sec" id="co-draft">
        <h5>联系草稿</h5>
        <div className="draft-note">
          <span>{LOTUS.check}</span>
          <SourceButton />
        </div>
        <div className="draft-h">
          <b>给 {ALEX.name} 的草稿</b>
          <span>
            <Check className="i" />
            未编辑
          </span>
        </div>
        <div className="draft-b">{DRAFT}</div>
        <p className="draft-f">示例草稿 · 未发送</p>
      </section>
      <section className="rec-sec" id="co-prog">
        <h5>推进</h5>
        <div className="form-k">
          <FakeField label="对象" value={`公司 · ${LOTUS.name}`} />
          <div className="row">
            <FakeField label="跟进状态" value="待评估" />
            <FakeField label="优先级" value="普通" />
          </div>
          <div className="fk-l">
            下一步行动
            <span className="fk ta">寄两套 A6 样品，附 2,000 件单色报价</span>
          </div>
        </div>
      </section>
      <section className="rec-sec last" id="co-task">
        <h5>任务</h5>
        <TaskRow label="近期信号" value={`${shortDate(LOTUS.signals[0].date)} ${LOTUS.signals[0].title}`} />
        <TaskRow label="采购决策人" value={`${ALEX.name} · ${ALEX.role}`} />
      </section>
    </>
  );
}

function FakeField({ label, value }: { label: string; value: string }) {
  return (
    <div className="fk-l">
      {label}
      <span className="fk">
        {value}
        <ChevronDown className="i" />
      </span>
    </div>
  );
}

/** 按钮里只能放行内内容：职责那一行用 span，不用 p */
function PersonCardBody({ contact }: { contact: DemoContact }) {
  return (
    <>
      <span className="ppl-av">{contact.initials}</span>
      <b>{contact.name}</b>
      <ArrowUpRight className="i" />
      <span className="mi">{contact.role}</span>
      <span className="duty">{contact.duty}</span>
      <span className="chip">待评估</span>
    </>
  );
}

function SignalCard({ signal, kind, progress }: { signal: DemoSignal; kind: string; progress?: boolean }) {
  return (
    <article className="sig">
      <div className="sig-d">
        <Radar className="i" />
        {signal.date} · {kind}
        <SourceButton />
      </div>
      <h6>{signal.title}</h6>
      <p className="obs mu">{signal.observation}</p>
      <div className="rel">
        <span className="lb">与你的关联</span>
        {signal.relevance}
        {signal.next ? (
          <>
            <span className="lb n">下一步确认</span>
            {signal.next}
          </>
        ) : null}
      </div>
      {progress ? (
        <div className="ft">
          <span className="chip">待评估</span>
          <span className="go">
            <ListChecks className="i" />
            推进
          </span>
        </div>
      ) : null}
    </article>
  );
}

function TaskRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="task-r">
      <div>
        <span className="mi">{label}</span>
        <b>{value}</b>
      </div>
      <SourceButton />
      <span className="ibtn">
        <RotateCcw className="i" />
      </span>
    </div>
  );
}

function PersonHead() {
  return (
    <>
      <div className="rec-h">
        <div>
          <h4>{ALEX.name}</h4>
          <span className="mi mu">示例</span>
        </div>
      </div>
      <div className="rec-id">
        <span className="rec-mono p">{ALEX.initials}</span>
        <div>
          <span className="mi mu">
            {ALEX.role} · <span className="lk">{LOTUS.name}</span>
          </span>
          <span className="chip">待评估</span>
        </div>
        <SourceButton />
      </div>
    </>
  );
}

function PersonBody() {
  return (
    <>
      <section className="rec-sec" id="pe-sum">
        <h5>概况</h5>
        <p className="lead">{ALEX.duty}</p>
        <div className="k-fit muted">
          <span className="mi">可以先问</span>
          <p>{ALEX.ask}</p>
        </div>
      </section>
      <section className="rec-sec" id="pe-org">
        <h5>所属公司</h5>
        <OpenRecordButton to="co" className="org-c">
          <span className="rec-mono">{LOTUS.initials}</span>
          <b>{LOTUS.name}</b>
          <ArrowUpRight className="i" />
          <span className="mi mu">
            {LOTUS.kind} · {ALEX.since} – 至今
          </span>
          <span className="duty">{LOTUS.summary}</span>
          <span className="mi ok">{LOTUS.fitLabel}</span>
        </OpenRecordButton>
      </section>
      <section className="rec-sec" id="pe-exp">
        <h5>经历</h5>
        <ol className="exp">
          {ALEX.experience.map(([title, where]) => (
            <li key={title}>
              <b>
                <Briefcase className="i" />
                {title}
              </b>
              <span className="mi">{where}</span>
            </li>
          ))}
        </ol>
      </section>
      <section className="rec-sec last" id="pe-sig">
        <h5>
          信号<small>{ALEX.signals.length}</small>
        </h5>
        {ALEX.signals.map((s) => (
          <SignalCard key={s.title} signal={s} kind="个人动态" />
        ))}
      </section>
    </>
  );
}
