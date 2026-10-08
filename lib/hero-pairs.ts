/**
 * 首屏地球上「一条信号 → 负责这件事的人」成对卡片的调度与排布：转地球、决定什么时候放哪一对、
 * 算出每对卡、连线、定位点在屏幕上的位置和透明度。不碰 DOM，组件拿结果去写样式。
 */
import { GLOBE_COLORS, mixHex, type Globe, type LonLat } from "./globe";
import { clamp, easeOut, smoothstep } from "./math";

export const PAIR_SLOTS = 2; // 同屏最多两对
export const CARD_W = 284; // 与 web-next 登录页的卡同尺寸
export const CARD_H = 120;
const GAP = 28; // 信号卡与联系人卡之间
const INDENT = 48; // 联系人卡相对信号卡往外缩进，像从它分出去的一枝
const BRANCH_X = 22; // 连线从信号卡底边离内侧这么远的地方垂下
const PAIR_W = INDENT + CARD_W;
const PAIR_H = CARD_H * 2 + GAP;
export const BRANCH_LEN = GAP + CARD_H / 2 + (INDENT - BRANCH_X);
const NAV_H = 64;

const SPEED = 3; // 度 / 秒
const LAT = 18;
const LIFE = 9000;
const FADE = 650;
// 一对卡的节奏：信号淡入 → 连线从信号画向联系人 → 联系人淡入
const BRANCH_AT = 900;
const BRANCH_MS = 600;
const CONTACT_AT = 1400;
// 屏上没有卡超过一会儿，地球加速转向下一处示例区域；有卡后按这个时间常数回到常速
const IDLE_AFTER = 2500;
const IDLE_BOOST = 3.2;
const EASE_MS = 700;
const SPAWN_GAP = 2600;
const RETRY = 250;

export interface PairAnchor {
  id: string;
  /** world-atlas 的 ISO 数字编码，这一对卡在时点亮这个国家 */
  iso: string;
  at: LonLat;
}

export interface PairFrame {
  signal: { x: number; y: number; opacity: number };
  contact: { x: number; y: number; opacity: number };
  pin: { x: number; y: number; opacity: number };
  leader: { x1: number; y1: number; x2: number; y2: number; opacity: number };
  branch: { d: string; offset: number; opacity: number };
}

export interface PairScene {
  /** 每个槽位这一帧的样子；null = 这个槽位空着 */
  frames: (PairFrame | null)[];
  /** 要点亮的国家与颜色 */
  fills: Map<string, string>;
}

interface Live<T> {
  pair: T;
  slot: number;
  born: number;
  opacity: number;
  /** 1 = 放在锚点右边，-1 = 左边（整对左右镜像） */
  side: 1 | -1;
  /** 这一对卡的上沿相对锚点的纵向偏移，出生时定下，之后跟着锚点走 */
  dy: number;
}

