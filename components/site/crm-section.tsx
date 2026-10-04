"use client";

import { useRef } from "react";
import {
  ArrowDown,
  Bookmark,
  Building2,
  Calendar,
  ChartColumn,
  ChevronDown,
  CircleDot,
  Columns3,
  Compass,
  Download,
  Flag,
  Funnel,
  LayoutGrid,
  ListChecks,
  Minimize2,
  Play,
  Radar,
  Search,
  Send,
  Sparkles,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { FleetMark, Tab, TAB_COLORS } from "./product-ui";
import { Reveal } from "./reveal";
import { StepKicker } from "./step-kicker";
import { usePlayback } from "./use-once-visible";

// 公司名、近期信号、采购决策人都来自 web-next 的示例客户表；「查询失败」也是它会出现的样子
const PROFILES = [
  ["09-18 准备扩充便携音频系列", "Alex Morgan · 产品采购负责人"],
  ["09-16 新增消费电子渠道合作岗位", "Jamie Chen · 品类经理"],
] as const;

interface Row {
  name: string;
  profile: 0 | 1;
  followed?: boolean;
  next?: string;
  date?: string;
  priority?: string;
  failed?: boolean;
}

const ROWS: Row[] = [
  { name: "Atelier Son", profile: 0 },
  { name: "Auralis Audio", profile: 0 },
  { name: "Harbor Sound", profile: 0 },
  { name: "Hudson Audio", profile: 0 },
  { name: "Lotus Sound", profile: 0, followed: true, next: "寄两套 A6 样品", date: "2026-10-08", priority: "高" },
  { name: "Luna Audio", profile: 0 },
  { name: "Maple Tone", profile: 0, failed: true },
  { name: "Nusa Sound", profile: 0 },
  { name: "Pacific Pulse", profile: 0 },
  { name: "Red River Audio", profile: 0 },
  { name: "Siam Pulse", profile: 0 },
  { name: "Archipelago Devices", profile: 1, failed: true },
  { name: "Centro Sound Supply", profile: 1 },
  { name: "Chao Audio Trade", profile: 1 },
  { name: "Delta Sound Supply", profile: 1 },
  { name: "Eastline Sound", profile: 1 },
];

type CellState = "idle" | "run" | "done";

// 「采购决策人」这一列挨行去查：每行先「查询中」，0.8 秒后出结果；最后列头进度条归零
type Ev = { at: number; cell: number; st: "run" | "done" } | { at: number; cell: -1; st: "end" };
const EVENTS: Ev[] = [
  ...ROWS.flatMap((_, i): Ev[] => [
    { at: 500 + i * 140, cell: i, st: "run" },
    { at: 1300 + i * 140, cell: i, st: "done" },
  ]),
  { at: 1300 + ROWS.length * 140 + 600, cell: -1, st: "end" } as const,
].sort((a, b) => a.at - b.at);
const TIMES = EVENTS.map((e) => e.at);

/** 4 准备联系与跟进：照 web-next 的客户工作区表格（crm-table），「采购决策人」任务列逐格查 */
export function CrmSection() {
  const frameRef = useRef<HTMLDivElement>(null);
  const { step } = usePlayback(frameRef, TIMES, 0.35);
  const cells: CellState[] = ROWS.map(() => "idle");
  let finished = 0;
  let ended = false;
  for (const e of EVENTS.slice(0, step)) {
    if (e.st === "end") ended = true;
    else {
      cells[e.cell] = e.st;
      if (e.st === "done") finished += 1;
    }
  }
  const progress = ended ? 0 : Math.round((finished / ROWS.length) * 100);

  return (
    <section className="sec crmx" id="crm">
      <div className="wrap">
        <div className="crm-top">
          <Reveal>
            <StepKicker icon={Send} step={4}>
              准备联系与跟进
            </StepKicker>
            <div className="sec-h">
              <h2>
                一线销售的一天，
                <br />
                从一张表开始。
              </h2>
              <p>卡片一层层下钻，表格看全局。一列就是一个任务：点列头的 ▶，「近期信号」「采购决策人」就挨家去查，查不到的格子老实写着查询失败。</p>
            </div>
          </Reveal>
          <Reveal as="ul" className="points flat">
            <li>
              <b>一家客户，一条记录</b>
              <span>关注、跟进状态、下一步、联系草稿都记在同一条记录上。卡片、表格、公司页，看到的都是它。</span>
            </li>
            <li>
              <b>交得出一封能发的信</b>
              <span>联系草稿从信号里取开场，从你的产品资料里取条件，要先问清的事写在信里。</span>
            </li>
          </Reveal>
        </div>
      </div>
      <div className="wrap-wide">
        <Reveal>
          <div ref={frameRef} className="k crm-frame" role="group" aria-label="示例：客户工作区表格逐行查找采购决策人">
            <div className="pane crm-pane">
              <div className="k-tabs crm-tabs">
                <Tab icon={Compass} color={TAB_COLORS.explore} on>
                  探索
                </Tab>
                <Tab icon={Building2} color={TAB_COLORS.company} closable>
                  Lotus Sound
                </Tab>
                <Tab icon={UserRound} color={TAB_COLORS.person} closable>
                  Alex Morgan
                </Tab>
                <span className="k-tools">
                  <span className="ibtn">
                    <LayoutGrid className="i" />
                  </span>
                  <span className="ibtn">
                    <Minimize2 className="i" />
                  </span>
                </span>
              </div>
              <div className="crm-ttl">
                <b>客户工作区</b>
                <span className="mi mu">示例</span>
              </div>
              <div className="crm-tb" aria-hidden="true">
                <span className="crm-b">
                  <Bookmark className="i" />
                  默认视图
                  <ChevronDown className="i sm" />
                </span>
                <span className="crm-b">
                  <Columns3 className="i" />
                  14/19 列
                </span>
                <span className="crm-b plain">36/36 行</span>
                <span className="crm-b">
                  <Funnel className="i" />
                  无筛选
                </span>
                <span className="crm-b">
                  <ArrowDown className="i" />
                  排序
                </span>
                <span className="crm-b">
                  不分组
                  <ChevronDown className="i sm" />
                </span>
                <span className="crm-b">
                  <ChartColumn className="i" />
                  洞察
                </span>
                <span className="crm-b search">
                  <Search className="i" />
                  搜索
                </span>
                <span className="crm-b right">
                  <Download className="i" />
                  导出
                </span>
              </div>
              <div className="crm-gw">
                <table className="crm-g">
                  <colgroup>
                    {[40, 46, 190, 84, 236, 236, 104, 150, 110, 96].map((w, i) => (
                      <col key={i} style={{ width: w }} />
                    ))}
                  </colgroup>
                  <thead>
                    <tr>
                      <th className="cb">
                        <span className="box" />
                      </th>
                      <th className="n" />
                      <th className="nm">
                        <span className="h">
                          <Building2 className="i" />
                          名称
                        </span>
                      </th>
                      <th>
                        <span className="h">
                          <Bookmark className="i" />
                          关注
                        </span>
                      </th>
                      <th className="ag">
                        <span className="h">
                          <Sparkles className="i" />
                          近期信号
                          <ArrowDown className="i sm" />
                          <span className="play">
                            <Play className="i" />
                          </span>
                        </span>
                      </th>
                      <th className="ag">
                        <span className="h">
                          <Sparkles className="i" />
                          采购决策人
                          <span className="play">
                            <Play className="i" />
                          </span>
                        </span>
                        <i className="prog" style={{ width: `${progress}%` }} />
                      </th>
                      <th>
                        <span className="h">
                          <CircleDot className="i" />
                          跟进状态
                        </span>
                      </th>
                      <th>
                        <span className="h">
                          <ListChecks className="i" />
                          下一步
                        </span>
                      </th>
                      <th>
                        <span className="h">
                          <Calendar className="i" />
                          跟进日期
                        </span>
                      </th>
                      <th>
                        <span className="h">
                          <Flag className="i" />
                          优先级
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ROWS.map((r, i) => (
                      <tr key={r.name}>
                        <td className="cb">
                          <span className="box" />
                        </td>
                        <td className="n">{i + 1}</td>
                        <td className="nm">{r.name}</td>
                        <td className="fol">{r.followed ? <Bookmark className="i" /> : null}</td>
                        <td>{PROFILES[r.profile][0]}</td>
                        <td className="dm" data-st={cells[i]}>
                          {cells[i] === "run" ? (
                            <span className="q">
                              <span className="spin" />
                              查询中
                            </span>
                          ) : cells[i] === "done" ? (
                            r.failed ? (
                              <span className="fail">
                                <TriangleAlert className="i" />
                                查询失败
                              </span>
                            ) : (
                              <span className="v">{PROFILES[r.profile][1]}</span>
                            )
                          ) : null}
                        </td>
                        <td>
                          <span className="chip">待评估</span>
                        </td>
                        <td>{r.next ?? ""}</td>
                        <td>{r.date ?? ""}</td>
                        <td>{r.priority ?? "普通"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="crm-sh">
                <span className="on">
                  <Building2 className="i" />
                  公司 36
                </span>
                <span>
                  <UserRound className="i" />
                  联系人 72
                </span>
                <span>
                  <Radar className="i" />
                  业务信号 72
                </span>
              </div>
            </div>
            {/* Agent 收起后，右缘那枚只有标识的玻璃入口，里面的蓝光在游动 */}
            <span className="fab" aria-hidden="true">
              <FleetMark className="fab-mark" />
            </span>
          </div>
          <p className="frame-cap">示例 · 公司与联系人均为虚构；Agent 收起时停在右缘那枚玻璃入口</p>
        </Reveal>
      </div>
    </section>
  );
}
