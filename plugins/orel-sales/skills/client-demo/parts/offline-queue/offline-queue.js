// offline-queue — work saved on the device when there is no signal, and sent in order when it returns. An online
// switch the visitor can flip, items kept locally (they survive a reload), an ordered drain one item at a time with
// retries, and a log of what happened. The upload itself is a function you supply (a local stand-in by default).

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// keep keyboard focus across a repaint: find the focused control again by its data-* attributes
const keepFocus = (root, paint) => {
  const a = root.contains(document.activeElement) ? document.activeElement : null;
  const sel = a ? [...a.attributes].filter((x) => x.name.startsWith("data-")).map((x) => `[${x.name}="${CSS.escape(x.value)}"]`).join("") : "";
  paint();
  if (sel) root.querySelector(sel)?.focus({ preventScroll: true });
};

/**
 * createOfflineQueue(opts)
 *   upload(item) → Promise          sends one item; throw to fail it. Default: a local stand-in that waits 600 ms.
 *   key                             localStorage key (null = memory only)
 *   retries                         attempts per item before it is parked as "failed" (default 3)
 *   backoffMs(attempt)              wait between attempts (default 500 × attempt)
 *   failFirst(item) → bool          make an item fail its first attempt (to show the retry working)
 *   now() → Date                    clock for the log stamps (default: none, stamps omitted)
 * returns { online, setOnline, toggle, add, items, pending, retry, clear, log, on, destroy }
 * events: "change" (snapshot) · "sent" (item) · "failed" (item) · "drained" ({ sent })
 */
export function createOfflineQueue(opts = {}) {
  const o = { upload: async () => { await sleep(600); }, key: null, retries: 3, backoffMs: (n) => 500 * n, failFirst: () => false, now: null, ...opts };
  const listeners = {};
  const emit = (ev, d) => (listeners[ev] || []).forEach((fn) => fn(d));
  const load = () => { try { return o.key ? JSON.parse(localStorage.getItem(o.key) || "null") : null; } catch { return null; } };
  const saved = load();
  let online = saved ? saved.online : true, items = saved ? saved.items.map((x) => ({ ...x, status: x.status === "sending" ? "local" : x.status })) : [], logRows = saved ? saved.log : [];
  let draining = false, seq = saved ? saved.seq : 0, alive = true;

  const save = () => { try { o.key && localStorage.setItem(o.key, JSON.stringify({ online, items, log: logRows.slice(0, 50), seq })); } catch { /* full or blocked */ } };
  const stamp = () => { if (!o.now) return ""; const d = o.now(); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
  const note = (text, kind) => { logRows.unshift({ text, kind, at: stamp() }); logRows = logRows.slice(0, 50); };
  const changed = () => { save(); emit("change", api.snapshot()); };

  async function drain() {
    if (draining || !online) return;
    draining = true; changed();
    let sent = 0;
    while (alive && online) {
      const it = items.find((x) => x.status === "local" || x.status === "retry");
      if (!it) break;
      it.status = "sending"; it.attempts += 1; changed();
      try {
        if (it.attempts === 1 && o.failFirst(it)) { await sleep(500); throw new Error("no answer from the server"); }
        await o.upload(it);
        if (!online) { it.status = "local"; it.attempts -= 1; break; }   // signal dropped mid-send: back in line, untouched
        it.status = "sent"; sent++; note(`נשלח: ${it.label}`, "sent"); emit("sent", it);
      } catch (e) {
        if (!online) { it.status = "local"; break; }
        if (it.attempts >= o.retries) { it.status = "failed"; note(`נכשל אחרי ${it.attempts} ניסיונות: ${it.label}`, "failed"); emit("failed", it); }
        else { it.status = "retry"; note(`ניסיון חוזר: ${it.label}`, "retry"); changed(); await sleep(o.backoffMs(it.attempts)); }
      }
      changed();
    }
    draining = false;
    if (sent) emit("drained", { sent });
    changed();
  }

  const api = {
    online: () => online,
    setOnline(on) {
      if (online === on) return api;
      online = on;
      note(on ? "יש קליטה — שולח את מה שנשמר, לפי הסדר" : "אין קליטה — עובדים מקומית, הכול נשמר במכשיר", on ? "online" : "offline");
      changed();
      if (on) drain();
      return api;
    },
    toggle: () => api.setOnline(!online),
    /** add({ label, kind, data }) — saved locally at once, sent now if there is signal */
    add(x) {
      const it = { id: `q${++seq}`, label: x.label || `פריט ${seq}`, kind: x.kind || "item", data: x.data ?? null, status: "local", attempts: 0 };
      items.push(it);
      note(online ? `בתור לשליחה: ${it.label}` : `נשמר במכשיר: ${it.label}`, "local");
      changed();
      if (online) drain();
      return it.id;
    },
    items: () => items.map((x) => ({ ...x })),
    pending: () => items.filter((x) => x.status !== "sent").length,
    retry(id) { const it = items.find((x) => x.id === id && x.status === "failed"); if (it) { it.status = "retry"; it.attempts = 0; changed(); drain(); } return api; },
    clear(which = "sent") { items = which === "all" ? [] : items.filter((x) => x.status !== which); changed(); return api; },
    log: () => logRows.slice(),
    snapshot: () => ({ online, draining, pending: api.pending(), items: api.items(), log: api.log() }),
    on(ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); return api; },
    destroy() { alive = false; for (const k in listeners) delete listeners[k]; },
  };
  if (online && items.some((x) => x.status !== "sent" && x.status !== "failed")) setTimeout(drain, 0);
  return api;
}

/** mountQueueStatus(el, queue) — the online switch, the queue in order with each item's state, and the log */
export function mountQueueStatus(el, q, { onText = "מחובר", offText = "ללא קליטה", emptyText = "אין פריטים בתור" } = {}) {
  const WORD = { local: "שמור במכשיר", sending: "נשלח…", retry: "ממתין לניסיון חוזר", sent: "נשלח", failed: "נכשל" };
  const root = document.createElement("section");
  root.className = "oq";
  el.appendChild(root);
  const paint = (s = q.snapshot()) => keepFocus(root, () => {
    root.dataset.oqOnline = s.online;
    root.innerHTML = `<button type="button" class="oq__switch" role="switch" aria-checked="${s.online}" data-oq="toggle"><span class="oq__knob" aria-hidden="true"></span><span>${s.online ? onText : offText}</span></button>
      <p class="oq__sum" aria-live="polite">${s.pending ? `${s.pending} ממתינים` : "הכול נשלח"}${s.draining ? " · שולח לפי הסדר" : ""}</p>
      <ol class="oq__items">${s.items.length ? s.items.map((x) => `<li class="oq__item oq__item--${x.status}"><span>${x.label}</span><small>${WORD[x.status]}${x.attempts > 1 ? ` · ניסיון ${x.attempts}` : ""}</small>${x.status === "failed" ? `<button type="button" class="oq__retry" data-oq-retry="${x.id}">שוב</button>` : ""}</li>`).join("") : `<li class="oq__empty">${emptyText}</li>`}</ol>
      <details class="oq__log"><summary>יומן סנכרון</summary><ul>${s.log.map((l) => `<li class="oq__log--${l.kind}">${l.at ? `<time>${l.at}</time> ` : ""}${l.text}</li>`).join("")}</ul></details>`;
  });
  root.addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; if (b.dataset.oq === "toggle") q.toggle(); else if (b.dataset.oqRetry) q.retry(b.dataset.oqRetry); });
  q.on("change", paint); paint();
  return { el: root, destroy: () => root.remove() };
}