export function createPairDirector<T extends PairAnchor>(
  globe: Globe,
  pairs: readonly T[],
  { still, onSlot }: { still: boolean; onSlot: (slot: number, pair: T) => void },
) {
  const life = still ? Infinity : LIFE;
  let width = 1;
  let height = 1;
  let safeLeft = 0;
  let maxPairs: number = PAIR_SLOTS;
  let radius = 300;
  let cx = 0;
  let cy = 0;
  let lon = 18; // 视线中心经度，逐帧减小：地物自西向东移动，和地球自转同向
  let speed = SPEED;
  let last = 0;
  let lastAlive = 0;
  let nextSpawn = 0;
  let queue = 0;
  const live: Live<T>[] = [];

  const view = (atLon = lon) => globe.view([atLon, LAT], radius, cx, cy);
  const project = (p: T) => globe.proj(p.at);
  const boxAt = (c: Live<T>, p: [number, number]) => ({
    x: c.side > 0 ? p[0] + 28 : p[0] - 28 - PAIR_W,
    y: p[1] + c.dy,
    w: PAIR_W,
    h: PAIR_H,
  });
  type Box = ReturnType<typeof boxAt>;
  const overlap = (a: Box, b: Box, m: number) => a.x < b.x + b.w + m && b.x < a.x + a.w + m && a.y < b.y + b.h + m && b.y < a.y + a.h + m;

  /**
   * ms 毫秒之后这个锚点的屏幕位置；背面返回 null。转速按当前值指数回落到常速来估：
   * 加速期间放出的卡，多转的那一段也算进去。
   */
  function futureAt(p: T, ms: number) {
    const turned = (SPEED * ms) / 1000 + ((speed - SPEED) * EASE_MS) / 1000;
    view(lon - turned);
    const q = globe.angle(p.at) < 1.1 ? project(p) : null;
    view();
    return q;
  }

  function trySpawn(now: number): boolean {
    if (live.length >= maxPairs) return false;
    const slot = [...Array(PAIR_SLOTS).keys()].find((i) => !live.some((c) => c.slot === i));
    if (slot === undefined) return false;
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[(queue + i) % pairs.length];
      if (live.some((c) => c.pair.id === pair.id)) continue;
      if (globe.angle(pair.at) > 0.9) continue;
      const p = project(pair);
      if (!p || p[0] < safeLeft || p[0] > width - 40 || p[1] < NAV_H + 30 || p[1] > height - 60) continue;
      // 地球一直往右转：开头和寿命结束时都放得下才出场
      const end = still ? p : futureAt(pair, LIFE);
      if (!end) continue;
      const fits = (side: 1 | -1) =>
        [p, end].every((q) => {
          const x = side > 0 ? q[0] + 28 : q[0] - 28 - PAIR_W;
          return x >= safeLeft - 8 && x + PAIR_W <= width - 16;
        });
      // 优先放在锚点左边：往右转时它离右边缘更远
      const side: 1 | -1 | 0 = fits(-1) ? -1 : fits(1) ? 1 : 0;
      if (!side) continue;
      // 信号卡与锚点大致齐平，联系人在它下面；整对卡不出首屏上下边
      const top = clamp(p[1] - CARD_H / 2 - 10, NAV_H + 12, height - 24 - PAIR_H);
      const c: Live<T> = { pair, slot, born: now, opacity: 0, side, dy: top - p[1] };
      const b = boxAt(c, p);
      if (live.some((o) => overlap(b, boxAt(o, project(o.pair) ?? p), 16))) continue;
      live.push(c);
      queue = (queue + i + 1) % pairs.length;
      onSlot(slot, pair);
      return true;
    }
    return false;
  }

  function remove(c: Live<T>) {
    const k = live.indexOf(c);
    if (k >= 0) live.splice(k, 1);
  }

  function frameOf(c: Live<T>, now: number): PairFrame | null {
    const p = project(c.pair);
    if (!p) return null;
    const age = now - c.born;
    const b = boxAt(c, p);
    let env = Math.min(1, (life - age) / FADE);
    env *= 1 - smoothstep(1.15, 1.4, globe.angle(c.pair.at)); // 转向球背面前先淡出
    env *= clamp((width - 8 - (b.x + b.w)) / 40 + 1, 0, 1); // 被转出右边缘时淡出
    env = clamp(env, 0, 1);
    const signalOpacity = env * clamp(age / FADE, 0, 1);
    const contactIn = clamp((age - CONTACT_AT) / FADE, 0, 1);
    const grow = easeOut(clamp((age - BRANCH_AT) / BRANCH_MS, 0, 1));
    c.opacity = signalOpacity;
    if (age >= life || (age > FADE && signalOpacity <= 0.002)) return null;

    // 信号卡总在靠近锚点的一侧，联系人往外缩进；放在锚点左边时整对左右镜像
    const sx = c.side > 0 ? b.x : b.x + INDENT;
    const sy = b.y;
    const ctx = c.side > 0 ? b.x + INDENT : b.x;
    const cty = b.y + CARD_H + GAP;
    // 连线从信号卡底边垂下来，拐进联系人卡朝里那条边的中线
    const bx = c.side > 0 ? sx + BRANCH_X : sx + CARD_W - BRANCH_X;
    const hx = c.side > 0 ? ctx : ctx + CARD_W;
    const midY = cty + CARD_H / 2;
    return {
      signal: { x: sx, y: sy, opacity: signalOpacity },
      contact: { x: ctx, y: cty + (1 - contactIn) * 8, opacity: env * contactIn },
      pin: { x: p[0], y: p[1], opacity: signalOpacity },
      // 锚点连到信号卡靠近它的那条竖边
      leader: {
        x1: p[0],
        y1: p[1],
        x2: c.side > 0 ? sx + 2 : sx + CARD_W - 2,
        y2: clamp(p[1], sy + 20, sy + CARD_H - 20),
        opacity: signalOpacity,
      },
      branch: {
        d: `M ${bx.toFixed(1)} ${(sy + CARD_H).toFixed(1)} V ${midY.toFixed(1)} H ${hx.toFixed(1)}`,
        offset: BRANCH_LEN * (1 - grow),
        opacity: grow > 0 ? env : 0,
      },
    };
  }

  function scene(now: number): PairScene {
    const frames: (PairFrame | null)[] = Array(PAIR_SLOTS).fill(null);
    for (const c of live.slice()) {
      const f = frameOf(c, now);
      if (f) frames[c.slot] = f;
      else remove(c);
    }
    const fills = new Map<string, string>();
    for (const c of live) if (c.opacity > 0.01) fills.set(c.pair.iso, mixHex(GLOBE_COLORS.land, GLOBE_COLORS.strong, c.opacity));
    return { frames, fills };
  }

  return {
    /** 量好首屏尺寸与文字右缘后调用：决定地球的大小位置、同屏放几对 */
    setStage(stage: { width: number; height: number; safeLeft: number }) {
      ({ width, height, safeLeft } = stage);
      if (width < 900) {
        radius = Math.min(width * 0.66, height * 0.36);
        cx = width * 0.5;
        cy = height + radius * 0.1;
        maxPairs = 0;
      } else {
        radius = Math.min(height * 0.64, width * 0.4);
        cx = Math.max(width * 0.69, width - radius * 0.8);
        cy = height * 0.56;
        maxPairs = width < 1300 ? 1 : PAIR_SLOTS;
      }
      live.splice(maxPairs);
      view();
    },
    /** 推进一帧：转地球、按需放出新的一对、算出这一帧的样子 */
    tick(now: number): PairScene {
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      if (live.length) lastAlive = now;
      const target = now - lastAlive > IDLE_AFTER ? SPEED * IDLE_BOOST : SPEED;
      speed += (target - speed) * Math.min(1, dt / EASE_MS);
      lon -= (speed * dt) / 1000;
      view();
      // 能完整放下一对卡的位置窗口很窄：没放成就很快再试，放成了再隔一段放下一对
      if (now >= nextSpawn) nextSpawn = now + (trySpawn(now) ? SPAWN_GAP : RETRY);
      return scene(now);
    },
    /** 减少动态效果：地球不转，直接摆好成对的终态（连线画满） */
    settle(now: number): PairScene {
      view();
      live.splice(0);
      for (let k = 0; k < maxPairs; k++) trySpawn(now - CONTACT_AT - FADE * 2);
      return scene(now);
    },
  };
}
