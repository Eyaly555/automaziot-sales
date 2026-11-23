// offer-page — the price offer as a page of the demo. Tracks as cards with their own price (computed from their
// lines, never typed), add-ons as tiles, monthly lines in their own pane, hourly lines counted with a stepper, and
// the sum as the focal figure: it counts to its new value, shows VAT under it and opens line by line. Every line
// opens over the page with what it is, what is included, why (in the client's words) and a door to the screen of
// the demo that line pays for. The choice lives in the address, so a configured offer can be sent as a link.
//
// The truth contract: every figure comes from the lines you pass. A line without a valid price is shown as
// "no price" and is never summed; nothing here invents, rounds up or completes a price.

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// keep keyboard focus across a repaint: find the focused control again by its data-* attributes
const keepFocus = (root, paint) => {
  const a = root.contains(document.activeElement) ? document.activeElement : null;
  const sel = a ? [...a.attributes].filter((x) => x.name.startsWith("data-")).map((x) => `[${x.name}="${CSS.escape(x.value)}"]`).join("") : "";
  paint();
  if (sel) root.querySelector(sel)?.focus({ preventScroll: true });
};
const priced = (l) => typeof l.price === "number" && Number.isFinite(l.price) && l.price >= 0;
const reduce = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * createOffer(el, opts)
 *   lines     [{ id, name, price, kind: "base"|"option"|"monthly"|"hourly", desc, includes: [], why, who, door: { label, href } | { label, open() } }]
 *   tracks    [{ id, name, note, lines: [ids of base lines] }]   — the one real fork; one track is chosen. Optional.
 *   vatRate   required, e.g. 0.18 — an input, never assumed
 *   currency  "₪" (default) · locale "he-IL"
 *   urlState  true: ?ot=<track>&oa=<ids>&oh=<hours> mirrors the choice (default true)
 *   discountPct  optional, from the proposal: applied to the one-time sum and shown as its own line
 *   maxHours  stepper ceiling (default 200) · contract: { label, href } — the last step, to the formal contract
 * returns { el, state, totals, choose(track), toggle(id), setHours(n), open(id), destroy }
 */
