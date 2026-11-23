// seed-world — a believable Israeli world from one number.
// The same seed always draws the same people, phones, streets and dates, so every screen, reload and screenshot agrees.
// Dates are counted from an `asOf` date you give (the data's own "today"), never from the wall clock, so the demo
// still reads right next week. No DOM, no network: safe to import in Node, a static page or a bundler.

const FIRST_M = ["יונתן", "עידו", "אורי", "דניאל", "איתי", "נדב", "עומר", "יואב", "אלעד", "רועי", "תומר", "גיא", "עמית", "אסף", "שגיא", "בועז", "חנן", "מוטי", "יגאל", "שלמה", "עזרא", "סאמר", "ראמי", "מוחמד", "ולדימיר", "דמיטרי", "אליהו", "שמעון", "צחי", "קובי", "ליאור", "אמיר", "עוז", "נתנאל", "הראל", "אביתר"];
const FIRST_F = ["מיכל", "נועם", "יעל", "תמר", "שני", "הדס", "אורית", "לימור", "ענבל", "קרן", "מורן", "דנה", "שרון", "אפרת", "חגית", "רוני", "טל", "גלית", "אסנת", "רחל", "חנה", "ליאת", "סהר", "אביטל", "עדי", "נטע", "מאיה", "רינה", "סוהא", "נאדיה", "אולגה", "יוליה", "בתיה", "ציפי", "אושרת", "הילה"];
const LAST = ["כהן", "לוי", "מזרחי", "פרץ", "ביטון", "אברהם", "פרידמן", "אזולאי", "שפירא", "גולן", "אוחיון", "רוזן", "חדד", "בן דוד", "אלמוג", "ששון", "גבאי", "נחום", "יוסף", "קליין", "וקנין", "סלאמה", "חורי", "עמר", "טל", "שטרן", "ברגר", "זילברמן", "מלכה", "סויסה", "אשכנזי", "דהן", "ליבוביץ", "קורן", "רז", "ענבר", "שושן", "חזן", "בוזגלו", "נגר"];
const STREETS = ["הרצל", "ויצמן", "ז׳בוטינסקי", "בן גוריון", "רוטשילד", "העצמאות", "הנשיא", "סוקולוב", "ביאליק", "אחד העם", "הגפן", "התאנה", "הזית", "הרימון", "הדקל", "הברוש", "האלון", "השקמה", "הכלנית", "הנרקיס", "החרושת", "היוצרים", "המסגר", "הנפח", "הפלדה", "יגאל אלון", "משה דיין", "גולדה מאיר", "רבין", "הפלמ״ח", "הגדוד העברי", "שבזי", "קק״ל", "המעיין", "הנחל", "הגליל", "הנגב", "הירדן", "התבור", "הכרמל"];
const CITIES = ["ירושלים", "תל אביב-יפו", "באר שבע", "פתח תקווה", "הרצליה", "מודיעין", "רעננה", "עפולה", "כרמיאל", "אשקלון", "נהריה", "טבריה", "הוד השרון", "רמת גן", "גבעתיים", "בת ים", "לוד", "רמלה", "אילת", "דימונה", "צפת", "יקנעם", "זכרון יעקב", "חדרה", "בית שמש", "קריית גת", "שדרות", "ראש העין", "אור יהודה", "יהוד", "קריית אונו", "גבעת שמואל", "נוף הגליל", "מעלות-תרשיחא", "אופקים"];
const MOBILE = ["050", "052", "053", "054", "055", "058"];
const LANDLINE = ["02", "03", "04", "08", "09"];
const BIZ_KIND = ["נגריה", "מסגרייה", "מאפייה", "משרד רואי חשבון", "סטודיו לעיצוב", "מוסך", "חנות כלי בית", "מרפאת שיניים", "גן אירועים", "בית קפה", "חברת הובלות", "משתלה", "מכון כושר", "בית דפוס", "חברת ניקיון", "מעבדת שיניים", "חנות אופניים", "קייטרינג"];
const BIZ_NAME = ["האורן", "הכרמים", "שחר", "אופק", "גלעד", "נווה", "הצפון", "המרכז", "רקפת", "אלה", "אגם", "סלע", "תבור", "צוק", "ניצן", "יובל", "פלג", "שקד"];
const BIZ_FORM = ["בע״מ", "ושות׳", "", "", "שירותים", "תעשיות"];

