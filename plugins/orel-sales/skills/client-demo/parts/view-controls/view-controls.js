// view-controls — bend any list to the question of the moment: a time window ("today", "7 days", "this month"),
// filters per facet with counts, one-tap flags ("late only"), a sort, and the choice said back in plain words
// ("30 ימים · צפון · מהגבוה לנמוך · 41"). The logic layer has no markup; a plain bar is included to restyle or skip.
// Windows are counted from the data's own now (you pass it), never from the wall clock.

const DAY = 864e5;
// keep keyboard focus across a repaint: find the focused control again by its data-* attributes
const keepFocus = (root, paint) => {
  const a = root.contains(document.activeElement) ? document.activeElement : null;
  const sel = a ? [...a.attributes].filter((x) => x.name.startsWith("data-")).map((x) => `[${x.name}="${CSS.escape(x.value)}"]`).join("") : "";
  paint();
  if (sel) root.querySelector(sel)?.focus({ preventScroll: true });
};
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const since = (id, now) => {
  const d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!id || id === "all") return null;
  if (id === "today") return d0;
  if (id === "week") return new Date(d0 - d0.getDay() * DAY);
  if (id === "month") return new Date(now.getFullYear(), now.getMonth(), 1);
  const m = /^(\d+)d$/.exec(id); return m ? new Date(d0 - (+m[1] - 1) * DAY) : null;
};

/**
 * createView(spec, { key, persist: null|"url"|"local", onChange })
 * spec = {
 *   now: () => Date                                         required when time is used: the data's own now
 *   time:   { get: (row) => Date, options: [["7d","7 ימים"],["month","החודש"],["all","הכול"]], value: "7d" },
 *   facets: [{ id, label, get: (row) => value, options?: [[value, label]] }],
 *   flags:  [{ id, label, test: (row) => bool }],
 *   sort:   [{ id, label, by: (a, b) => number }], sortValue?
 * }
 * returns { state, set, toggle, flag, only, reset, isDefault, apply(rows), count(facet, value, rows), options(facet, rows), say(n), on }
 */
export function createView(spec, { key = "view", persist = null, onChange } = {}) {
  const def = () => ({ time: spec.time ? spec.time.value : null, sort: spec.sortValue || spec.sort?.[0]?.id || null, f: {}, flags: [] });
  const listeners = onChange ? [onChange] : [];
  const read = () => {
    try {
      if (persist === "url" && typeof location !== "undefined") { const v = new URLSearchParams(location.search).get("v." + key); return v ? JSON.parse(v) : null; }
      if (persist === "local") return JSON.parse(localStorage.getItem("view." + key) || "null");
    } catch { /* bad saved value */ }
    return null;
  };
  let state = { ...def(), ...(read() || {}) };
  const write = () => {
    try {
      if (persist === "url") { const u = new URL(location.href); api.isDefault() ? u.searchParams.delete("v." + key) : u.searchParams.set("v." + key, JSON.stringify(state)); history.replaceState(history.state, "", u); }
      if (persist === "local") localStorage.setItem("view." + key, JSON.stringify(state));
    } catch { /* blocked */ }
  };
  const changed = () => { write(); listeners.forEach((fn) => fn(state)); };
  const facet = (id) => spec.facets?.find((f) => f.id === id);

  // does a row pass everything, optionally ignoring one facet (for "how many would this choice leave")
  function pass(row, s, skip) {
    if (spec.time && s.time) { const st = since(s.time, spec.now()); if (st && spec.time.get(row) < st) return false; }
    for (const f of spec.facets || []) { if (f.id === skip) continue; const want = s.f[f.id]; if (want && want.length && !want.includes(String(f.get(row)))) return false; }
    for (const fl of s.flags) { const d = spec.flags?.find((x) => x.id === fl); if (d && !d.test(row)) return false; }
    return true;
  }
  const api = {
    get state() { return JSON.parse(JSON.stringify(state)); },
    set(patch) { state = { ...state, ...patch }; changed(); return api; },
    /** toggle one value of a facet (multi-select) */
    toggle(id, value) { const v = String(value), cur = state.f[id] || []; state.f = { ...state.f, [id]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] }; changed(); return api; },
    flag(id) { state.flags = state.flags.includes(id) ? state.flags.filter((x) => x !== id) : [...state.flags, id]; changed(); return api; },
    /** "just this one": from a name, pill or legend pressed anywhere on the screen */
    only(id, value) { state.f = { ...state.f, [id]: [String(value)] }; changed(); return api; },
    reset() { state = def(); changed(); return api; },
    isDefault: () => JSON.stringify(state) === JSON.stringify(def()),
    apply(rows) { const sorter = spec.sort?.find((s) => s.id === state.sort); const out = rows.filter((r) => pass(r, state)); return sorter ? out.sort(sorter.by) : out; },
    count: (id, value, rows) => rows.filter((r) => pass(r, state, id) && String(facet(id).get(r)) === String(value)).length,
    /** the options of a facet with their counts; options with nothing behind them stay listed (count 0) */
    options(id, rows) {
      const f = facet(id);
      const opts = f.options || [...new Set(rows.map((r) => String(f.get(r))))].sort().map((v) => [v, v]);
      return opts.map(([v, label]) => ({ value: String(v), label, count: api.count(id, v, rows), on: (state.f[id] || []).includes(String(v)) }));
    },
    /** the choice in words: "7 ימים · צפון, מרכז · באיחור · מהגבוה לנמוך · 12" */
    say(n) {
      const bits = [];
      if (spec.time && state.time) bits.push(spec.time.options.find(([v]) => v === state.time)?.[1] || state.time);
      for (const f of spec.facets || []) { const v = state.f[f.id]; if (v && v.length) bits.push(v.map((x) => (f.options || []).find(([o]) => String(o) === x)?.[1] || x).join(", ")); }
      state.flags.forEach((fl) => bits.push(spec.flags.find((x) => x.id === fl)?.label || fl));
      if (spec.sort && state.sort) bits.push(spec.sort.find((s) => s.id === state.sort)?.label || "");
      if (n != null) bits.push(String(n));
      return bits.filter(Boolean).join(" · ");
    },
    on(ev, fn) { if (ev === "change") listeners.push(fn); return api; },
  };
  return api;
}

