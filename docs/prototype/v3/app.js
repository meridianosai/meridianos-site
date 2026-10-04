/* 子午纪 · 落地页原型 v3（MeridianAI Fleet）
 *
 * 静态原型，不接后端：首屏输入和内测表单只在本页给出结果，不发请求。
 * 产品画面照 fleet apps/web-next 的本地实现复刻；示例数据（声谷电子、Lotus Sound、登录页各国卡片）
 *   取自 web-next 的演示数据，公司、人物与动态均为虚构。
 * 地球：d3-geo 正射投影画在 canvas 上；卡片与标注是 DOM，每帧按投影坐标摆位。
 * 地图合规：只画合并后的陆地，不画国界线、不单独给中国上色，也不点亮边界有争议的国家，
 *   规避公开页面「问题地图」的风险；上线前仍需按《地图管理条例》复核。
 */
(() => {
  'use strict';

  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (id, style = '') => `<svg class="i"${style ? ` style="${style}"` : ''}><use href="#${id}"/></svg>`;
  const NAV_H = 64;
  const SVG_NS = 'http://www.w3.org/2000/svg';

  /* ---------- 导航与滚动 ---------- */

  function go(target) {
    const el = $(target);
    if (!el) return;
    const top = target === '#top' ? 0 : el.getBoundingClientRect().top + scrollY - NAV_H + 1;
    scrollTo({ top: Math.max(0, top), behavior: REDUCE ? 'auto' : 'smooth' });
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-go]');
    if (!a) return;
    e.preventDefault();
    go(a.dataset.go);
  });

  const nav = $('.nav');
  const syncNav = () => nav.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', syncNav, { passive: true });
  syncNav();

  const revealer = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add('in'); revealer.unobserve(e.target); }
    }
  }, { threshold: 0.12 });
  $$('.rv').forEach(el => revealer.observe(el));

  function onceVisible(el, threshold, fn) {
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { io.disconnect(); fn(); }
    }, { threshold });
    io.observe(el);
  }
  function mulberry32(seed) {
    let a = seed;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- 地球：照 web-next 登录页那颗浅色玻璃球 ---------- */

  const GEO = (() => {
    const { d3, topojson, WORLD_110M: w } = window;
    if (!d3 || !topojson || !w) return null;
    const countries = topojson.feature(w, w.objects.countries).features;
    return {
      land: topojson.feature(w, w.objects.land),
      byId: new Map(countries.map(f => [String(f.id), f])),
      grat: d3.geoGraticule10(),
    };
  })();

  // 取自 web-next DESIGN.md / globals.css：--meridian-orb、推荐区域 #91B4E5、当前定位 #5B94DD、焦点蓝 #2866F6
  const COL = {
    orbA: '#FBFDFF', orbB: '#EFF5FC', orbC: '#CBDBEE',
    land: '#C3D3EC', fog: '#D3DEEE',
    rec: '#91B4E5', strong: '#5B94DD',
    border: 'rgba(253,254,255,0.85)', limb: 'rgba(39,69,105,0.16)', pin: '#2866F6',
  };
  const mix = (a, b, t) => (t <= 0 ? a : t >= 1 ? b : d3.interpolateRgb(a, b)(t));

  function makeGlobe(canvas) {
    const ctx = canvas.getContext('2d');
    const proj = d3.geoOrthographic().clipAngle(90).precision(0.35);
    // 不裁背面的同一投影：经纬网的背面透过玻璃显出来
    const thru = d3.geoOrthographic().clipAngle(null).precision(0.6);
    const g = { canvas, ctx, proj, path: d3.geoPath(proj, ctx), pathThru: d3.geoPath(thru, ctx), W: 1, H: 1, dpr: 1, center: [0, 0] };
    g.resize = () => {
      const r = canvas.getBoundingClientRect();
      g.dpr = Math.min(window.devicePixelRatio || 1, 2);
      g.W = Math.max(1, r.width);
      g.H = Math.max(1, r.height);
      canvas.width = Math.round(g.W * g.dpr);
      canvas.height = Math.round(g.H * g.dpr);
    };
    g.view = (center, radius, x, y) => {
      g.center = center;
      for (const p of [proj, thru]) p.rotate([-center[0], -center[1]]).scale(radius).translate([x, y]);
    };
    /** 与视线中心的球面角距：0 在正中，π/2 在球缘 */
    g.angle = p => d3.geoDistance(p, g.center);
    return g;
  }

  function paintGlobe(g, { fills = new Map(), land = COL.land, grat = 1, outline = 0.7 } = {}) {
    const { ctx, path, pathThru, proj } = g;
    const [x, y] = proj.translate();
    const r = proj.scale();
    ctx.setTransform(g.dpr, 0, 0, g.dpr, 0, 0);
    ctx.clearRect(0, 0, g.W, g.H);
    const orb = ctx.createRadialGradient(x - r * 0.34, y - r * 0.48, r * 0.04, x, y, r);
    orb.addColorStop(0, COL.orbA); orb.addColorStop(0.66, COL.orbB); orb.addColorStop(1, COL.orbC);
    ctx.beginPath(); path({ type: 'Sphere' }); ctx.fillStyle = orb; ctx.fill();
    if (grat > 0.01) {
      ctx.beginPath(); pathThru(GEO.grat);
      ctx.strokeStyle = `rgba(66,98,150,${(0.1 * grat).toFixed(3)})`; ctx.lineWidth = 0.8; ctx.stroke();
    }
    ctx.beginPath(); path(GEO.land); ctx.fillStyle = land; ctx.fill();
    for (const [id, color] of fills) {
      const f = GEO.byId.get(id);
      if (!f) continue;
      ctx.beginPath(); path(f); ctx.fillStyle = color; ctx.fill();
      if (outline) { ctx.strokeStyle = COL.border; ctx.lineWidth = outline; ctx.stroke(); }
    }
    if (grat > 0.01) {
      ctx.beginPath(); path(GEO.grat);
      ctx.strokeStyle = `rgba(66,98,150,${(0.12 * grat).toFixed(3)})`; ctx.lineWidth = 0.7; ctx.stroke();
    }
    const rim = ctx.createRadialGradient(x, y, r * 0.82, x, y, r);
    rim.addColorStop(0, 'rgba(39,69,105,0)'); rim.addColorStop(1, 'rgba(39,69,105,0.07)');
    ctx.beginPath(); path({ type: 'Sphere' }); ctx.fillStyle = rim; ctx.fill();
    ctx.strokeStyle = COL.limb; ctx.lineWidth = 1; ctx.stroke();
  }
  function paintPin(g, lonlat, alpha, now) {
    if (alpha < 0.02 || g.angle(lonlat) > Math.PI / 2 - 0.05) return;
    const { ctx } = g;
    const [x, y] = g.proj(lonlat);
    const ph = REDUCE ? 0.3 : (now % 2600) / 2600;
    ctx.globalAlpha = alpha;
    ctx.beginPath(); ctx.arc(x, y, 8 + ph * 14, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(40,102,246,${(0.22 * (1 - ph)).toFixed(3)})`; ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fillStyle = 'rgba(40,102,246,0.12)'; ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, 6.5, 0, Math.PI * 2); ctx.fillStyle = COL.pin; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.stroke();
    ctx.globalAlpha = 1;
  }

  /* ---------- Hero：登录页的信号 / 商机 / 联系人卡（auth-globe-signals.ts 的示例） ---------- */

  // [id, 地区, ISO, 纬度, 经度, 信号标题, 信号说明, 公司, 联系人, 职位, 商机, 头像]
  // 印度、巴基斯坦、摩洛哥、阿尔及利亚、哈萨克斯坦不放：点亮它们会把有争议的边界画出来。
  const MARKETS = [
    ['japan', '日本', '392', 36, 138, '耳机品牌正在寻找代工伙伴', '消费电子 · OEM / ODM', 'Aster Audio', 'Yuki Tanaka', '采购负责人', '蓝牙耳机代工合作', '01'],
    ['korea', '韩国', '410', 36, 128, '美妆渠道招募海外品牌', '美妆个护 · 品牌入驻', 'Mora Beauty', 'Minji Park', '品牌采购经理', '美妆品牌进入零售渠道', '01'],
    ['vietnam', '越南', '704', 16, 107.5, '智能家居进入新一轮选品', '跨境电商 · 新品采购', 'Lotus Living', 'Linh Nguyen', '选品经理', '智能家居新品采购', '01'],
    ['united-states', '美国', '840', 39, -100, '储能项目寻找设备伙伴', '新能源 · 项目采购', 'Cedar Energy', 'Emma Carter', '项目采购经理', '商用储能项目供货', '03'],
    ['mexico', '墨西哥', '484', 24, -102, '汽车零部件新增采购需求', '汽车制造 · 供应链配套', 'Sierra Parts', 'Diego Luna', '采购总监', '汽车零部件供应商配套', '02'],
    ['brazil', '巴西', '076', -14, -52, '家居连锁新增进口品类', '家居生活 · 分销合作', 'Verde Home', 'Ana Costa', '进口采购经理', '家居连锁进口选品', '07'],
    ['germany', '德国', '276', 51, 10, '可持续包装进入采购清单', '环保包装 · 企业采购', 'Linden Pack', 'Lena Fischer', '采购负责人', '环保包装供应链合作', '03'],
    ['uk', '英国', '826', 54, -2, '家居品牌寻找设计合作商', '家居设计 · 联合开发', 'Elm Interiors', 'Oliver Clarke', '产品开发经理', '家居系列联合开发', '04'],
    ['uae', '阿联酋', '784', 24, 54, '新酒店启动家具采购', '酒店工程 · 项目配套', 'Dune Hospitality', 'Omar Hassan', '项目采购总监', '酒店家具整套采购', '02'],
    ['canada', '加拿大', '124', 53, -106, '家装连锁采购节能照明', '家装建材 · 连锁采购', 'Maple Lighting', 'Sophie Martin', '品类采购经理', '节能照明零售供货', '03'],
    ['colombia', '哥伦比亚', '170', 4, -73, '母婴渠道寻找新品牌', '母婴用品 · 分销合作', 'Alba Baby', 'Camila Torres', '品牌合作经理', '母婴用品分销合作', '07'],
    ['peru', '秘鲁', '604', -12, -75, '食品工厂更新包装设备', '食品加工 · 设备采购', 'Sol Foods', 'Luis Mendoza', '设备采购经理', '食品包装产线升级', '02'],
    ['france', '法国', '250', 47, 2, '生活方式买手店寻找新品', '家居设计 · 精品零售', 'Atelier Lune', 'Claire Dubois', '家居买手', '设计家居精品渠道合作', '03'],
    ['netherlands', '荷兰', '528', 52.1, 5.3, '海外仓升级智能分拣设备', '仓储物流 · 自动化改造', 'Canal Logistics', 'Lars de Vries', '运营采购经理', '仓储分拣系统配套', '04'],
    ['spain', '西班牙', '724', 40, -4, '度假酒店采购户外家具', '户外家居 · 酒店采购', 'Costa Spaces', 'Lucia Garcia', '项目采购主管', '度假酒店户外家具供货', '07'],
    ['italy', '意大利', '380', 43, 12.5, '咖啡设备品牌寻找零件商', '餐饮设备 · OEM 配套', 'Forma Coffee', 'Marco Rossi', '供应链经理', '咖啡设备零部件配套', '04'],
    ['sweden', '瑞典', '752', 60, 15, '骑行渠道引入轻量化配件', '骑行装备 · 零售渠道', 'Birch Cycling', 'Elsa Lind', '产品采购经理', '骑行配件零售合作', '03'],
    ['poland', '波兰', '616', 52, 19, '电商仓储启动货架招采', '物流设施 · 新仓建设', 'Vistula Storage', 'Jan Kowalski', '项目采购经理', '新仓货架与物流设备采购', '04'],
    ['czechia', '捷克', '203', 49.8, 15.5, '工业买家寻找精密零件', '机械加工 · 定制采购', 'Morava Precision', 'Eva Novak', '技术采购经理', '精密机械零件定制', '03'],
    ['egypt', '埃及', '818', 27, 30, '家电组装厂寻找核心部件', '家用电器 · 零件采购', 'Nile Appliances', 'Nour Adel', '零部件采购经理', '家电核心部件供货', '07'],
    ['nigeria', '尼日利亚', '566', 9, 8, '数码渠道招募配件供应商', '手机配件 · 批发合作', 'Kora Digital', 'Ada Okafor', '品类负责人', '数码配件批发合作', '05'],
    ['kenya', '肯尼亚', '404', 0, 38, '生鲜配送扩建冷链设施', '冷链物流 · 制冷设备', 'Savanna Fresh', 'Grace Njeri', '供应链经理', '生鲜冷链设备配套', '05'],
    ['thailand', '泰国', '764', 16, 101, '连锁餐饮升级后厨设备', '餐饮设备 · 门店扩张', 'Baan Kitchen', 'Narin Chai', '采购经理', '连锁餐饮后厨设备配套', '08'],
    ['indonesia', '印度尼西亚', '360', -2, 113, '家电分销商扩充小家电', '小家电 · 本地分销', 'Nusa Home', 'Dewi Putri', '渠道采购经理', '小家电本地分销合作', '01'],
    ['malaysia', '马来西亚', '458', 4, 102, '电子工厂寻找检测设备', '电子制造 · 质量检测', 'Meranti Tech', 'Amir Lim', '技术采购经理', '电子制造检测设备采购', '08'],
    ['philippines', '菲律宾', '608', 16, 121, '便利店渠道新增饮品设备', '商用设备 · 零售渠道', 'Isla Retail', 'Maria Santos', '品类采购主管', '便利店商用饮品设备供货', '07'],
    ['saudi-arabia', '沙特阿拉伯', '682', 24, 45, '商业综合体启动照明招采', '工程照明 · 项目配套', 'Rimal Lighting', 'Faisal Noor', '工程采购总监', '商业综合体照明配套', '02'],
    ['turkey', '土耳其', '792', 39, 35, '厨具品牌征集制造伙伴', '厨房用品 · 贴牌合作', 'Anatolia Kitchen', 'Deniz Kaya', '产品采购经理', '厨房用品贴牌合作', '08'],
  ];
  // 每个市场三张卡：信号、商机、联系人；按种类交错，同屏尽量凑齐三种
  const HERO_CARDS = ['signal', 'opp', 'contact'].flatMap(type => MARKETS.map(m => ({
    type, region: m[1], iso: m[2], at: [m[4], m[3]],
    headline: type === 'signal' ? m[5] : type === 'opp' ? m[10] : m[8],
    detail: type === 'signal' ? m[6] : m[7], role: m[9], avatar: m[11],
  })));

  function heroCardHTML(c) {
    const tag = c.type === 'signal'
      ? `<span class="ac-tag signal">${icon('l-radar')}信号</span>`
      : c.type === 'opp' ? `<span class="ac-tag opp">${icon('l-target')}商机</span>` : `<span class="ac-tag contact">${icon('l-user')}联系人</span>`;
    const top = `<div class="ac-top">${tag}<span class="ac-region">${c.region}</span></div>`;
    if (c.type === 'signal') return `<div class="ac-in">${top}<div class="ac-sig"><b>${c.headline}</b><span>${c.detail}</span></div></div>`;
    if (c.type === 'opp') return `<div class="ac-in">${top}<div class="ac-opp"><b>${c.headline}</b><span>${icon('l-building')}${esc(c.detail)}</span></div></div>`;
    return `<div class="ac-in">${top}<div class="ac-ct"><img src="assets/portrait-${c.avatar}.jpg" alt=""><div><b>${esc(c.headline)}</b><span>${c.role}</span><em>${esc(c.detail)}</em></div></div></div>`;
  }

  function initHero() {
    const hero = $('.hero');
    requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('ready')));
    if (!GEO) {
      // CDN 没加载上时退回一张静态经纬网，首屏输入照常可用
      $('.hero-fx').insertAdjacentHTML('beforeend', '<svg viewBox="0 0 620 620" style="position:absolute;right:-12%;top:12%;width:min(900px,90vw);height:auto;color:rgba(36,94,168,.12)"><use href="#meridians" width="620" height="620"/></svg>');
      return;
    }
    const layer = $('.hero-fx');
    const svg = $('.hero-lines');
    const g = makeGlobe($('.hero-globe'));
    const CW = 284, CH = 120;
    const cards = HERO_CARDS.map(c => {
      const body = document.createElement('div');
      body.className = `ac ac-body${c.type === 'opp' ? ' opp' : ''}`;
      body.innerHTML = heroCardHTML(c);
      const pin = document.createElement('div');
      pin.className = 'ac';
      pin.innerHTML = '<span class="ac-pin"></span>';
      layer.append(body, pin);
      const line = document.createElementNS(SVG_NS, 'line');
      line.style.opacity = '0';
      svg.append(line);
      return { ...c, body, pin, line, alive: false, born: 0, op: 0, side: 1, below: false };
    });

    const SPEED = 3; // 度 / 秒
    const LAT = 18;
    const LIFE = REDUCE ? Infinity : 8000; // 登录页每张卡独立展示 8 秒
    const FADE = 650;
    let lon = 18; // 视线中心经度，逐帧减小：地物自西向东移动，和地球自转同向
    let R = 300, cx = 0, cy = 0, safeL = 0, maxLive = 3;
    let raf = 0, last = 0, nextSpawn = 0, queue = 0, onScreen = true, speed = SPEED, lastAlive = 0;
    const live = [];

    function layout() {
      g.resize();
      const { W, H } = g;
      if (W < 900) {
        R = Math.min(W * 0.66, H * 0.36);
        cx = W * 0.5;
        cy = H + R * 0.1;
        maxLive = 0;
      } else {
        R = Math.min(H * 0.64, W * 0.4);
        cx = Math.max(W * 0.69, W - R * 0.8);
        cy = H * 0.56;
        const left = hero.getBoundingClientRect().left;
        safeL = Math.max(...['.hero h1 .l', '.hero-sub', '.wc'].flatMap(s => $$(s, hero)).map(el => el.getBoundingClientRect().right)) - left + 32;
        maxLive = W < 1200 ? 2 : 3;
      }
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      if (!maxLive) live.slice().forEach(kill);
    }
    const boxAt = (c, p) => ({ x: c.side > 0 ? p[0] + 28 : p[0] - 28 - CW, y: c.below ? p[1] + 22 : p[1] - CH - 22, w: CW, h: CH });
    const overlap = (a, b, m) => a.x < b.x + b.w + m && b.x < a.x + a.w + m && a.y < b.y + b.h + m && b.y < a.y + a.h + m;

    function trySpawn(now) {
      if (live.length >= maxLive) return;
      // 登录页的规则：同屏优先凑齐三种卡
      const missing = ['signal', 'opp', 'contact'].filter(t => !live.some(c => c.type === t));
      for (const pass of [missing, null]) {
        for (let i = 0; i < cards.length; i++) {
          const c = cards[(queue + i) % cards.length];
          if (c.alive || (pass && !pass.includes(c.type)) || live.some(o => o.iso === c.iso)) continue;
          if (g.angle(c.at) > 0.9) continue;
          const p = g.proj(c.at);
          if (!p || p[0] < safeL || p[0] > g.W - 40 || p[1] < NAV_H + 30 || p[1] > g.H - 60) continue;
          c.side = p[0] + 28 + CW < g.W - 24 ? 1 : -1;
          c.below = p[1] - CH - 22 < NAV_H + 12;
          const b = boxAt(c, p);
          if (b.x < safeL - 8 || b.y + b.h > g.H - 24) continue;
          if (live.some(o => overlap(b, boxAt(o, g.proj(o.at)), 14))) continue;
          c.alive = true;
          c.born = now;
          live.push(c);
          queue = (queue + i + 1) % cards.length;
          return;
        }
      }
    }
    function kill(c) {
      c.alive = false;
      c.op = 0;
      c.body.style.opacity = c.pin.style.opacity = c.line.style.opacity = '0';
      const k = live.indexOf(c);
      if (k >= 0) live.splice(k, 1);
    }
    function place(c, now) {
      const p = g.proj(c.at);
      const age = now - c.born;
      const b = boxAt(c, p);
      let op = Math.min(1, age / FADE, (LIFE - age) / FADE);
      op *= 1 - smooth(1.15, 1.4, g.angle(c.at)); // 转向球背面前先淡出
      op *= clamp((g.W - 8 - (b.x + b.w)) / 40 + 1, 0, 1); // 被转出右边缘时淡出
      c.op = clamp(op, 0, 1);
      if (age >= LIFE || (age > FADE && c.op <= 0.002)) { kill(c); return; }
      c.body.style.transform = `translate3d(${b.x.toFixed(1)}px,${b.y.toFixed(1)}px,0)`;
      c.pin.style.transform = `translate3d(${p[0].toFixed(1)}px,${p[1].toFixed(1)}px,0)`;
      const ex = clamp(p[0], b.x + 18, b.x + b.w - 18);
      const ey = c.below ? b.y : b.y + b.h;
      c.line.setAttribute('x1', p[0].toFixed(1)); c.line.setAttribute('y1', p[1].toFixed(1));
      c.line.setAttribute('x2', ex.toFixed(1)); c.line.setAttribute('y2', ey.toFixed(1));
      c.body.style.opacity = c.pin.style.opacity = c.line.style.opacity = c.op.toFixed(3);
    }
    function draw() {
      const fills = new Map();
      for (const c of live) if (c.alive && c.op > 0.01) fills.set(c.iso, mix(COL.land, COL.strong, Math.max(c.op, 0)));
      g.view([lon, LAT], R, cx, cy);
      paintGlobe(g, { fills, outline: 0.6 });
    }
    function frame(now) {
      raf = 0;
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      // 可见范围里没有能展示的卡时，地球加快转向下一处示例区域；有卡时回到常速
      if (live.length) lastAlive = now;
      const target = now - lastAlive > 2500 ? SPEED * 3.2 : SPEED;
      speed += (target - speed) * Math.min(1, dt / 700);
      lon -= (speed * dt) / 1000;
      g.view([lon, LAT], R, cx, cy);
      if (now >= nextSpawn) { trySpawn(now); nextSpawn = now + 1900; }
      live.slice().forEach(c => place(c, now));
      draw();
      if (onScreen && !document.hidden) raf = requestAnimationFrame(frame);
    }
    function renderStatic() {
      g.view([lon, LAT], R, cx, cy);
      live.slice().forEach(kill);
      const now = performance.now();
      for (let k = 0; k < maxLive; k++) trySpawn(now - FADE);
      live.forEach(c => place(c, now));
      draw();
    }
    const kick = () => {
      if (REDUCE || raf || !onScreen || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    };

    layout();
    if (REDUCE) renderStatic();
    else { nextSpawn = performance.now() + 1200; kick(); }
    new IntersectionObserver(es => { onScreen = es[0].isIntersecting; kick(); }).observe(hero);
    document.addEventListener('visibilitychange', kick);
    // 衬线字体换上后标题变宽，安全区要重算
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { layout(); if (REDUCE) renderStatic(); });
    let rt = 0;
    addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => { layout(); if (REDUCE) renderStatic(); }, 120);
    });
  }

  /* ---------- 首屏输入：照欢迎页的输入框，示例只装资料，不替用户发送 ---------- */

  function initComposer(understanding) {
    const form = $('#heroForm');
    const ta = $('#heroInput');
    const send = $('#heroSend');
    const chips = $('#heroChips');
    const file = $('#heroFile');
    let demo = false;
    let typing = 0;

    const sync = () => { send.disabled = !ta.value.trim() && !chips.children.length; };
    const fit = () => { ta.style.height = 'auto'; ta.style.height = `${Math.min(150, ta.scrollHeight)}px`; };
    function addChip(name) {
      const el = document.createElement('span');
      el.className = 'wc-file';
      el.innerHTML = `${icon('l-file', 'width:15px;height:15px')}<span>${esc(name)}</span><button type="button" aria-label="移除 ${esc(name)}">${icon('l-x', 'width:13px;height:13px')}</button>`;
      el.querySelector('button').addEventListener('click', () => { el.remove(); sync(); ta.focus(); });
      chips.appendChild(el);
      sync();
    }

    $('#heroAttach').addEventListener('click', () => file.click());
    // 只显示文件名，文件不离开浏览器
    file.addEventListener('change', () => {
      Array.from(file.files).forEach(f => addChip(f.name));
      file.value = '';
      demo = false;
    });
    ta.addEventListener('input', () => { demo = false; clearInterval(typing); sync(); fit(); });
    ta.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        if (!send.disabled) form.requestSubmit();
      }
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (send.disabled) return;
      if (demo) {
        go('#understand');
        setTimeout(() => understanding.play(true), REDUCE ? 0 : 700);
        return;
      }
      const m = ta.value.trim().match(/(?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s，。,]*)?/i);
      if (m) $('#wlSite').value = m[0];
      const n = chips.children.length;
      const from = $('#wlFrom');
      from.hidden = false;
      from.textContent = `已带上你在首屏填的${m ? '官网' : '内容'}${n ? `和 ${n} 份文件的名字` : ''}。内测开放时，就从这份资料开始聊。`;
      go('#waitlist');
      setTimeout(() => $('#wlContact').focus({ preventScroll: true }), REDUCE ? 0 : 900);
    });
    $('#heroDemo').addEventListener('click', () => {
      clearInterval(typing);
      chips.textContent = '';
      ta.value = '';
      demo = false;
      sync();
      const text = 'https://shenggu-audio.com';
      const done = () => {
        ['声谷电子 · 产品目录.pdf', '声谷电子 · 产品报价.xlsx'].forEach(addChip);
        demo = true;
        fit();
        ta.focus();
      };
      if (REDUCE) { ta.value = text; done(); return; }
      let i = 0;
      typing = setInterval(() => {
        ta.value = text.slice(0, ++i);
        fit();
        if (i >= text.length) { clearInterval(typing); done(); }
      }, 34);
    });
  }

  /* ---------- 1 理解你的业务：工具调用逐个回放，再给出四段判断 ---------- */

  function initUnderstanding() {
    const root = $('#understand');
    const log = $('#undLog');
    const task = $('#undTask');
    const tools = $('#undTools');
    const taskT = $('#undTaskT');
    const taskSt = $('#undTaskSt');
    const users = $$('[data-u]', root);
    const toolEls = $$('[data-t]', root);
    const secs = $$('[data-s]', root);
    const acts = $$('.und-act', root);
    let timers = [];
    let played = false;
    const at = (ms, fn) => timers.push(setTimeout(fn, REDUCE ? 0 : ms));
    const toBottom = () => log.scrollTo({ top: log.scrollHeight, behavior: REDUCE ? 'auto' : 'smooth' });
    root.classList.add('armed');

    function reset() {
      timers.forEach(clearTimeout);
      timers = [];
      [...users, ...toolEls, ...secs].forEach(el => el.classList.remove('on'));
      toolEls.forEach(el => { el.dataset.st = 'run'; el.classList.remove('open'); });
      task.classList.remove('collapsed');
      tools.style.maxHeight = '';
      taskT.textContent = '读取资料 · 2 份文件与官网';
      taskSt.className = 'st';
      taskSt.innerHTML = '';
      acts.forEach(b => { b.disabled = true; });
      log.scrollTop = 0;
    }
    function play(force) {
      if (played && !force) return;
      played = true;
      reset();
      // 演示节奏：文件与网页并行读取，搜索等读取结果；不是实际服务耗时
      at(150, () => users[0].classList.add('on'));
      at(600, () => { users[1].classList.add('on'); toBottom(); });
      const tool = (i, on, ok, open) => {
        at(on, () => { toolEls[i].classList.add('on'); if (open) toolEls[i].classList.add('open'); toBottom(); });
        at(ok, () => { toolEls[i].dataset.st = 'ok'; toBottom(); });
      };
      tool(0, 900, 2300, false);
      tool(1, 1250, 3300, true);
      tool(2, 1600, 2900, false);
      tool(3, 3600, 5600, true);
      at(6300, () => {
        tools.style.maxHeight = `${tools.scrollHeight}px`;
        void tools.offsetHeight;
        task.classList.add('collapsed');
        taskT.textContent = '工具调用记录';
        taskSt.className = 'st done';
        taskSt.innerHTML = icon('l-check', 'width:15px;height:15px');
      });
      secs.forEach((s, i) => at(6800 + i * 650, () => {
        if (i === 0) users[2].classList.add('on');
        s.classList.add('on');
        toBottom();
      }));
      at(6800 + secs.length * 650 + 200, () => acts.forEach(b => { b.disabled = false; }));
    }
    onceVisible($('#und'), 0.35, () => play());
    return { play };
  }

  /* ---------- 2 发现合适市场：滚动驱动 全球 → 东南亚 → 越南 → 胡志明市 ---------- */

  function initExplore() {
    const track = $('#exTrack');
    const stage = $('#exStage');
    const app = $('#exApp');
    const col = $('#exCol');
    const caps = $$('.ex-cap', stage);
    const ticks = $$('.ex-ticks i', stage);
    const views = $$('.ex-view', app);
    const logs = $$('.ex-log', app);
    const asks = $$('.ex-ask', app);
    const crumb = $('#exCrumb');
    const cur = $('#exCur');
    const lbl = $('#exLbl');
    const N = 4;
    const NAMES = ['全球', '东南亚', '越南', '胡志明市'];
    let step = -1;

    const crumbHTML = i => NAMES.slice(0, i + 1).map((n, k) => `<span class="c">${n}${k ? icon('l-cdown') : ''}</span>`).join(icon('l-cright', '').replace('class="i"', 'class="i sep"'))
      + (i ? `<span class="ibtn">${icon('l-history')}</span>` : '');
    function setStep(i) {
      if (i === step) return;
      step = i;
      caps.forEach(c => c.classList.toggle('on', Number(c.dataset.c) === i));
      ticks.forEach(t => t.classList.toggle('on', Number(t.dataset.t) <= i));
      views.forEach(v => v.classList.toggle('on', Number(v.dataset.v) === i));
      logs.forEach(l => l.classList.toggle('on', Number(l.dataset.l) === i));
      asks.forEach(a => a.classList.toggle('on', Number(a.dataset.a) === i));
      crumb.innerHTML = crumbHTML(i);
      cur.textContent = `当前查看 · ${NAMES[i]}`;
      if (i < 3) lbl.textContent = NAMES[i];
      app.classList.toggle('city', i === 3);
    }
    function progress() {
      const r = track.getBoundingClientRect();
      const total = r.height - stage.offsetHeight;
      return clamp(-r.top / total, 0, 1) * (N - 1);
    }
    /** 每一段先停留读字，再进下一层：前 28% 不动，中间 55% 过渡 */
    function camera(s) {
      const b = clamp(Math.ceil(s), 1, N - 1);
      const a = b - 1;
      return { a, b, t: easeInOut(clamp((s - a - 0.28) / 0.55, 0, 1)) };
    }
    setStep(0);
    if (!GEO) {
      const tick = () => { const { a, b, t } = camera(progress()); setStep(t > 0.5 ? b : a); };
      addEventListener('scroll', tick, { passive: true });
      tick();
      return;
    }

    const g = makeGlobe($('.ex-map', app));
    const city = $('#exCity');
    const SEA = ['704', '764', '360'];
    const WEU = ['276', '250', '528'];
    const NAM = ['840', '124', '484'];
    // 镜头：区域方向 → 东南亚 → 越南 → 胡志明市（城市层由示意街区图接替地球）
    const KF = [
      { c: [52, 26], k: 1 },
      { c: [109, 9], k: 2.5 },
      { c: [106.4, 15.6], k: 5.3 },
      { c: [106.7, 10.8], k: 9 },
    ];
    const FILLS = [
      new Map([...SEA, ...WEU, ...NAM].map(id => [id, COL.rec])),
      new Map(SEA.map(id => [id, COL.strong])),
      new Map([['704', COL.strong], ['764', COL.rec], ['360', COL.rec]]),
      new Map([['704', COL.strong]]),
    ];
    const PINS = [null, [107.5, 16], [106.7, 10.8], [106.7, 10.8]];
    let foc = { x: 0, y: 0, w: 1, h: 1 }, R0 = 200;

    function drawCity() {
      // 城市层的示意街区图：web-next 没配地图 Key 时就是这样一张「城市分布示意 · 非真实地址」
      const W = Math.round(g.W), H = Math.round(g.H);
      const rnd = mulberry32(11);
      let s = `<rect width="${W}" height="${H}" fill="#EEF1EB"/>`;
      for (let i = 0; i < 9; i++) s += `<rect x="${(rnd() * W).toFixed(0)}" y="${(rnd() * H).toFixed(0)}" width="${(50 + rnd() * 110).toFixed(0)}" height="${(36 + rnd() * 80).toFixed(0)}" rx="12" fill="#DCEBD3"/>`;
      s += `<path d="M -40 ${H * 0.16} C ${W * 0.16} ${H * 0.02}, ${W * 0.14} ${H * 0.62}, ${W * 0.36} ${H * 0.52} S ${W * 0.62} ${H * 0.98}, ${W + 40} ${H * 0.8}" fill="none" stroke="#AAD3EA" stroke-width="30" stroke-linecap="round"/>`;
      s += '<g stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" opacity=".95">';
      for (let x = -H; x < W + H; x += 46 + rnd() * 30) s += `<path d="M ${x.toFixed(0)} ${H} L ${(x + H * 0.42).toFixed(0)} 0"/>`;
      for (let y = 0; y < H + W * 0.3; y += 40 + rnd() * 28) s += `<path d="M 0 ${y.toFixed(0)} L ${W} ${(y - W * 0.22).toFixed(0)}"/>`;
      s += '</g><g fill="none" stroke-linecap="round">';
      const majors = [`M 0 ${H * 0.72} C ${W * 0.3} ${H * 0.6}, ${W * 0.5} ${H * 0.4}, ${W} ${H * 0.34}`, `M ${W * 0.16} 0 C ${W * 0.2} ${H * 0.4}, ${W * 0.3} ${H * 0.7}, ${W * 0.28} ${H}`];
      majors.forEach(d => { s += `<path d="${d}" stroke="#E6DCC2" stroke-width="12"/><path d="${d}" stroke="#FFF6DA" stroke-width="8"/>`; });
      s += '</g>';
      const pts = [[0.42, 0.42], [0.66, 0.3], [0.56, 0.6]];
      pts.forEach(([px, py], i) => {
        const x = foc.x + foc.w * px, y = foc.y + foc.h * py;
        s += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle r="17" fill="${i ? 'rgba(31,111,92,.82)' : '#1F6F5C'}" stroke="#fff" stroke-width="3"/><text y="5" text-anchor="middle" font-size="14" font-weight="600" fill="#fff" font-family="-apple-system,PingFang SC,sans-serif">${i + 1}</text></g>`;
      });
      city.setAttribute('viewBox', `0 0 ${W} ${H}`);
      city.innerHTML = s;
    }
    function layout() {
      g.resize();
      const ar = app.getBoundingClientRect();
      const cr = col.getBoundingClientRect();
      foc = { x: cr.left - ar.left, y: cr.top - ar.top, w: cr.width, h: cr.height };
      R0 = Math.max(70, Math.min(foc.h * 0.6, foc.w * 1.35));
      drawCity();
    }
    let raf = 0;
    let active = false;
    function frame(now) {
      raf = 0;
      const { a, b, t } = camera(progress());
      setStep(t > 0.5 ? b : a);
      const A = KF[a], B = KF[b];
      const k = Math.exp(lerp(Math.log(A.k), Math.log(B.k), t));
      g.view(d3.geoInterpolate(A.c, B.c)(t), R0 * k, foc.x + foc.w / 2, foc.y + foc.h * (foc.w < 400 && foc.h < 260 ? 0.5 : 0.46));
      const fills = new Map();
      for (const id of new Set([...FILLS[a].keys(), ...FILLS[b].keys()])) {
        fills.set(id, mix(FILLS[a].get(id) || COL.land, FILLS[b].get(id) || COL.land, t));
      }
      paintGlobe(g, { fills, grat: lerp([1, 0.7, 0.45, 0.3][a], [1, 0.7, 0.45, 0.3][b], t), outline: 0.7 });
      for (let i = 1; i < 3; i++) {
        const wgt = (a === i ? 1 - t : 0) + (b === i ? t : 0);
        if (PINS[i]) paintPin(g, PINS[i], wgt, now);
      }
      if (active && !document.hidden) raf = requestAnimationFrame(frame);
    }
    const kick = () => { if (active && !document.hidden && !raf) raf = requestAnimationFrame(frame); };
    layout();
    new IntersectionObserver(es => { active = es[0].isIntersecting; kick(); }, { rootMargin: '120px 0px' }).observe(track);
    document.addEventListener('visibilitychange', kick);
    let rt = 0;
    addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => { layout(); kick(); }, 120);
    });
  }

  /* ---------- 3 找到目标客户：公司页 / 人的页面是工作台里的两个标签 ---------- */

  function initAccount() {
    const root = $('#acc');
    const tabs = $$('.k-tab[data-rec]', root);
    const recs = $$('.rec', root);
    const cur = $('#accCur');
    const CUR = { co: '当前查看 · Lotus Sound', pe: '当前查看 · Alex Morgan · Lotus Sound', biz: '当前查看 · 声谷电子' };
    function show(id) {
      tabs.forEach(t => { const on = t.dataset.rec === id; t.classList.toggle('on', on); t.setAttribute('aria-selected', String(on)); });
      recs.forEach(r => { r.hidden = r.dataset.rec !== id; });
      root.classList.toggle('biz', id === 'biz');
      cur.textContent = CUR[id];
    }
    // 我的业务：字段就地改；改过的值在标签旁标出用户修改，原来的来源按钮不动
    root.addEventListener('click', e => {
      const ed = e.target.closest('.bz-ed');
      if (!ed) return;
      const b = $('b', ed.closest('.bz-row'));
      const before = b.textContent;
      b.contentEditable = 'true';
      b.focus();
      getSelection().selectAllChildren(b);
      const done = () => {
        b.contentEditable = 'false';
        b.textContent = b.textContent.trim() || before;
        const label = $('span', b.parentElement);
        if (b.textContent !== before && !$('svg', label)) {
          label.insertAdjacentHTML('beforeend', icon('l-pencil'));
          label.title = '你改过这个值，原始来源仍保留';
        }
        b.removeEventListener('keydown', key);
      };
      const key = ev => {
        if (ev.key === 'Enter' && !ev.isComposing) { ev.preventDefault(); b.blur(); }
        if (ev.key === 'Escape') { b.textContent = before; b.blur(); }
      };
      b.addEventListener('keydown', key);
      b.addEventListener('blur', done, { once: true });
    });
    root.addEventListener('click', e => {
      const t = e.target.closest('.k-tab[data-rec]');
      if (t) { show(t.dataset.rec); return; }
      if (e.target.closest('[data-open-pe]')) { show('pe'); return; }
      if (e.target.closest('[data-open-co]')) { show('co'); return; }
      const a = e.target.closest('.rec-anc button');
      if (a) {
        const rec = a.closest('.rec');
        const sec = $(`#${a.dataset.to}`, rec);
        const anc = $('.rec-anc', rec);
        // 点了哪段就亮哪段：末尾几段滚不到顶，不能让滚动位置把它改成最后一段
        rec.lock = a;
        rec.scrollTo({ top: sec.offsetTop - anc.offsetHeight + 1, behavior: REDUCE ? 'auto' : 'smooth' });
        $$('button', anc).forEach(b => b.classList.toggle('on', b === a));
      }
    });
    // 滚动时锚点跟着当前段走；用户自己动了滚轮或手指，才解除点击时的锁定
    recs.forEach(rec => {
      const anc = $('.rec-anc', rec);
      if (!anc) return; // 我的业务没有锚点
      const btns = $$('button', anc);
      const unlock = () => { rec.lock = null; };
      // pointerdown 覆盖拖滚动条；点锚点时 pointerdown 先于 click，锁会在 click 里重新挂上
      ['wheel', 'touchmove', 'keydown', 'pointerdown'].forEach(t => rec.addEventListener(t, unlock, { passive: true }));
      rec.addEventListener('scroll', () => {
        if (rec.lock) return;
        const y = rec.scrollTop + anc.offsetHeight + 24;
        let on = btns[0];
        for (const b of btns) if ($(`#${b.dataset.to}`, rec).offsetTop <= y) on = b;
        if (rec.scrollTop + rec.clientHeight >= rec.scrollHeight - 4) on = btns[btns.length - 1];
        btns.forEach(b => b.classList.toggle('on', b === on));
      }, { passive: true });
    });
    $('#followBtn').addEventListener('click', e => {
      const b = e.currentTarget;
      const on = !b.classList.contains('on');
      b.classList.toggle('on', on);
      $('span', b).textContent = on ? '已关注' : '关注';
    });
    // 默认停在信号段：这一节要讲的就是信号
    onceVisible(root, 0.3, () => {
      setTimeout(() => $('#recCo .rec-anc button[data-to="co-sig"]').click(), REDUCE ? 0 : 900);
    });
  }

  /* ---------- 来源：沙箱浏览器打开网页，滚到摘录并用荧光笔划出 ---------- */

  function initSource() {
    const frame = $('#srcx');
    const page = $('#cwPage');
    const mark = $('#cwMark');
    const view = $('.cw-view', frame);
    let timers = [];
    const at = (ms, fn) => timers.push(setTimeout(fn, REDUCE ? 0 : ms));
    function aim() {
      const target = Math.max(0, mark.offsetTop - view.clientHeight * 0.4);
      page.style.setProperty('--scroll', `-${Math.round(target)}px`);
    }
    function play() {
      timers.forEach(clearTimeout);
      timers = [];
      frame.classList.add('reset');
      frame.classList.remove('live', 'scrolled', 'found');
      void frame.offsetWidth;
      frame.classList.remove('reset');
      // 冷启动时沙箱要十几秒；示例里缩短成一秒多
      at(1100, () => { frame.classList.add('live'); aim(); });
      at(1500, () => frame.classList.add('scrolled'));
      at(4200, () => frame.classList.add('found'));
    }
    onceVisible(frame, 0.4, play);
    $('#srcReplay').addEventListener('click', play);
    addEventListener('resize', () => { if (frame.classList.contains('live')) aim(); });
  }

  /* ---------- 4 准备联系与跟进：客户工作区表格，任务列逐格查 ---------- */

  function initCrm() {
    const frame = $('#crmFrame');
    const tbody = $('#crmRows');
    const prog = $('#dmProg');
    // 公司名、近期信号、采购决策人都来自 web-next 的示例客户表；「查询失败」也是它会出现的样子
    const PROFILES = [
      ['09-18 准备扩充便携音频系列', 'Alex Morgan · 产品采购负责人'],
      ['09-16 新增消费电子渠道合作岗位', 'Jamie Chen · 品类经理'],
    ];
    const ROWS = [
      ['Atelier Son', 0], ['Auralis Audio', 0], ['Harbor Sound', 0], ['Hudson Audio', 0],
      ['Lotus Sound', 0, { fol: true, next: '寄两套 A6 样品', date: '2026-10-08', pri: '高' }],
      ['Luna Audio', 0], ['Maple Tone', 0, { fail: true }], ['Nusa Sound', 0], ['Pacific Pulse', 0],
      ['Red River Audio', 0], ['Siam Pulse', 0], ['Archipelago Devices', 1, { fail: true }],
      ['Centro Sound Supply', 1], ['Chao Audio Trade', 1], ['Delta Sound Supply', 1], ['Eastline Sound', 1],
    ];
    tbody.innerHTML = ROWS.map(([name, p, x = {}], i) => {
      const dm = x.fail ? `<span class="fail">${icon('l-alert')}查询失败</span>` : esc(PROFILES[p][1]);
      return `<tr><td class="cb"><span class="box"></span></td><td class="n">${i + 1}</td><td class="nm">${esc(name)}</td>`
        + `<td class="fol">${x.fol ? icon('l-bookmark') : ''}</td><td>${PROFILES[p][0]}</td>`
        + `<td class="dm" data-st="idle"><span class="q"><span class="spin"></span>查询中</span><span class="v">${dm}</span></td>`
        + `<td><span class="chip">待评估</span></td><td>${x.next || ''}</td><td>${x.date || ''}</td><td>${x.pri || '普通'}</td></tr>`;
    }).join('');
    const cells = $$('td.dm', tbody);
    onceVisible(frame, 0.35, () => {
      const at = (ms, fn) => setTimeout(fn, REDUCE ? 0 : ms);
      cells.forEach((c, i) => {
        at(500 + i * 140, () => { c.dataset.st = 'run'; });
        at(1300 + i * 140, () => { c.dataset.st = 'done'; prog.style.width = `${Math.round(((i + 1) / cells.length) * 100)}%`; });
      });
      at(1300 + cells.length * 140 + 600, () => { prog.style.width = '0'; });
    });
  }

  /* ---------- 内测表单 ---------- */

  function initWaitlist() {
    const form = $('#wlForm');
    const err = $('#wlErr');
    const ok = $('#wlOk');
    const contact = $('#wlContact');
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!contact.value.trim()) {
        err.hidden = false;
        err.textContent = '请填写微信号或邮箱';
        contact.focus();
        return;
      }
      // 原型不发请求；正式版沿用现有 POST /api/waitlist（contact / company / name），官网并进 company
      form.hidden = true;
      ok.hidden = false;
    });
    contact.addEventListener('input', () => { err.hidden = true; });
  }

  initHero();
  const understanding = initUnderstanding();
  initComposer(understanding);
  initExplore();
  initAccount();
  initSource();
  initCrm();
  initWaitlist();
})();