const DAY = 864e5;

/** mulberry32: small, fast, well spread. */
export function rng(seed = 1) {
  let a = (typeof seed === "string" ? hashString(seed) : seed) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s) {
  let h = 2166136261;
  for (const ch of String(s)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

/** Israeli ID check digit (the Luhn variant the Population Registry uses). */
export function idCheckDigit(eight) {
  let s = 0;
  for (let i = 0; i < 8; i++) { let d = +eight[i] * (i % 2 ? 2 : 1); if (d > 9) d -= 9; s += d; }
  return String((10 - (s % 10)) % 10);
}

const pad = (n, w = 2) => String(n).padStart(w, "0");
const toDate = (d) => (d instanceof Date ? new Date(d.getTime()) : new Date(d));

/**
 * createWorld({ seed, asOf, workDays }) → a drawer of things.
 *   asOf      the data's "today" (Date or ISO). Required: no wall clock is ever read.
 *   workDays  days of week that are working days, 0 = Sunday. Default Sunday–Thursday.
 */
export function createWorld({ seed = 1, asOf, workDays = [0, 1, 2, 3, 4] } = {}) {
  if (!asOf) throw new Error("seed-world: asOf is required (the data's own today)");
  const r = rng(seed);
  const today = toDate(asOf); today.setHours(0, 0, 0, 0);
  const used = new Set();

  const w = {
    seed, asOf: toDate(asOf), today,
    next: r,
    float: (min = 0, max = 1) => min + r() * (max - min),
    int: (min, max) => Math.floor(min + r() * (max - min + 1)),
    chance: (p) => r() < p,
    pick: (list) => list[Math.floor(r() * list.length)],
    sample(list, n) { const pool = list.slice(), out = []; while (out.length < Math.min(n, list.length)) out.push(pool.splice(Math.floor(r() * pool.length), 1)[0]); return out; },
    weighted(items, weights) { let t = weights.reduce((a, b) => a + b, 0) * r(); for (let i = 0; i < items.length; i++) { t -= weights[i]; if (t <= 0) return items[i]; } return items[items.length - 1]; },
    shuffle(list) { for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; } return list; },
    /** a value bunched toward the middle of [min, max]: amounts, durations, scores */
    bell: (min, max) => min + ((r() + r() + r()) / 3) * (max - min),
    /** an id that never repeats in this world: id("Q-", 4) → "Q-0417" */
    id(prefix = "", digits = 4) { let v; do v = prefix + pad(Math.floor(r() * 10 ** digits), digits); while (used.has(v)); used.add(v); return v; },
    uuid() { const h = "0123456789abcdef"; let o = ""; for (let i = 0; i < 36; i++) o += [8, 13, 18, 23].includes(i) ? "-" : i === 14 ? "4" : h[Math.floor(r() * 16)]; return o; },

    // ------------------------------------------------------------ people and places
    person(o = {}) {
      const gender = o.gender || (r() < 0.5 ? "m" : "f");
      const first = w.pick(gender === "m" ? FIRST_M : FIRST_F), last = w.pick(LAST);
      return { id: w.id(o.idPrefix || "P-", 5), gender, first, last, name: `${first} ${last}`, initials: first[0] + last[0], phone: w.mobile(), city: o.city || w.pick(CITIES), idNumber: w.idNumber() };
    },
    people(n, o) { return Array.from({ length: n }, () => w.person(o)); },
    // Invented numbers must never reach a real person: a seeded "call" or WhatsApp link in a demo would dial them.
    // Subscriber numbers in Israel do not begin with 0, so these read as phone numbers and connect to nobody.
    mobile() { return `${w.pick(MOBILE)}-0${pad(w.int(10, 99), 2)}-${pad(w.int(0, 9999), 4)}`; },
    landline() { return `${w.pick(LANDLINE)}-0${pad(w.int(10, 99), 2)}-${pad(w.int(0, 9999), 4)}`; },
    /** the international form a tel:/wa.me link wants: "054-012-3456" → "972540123456" */
    e164: (local) => "972" + String(local).replace(/\D/g, "").replace(/^0/, ""),
    idNumber() { const e = pad(w.int(1000000, 39999999), 8); return e + idCheckDigit(e); },
    city: () => w.pick(CITIES),
    street: () => w.pick(STREETS),
    address(o = {}) { const city = o.city || w.pick(CITIES); return { street: w.pick(STREETS), no: w.int(1, 140), city, get line() { return `${this.street} ${this.no}, ${this.city}`; } }; },
    business(o = {}) {
      const kind = o.kind || w.pick(BIZ_KIND), name = `${kind} ${w.pick(BIZ_NAME)}`, form = w.pick(BIZ_FORM);
      return { id: w.id("B-", 4), kind, name: form ? `${name} ${form}` : name, phone: w.landline(), address: w.address(o), companyNo: "51" + pad(w.int(0, 9999999), 7) };
    },
    amount(min, max, step = 10) { return Math.round(w.bell(min, max) / step) * step; },

    // ------------------------------------------------------------ dates, counted from asOf
    daysAgo(n, hhmm) { const d = new Date(today.getTime() - n * DAY); if (hhmm) { const [h, m] = hhmm.split(":").map(Number); d.setHours(h, m, 0, 0); } return d; },
    daysAhead: (n, hhmm) => w.daysAgo(-n, hhmm),
    isWorkDay: (d) => workDays.includes(toDate(d).getDay()),
    /** the n-th working day back (0 = today if it is one) */
    workDaysAgo(n) { const d = new Date(today); let left = n; while (!w.isWorkDay(d) || left > 0) { if (w.isWorkDay(d)) left--; d.setDate(d.getDate() - 1); } return d; },
    /** a moment inside working hours on a random day in the last `days` */
    within(days, { from = "08:00", to = "17:00", workOnly = true } = {}) {
      let d; do d = w.daysAgo(w.int(0, Math.max(0, days - 1))); while (workOnly && !w.isWorkDay(d));
      const [fh, fm] = from.split(":").map(Number), [th, tm] = to.split(":").map(Number);
      const mins = w.int(fh * 60 + fm, th * 60 + tm); d.setHours(Math.floor(mins / 60), mins % 60, 0, 0); return d;
    },
    fmtDate: (d) => { d = toDate(d); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`; },
    fmtTime: (d) => { d = toDate(d); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; },

    /**
     * The story: a world where everything is fine reads as fake. Pick a few items and let something go slightly wrong.
     *   w.story(rows, [{ share: 0.06, apply: (row, w) => { row.late = true } }, { count: 2, apply: ... }])
     * Each plot touches a stable set (same seed → same unlucky rows). Returns { plotIndex: [rows touched] }.
     */
    story(rows, plots) {
      const out = {}, pool = rows.slice();
      plots.forEach((p, i) => {
        const n = p.count != null ? p.count : Math.max(1, Math.round(rows.length * (p.share || 0.05)));
        const hit = [];
        for (let k = 0; k < n && pool.length; k++) { const row = pool.splice(Math.floor(r() * pool.length), 1)[0]; if (!p.when || p.when(row)) { p.apply(row, w); hit.push(row); } }
        out[p.name || i] = hit;
      });
      return out;
    },
  };
  return w;
}

export const LISTS = { FIRST_M, FIRST_F, LAST, STREETS, CITIES, BIZ_KIND };
