/**
 * 产品画面里反复出现的演示数据，取自 fleet web-next 的示例（声谷电子的产品、胡志明市的候选公司）。
 * 公司、人物、动态全部虚构。探索区、公司页、来源、客户表都从这里取，改一处即可。
 */

export const PRODUCTS = {
  A6: { id: "A6", name: "TWS 真无线耳机", specs: "蓝牙 5.3 · 25h · IPX5", price: "$12.4–15.8", moq: "2,000" },
  H2: { id: "H2", name: "头戴式主动降噪耳机", specs: "ANC · 40mm · 40h", price: "$28.5–36.0", moq: "1,000" },
  S3: { id: "S3", name: "便携蓝牙音箱", specs: "10W · IPX7 · 12h", price: "$9.2–14.0", moq: "3,000" },
} as const;

/** 2026-09-18 → 09-18 */
export const shortDate = (date: string) => date.slice(5);

export interface DemoSignal {
  date: string;
  title: string;
  observation: string;
  relevance: string;
  /** 联系之前先问清的事；个人动态没有这一项 */
  next?: string;
}

export interface DemoContact {
  initials: string;
  name: string;
  role: string;
  duty: string;
}

const LOTUS_CHECK = "先确认 2,000 件是否按单一型号、单一颜色计算。";
const LOTUS_FIT = "可从 A6 真无线耳机的小批量贴牌切入，先核对渠道售价与目标毛利。";
const LOTUS_SUMMARY = "面向日常通勤与运动场景，销售无线耳机与便携音箱。";

export const LOTUS = {
  name: "Lotus Sound",
  initials: "LS",
  kind: "音频品牌",
  place: "胡志明市，越南",
  summary: LOTUS_SUMMARY,
  fitLabel: "可先评估样品",
  check: LOTUS_CHECK,
  demand: { use: "通勤真无线系列", firstOrder: "2,000 件", packaging: "品牌标识与独立零售包装", delivery: "样品确认后 6–8 周" },
  signals: [
    {
      date: "2026-09-18",
      title: "准备扩充便携音频系列",
      observation: `${LOTUS_SUMMARY}示例业务记录提及准备扩充便携音频系列，尚未发布正式采购单。`,
      relevance: LOTUS_FIT,
      next: LOTUS_CHECK,
    },
    {
      date: "2026-09-10",
      title: "贴牌合作入口新增包装选项",
      observation: "示例合作页面列出自有标识、独立包装和样品评估三个步骤。",
      relevance: "OEM / ODM 能力有对照点，但包装打样费用仍未知。",
      next: "确认计划是否仍在推进，以及哪一位负责最终采购决策。",
    },
  ] satisfies DemoSignal[],
  contacts: [
    { initials: "AM", name: "Alex Morgan", role: "产品采购负责人", duty: "确认首单规模、报价与供应商名单" },
    { initials: "SR", name: "Sam Rivera", role: "产品开发经理", duty: "参与样品评估与交付规格确认" },
  ] satisfies DemoContact[],
};

/** Lotus Sound 的主要联系人在人的页面里多出来的内容 */
export const ALEX = {
  ...LOTUS.contacts[0],
  ask: "首单数量、目标价和打样时间",
  since: "2022",
  experience: [
    ["产品采购负责人", "Lotus Sound · 2022 – 至今"],
    ["采购经理", "Brightline Retail · 2018 – 2022"],
    ["采购专员", "Coastline Electronics · 2015 – 2018"],
  ] as const,
  signals: [
    {
      date: "2026-09-05",
      title: "在品类交流会上谈到下一季的贴牌计划",
      observation: "提到下一季考虑引入贴牌耳机，更关注包装与交期。",
      relevance: "与 A6 贴牌方向一致，可以从包装和交期切入。",
    },
    {
      date: "2026-08-20",
      title: "职责扩展到全部音频品类",
      observation: "职业资料显示负责范围从耳机扩展到全部音频采购。",
      relevance: "便携音箱也可能纳入同一次讨论。",
    },
  ] satisfies DemoSignal[],
};

export const MEKONG = {
  name: "Mekong Audio Supply",
  kind: "渠道分销",
  signal: { date: "2026-09-16", title: "新增消费电子渠道合作岗位" },
  contact: { name: "Jamie Chen", role: "品类经理" },
  demand: { use: "便携音箱渠道试单", firstOrder: "1,500 件" },
  check: "先确认能否合单到 3,000 件，或接受分批交付。",
};
