// time-anchor — the demo's own clock. "Now" is the data's date (asOf) plus however long the page has been open, so the
// demo reads "today 09:14" next week exactly as it does today, and still moves while the visitor watches.
// Hebrew formats (dd/mm/yyyy, 24h), relative words ("לפני 3 שעות"), working days (Sunday–Thursday by default), and
// the start of named windows ("today", "7d", "month") counted from the data's now, never from the wall clock.

const DAY = 864e5, HOUR = 36e5, MIN = 6e4;
const pad = (n) => String(n).padStart(2, "0");
const elapsed = () => (typeof performance !== "undefined" ? performance.now() : 0);
const D = (d) => (d instanceof Date ? d : new Date(d));

/**
 * createClock({ asOf, rate = 1, frozen = false, workDays = [0..4], dayStart = "08:00", dayEnd = "18:00" })
 *   asOf     the data's own "now" (Date or ISO string). Required.
 *   rate     how fast demo time runs against real time (1 = real time)
 *   frozen   true: now() is always asOf (good for screenshots)
 */
export function createClock({ asOf, rate = 1, frozen = false, workDays = [0, 1, 2, 3, 4], dayStart = "08:00", dayEnd = "18:00" } = {}) {
  if (asOf == null) throw new Error("time-anchor: asOf is required");
  let base = D(asOf).getTime(), t0 = elapsed(), r = rate;
  const ticks = new Set();
  let timer = null;
  const toMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };

  const c = {
    now: () => new Date(frozen ? base : base + (elapsed() - t0) * r),
    /** jump demo time (a live run moving the clock) */
    set(d) { base = D(d).getTime(); t0 = elapsed(); emitTick(); return c; },
    advance(ms) { return c.set(c.now().getTime() + ms); },
    setRate(x) { base = c.now().getTime(); t0 = elapsed(); r = x; return c; },
    today() { const d = c.now(); d.setHours(0, 0, 0, 0); return d; },
    /** a moment relative to today: at(-2, "14:30") = the day before yesterday at 14:30 */
    at(dayOffset = 0, hhmm = "00:00") { const d = c.today(); d.setDate(d.getDate() + dayOffset); const [h, m] = hhmm.split(":").map(Number); d.setHours(h, m, 0, 0); return d; },
    ago: (ms) => new Date(c.now().getTime() - ms),
    minutesAgo: (n) => c.ago(n * MIN), hoursAgo: (n) => c.ago(n * HOUR), daysAgo: (n) => c.ago(n * DAY),

    isWorkDay: (d) => workDays.includes(D(d).getDay()),
    isWorkHours(d = c.now()) { d = D(d); const m = d.getHours() * 60 + d.getMinutes(); return c.isWorkDay(d) && m >= toMin(dayStart) && m < toMin(dayEnd); },
    /** add n working days (negative goes back), skipping the weekend */
    addWorkDays(d, n) { const x = new Date(D(d)); const step = n < 0 ? -1 : 1; let left = Math.abs(n); while (left) { x.setDate(x.getDate() + step); if (c.isWorkDay(x)) left--; } return x; },
    /** the next opening moment at or after d (a live clock skips nights and the weekend with it) */
    nextOpen(d = c.now()) { const x = new Date(D(d)); for (let i = 0; i < 14; i++) { const m = x.getHours() * 60 + x.getMinutes(); if (c.isWorkDay(x) && m < toMin(dayEnd)) { if (m < toMin(dayStart)) x.setHours(...dayStart.split(":").map(Number), 0, 0); return x; } x.setDate(x.getDate() + 1); x.setHours(...dayStart.split(":").map(Number), 0, 0); } return x; },

    /** the first moment of a named window: "today" | "week" (from Sunday) | "month" | "year" | "<n>d" | "all" (null) */
    since(id) {
      const d0 = c.today();
      if (id === "all") return null;
      if (id === "today") return d0;
      if (id === "week") return new Date(d0.getTime() - d0.getDay() * DAY);
      if (id === "month") return new Date(d0.getFullYear(), d0.getMonth(), 1);
      if (id === "year") return new Date(d0.getFullYear(), 0, 1);
      const m = /^(\d+)d$/.exec(id); if (m) return new Date(d0.getTime() - (+m[1] - 1) * DAY);
      throw new Error(`time-anchor: unknown window "${id}"`);
    },
    inWindow: (d, id) => { const s = c.since(id); return !s || (D(d) >= s && D(d) <= c.now()); },

    date: (d) => { d = D(d); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`; },
    time: (d) => { d = D(d); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; },
    dateTime: (d) => `${c.date(d)} ${c.time(d)}`,
    weekday: (d) => ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"][D(d).getDay()],
    /** "עכשיו", "לפני 5 דק׳", "לפני 3 שעות", "אתמול 14:20", "יום שלישי", "12/02/2026" — and the future too */
    relative(d) {
      d = D(d); const diff = c.now() - d, abs = Math.abs(diff), fut = diff < 0;
      if (abs < MIN) return "עכשיו";
      if (abs < HOUR) { const n = Math.round(abs / MIN); return fut ? `בעוד ${n} דק׳` : `לפני ${n} דק׳`; }
      const dd = Math.round((c.today() - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / DAY);
      if (dd === 0) { const n = Math.round(abs / HOUR); return fut ? `בעוד ${n === 1 ? "שעה" : n === 2 ? "שעתיים" : n + " שעות"}` : `לפני ${n === 1 ? "שעה" : n === 2 ? "שעתיים" : n + " שעות"}`; }
      if (dd === 1) return `אתמול ${c.time(d)}`;
      if (dd === -1) return `מחר ${c.time(d)}`;
      if (dd > 1 && dd < 7) return `יום ${c.weekday(d)}`;
      return c.date(d);
    },
    /** call fn(now) every `ms` of real time (for a clock on screen). Returns unsubscribe. */
    onTick(fn, ms = 1000) {
      ticks.add(fn); fn(c.now());
      if (!timer && typeof setInterval !== "undefined") timer = setInterval(emitTick, ms);
      return () => { ticks.delete(fn); if (!ticks.size) { clearInterval(timer); timer = null; } };
    },
    /** keep an element showing the demo time: c.mount(el, (d) => `${c.weekday(d)} ${c.time(d)}`) */
    mount(el, fmt = (d) => c.time(d)) { return c.onTick((d) => { el.textContent = fmt(d); }); },
  };
  function emitTick() { const n = c.now(); ticks.forEach((fn) => fn(n)); }
  return c;
}
