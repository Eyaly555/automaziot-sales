// one-store — one in-memory truth for the whole demo. A KPI and the rows behind it read the same named selector, so the
// figure on the dashboard, the count on the list and the number on the phone can never disagree. Change notifications,
// batched updates for simulations, an optional session or local persistence, and a reset back to the seed.

// JSON turns Dates into ISO strings; turn them back when reading a saved copy (seed-world dates stay Dates)
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
const reviveDates = (k, v) => (typeof v === "string" && ISO.test(v) ? new Date(v) : v);
const clone = (x) => (typeof structuredClone === "function" ? structuredClone(x) : JSON.parse(JSON.stringify(x)));

/**
 * createStore(initial, { persist: null|"session"|"local", key, version })
 *   initial   the seeded world (an object). Kept as the reset point.
 *   persist   keep the visitor's changes across reloads in this tab ("session") or this browser ("local")
 *   version   bump it when the seed's shape changes and saved state is dropped instead of merged
 */
export function createStore(initial, { persist = null, key = "demo-store", version = 1 } = {}) {
  const seed = clone(initial);
  const storage = (() => { try { return persist === "local" ? localStorage : persist === "session" ? sessionStorage : null; } catch { return null; } })();
  const fullKey = `${key}@${version}`;
  let state = clone(seed);
  if (storage) { try { const raw = storage.getItem(fullKey); if (raw) state = { ...state, ...JSON.parse(raw, reviveDates) }; } catch { /* private mode or bad JSON: start from the seed */ } }

  const subs = new Set();
  const named = new Map();         // name -> { fn, memo: { state, value } }
  let quiet = 0, dirty = false, saveTimer = null, ver = 0;   // ver also breaks memos after an in-place set(fn)

  function save() {
    if (!storage) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { try { storage.setItem(fullKey, JSON.stringify(state)); } catch { /* full or blocked */ } }, 120);
  }
  function notify() {
    ver++;
    if (quiet) { dirty = true; return; }
    dirty = false;
    save();
    for (const s of [...subs]) {
      try {
        if (!s.sel) { s.fn(state); continue; }
        const v = s.sel(state);
        if (!Object.is(v, s.last)) { const prev = s.last; s.last = v; s.fn(v, prev); }
      } catch (e) { console.warn("one-store subscriber failed", e); }
    }
  }

  const api = {
    /** the whole state (read it, never mutate it outside set/update) */
    get: () => state,
    /** set(patch) merges top-level keys; set(fn) gets a draft copy-free state and may mutate it or return a new one */
    set(patch) {
      if (typeof patch === "function") { const r = patch(state); if (r && r !== state) state = r; }
      else state = { ...state, ...patch };
      notify();
      return api;
    },
    /** run many changes and notify once (a simulation tick, an import) */
    batch(fn) { quiet++; try { fn(api); } finally { quiet--; if (!quiet && dirty) notify(); } return api; },

    /** define a named truth once: store.define("late", (s) => s.jobs.filter((j) => j.due < s.now && !j.done)) */
    define(name, fn) { named.set(name, { fn, memo: null }); return api; },
    /** the rows of a named truth (memoised per state) */
    rows(name, ...args) {
      const n = named.get(name);
      if (!n) throw new Error(`one-store: no selector "${name}"`);
      if (args.length) return n.fn(state, ...args);
      if (!n.memo || n.memo.state !== state || n.memo.ver !== ver) n.memo = { state, ver, value: n.fn(state) };
      return n.memo.value;
    },
    /** the count a KPI shows: always rows(name).length, so the figure and its list cannot drift */
    count: (name, ...args) => api.rows(name, ...args).length,
    /** a sum over a named truth: store.sum("open", (r) => r.amount) */
    sum: (name, by) => api.rows(name).reduce((t, r) => t + (Number(by(r)) || 0), 0),
    names: () => [...named.keys()],

    /** subscribe(fn) on every change, or subscribe(selector, fn) only when that value changes. Returns unsubscribe. */
    subscribe(a, b) {
      const s = b ? { sel: typeof a === "string" ? (st) => api.count(a) : a, fn: b, last: undefined } : { fn: a };
      if (s.sel) s.last = s.sel(state);
      subs.add(s);
      return () => subs.delete(s);
    },
    /** bind(el, "late") keeps an element's text equal to a named count (or a selector), formatted */
    bind(el, nameOrFn, fmt = (v) => String(v)) {
      const sel = typeof nameOrFn === "string" ? () => api.count(nameOrFn) : nameOrFn;
      const paint = () => { el.textContent = fmt(sel(state)); };
      paint();
      return api.subscribe(() => paint());
    },
    /** back to the seed (and forget the saved copy) */
    reset() { state = clone(seed); try { storage && storage.removeItem(fullKey); } catch { /* ignore */ } notify(); return api; },
  };
  return api;
}
