/**
 * 落地页的浅色地球：d3-geo 正射投影画在 canvas 上，样子照 fleet web-next 登录页那颗玻璃球。
 *
 * 地图合规：只画合并后的陆地和少量示例国家的填色，不画国界线、不单独给中国上色，
 * 调用方也不应点亮边界有争议的国家，规避公开页面「问题地图」的风险；上线前仍需按
 * 《地图管理条例》复核，或换成有审图号的底图。
 *
 * 只在浏览器里用（canvas / fetch），模块加载时不碰 window。
 */
import {
  geoDistance,
  geoGraticule10,
  geoOrthographic,
  geoPath,
  type GeoPermissibleObjects,
  type GeoProjection,
} from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import type { Feature, FeatureCollection, Geometry } from "geojson";

export type LonLat = [number, number];

export interface World {
  land: GeoPermissibleObjects;
  byId: Map<string, Feature<Geometry>>;
  graticule: GeoPermissibleObjects;
}

// world-atlas@2 countries-110m（Natural Earth，公有领域），放在 public/geo，运行时再取，不进首屏包
const WORLD_URL = "/geo/countries-110m.json";
let worldPromise: Promise<World> | null = null;

export function loadWorld(): Promise<World> {
  worldPromise ??= fetch(WORLD_URL)
    .then((r) => {
      if (!r.ok) throw new Error(`world data ${r.status}`);
      return r.json() as Promise<Topology<{ countries: GeometryCollection; land: GeometryCollection }>>;
    })
    .then((topo) => {
      const countries = feature(topo, topo.objects.countries) as FeatureCollection<Geometry>;
      return {
        land: feature(topo, topo.objects.land) as GeoPermissibleObjects,
        byId: new Map(countries.features.map((f) => [String(f.id), f])),
        graticule: geoGraticule10(),
      };
    })
    .catch((err) => {
      worldPromise = null; // 失败了允许下次重试
      throw err;
    });
  return worldPromise;
}

// 取自 web-next DESIGN.md / globals.css：--meridian-orb、推荐区域 #91B4E5、当前定位 #5B94DD、焦点蓝 #2866F6
export const GLOBE_COLORS = {
  orbA: "#FBFDFF",
  orbB: "#EFF5FC",
  orbC: "#CBDBEE",
  land: "#C3D3EC",
  rec: "#91B4E5",
  strong: "#5B94DD",
  border: "rgba(253,254,255,0.85)",
  limb: "rgba(39,69,105,0.16)",
  pin: "#2866F6",
} as const;

/** 两个 #RRGGBB 之间线性插值，t 夹在 0–1 */
export function mixHex(a: string, b: string, t: number): string {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift: number) => {
    const x = (pa >> shift) & 255;
    const y = (pb >> shift) & 255;
    return Math.round(x + (y - x) * t);
  };
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}

export interface Globe {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  /** 裁掉背面的投影：陆地、填色、正面经纬网 */
  proj: GeoProjection;
  /** 不裁背面的同一投影：经纬网的背面透过玻璃显出来 */
  through: GeoProjection;
  dpr: number;
  width: number;
  height: number;
  /** 量画布尺寸并按设备像素比重设缓冲区 */
  resize(): void;
  /** 视线中心、半径（px）、球心位置 */
  view(center: LonLat, radius: number, x: number, y: number): void;
  /** 与视线中心的球面角距：0 在正中，π/2 在球缘 */
  angle(p: LonLat): number;
}

export function createGlobe(canvas: HTMLCanvasElement): Globe {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 2d context unavailable");
  const proj = geoOrthographic().clipAngle(90).precision(0.35);
  const through = geoOrthographic().precision(0.6);
  let center: LonLat = [0, 0];
  const globe: Globe = {
    canvas,
    ctx,
    proj,
    through,
    dpr: 1,
    width: 1,
    height: 1,
    resize() {
      // 用布局尺寸而不是 getBoundingClientRect：首屏地球入场时带 scale(.97)，量到的是缩小后的框，
      // 画布与叠在上面的卡片、连线会整体差 3%
      globe.dpr = Math.min(window.devicePixelRatio || 1, 2);
      globe.width = Math.max(1, canvas.clientWidth);
      globe.height = Math.max(1, canvas.clientHeight);
      canvas.width = Math.round(globe.width * globe.dpr);
      canvas.height = Math.round(globe.height * globe.dpr);
    },
    view(c, radius, x, y) {
      center = c;
      for (const p of [proj, through]) p.rotate([-c[0], -c[1]]).scale(radius).translate([x, y]);
    },
    angle: (p) => geoDistance(p, center),
  };
  return globe;
}

