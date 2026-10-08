/**
 * 首屏地球上成对出现的卡：先是一家公司的一条信号，再连出这家公司里负责这件事的人。
 * 情景取自 fleet web-next 登录页的演示数据（auth-globe-signals.ts），同一市场的信号与联系人本来就属于同一家公司。
 * 公司与人物均为虚构，头像是 web-next 本地生成的示例人像。
 * 印度、巴基斯坦、摩洛哥、阿尔及利亚、哈萨克斯坦不放：点亮它们会把有争议的边界画出来。
 */
import type { LonLat } from "@/lib/globe";

export interface HeroPair {
  id: string;
  region: string;
  /** world-atlas 的 ISO 数字编码，这一对卡在时点亮这个国家 */
  iso: string;
  at: LonLat;
  signal: { headline: string; company: string; field: string };
  contact: { name: string; role: string; company: string; avatar: string };
}

// [id, 地区, ISO, 纬度, 经度, 信号, 行业, 公司, 联系人, 职位, 头像]
type Market = [string, string, string, number, number, string, string, string, string, string, string];

const MARKETS: Market[] = [
  ["japan", "日本", "392", 36, 138, "耳机品牌正在寻找代工伙伴", "消费电子", "Aster Audio", "Yuki Tanaka", "采购负责人", "01"],
  ["korea", "韩国", "410", 36, 128, "美妆渠道招募海外品牌", "美妆个护", "Mora Beauty", "Minji Park", "品牌采购经理", "01"],
  ["vietnam", "越南", "704", 16, 107.5, "智能家居进入新一轮选品", "跨境电商", "Lotus Living", "Linh Nguyen", "选品经理", "01"],
  ["united-states", "美国", "840", 39, -100, "储能项目寻找设备伙伴", "新能源", "Cedar Energy", "Emma Carter", "项目采购经理", "03"],
  ["mexico", "墨西哥", "484", 24, -102, "汽车零部件新增采购需求", "汽车制造", "Sierra Parts", "Diego Luna", "采购总监", "02"],
  ["brazil", "巴西", "076", -14, -52, "家居连锁新增进口品类", "家居生活", "Verde Home", "Ana Costa", "进口采购经理", "07"],
  ["germany", "德国", "276", 51, 10, "可持续包装进入采购清单", "环保包装", "Linden Pack", "Lena Fischer", "采购负责人", "03"],
  ["uk", "英国", "826", 54, -2, "家居品牌寻找设计合作商", "家居设计", "Elm Interiors", "Oliver Clarke", "产品开发经理", "04"],
  ["uae", "阿联酋", "784", 24, 54, "新酒店启动家具采购", "酒店工程", "Dune Hospitality", "Omar Hassan", "项目采购总监", "02"],
  ["canada", "加拿大", "124", 53, -106, "家装连锁采购节能照明", "家装建材", "Maple Lighting", "Sophie Martin", "品类采购经理", "03"],
  ["colombia", "哥伦比亚", "170", 4, -73, "母婴渠道寻找新品牌", "母婴用品", "Alba Baby", "Camila Torres", "品牌合作经理", "07"],
  ["peru", "秘鲁", "604", -12, -75, "食品工厂更新包装设备", "食品加工", "Sol Foods", "Luis Mendoza", "设备采购经理", "02"],
  ["france", "法国", "250", 47, 2, "生活方式买手店寻找新品", "家居设计", "Atelier Lune", "Claire Dubois", "家居买手", "03"],
  ["netherlands", "荷兰", "528", 52.1, 5.3, "海外仓升级智能分拣设备", "仓储物流", "Canal Logistics", "Lars de Vries", "运营采购经理", "04"],
  ["spain", "西班牙", "724", 40, -4, "度假酒店采购户外家具", "户外家居", "Costa Spaces", "Lucia Garcia", "项目采购主管", "07"],
  ["italy", "意大利", "380", 43, 12.5, "咖啡设备品牌寻找零件商", "餐饮设备", "Forma Coffee", "Marco Rossi", "供应链经理", "04"],
  ["sweden", "瑞典", "752", 60, 15, "骑行渠道引入轻量化配件", "骑行装备", "Birch Cycling", "Elsa Lind", "产品采购经理", "03"],
  ["poland", "波兰", "616", 52, 19, "电商仓储启动货架招采", "物流设施", "Vistula Storage", "Jan Kowalski", "项目采购经理", "04"],
  ["czechia", "捷克", "203", 49.8, 15.5, "工业买家寻找精密零件", "机械加工", "Morava Precision", "Eva Novak", "技术采购经理", "03"],
  ["egypt", "埃及", "818", 27, 30, "家电组装厂寻找核心部件", "家用电器", "Nile Appliances", "Nour Adel", "零部件采购经理", "07"],
  ["nigeria", "尼日利亚", "566", 9, 8, "数码渠道招募配件供应商", "手机配件", "Kora Digital", "Ada Okafor", "品类负责人", "05"],
  ["kenya", "肯尼亚", "404", 0, 38, "生鲜配送扩建冷链设施", "冷链物流", "Savanna Fresh", "Grace Njeri", "供应链经理", "05"],
  ["thailand", "泰国", "764", 16, 101, "连锁餐饮升级后厨设备", "餐饮设备", "Baan Kitchen", "Narin Chai", "采购经理", "08"],
  ["indonesia", "印度尼西亚", "360", -2, 113, "家电分销商扩充小家电", "小家电", "Nusa Home", "Dewi Putri", "渠道采购经理", "01"],
  ["malaysia", "马来西亚", "458", 4, 102, "电子工厂寻找检测设备", "电子制造", "Meranti Tech", "Amir Lim", "技术采购经理", "08"],
  ["philippines", "菲律宾", "608", 16, 121, "便利店渠道新增饮品设备", "商用设备", "Isla Retail", "Maria Santos", "品类采购主管", "07"],
  ["saudi-arabia", "沙特阿拉伯", "682", 24, 45, "商业综合体启动照明招采", "工程照明", "Rimal Lighting", "Faisal Noor", "工程采购总监", "02"],
  ["turkey", "土耳其", "792", 39, 35, "厨具品牌征集制造伙伴", "厨房用品", "Anatolia Kitchen", "Deniz Kaya", "产品采购经理", "08"],
];

export const HERO_PAIRS: readonly HeroPair[] = MARKETS.map(
  ([id, region, iso, lat, lng, headline, field, company, name, role, avatar]): HeroPair => ({
    id,
    region,
    iso,
    at: [lng, lat],
    signal: { headline, company, field },
    contact: { name, role, company, avatar },
  }),
);
