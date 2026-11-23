// guided-tour — a short walk through the demo for whoever opens it alone: a spotlight on one thing at a time, a card
// beside it with what it is and why it matters, next/back, and keys. A step can prepare its screen first (open a
// tab, run something) before it is lit. Ends by itself and remembers it was seen if you ask it to.

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/**
 * createTour(steps, opts)
 *   steps  [{ target: selector | Element | null, title, body, before?: () => void | Promise }]   null target = a centred card
 *   opts   { onEnd(reason), nextText, backText, doneText, closeText, seenKey, pad }
 * returns { start(i = 0), next, back, end, isOpen, seen }
 */
export function createTour(steps, opts = {}) {
  const o = { nextText: "הבא", backText: "הקודם", doneText: "סיום", closeText: "סגירת הסיור", seenKey: null, pad: 8, ...opts };
  let i = -1, ring = null, card = null, lastFocus = null;
  const seen = () => { try { return !!(o.seenKey && localStorage.getItem(o.seenKey)); } catch { return false; } };
  const markSeen = () => { try { o.seenKey && localStorage.setItem(o.seenKey, "1"); } catch { /* ignore */ } };
  const rtl = () => getComputedStyle(document.documentElement).direction === "rtl";

  function build() {
    ring = document.createElement("div"); ring.className = "gtour__ring"; ring.setAttribute("aria-hidden", "true");
    card = document.createElement("div"); card.className = "gtour__card"; card.setAttribute("role", "dialog"); card.setAttribute("aria-modal", "false"); card.tabIndex = -1;
    document.body.append(ring, card);
    card.addEventListener("click", (e) => { const b = e.target.closest("[data-gtour]"); if (!b) return; ({ next: api.next, back: api.back, end: () => api.end("closed") })[b.dataset.gtour](); });
    document.addEventListener("keydown", onKey);
    addEventListener("resize", place); addEventListener("scroll", place, true);
  }
  function onKey(e) {
    if (i < 0) return;
    if (e.key === "Escape") api.end("closed");
    // in a right-to-left page the next step is to the left
    else if (e.key === (rtl() ? "ArrowLeft" : "ArrowRight")) api.next();
    else if (e.key === (rtl() ? "ArrowRight" : "ArrowLeft")) api.back();
  }
  const targetOf = (s) => (typeof s.target === "string" ? document.querySelector(s.target) : s.target || null);

  function place() {
    if (i < 0) return;
    const t = targetOf(steps[i]);
    const vw = document.documentElement.clientWidth, vh = innerHeight;
    if (!t) { ring.style.cssText = `inset-block-start:${vh / 2}px;inset-inline-start:${vw / 2}px;inline-size:0;block-size:0`; card.style.cssText = `inset-block-start:${Math.max(12, vh / 2 - card.offsetHeight / 2)}px;left:${Math.max(12, vw / 2 - card.offsetWidth / 2)}px`; return; }
    const r = t.getBoundingClientRect(), p = o.pad;
    ring.style.cssText = `top:${r.top - p}px;left:${r.left - p}px;width:${r.width + p * 2}px;height:${r.height + p * 2}px`;
    const cw = card.offsetWidth, ch = card.offsetHeight;
    let top = r.bottom + p + 10;
    if (top + ch > vh - 8) top = r.top - p - 10 - ch;          // no room below: above
    if (top < 8) top = Math.min(vh - ch - 8, Math.max(8, r.top + 12)); // no room either: over the target, inside the screen
    const start = rtl() ? r.right - cw : r.left;                 // align with the target's start edge
    const left = Math.min(Math.max(8, start), vw - cw - 8);
    card.style.cssText = `top:${top}px;left:${left}px`;
  }
  async function show(n) {
    if (n < 0 || n >= steps.length) return;
    const s = steps[n];
    i = n;
    if (s.before) await s.before();
    const t = targetOf(s);
    if (t) t.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" });
    card.innerHTML = `<p class="gtour__count">${n + 1} / ${steps.length}</p><h2 class="gtour__title">${esc(s.title)}</h2>${s.body ? `<p class="gtour__body">${esc(s.body)}</p>` : ""}
      <div class="gtour__bar"><button type="button" data-gtour="end" class="gtour__x" aria-label="${esc(o.closeText)}">×</button>
        ${n > 0 ? `<button type="button" data-gtour="back" class="gtour__btn">${esc(o.backText)}</button>` : ""}
        <button type="button" data-gtour="next" class="gtour__btn gtour__btn--primary">${esc(n === steps.length - 1 ? o.doneText : o.nextText)}</button></div>`;
    card.setAttribute("aria-label", s.title);
    ring.classList.toggle("is-free", !t);
    place();
    card.querySelector(".gtour__btn--primary").focus({ preventScroll: true });
  }
  const api = {
    start(n = 0) { if (!ring) build(); lastFocus = document.activeElement; document.documentElement.classList.add("gtour-on"); show(n); return api; },
    next() { if (i >= steps.length - 1) api.end("done"); else show(i + 1); return api; },
    back() { if (i > 0) show(i - 1); return api; },
    end(reason = "closed") {
      if (i < 0) return api;
      i = -1; ring.remove(); card.remove(); ring = card = null;
      document.removeEventListener("keydown", onKey); removeEventListener("resize", place); removeEventListener("scroll", place, true);
      document.documentElement.classList.remove("gtour-on");
      markSeen(); lastFocus && lastFocus.focus && lastFocus.focus();
      o.onEnd && o.onEnd(reason);
      return api;
    },
    isOpen: () => i >= 0, step: () => i, seen,
  };
  return api;
}
