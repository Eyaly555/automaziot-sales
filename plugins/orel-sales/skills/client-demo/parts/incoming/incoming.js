// incoming — something arrives while the visitor watches: a call rings, an order lands, a lead comes in, a message
// pops. A visible arrival card (slides in, a call pulses), the actions it offers, and a promise that tells you which
// one was pressed, so the demo can open the right screen. Several stack; Escape dismisses the newest.

const ICON = {
  call: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>',
  order: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 4V2h10v2h3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm0 6v2h10v-2zm0 4v2h7v-2z"/></svg>',
  lead: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4.4 0-8 2.2-8 5v2h16v-2c0-2.8-3.6-5-8-5z"/></svg>',
  message: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 3h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H8l-5 4V4a1 1 0 0 1 1-1z"/></svg>',
};
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const KIND_WORD = { call: "שיחה נכנסת", order: "הזמנה חדשה", lead: "ליד חדש", message: "הודעה חדשה" };

/**
 * createIncoming({ container = document.body, max = 3, sound = false })
 * show(item) → Promise<actionId | "dismiss" | "timeout">
 *   item = { kind: "call"|"order"|"lead"|"message", title, detail, meta, label?, icon? (svg string),
 *            actions: [{ id, label, primary }], timeoutMs?, onOpen?(el) }
 */
export function createIncoming({ container, max = 3, sound = false } = {}) {
  const host = document.createElement("div");
  host.className = "inc";
  host.setAttribute("aria-live", "assertive");
  (container || document.body).appendChild(host);
  const open = [];
  let audio = null;

  function ring() {
    if (!sound) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const t = audio.currentTime;
      [0, 0.25].forEach((d) => { const os = audio.createOscillator(), g = audio.createGain(); os.frequency.value = 880; g.gain.setValueAtTime(0.0001, t + d); g.gain.exponentialRampToValueAtTime(0.15, t + d + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.2); os.connect(g).connect(audio.destination); os.start(t + d); os.stop(t + d + 0.22); });
    } catch { /* no audio: the card still arrives */ }
  }

  function show(item) {
    const kind = item.kind || "message";
    const actions = item.actions && item.actions.length ? item.actions : [{ id: "open", label: "פתיחה", primary: true }];
    const card = document.createElement("article");
    card.className = `inc__card inc__card--${kind}`;
    card.setAttribute("role", "alert");
    card.innerHTML = `<span class="inc__icon">${item.icon || ICON[kind] || ICON.message}</span>
      <div class="inc__body"><small class="inc__kind">${esc(item.label || KIND_WORD[kind] || "")}</small>
        <b class="inc__title">${esc(item.title)}</b>${item.detail ? `<span class="inc__detail">${esc(item.detail)}</span>` : ""}${item.meta ? `<small class="inc__meta">${esc(item.meta)}</small>` : ""}</div>
      <div class="inc__acts">${actions.map((a) => `<button type="button" class="inc__act${a.primary ? " inc__act--primary" : ""}" data-inc-act="${esc(a.id)}">${esc(a.label)}</button>`).join("")}
        <button type="button" class="inc__x" data-inc-act="dismiss" aria-label="סגירה">×</button></div>`;
    host.prepend(card);
    while (open.length >= max) close(open[0], "dismiss");
    ring();
    item.onOpen && item.onOpen(card);
    return new Promise((resolve) => {
      const rec = { card, resolve, timer: item.timeoutMs ? setTimeout(() => close(rec, "timeout"), item.timeoutMs) : null };
      open.push(rec);
      card.addEventListener("click", (e) => { const b = e.target.closest("[data-inc-act]"); if (b) close(rec, b.dataset.incAct); });
      requestAnimationFrame(() => card.classList.add("is-in"));
    });
  }
  function close(rec, result) {
    const i = open.indexOf(rec); if (i < 0) return;
    open.splice(i, 1); clearTimeout(rec.timer);
    rec.card.classList.remove("is-in"); rec.card.classList.add("is-out");
    setTimeout(() => rec.card.remove(), 220);
    rec.resolve(result);
  }
  const onKey = (e) => { if (e.key === "Escape" && open.length) close(open[open.length - 1], "dismiss"); };
  document.addEventListener("keydown", onKey);

  return {
    el: host, show,
    count: () => open.length,
    dismissAll() { [...open].forEach((r) => close(r, "dismiss")); },
    destroy() { document.removeEventListener("keydown", onKey); [...open].forEach((r) => close(r, "dismiss")); host.remove(); },
  };
}