export function createOffer(el, opts = {}) {
  const o = { lines: [], tracks: [], currency: "₪", locale: "he-IL", urlState: true, maxHours: 200, contract: null, title: "ההצעה", ...opts };
  if (typeof o.vatRate !== "number" || !Number.isFinite(o.vatRate)) throw new Error("offer-page: vatRate is required (e.g. 0.18)");
  const lines = o.lines.map((l) => ({ ...l, ok: priced(l) }));
  lines.filter((l) => !l.ok).forEach((l) => console.warn(`offer-page: line "${l.id}" has no valid price and is not summed`));
  const byId = new Map(lines.map((l) => [String(l.id), l]));
  // shown to the agora when a figure has one; never rounded to a whole shekel behind the visitor's back
  const money = (n) => `${o.currency}${n.toLocaleString(o.locale, { minimumFractionDigits: Number.isInteger(Math.round(n * 100) / 100) ? 0 : 2, maximumFractionDigits: 2 })}`;
  const disc = typeof o.discountPct === "number" && o.discountPct > 0 ? o.discountPct : 0;
  const hourly = lines.filter((l) => l.kind === "hourly");

  // ------------------------------------------------------------------ state (from the address when present)
  const q = typeof location !== "undefined" && o.urlState ? new URLSearchParams(location.search) : new URLSearchParams();
  const state = {
    track: q.get("ot") && o.tracks.some((t) => t.id === q.get("ot")) ? q.get("ot") : o.tracks[0]?.id || null,
    add: new Set((q.get("oa") || "").split(",").filter((id) => byId.get(id)?.kind === "option")),
    hours: Math.max(0, Math.min(o.maxHours, parseInt(q.get("oh") || "0", 10) || 0)),
  };
  const write = () => {
    if (!o.urlState || typeof history === "undefined") return;
    try { const u = new URL(location.href); state.track ? u.searchParams.set("ot", state.track) : u.searchParams.delete("ot"); state.add.size ? u.searchParams.set("oa", [...state.add].join(",")) : u.searchParams.delete("oa"); state.hours ? u.searchParams.set("oh", state.hours) : u.searchParams.delete("oh"); history.replaceState(history.state, "", u); } catch { /* sandboxed */ }
  };

  const trackLines = (t) => (t ? t.lines.map((id) => byId.get(String(id))).filter(Boolean) : lines.filter((l) => l.kind === "base"));
  const trackPrice = (t) => trackLines(t).filter((l) => l.ok).reduce((s, l) => s + l.price, 0);
  const chosen = () => {
    const t = o.tracks.find((x) => x.id === state.track);
    return [...trackLines(t), ...lines.filter((l) => l.kind === "option" && state.add.has(String(l.id)))];
  };
  function totals() {
    const gross = chosen().filter((l) => l.ok).reduce((s, l) => s + l.price, 0) + hourly.filter((l) => l.ok).reduce((s, l) => s + l.price * state.hours, 0);
    const discount = gross * disc / 100, once = gross - discount;
    const monthly = lines.filter((l) => l.kind === "monthly" && l.ok).reduce((s, l) => s + l.price, 0);
    return { gross, discount, once, vat: once * o.vatRate, withVat: once * (1 + o.vatRate), monthly, unpriced: chosen().filter((l) => !l.ok).length };
  }

  // ------------------------------------------------------------------ markup
  const root = document.createElement("section");
  root.className = "offer";
  el.appendChild(root);
  const priceTag = (l, x = "") => (l.ok ? `<b class="offer__price">${money(l.price)}${x}</b>` : `<span class="offer__noprice">אין מחיר — לא נכלל בסכום</span>`);
  const lineBtn = (l, extra = "") => `<button type="button" class="offer__line${l.ok ? "" : " offer__line--unpriced"}" data-offer-open="${esc(l.id)}"><span class="offer__lname">${esc(l.name)}</span>${extra}${priceTag(l, l.kind === "monthly" ? " לחודש" : l.kind === "hourly" ? " לשעה" : "")}</button>`;

  function render() {
    const t = totals();
    root.innerHTML = `
      ${o.tracks.length ? `<div class="offer__tracks" role="radiogroup" aria-label="מסלול">${o.tracks.map((tr) => { const partial = trackLines(tr).some((l) => !l.ok); return `<button type="button" role="radio" class="offer__track" aria-checked="${tr.id === state.track}" data-offer-track="${esc(tr.id)}">
          <span class="offer__tname">${esc(tr.name)}</span>${tr.note ? `<small>${esc(tr.note)}</small>` : ""}<b class="offer__tprice">${money(trackPrice(tr))}${partial ? " <small>(בלי שורה שאין לה מחיר)</small>" : ""}</b></button>`; }).join("")}</div>` : ""}
      <div class="offer__cols">
        <div class="offer__main">
          <h3 class="offer__h">מה כלול</h3>
          <ul class="offer__list">${trackLines(o.tracks.find((x) => x.id === state.track)).map((l) => `<li>${lineBtn(l)}</li>`).join("")}</ul>
          ${lines.some((l) => l.kind === "option") ? `<h3 class="offer__h">תוספות</h3><ul class="offer__tiles">${lines.filter((l) => l.kind === "option").map((l) => `<li class="offer__tile"><label class="offer__tick"><input type="checkbox" data-offer-add="${esc(l.id)}"${state.add.has(String(l.id)) ? " checked" : ""}${l.ok ? "" : " disabled"}><span class="visually-hidden">הוספת ${esc(l.name)}</span></label>${lineBtn(l)}</li>`).join("")}</ul>` : ""}
          ${hourly.length ? `<h3 class="offer__h">לפי שעות</h3><ul class="offer__list">${hourly.map((l) => `<li class="offer__hourly">${lineBtn(l)}<span class="offer__stepper" role="group" aria-label="כמה שעות"><button type="button" data-offer-h="-5" aria-label="פחות 5 שעות">−</button><output>${state.hours}</output><button type="button" data-offer-h="5" aria-label="עוד 5 שעות">+</button></span><small class="offer__hsay">${l.ok && state.hours ? `${state.hours} × ${money(l.price)} = ${money(l.price * state.hours)}` : "לא נכלל בסכום"}</small></li>`).join("")}</ul>` : ""}
          ${lines.some((l) => l.kind === "monthly") ? `<h3 class="offer__h">חודשי</h3><ul class="offer__list">${lines.filter((l) => l.kind === "monthly").map((l) => `<li>${lineBtn(l)}</li>`).join("")}</ul>` : ""}
        </div>
        <aside class="offer__sum">
          <button type="button" class="offer__total" data-offer-sum><small>סה״כ חד־פעמי</small><b data-offer-total>${money(t.once)}</b>
            ${t.discount ? `<span>לפני הנחה ${money(t.gross)} · הנחה ${disc}%: −${money(t.discount)}</span>` : ""}<span>מע״מ ${Math.round(o.vatRate * 1000) / 10}%: ${money(t.vat)} · כולל מע״מ ${money(t.withVat)}</span></button>
          ${t.monthly ? `<p class="offer__monthly">ובנוסף ${money(t.monthly)} לחודש</p>` : ""}
          ${t.unpriced ? `<p class="offer__warn">${t.unpriced === 1 ? "שורה אחת" : t.unpriced + " שורות"} בלי מחיר — לא נכללו בסכום</p>` : ""}
          ${o.contract ? `<a class="offer__contract" href="${esc(o.contract.href)}">${esc(o.contract.label || "לחוזה ולחתימה")}</a>` : ""}
        </aside>
      </div>
      <dialog class="offer__dlg"></dialog>`;
    write();
  }

  // the total counts from its old value to the new one
  let shown = 0;
  function countTo(to) {
    const elT = root.querySelector("[data-offer-total]"); if (!elT) return;
    if (reduce()) { elT.textContent = money(to); shown = to; return; }
    const from = shown, t0 = performance.now();
    const step = (now) => { const k = Math.min(1, (now - t0) / 500), v = from + (to - from) * (1 - Math.pow(1 - k, 3)); elT.textContent = money(v); if (k < 1) requestAnimationFrame(step); else shown = to; };
    requestAnimationFrame(step);
  }
  const update = () => { const before = shown; keepFocus(root, render); const t = totals().once; root.querySelector("[data-offer-total]").textContent = money(before); countTo(t); };

  function openLine(id) {
    const l = byId.get(String(id)); if (!l) return;
    const d = root.querySelector(".offer__dlg");
    d.innerHTML = `<form method="dialog" class="offer__dlgin"><header><h3>${esc(l.name)}</h3><button class="offer__x" aria-label="סגירה">×</button></header>
      ${priceTag(l, l.kind === "monthly" ? " לחודש" : l.kind === "hourly" ? " לשעה" : "")}
      ${l.desc ? `<p>${esc(l.desc)}</p>` : ""}
      ${l.includes && l.includes.length ? `<ul class="offer__inc">${l.includes.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
      ${l.why ? `<blockquote class="offer__why">«${esc(l.why)}»${l.who ? `<footer>${esc(l.who)}</footer>` : ""}</blockquote>` : ""}
      ${l.door ? (l.door.href ? `<a class="offer__door" href="${esc(l.door.href)}">${esc(l.door.label || "לראות בהדגמה")}</a>` : `<button type="button" class="offer__door" data-offer-door>${esc(l.door.label || "לראות בהדגמה")}</button>`) : ""}</form>`;
    d.querySelector("[data-offer-door]")?.addEventListener("click", () => { d.close(); l.door.open(l); });
    d.showModal ? d.showModal() : d.setAttribute("open", "");
  }
  function openSum() {
    const d = root.querySelector(".offer__dlg"), t = totals();
    const rows = [...chosen().map((l) => [l.name, l.ok ? money(l.price) : "אין מחיר"]), ...hourly.filter((l) => state.hours).map((l) => [`${l.name} · ${state.hours} שעות`, l.ok ? money(l.price * state.hours) : "אין מחיר"])];
    d.innerHTML = `<form method="dialog" class="offer__dlgin"><header><h3>מה נכנס לסכום</h3><button class="offer__x" aria-label="סגירה">×</button></header>
      <table class="offer__break"><tbody>${rows.map(([a, b]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join("")}</tbody>
      <tfoot>${t.discount ? `<tr><td>הנחה ${disc}%</td><td>−${money(t.discount)}</td></tr>` : ""}<tr><td>סה״כ</td><td>${money(t.once)}</td></tr><tr><td>מע״מ</td><td>${money(t.vat)}</td></tr><tr><td>כולל מע״מ</td><td>${money(t.withVat)}</td></tr></tfoot></table></form>`;
    d.showModal ? d.showModal() : d.setAttribute("open", "");
  }

  root.addEventListener("click", (e) => {
    const b = e.target.closest("button, input"); if (!b) return;
    if (b.dataset.offerTrack) api.choose(b.dataset.offerTrack);
    else if (b.dataset.offerOpen) openLine(b.dataset.offerOpen);
    else if (b.dataset.offerH) api.setHours(state.hours + +b.dataset.offerH);
    else if (b.hasAttribute("data-offer-sum")) openSum();
  });
  root.addEventListener("change", (e) => { const c = e.target.closest("[data-offer-add]"); if (c) api.toggle(c.dataset.offerAdd); });

  const api = {
    el: root,
    state: () => ({ track: state.track, add: [...state.add], hours: state.hours }),
    totals,
    choose(id) { if (o.tracks.some((t) => t.id === id)) { state.track = id; update(); } return api; },
    toggle(id) { const l = byId.get(String(id)); if (l && l.kind === "option" && l.ok) { state.add.has(String(id)) ? state.add.delete(String(id)) : state.add.add(String(id)); update(); } return api; },
    setHours(n) { state.hours = Math.max(0, Math.min(o.maxHours, Math.round(+n) || 0)); update(); return api; },
    open: openLine,
    destroy: () => root.remove(),
  };
  render(); shown = totals().once;
  return api;
}
