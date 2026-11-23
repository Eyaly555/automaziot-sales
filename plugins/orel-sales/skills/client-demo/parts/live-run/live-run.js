// live-run — "run the day": one button and the business plays in front of the visitor. A demo clock with speeds and
// pause, scripted moments at set times, generated arrivals at a steady rate in demo minutes (so the floor fills at
// the same pace at any speed), working hours that skip nights and the weekend, and a deterministic random source so a
// replay looks the same. Each tick hands you the minutes that passed; you mutate your own state (in one batch).

const MIN = 6e4;
const mulberry = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const pad = (n) => String(n).padStart(2, "0");

/**
 * createLiveRun(opts)
 *   start       Date or ISO: where the clock begins (the data's morning). Required.
 *   speeds      [{ id, label, minsPerSec }]: demo minutes per real second. Default ×1 / ×10 / ×60.
 *   tickMs      real ms between ticks (default 250)
 *   shift       { days: [0..4], start: "07:30", end: "17:00" } or null for a 24/7 clock
 *   seed        for run.rng()
 *   onTick(ctx) every tick: ctx = { now, mins, rng, run }; mutate your state here
 *   script      [{ at: "09:40" | Date, label, do(ctx) }]: fire once when the clock passes them
 *   every       [{ mins: 85, label, do(ctx) }]: on average once per `mins` demo minutes (Poisson-like), generated
 * returns { play, pause, toggle, setSpeed, fastForward, reset, now, running, speed, rng, on, destroy }
 * events: "tick" (ctx) · "moment" ({ label, now, kind: "script"|"every" }) · "state" ({ running, speed })
 */
export function createLiveRun(opts = {}) {
  if (!opts.start) throw new Error("live-run: start is required");
  const o = { tickMs: 250, seed: 4242, shift: null, script: [], every: [], speeds: [{ id: "x1", label: "×1", minsPerSec: 1 }, { id: "x10", label: "×10", minsPerSec: 10 }, { id: "x60", label: "×60", minsPerSec: 60 }], ...opts };
  const startMs = new Date(o.start).getTime();
  let clock = startMs, speed = o.speeds[1] || o.speeds[0], timer = null, rng = mulberry(o.seed), fired = new Set();
  const listeners = {};
  const emit = (ev, d) => (listeners[ev] || []).forEach((fn) => fn(d));
  const toMin = (s) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
  const atMs = (at) => { if (at instanceof Date) return at.getTime(); const d = new Date(startMs); const [h, m] = at.split(":").map(Number); d.setHours(h, m, 0, 0); return d.getTime(); };

  // outside working hours the clock jumps to the next opening, so a run never plays an empty night
  function respectShift() {
    if (!o.shift) return;
    const d = new Date(clock); const s = toMin(o.shift.start || "08:00"), e = toMin(o.shift.end || "17:00"), days = o.shift.days || [0, 1, 2, 3, 4];
    for (let g = 0; g < 14; g++) {
      const m = d.getHours() * 60 + d.getMinutes();
      if (!days.includes(d.getDay()) || m >= e) { d.setDate(d.getDate() + 1); d.setHours(Math.floor(s / 60), s % 60, 0, 0); continue; }
      if (m < s) { d.setHours(Math.floor(s / 60), s % 60, 0, 0); continue; }
      break;
    }
    clock = d.getTime();
  }

  function step(mins) {
    const before = clock;
    clock += mins * MIN;
    respectShift();
    const ctx = { now: new Date(clock), mins, rng, run: api };
    o.script.forEach((s, i) => {
      const t = atMs(s.at);
      if (!fired.has(i) && t > before && t <= clock) { fired.add(i); s.do && s.do(ctx); emit("moment", { label: s.label, now: ctx.now, kind: "script" }); }
    });
    o.every.forEach((e) => { if (rng() < mins / e.mins) { e.do && e.do(ctx); emit("moment", { label: e.label, now: ctx.now, kind: "every" }); } });
    o.onTick && o.onTick(ctx);
    emit("tick", ctx);
  }
  const loop = () => step(speed.minsPerSec * (o.tickMs / 1000));

  const api = {
    play(id) { if (id) api.setSpeed(id); if (!timer) timer = setInterval(loop, o.tickMs); emit("state", { running: true, speed: speed.id }); return api; },
    pause() { clearInterval(timer); timer = null; emit("state", { running: false, speed: speed.id }); return api; },
    toggle: () => (timer ? api.pause() : api.play()),
    setSpeed(id) { speed = o.speeds.find((s) => s.id === id) || speed; emit("state", { running: !!timer, speed: speed.id }); return api; },
    /** run `mins` demo minutes at once, in 5-minute steps, without animation */
    fastForward(mins) { let left = mins; while (left > 0) { const m = Math.min(5, left); step(m); left -= m; } return api; },
    reset() { api.pause(); clock = startMs; rng = mulberry(o.seed); fired = new Set(); emit("tick", { now: new Date(clock), mins: 0, rng, run: api }); return api; },
    now: () => new Date(clock),
    running: () => !!timer,
    speed: () => speed.id,
    speeds: () => o.speeds.slice(),
    rng: () => rng(),
    on(ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); return api; },
    destroy() { api.pause(); for (const k in listeners) delete listeners[k]; },
  };
  return api;
}

/**
 * mountRunControls(el, run, { fmt, playText, pauseText, ffMins, ffText }) — a small control strip: the demo clock,
 * play/pause, one button per speed, and "jump ahead". Plain buttons with classes the builder restyles or replaces.
 */
export function mountRunControls(el, run, x = {}) {
  const o = { playText: "▶ הרצה", pauseText: "❚❚ עצירה", ffMins: 60, ffText: "דילוג שעה", fmt: (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`, ...x };
  const root = document.createElement("div");
  root.className = "lrun";
  root.innerHTML = `<output class="lrun__clock" aria-live="off"></output>
    <button type="button" class="lrun__play" data-lrun="toggle"></button>
    <span class="lrun__speeds" role="group" aria-label="מהירות">${run.speeds().map((s) => `<button type="button" class="lrun__speed" data-lrun-speed="${s.id}">${s.label}</button>`).join("")}</span>
    ${o.ffMins ? `<button type="button" class="lrun__ff" data-lrun="ff">${o.ffText}</button>` : ""}`;
  el.appendChild(root);
  const clockEl = root.querySelector(".lrun__clock"), playEl = root.querySelector(".lrun__play");
  const paint = () => {
    clockEl.textContent = o.fmt(run.now());
    playEl.textContent = run.running() ? o.pauseText : o.playText;
    playEl.setAttribute("aria-pressed", run.running());
    root.querySelectorAll("[data-lrun-speed]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.lrunSpeed === run.speed()));
    root.classList.toggle("is-running", run.running());
  };
  root.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.lrun === "toggle") run.toggle();
    else if (b.dataset.lrun === "ff") { run.fastForward(o.ffMins); paint(); }
    else if (b.dataset.lrunSpeed) { run.setSpeed(b.dataset.lrunSpeed); if (!run.running()) run.play(); }
  });
  run.on("tick", paint).on("state", paint);
  paint();
  return { el: root, destroy: () => root.remove() };
}