interface PaintOptions {
  /** ISO 数字编码 → 填色 */
  fills?: Map<string, string>;
  /** 经纬网透明度系数，0 不画 */
  graticule?: number;
  outline?: number;
}

export function paintGlobe(g: Globe, world: World, { fills, graticule = 1, outline = 0.7 }: PaintOptions = {}) {
  const { ctx, proj } = g;
  const path = geoPath(proj, ctx);
  const pathThrough = geoPath(g.through, ctx);
  const [x, y] = proj.translate();
  const r = proj.scale();
  ctx.setTransform(g.dpr, 0, 0, g.dpr, 0, 0);
  ctx.clearRect(0, 0, g.width, g.height);

  const orb = ctx.createRadialGradient(x - r * 0.34, y - r * 0.48, r * 0.04, x, y, r);
  orb.addColorStop(0, GLOBE_COLORS.orbA);
  orb.addColorStop(0.66, GLOBE_COLORS.orbB);
  orb.addColorStop(1, GLOBE_COLORS.orbC);
  ctx.beginPath();
  path({ type: "Sphere" });
  ctx.fillStyle = orb;
  ctx.fill();

  if (graticule > 0.01) {
    ctx.beginPath();
    pathThrough(world.graticule);
    ctx.strokeStyle = `rgba(66,98,150,${(0.1 * graticule).toFixed(3)})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  ctx.beginPath();
  path(world.land);
  ctx.fillStyle = GLOBE_COLORS.land;
  ctx.fill();

  if (fills) {
    for (const [id, color] of fills) {
      const f = world.byId.get(id);
      if (!f) continue;
      ctx.beginPath();
      path(f);
      ctx.fillStyle = color;
      ctx.fill();
      if (outline) {
        ctx.strokeStyle = GLOBE_COLORS.border;
        ctx.lineWidth = outline;
        ctx.stroke();
      }
    }
  }

  if (graticule > 0.01) {
    ctx.beginPath();
    path(world.graticule);
    ctx.strokeStyle = `rgba(66,98,150,${(0.12 * graticule).toFixed(3)})`;
    ctx.lineWidth = 0.7;
    ctx.stroke();
  }

  const rim = ctx.createRadialGradient(x, y, r * 0.82, x, y, r);
  rim.addColorStop(0, "rgba(39,69,105,0)");
  rim.addColorStop(1, "rgba(39,69,105,0.07)");
  ctx.beginPath();
  path({ type: "Sphere" });
  ctx.fillStyle = rim;
  ctx.fill();
  ctx.strokeStyle = GLOBE_COLORS.limb;
  ctx.lineWidth = 1;
  ctx.stroke();
}

/** 定位点：蓝心白边，外圈一层呼吸 */
export function paintPin(g: Globe, at: LonLat, alpha: number, now: number, still: boolean) {
  if (alpha < 0.02 || g.angle(at) > Math.PI / 2 - 0.05) return;
  const p = g.proj(at);
  if (!p) return;
  const { ctx } = g;
  const [x, y] = p;
  const ph = still ? 0.3 : (now % 2600) / 2600;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(x, y, 8 + ph * 14, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(40,102,246,${(0.22 * (1 - ph)).toFixed(3)})`;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(40,102,246,0.12)";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, 6.5, 0, Math.PI * 2);
  ctx.fillStyle = GLOBE_COLORS.pin;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#fff";
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/** 两点之间沿大圆插值，用来让镜头平滑转向 */
export { geoInterpolate } from "d3-geo";