/** mountViewBar(el, view, spec, getRows, { resetText }) — plain controls for a view. Repaints on every change. */
export function mountViewBar(el, view, spec, getRows, { resetText = "ניקוי", sortLabel = "מיון" } = {}) {
  const root = document.createElement("div");
  root.className = "vbar";
  el.appendChild(root);
  const paint = () => keepFocus(root, () => {
    const rows = getRows(), s = view.state, n = view.apply(rows).length;
    root.innerHTML = `${spec.time ? `<div class="vbar__time" role="radiogroup" aria-label="טווח זמן">${spec.time.options.map(([v, l]) => `<button type="button" role="radio" class="vbar__seg" aria-checked="${s.time === v}" data-vbar-time="${esc(v)}">${esc(l)}</button>`).join("")}</div>` : ""}
      ${(spec.facets || []).map((f) => `<div class="vbar__facet" role="group" aria-label="${esc(f.label)}"><span class="vbar__flabel">${esc(f.label)}</span>${view.options(f.id, rows).map((o) => `<button type="button" class="vbar__chip${o.count ? "" : " is-zero"}" aria-pressed="${o.on}" data-vbar-f="${esc(f.id)}" data-vbar-v="${esc(o.value)}">${esc(o.label)} <small>${o.count}</small></button>`).join("")}</div>`).join("")}
      ${(spec.flags || []).map((fl) => `<button type="button" class="vbar__chip vbar__flag" aria-pressed="${s.flags.includes(fl.id)}" data-vbar-flag="${esc(fl.id)}">${esc(fl.label)}</button>`).join("")}
      ${spec.sort ? `<label class="vbar__sort"><span>${esc(sortLabel)}</span><select data-vbar-sort>${spec.sort.map((o) => `<option value="${esc(o.id)}"${o.id === s.sort ? " selected" : ""}>${esc(o.label)}</option>`).join("")}</select></label>` : ""}
      <p class="vbar__say" aria-live="polite">${esc(view.say(n))}</p>
      ${view.isDefault() ? "" : `<button type="button" class="vbar__reset" data-vbar-reset>${esc(resetText)}</button>`}`;
  });
  root.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.vbarTime) view.set({ time: b.dataset.vbarTime });
    else if (b.dataset.vbarF) view.toggle(b.dataset.vbarF, b.dataset.vbarV);
    else if (b.dataset.vbarFlag) view.flag(b.dataset.vbarFlag);
    else if (b.hasAttribute("data-vbar-reset")) view.reset();
  });
  root.addEventListener("change", (e) => { if (e.target.matches("[data-vbar-sort]")) view.set({ sort: e.target.value }); });
  view.on("change", paint); paint();
  return { el: root, paint, destroy: () => root.remove() };
}
