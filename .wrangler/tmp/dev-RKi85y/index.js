var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/config/clinic.ts
var lunch = { lunchStart: "12:30", lunchEnd: "14:00" };
var lateDay = { open: "09:30", close: "20:00", night: true, ...lunch };
var midDay = { open: "09:30", close: "19:00", ...lunch };
var clinic = {
  name: "\uC2E0\uC601\uD1B5\uBD80\uBD80\uD55C\uC758\uC6D0",
  phone: "031-273-0061",
  address: "\uC218\uC6D0\uC2DC \uC601\uD1B5\uAD6C \uD0DC\uC7A5\uB85C 84, \uB9DD\uD3EC\uD504\uB77C\uC790 2\uCE35",
  mapQuery: "\uC218\uC6D0\uC2DC \uC601\uD1B5\uAD6C \uD0DC\uC7A5\uB85C 84 \uB9DD\uD3EC\uD504\uB77C\uC790",
  // 진료시간: 월·수·금 20시, 화·목 19시, 토 13시(점심 없음). 시작 09:30.
  // 요일별 진료시간 (0=일요일 … 6=토요일). null 이면 정기 휴진
  hours: [null, lateDay, midDay, lateDay, midDay, lateDay, { open: "09:30", close: "13:00" }],
  slotMinutes: 30,
  // 예약 간격
  capacityPerSlot: 2,
  // 같은 시간에 받을 수 있는 인원
  bookingDays: 14,
  // 오늘부터 며칠 앞까지 예약 가능
  // TODO 오시는 길 안내: 문장을 추가하면 홈페이지·앱에 자동으로 나타납니다. 비워 두면 숨겨집니다.
  directions: {
    parking: [],
    subway: [],
    bus: []
  },
  // image 에 '/images/acu.jpg' 처럼 public/images 안의 사진 경로를 넣으면 사진이 표시됩니다.
  services: [
    { id: "acu", title: "\uCE68 \uCE58\uB8CC", summary: "\uC544\uD508 \uACF3\uACFC \uBAB8\uC758 \uADE0\uD615\uC744 \uB9DE\uCDB0 \uD1B5\uC99D\uC744 \uC904\uC5EC \uB4DC\uB9BD\uB2C8\uB2E4.", points: ["\uD5C8\uB9AC\xB7\uBB34\uB98E\xB7\uC5B4\uAE68 \uD1B5\uC99D", "\uB450\uD1B5, \uC5B4\uC9C0\uB7FC", "\uC77C\uD68C\uC6A9 \uBA78\uADE0 \uCE68\uB9CC \uC0AC\uC6A9"], image: "/images/acu.jpg" },
    { id: "yakchim", title: "\uC57D\uCE68 \uCE58\uB8CC", summary: "\uD55C\uC57D \uC131\uBD84\uC744 \uC815\uC81C\uD55C \uC57D\uC561\uC744 \uC544\uD508 \uBD80\uC704\uC640 \uD608\uC790\uB9AC\uC5D0 \uC8FC\uC785\uD574 \uC5FC\uC99D\uACFC \uD1B5\uC99D\uC744 \uB2E4\uC2A4\uB9BD\uB2C8\uB2E4.", points: ["\uD5C8\uB9AC\xB7\uBB34\uB98E\xB7\uC5B4\uAE68 \uD1B5\uC99D", "\uADFC\uC721 \uBB49\uCE68, \uB9CC\uC131 \uD1B5\uC99D", "\uC99D\uC0C1\uACFC \uCCB4\uC9C8\uC5D0 \uB9DE\uB294 \uC57D\uCE68 \uC120\uD0DD"], image: "/images/yakchim.svg" },
    { id: "herb", title: "\uD55C\uC57D", summary: "\uCCB4\uC9C8\uACFC \uC99D\uC0C1\uC5D0 \uB9DE\uAC8C \uD55C \uBD84 \uD55C \uBD84 \uC9C0\uC5B4 \uB4DC\uB9BD\uB2C8\uB2E4.", points: ["\uBCF4\uC57D, \uD53C\uB85C \uD68C\uBCF5", "\uC18C\uD654\xB7\uC218\uBA74 \uBB38\uC81C", "\uBCF5\uC6A9\uC774 \uB05D\uB0A0 \uB54C\uCBE4 \uC548\uB0B4\uD574 \uB4DC\uB824\uC694"], image: "/images/herb.jpg" },
    { id: "diet", title: "\uB2E4\uC774\uC5B4\uD2B8", summary: "\uBB34\uB9AC\uD55C \uAD76\uAE30 \uC5C6\uC774 \uCCB4\uC9C8\uC5D0 \uB9DE\uCDB0 \uCC9C\uCC9C\uD788 \uAD00\uB9AC\uD569\uB2C8\uB2E4.", points: ["\uCCB4\uC9C8 \uC0C1\uB2F4", "\uC2DD\uC0AC \uC2B5\uAD00 \uC548\uB0B4", "\uD55C\uC57D + \uCE68 \uBCD1\uD589"], image: "/images/diet.jpg" }
  ],
  // 원장 칼럼 '예시 글'입니다. 처음 한 번만 보이는 샘플이에요.
  // 칼럼은 이 파일이 아니라 관리자 화면(/admin → 칼럼 탭)에서 쓰고 지우고 고칩니다.
  sampleColumns: [
    { date: "2026-11-20", title: "\uD658\uC808\uAE30, \uBAB8\uC774 \uBCF4\uB0B4\uB294 \uC2E0\uD638 \uC77D\uAE30", body: "\uC77C\uAD50\uCC28\uAC00 \uD070 \uACC4\uC808\uC5D0\uB294 \uBAB8\uC774 \uC801\uC751\uD558\uB290\uB77C \uD3C9\uC18C\uBCF4\uB2E4 \uB9CE\uC740 \uC5D0\uB108\uC9C0\uB97C \uC501\uB2C8\uB2E4.\n\n\uCDA9\uBD84\uD55C \uC218\uBA74, \uB530\uB73B\uD55C \uBB3C, \uAC00\uBCBC\uC6B4 \uAC77\uAE30\uBD80\uD130 \uC2DC\uC791\uD574 \uBCF4\uC138\uC694. \uC99D\uC0C1\uC774 \uC624\uB798 \uAC00\uBA74 \uC9C4\uB8CC\uB97C \uBC1B\uC544 \uBCF4\uC2DC\uAE38 \uAD8C\uD569\uB2C8\uB2E4." },
    { date: "2026-11-10", title: "\uD5C8\uB9AC \uD1B5\uC99D, \uC624\uB798 \uC549\uC544 \uACC4\uC2E0 \uBD84\uAED8", body: "\uAC19\uC740 \uC790\uC138\uAC00 \uAE38\uC5B4\uC9C0\uBA74 \uADFC\uC721\uC774 \uAD73\uACE0 \uD1B5\uC99D\uC774 \uBC18\uBCF5\uB429\uB2C8\uB2E4. 50\uBD84 \uC549\uC558\uB2E4\uBA74 3\uBD84\uC740 \uC77C\uC5B4\uB098 \uBAB8\uC744 \uD480\uC5B4 \uC8FC\uC138\uC694.\n\n\uC0DD\uD65C \uC2B5\uAD00\uC744 \uBC14\uB85C\uC7A1\uC73C\uBA74\uC11C \uD544\uC694\uD55C \uCE58\uB8CC\uB97C \uBCD1\uD589\uD558\uBA74 \uD68C\uBCF5\uC774 \uBE68\uB77C\uC9D1\uB2C8\uB2E4." }
  ],
  // TODO 원장님 정보: 아래를 채우면 의료진 소개에 나타납니다. 비워 두면 해당 줄은 숨겨집니다.
  doctor: {
    name: "\uC6D0\uC7A5",
    photo: "",
    // 예: '/images/doctor.jpg' (public/images 폴더에 사진을 넣으세요)
    title: "",
    career: [],
    // 예: ['OO대학교 한의과대학 졸업', '전 OO한방병원 과장']
    philosophy: ""
  },
  // 진료시간 등 샘플 값이 남아 있는 동안 홈페이지 아래에 "일부 정보 준비 중" 문구를 보여줍니다. 다 채우면 false
  showPrepNotice: true
};

// src/lib/date.ts
function fromISO(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
__name(fromISO, "fromISO");
function toMin(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
__name(toMin, "toMin");
function fromMin(n) {
  return `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
}
__name(fromMin, "fromMin");

// src/lib/schedule.ts
function daySlots(iso) {
  const h = clinic.hours[fromISO(iso).getDay()];
  if (!h) return [];
  const out = [];
  const end = toMin(h.close) - clinic.slotMinutes;
  for (let t = toMin(h.open); t <= end; t += clinic.slotMinutes) {
    if (h.lunchStart && h.lunchEnd && t >= toMin(h.lunchStart) && t < toMin(h.lunchEnd)) continue;
    out.push(fromMin(t));
  }
  return out;
}
__name(daySlots, "daySlots");

// worker/index.ts
var json = /* @__PURE__ */ __name((data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } }), "json");
var fail = /* @__PURE__ */ __name((msg, status = 400) => json({ error: msg }, status), "fail");
var KST = "Asia/Seoul";
function kstParts(d = /* @__PURE__ */ new Date()) {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: KST, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  return f;
}
__name(kstParts, "kstParts");
var addDaysISO = /* @__PURE__ */ __name((iso, n) => {
  const [y, m, d] = iso.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
}, "addDaysISO");
var isISO = /* @__PURE__ */ __name((s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s), "isISO");
var isTime = /* @__PURE__ */ __name((s) => typeof s === "string" && /^\d{2}:\d{2}$/.test(s), "isTime");
var normPhone = /* @__PURE__ */ __name((p) => String(p ?? "").replace(/\D/g, ""), "normPhone");
var validPhone = /* @__PURE__ */ __name((p) => /^01[016789]\d{7,8}$/.test(p), "validPhone");
var ready = null;
function ensureSchema(db) {
  ready ??= db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS reservations (id TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT NOT NULL, date TEXT NOT NULL, time TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL, care_label TEXT, care_end TEXT)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_res_date ON reservations(date, time)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_res_phone ON reservations(phone)"),
    db.prepare("CREATE TABLE IF NOT EXISTS closed_days (date TEXT PRIMARY KEY, reason TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS notices (id TEXT PRIMARY KEY, text TEXT NOT NULL, created_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS columns (id TEXT PRIMARY KEY, title TEXT NOT NULL, body TEXT NOT NULL, date TEXT NOT NULL, created_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS notify_off (phone TEXT PRIMARY KEY)"),
    db.prepare("CREATE TABLE IF NOT EXISTS outbox (id TEXT PRIMARY KEY, key TEXT NOT NULL, kind TEXT NOT NULL, to_phone TEXT NOT NULL, channel TEXT NOT NULL, text TEXT NOT NULL, at TEXT NOT NULL, status TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS hits (ip TEXT NOT NULL, at INTEGER NOT NULL)")
  ]).then(() => void 0);
  return ready;
}
__name(ensureSchema, "ensureSchema");
var certCache = null;
var b64 = /* @__PURE__ */ __name((s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=")), (c) => c.charCodeAt(0)), "b64");
async function isAdmin(req, env) {
  const team = env.ACCESS_TEAM_DOMAIN;
  const aud = env.ACCESS_AUD;
  if (!team || !aud) return false;
  const token = req.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) return false;
  const [h, p, s] = token.split(".");
  if (!h || !p || !s) return false;
  try {
    const head = JSON.parse(new TextDecoder().decode(b64(h)));
    const body = JSON.parse(new TextDecoder().decode(b64(p)));
    if (head.alg !== "RS256") return false;
    if (body.iss !== `https://${team}`) return false;
    const audOk = Array.isArray(body.aud) ? body.aud.includes(aud) : body.aud === aud;
    if (!audOk || body.exp * 1e3 < Date.now()) return false;
    if (!certCache || Date.now() - certCache.at > 36e5) {
      const r = await fetch(`https://${team}/cdn-cgi/access/certs`);
      certCache = { at: Date.now(), keys: (await r.json()).keys };
    }
    const jwk = certCache.keys.find((k) => k.kid === head.kid);
    if (!jwk) return false;
    const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    return await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64(s), new TextEncoder().encode(`${h}.${p}`));
  } catch {
    return false;
  }
}
__name(isAdmin, "isAdmin");
async function limited(db, req) {
  const ip = req.headers.get("CF-Connecting-IP") ?? "unknown";
  const now = Date.now();
  await db.prepare("DELETE FROM hits WHERE at < ?").bind(now - 36e5).run();
  const row = await db.prepare("SELECT COUNT(*) AS n FROM hits WHERE ip = ? AND at > ?").bind(ip, now - 6e5).first();
  if ((row?.n ?? 0) >= 20) return true;
  await db.prepare("INSERT INTO hits (ip, at) VALUES (?, ?)").bind(ip, now).run();
  return false;
}
__name(limited, "limited");
var toRes = /* @__PURE__ */ __name((r) => ({
  id: r.id,
  name: r.name,
  phone: r.phone,
  date: r.date,
  time: r.time,
  status: r.status,
  createdAt: r.created_at,
  ...r.care_label && r.care_end ? { nextCare: { label: r.care_label, endDate: r.care_end } } : {}
}), "toRes");
var uid = /* @__PURE__ */ __name(() => crypto.randomUUID().replace(/-/g, "").slice(0, 16), "uid");
async function readJson(req) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}
__name(readJson, "readJson");
var str = /* @__PURE__ */ __name((v, max) => typeof v === "string" ? v.trim().slice(0, max) : "", "str");
async function used(db, date, time, ignoreId) {
  const r = await db.prepare("SELECT COUNT(*) AS n FROM reservations WHERE status='confirmed' AND date=? AND time=? AND id<>?").bind(date, time, ignoreId ?? "").first();
  return r?.n ?? 0;
}
__name(used, "used");
async function slotError(db, date, time, ignoreId) {
  const today = kstParts();
  if (date < today || date > addDaysISO(today, clinic.bookingDays)) return "\uC608\uC57D\uD560 \uC218 \uC5C6\uB294 \uB0A0\uC9DC\uC608\uC694.";
  if (await db.prepare("SELECT 1 AS x FROM closed_days WHERE date=?").bind(date).first()) return "\uADF8\uB0A0\uC740 \uC26C\uB294 \uB0A0\uC774\uC5D0\uC694.";
  if (!daySlots(date).includes(time)) return "\uC608\uC57D\uD560 \uC218 \uC5C6\uB294 \uC2DC\uAC04\uC774\uC5D0\uC694.";
  if (await used(db, date, time, ignoreId) >= clinic.capacityPerSlot) return "\uBC29\uAE08 \uB2E4\uB978 \uBD84\uC774 \uC608\uC57D\uD558\uC168\uC5B4\uC694. \uB2E4\uB978 \uC2DC\uAC04\uC744 \uACE8\uB77C \uC8FC\uC138\uC694.";
  return null;
}
__name(slotError, "slotError");
var worker_default = {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(req);
    try {
      await ensureSchema(env.DB);
      return await route(req, env, url);
    } catch {
      return fail("\uC11C\uBC84\uC5D0 \uBB38\uC81C\uAC00 \uC0DD\uACBC\uC5B4\uC694. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.", 500);
    }
  }
};
async function route(req, env, url) {
  const db = env.DB;
  const m = req.method;
  const parts = url.pathname.split("/").filter(Boolean).slice(1);
  const [a, b, c] = parts;
  const admin = a === "admin";
  if (admin && !await isAdmin(req, env)) return fail("\uAD00\uB9AC\uC790 \uB85C\uADF8\uC778\uC774 \uD544\uC694\uD574\uC694.", 403);
  if (!admin && m !== "GET" && await limited(db, req)) return fail("\uC694\uCCAD\uC774 \uB108\uBB34 \uB9CE\uC544\uC694. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.", 429);
  if (a === "closed-days" && m === "GET") {
    const rows = (await db.prepare("SELECT date, reason FROM closed_days ORDER BY date").all()).results;
    return json(Object.fromEntries(rows.map((r) => [r.date, r.reason])));
  }
  if (a === "availability" && m === "GET") {
    const date = url.searchParams.get("date");
    if (!isISO(date)) return fail("\uB0A0\uC9DC\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC544\uC694.");
    if (await db.prepare("SELECT 1 AS x FROM closed_days WHERE date=?").bind(date).first()) return json({});
    const rows = (await db.prepare("SELECT time, COUNT(*) AS n FROM reservations WHERE status='confirmed' AND date=? GROUP BY time").bind(date).all()).results;
    const cnt = new Map(rows.map((r) => [r.time, r.n]));
    const out = {};
    for (const t of daySlots(date)) out[t] = Math.max(0, clinic.capacityPerSlot - (cnt.get(t) ?? 0));
    return json(out);
  }
  if (a === "reservations" && !b && m === "POST") {
    const body = await readJson(req);
    const name = str(body?.name, 30);
    const phone = normPhone(body?.phone);
    if (!name) return fail("\uC774\uB984\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.");
    if (!validPhone(phone)) return fail("\uC804\uD654\uBC88\uD638\uB97C \uD655\uC778\uD574 \uC8FC\uC138\uC694.");
    if (!isISO(body?.date) || !isTime(body?.time)) return fail("\uB0A0\uC9DC\uC640 \uC2DC\uAC04\uC744 \uD655\uC778\uD574 \uC8FC\uC138\uC694.");
    const pending = await db.prepare("SELECT COUNT(*) AS n FROM reservations WHERE phone=? AND status='confirmed' AND date>=?").bind(phone, kstParts()).first();
    if ((pending?.n ?? 0) >= 5) return fail("\uC608\uC815\uB41C \uC608\uC57D\uC774 \uB108\uBB34 \uB9CE\uC544\uC694. \uC804\uD654\uB85C \uBB38\uC758\uD574 \uC8FC\uC138\uC694.");
    const err = await slotError(db, body.date, body.time);
    if (err) return fail(err, 409);
    const row = { id: uid(), name, phone, date: body.date, time: body.time, status: "confirmed", created_at: (/* @__PURE__ */ new Date()).toISOString(), care_label: null, care_end: null };
    await db.prepare("INSERT INTO reservations (id,name,phone,date,time,status,created_at) VALUES (?,?,?,?,?,?,?)").bind(row.id, name, phone, row.date, row.time, "confirmed", row.created_at).run();
    return json(toRes(row));
  }
  if (a === "reservations" && b === "lookup" && m === "GET") {
    const name = str(url.searchParams.get("name"), 30);
    const phone = normPhone(url.searchParams.get("phone"));
    if (!name || !validPhone(phone)) return json([]);
    const rows = (await db.prepare("SELECT * FROM reservations WHERE phone=? AND name=? ORDER BY date, time").bind(phone, name).all()).results;
    return json(rows.map(toRes));
  }
  if (a === "reservations" && b && c === "cancel" && m === "POST") {
    const r = await db.prepare("SELECT * FROM reservations WHERE id=?").bind(b).first();
    if (!r) return fail("\uC608\uC57D\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC5B4\uC694.", 404);
    await db.prepare("UPDATE reservations SET status='cancelled' WHERE id=?").bind(b).run();
    return json(toRes({ ...r, status: "cancelled" }));
  }
  if (a === "reservations" && b && !c && m === "PATCH") {
    const body = await readJson(req);
    if (!isISO(body?.date) || !isTime(body?.time)) return fail("\uB0A0\uC9DC\uC640 \uC2DC\uAC04\uC744 \uD655\uC778\uD574 \uC8FC\uC138\uC694.");
    const r = await db.prepare("SELECT * FROM reservations WHERE id=?").bind(b).first();
    if (!r) return fail("\uC608\uC57D\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC5B4\uC694.", 404);
    const err = await slotError(db, body.date, body.time, b);
    if (err) return fail(err, 409);
    await db.prepare("UPDATE reservations SET date=?, time=?, status='confirmed' WHERE id=?").bind(body.date, body.time, b).run();
    return json(toRes({ ...r, date: body.date, time: body.time, status: "confirmed" }));
  }
  if (a === "notices" && m === "GET") {
    const rows = (await db.prepare("SELECT * FROM notices ORDER BY created_at DESC LIMIT 20").all()).results;
    return json(rows.map((r) => ({ id: r.id, text: r.text, createdAt: r.created_at })));
  }
  if (a === "columns" && m === "GET") {
    const rows = (await db.prepare("SELECT * FROM columns ORDER BY created_at DESC LIMIT 200").all()).results;
    return json(rows.map((r) => ({ id: r.id, title: r.title, body: r.body, date: r.date, createdAt: r.created_at })));
  }
  if (a === "notify" && m === "GET") {
    const phone = normPhone(url.searchParams.get("phone"));
    const off = await db.prepare("SELECT 1 AS x FROM notify_off WHERE phone=?").bind(phone).first();
    return json({ on: !off });
  }
  if (a === "notify" && m === "PUT") {
    const body = await readJson(req);
    const phone = normPhone(body?.phone);
    if (!validPhone(phone)) return fail("\uC804\uD654\uBC88\uD638\uB97C \uD655\uC778\uD574 \uC8FC\uC138\uC694.");
    if (body?.on) await db.prepare("DELETE FROM notify_off WHERE phone=?").bind(phone).run();
    else await db.prepare("INSERT OR IGNORE INTO notify_off (phone) VALUES (?)").bind(phone).run();
    return json({ ok: true });
  }
  if (a === "outbox" && m === "POST") {
    const body = await readJson(req);
    const to = normPhone(body?.to);
    if (!validPhone(to) || !body?.text) return fail("\uBCF4\uB0BC \uB0B4\uC6A9\uC744 \uD655\uC778\uD574 \uC8FC\uC138\uC694.");
    await db.prepare("INSERT INTO outbox (id,key,kind,to_phone,channel,text,at,status) VALUES (?,?,?,?,?,?,?,?)").bind(uid(), str(body.key, 100), str(body.kind, 20), to, str(body.channel, 20) || "alimtalk", str(body.text, 500), (/* @__PURE__ */ new Date()).toISOString(), "preview").run();
    return json({ ok: true });
  }
  if (admin) {
    const [, x, y, z] = parts;
    if (x === "reservations" && !y && m === "GET") {
      const rows = (await db.prepare("SELECT * FROM reservations ORDER BY date, time").all()).results;
      return json(rows.map(toRes));
    }
    if (x === "reservations" && y && z === "next-care" && m === "PUT") {
      const care = await readJson(req);
      if (care && isISO(care.endDate)) await db.prepare("UPDATE reservations SET care_label=?, care_end=? WHERE id=?").bind(str(care.label, 50), care.endDate, y).run();
      else await db.prepare("UPDATE reservations SET care_label=NULL, care_end=NULL WHERE id=?").bind(y).run();
      return json({ ok: true });
    }
    if (x === "closed-days" && !y && m === "POST") {
      const body = await readJson(req);
      if (!isISO(body?.date)) return fail("\uB0A0\uC9DC\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC544\uC694.");
      await db.prepare("INSERT OR REPLACE INTO closed_days (date, reason) VALUES (?, ?)").bind(body.date, str(body.reason, 50)).run();
      return json({ ok: true });
    }
    if (x === "closed-days" && y && m === "DELETE") {
      await db.prepare("DELETE FROM closed_days WHERE date=?").bind(y).run();
      return json({ ok: true });
    }
    if (x === "notices" && !y && m === "POST") {
      const body = await readJson(req);
      const text = str(body?.text, 300);
      if (!text) return fail("\uACF5\uC9C0 \uB0B4\uC6A9\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.");
      if (body?.id) await db.prepare("UPDATE notices SET text=? WHERE id=?").bind(text, body.id).run();
      else await db.prepare("INSERT INTO notices (id,text,created_at) VALUES (?,?,?)").bind(uid(), text, (/* @__PURE__ */ new Date()).toISOString()).run();
      return json({ ok: true });
    }
    if (x === "notices" && y && m === "DELETE") {
      await db.prepare("DELETE FROM notices WHERE id=?").bind(y).run();
      return json({ ok: true });
    }
    if (x === "columns" && !y && m === "POST") {
      const body = await readJson(req);
      const title = str(body?.title, 100);
      const text = str(body?.body, 1e4);
      if (!title || !text) return fail("\uC81C\uBAA9\uACFC \uB0B4\uC6A9\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.");
      if (body?.id) await db.prepare("UPDATE columns SET title=?, body=? WHERE id=?").bind(title, text, body.id).run();
      else await db.prepare("INSERT INTO columns (id,title,body,date,created_at) VALUES (?,?,?,?,?)").bind(uid(), title, text, kstParts(), (/* @__PURE__ */ new Date()).toISOString()).run();
      return json({ ok: true });
    }
    if (x === "columns" && y && m === "DELETE") {
      await db.prepare("DELETE FROM columns WHERE id=?").bind(y).run();
      return json({ ok: true });
    }
    if (x === "outbox" && m === "GET") {
      const rows = (await db.prepare("SELECT * FROM outbox ORDER BY at DESC LIMIT 200").all()).results;
      return json(rows.map((r) => ({ id: r.id, key: r.key, kind: r.kind, to: r.to_phone, channel: r.channel, text: r.text, at: r.at, status: r.status })));
    }
  }
  return fail("\uCC3E\uC744 \uC218 \uC5C6\uC5B4\uC694.", 404);
}
__name(route, "route");

// ../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-TifgmB/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// ../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-TifgmB/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
