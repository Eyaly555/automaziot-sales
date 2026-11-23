// whatsapp-thread — a WhatsApp conversation surface: header, bubbles with ticks, typing dots, attachments, quick replies
// and a composer. Played from a script, or live: `send(text)` is the hook where a real agent endpoint plugs in.
// The look follows the real app (and nothing more); every colour is a custom property.

const ICON = {
  send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3.4 20.4 21 12 3.4 3.6 3.4 10l12.6 2-12.6 2z"/></svg>',
  clip: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M20 11.5 12.3 19.2a5 5 0 0 1-7.1-7.1l8.1-8.1a3.4 3.4 0 0 1 4.8 4.8l-8 8a1.7 1.7 0 0 1-2.4-2.4l7.3-7.3"/></svg>',
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>',
  doc: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 2h8l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm7 1.5V8h4.5z"/></svg>',
  img: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm2 13h12l-4-5-3 3.5-2-2.5z"/></svg>',
};
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const kb = (n) => (n > 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB");

/**
 * createWhatsAppThread(el, opts)
 *   title, subtitle, initials       the header (the other side of the conversation)
 *   ("me" is whoever holds this phone, the visitor; "them" is the other side, the one `send` answers for)
 *   send(text, { history, attachment }) → reply | [replies] | null   async, optional. A reply is a string or
 *        { text, attachment, quick: [..] }. Leave it out and the thread is scripted only (play / add / say).
 *   quick: [..]                      quick-reply chips shown above the composer
 *   attachments: [{ name, kind: "image"|"doc", size, src }]   what the clip button offers (a sheet of ready files)
 *   now: () => Date                  the clock for time stamps. Default: starts at opts.startAt ("09:41"), +1 min a message.
 *   typingMs: (text) => ms           how long the other side "types"
 * returns { add, say, play, stop, setQuick, typing, clear, messages, on, destroy }
 */
export function createWhatsAppThread(el, opts = {}) {
  const o = { title: "", subtitle: "", initials: "", quick: [], attachments: [], startAt: "09:41", placeholder: "הודעה", typingText: "מקליד/ה…", todayText: "היום", typingMs: (t) => Math.min(2200, 600 + String(t || "").length * 18), ...opts };
  let [hh, mm] = o.startAt.split(":").map(Number), tick = 0;
  const now = o.now || (() => { const d = new Date(2000, 0, 1, hh, mm + tick++); return d; });
  const stamp = (d) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  const log = [], listeners = {};
  const emit = (ev, d) => (listeners[ev] || []).forEach((fn) => fn(d));
  let run = 0, busy = false;

  const root = document.createElement("section");
  root.className = "wat";
  root.setAttribute("aria-label", o.title ? `שיחת וואטסאפ עם ${o.title}` : "שיחת וואטסאפ");
  root.innerHTML = `
    <header class="wat__head">
      <span class="wat__back" aria-hidden="true">${ICON.back}</span>
      <span class="wat__av" aria-hidden="true">${esc(o.initials || (o.title || "?").slice(0, 1))}</span>
      <div class="wat__who"><b class="wat__title">${esc(o.title)}</b><small class="wat__sub">${esc(o.subtitle)}</small></div>
    </header>
    <div class="wat__body" role="log" aria-live="polite"><div class="wat__day"><span>${esc(o.todayText)}</span></div></div>
    <div class="wat__quick" hidden></div>
    <div class="wat__sheet" hidden></div>
    <form class="wat__bar">
      <button type="button" class="wat__clip" aria-label="צירוף קובץ"${o.attachments.length ? "" : " hidden"}>${ICON.clip}</button>
      <input class="wat__in" autocomplete="off" maxlength="1000" placeholder="${esc(o.placeholder)}" aria-label="${esc(o.placeholder)}">
      <button type="submit" class="wat__send" aria-label="שליחה">${ICON.send}</button>
    </form>`;
  el.appendChild(root);
  const $ = (s) => root.querySelector(s);
  const body = $(".wat__body"), input = $(".wat__in"), quickEl = $(".wat__quick"), sheet = $(".wat__sheet"), sub = $(".wat__sub");
  const scroll = () => { body.scrollTop = body.scrollHeight; };

  function attachHtml(a) {
    if (!a) return "";
    if (a.kind === "image") return a.src ? `<img class="wat__img" alt="${esc(a.name)}" src="${esc(a.src)}">` : `<div class="wat__imgph">${ICON.img}<span>${esc(a.name)}</span></div>`;
    return `<div class="wat__file">${ICON.doc}<span class="wat__fname">${esc(a.name)}</span>${a.size ? `<small>${kb(a.size)}</small>` : ""}</div>`;
  }

  /** add({ from: "me"|"them"|"note", text, attachment, time }) — "me" is the holder of the phone */
  function add(m) {
    const msg = { from: m.from || "them", text: m.text || "", attachment: m.attachment || null, time: m.time || now(), status: m.from === "me" ? "sent" : null };
    log.push(msg);
    const d = document.createElement("div");
    if (msg.from === "note") { d.className = "wat__note"; d.textContent = msg.text; body.appendChild(d); scroll(); return msg; }
    d.className = `wat__msg wat__msg--${msg.from === "me" ? "out" : "in"}`;
    d.innerHTML = `<div class="wat__bubble">${attachHtml(msg.attachment)}${msg.text ? `<div class="wat__text">${esc(msg.text).replace(/\n/g, "<br>")}</div>` : ""}
      <span class="wat__meta"><time>${stamp(msg.time)}</time>${msg.from === "me" ? '<i class="wat__tick" data-wat-tick="sent" aria-label="נשלח">✓</i>' : ""}</span></div>`;
    body.appendChild(d); scroll();
    msg.el = d;
    emit("message", msg);
    return msg;
  }
  function setTick(msg, status) {
    if (!msg || !msg.el) return;
    msg.status = status;
    const t = msg.el.querySelector(".wat__tick");
    if (t) { t.dataset.watTick = status; t.textContent = status === "sent" ? "✓" : "✓✓"; t.setAttribute("aria-label", { sent: "נשלח", delivered: "נמסר", read: "נקרא" }[status]); }
  }
  let typingEl = null;
  function typing(on) {
    if (on && !typingEl) { typingEl = document.createElement("div"); typingEl.className = "wat__msg wat__msg--in wat__typing"; typingEl.innerHTML = '<div class="wat__bubble"><i></i><i></i><i></i></div>'; body.appendChild(typingEl); scroll(); sub.textContent = o.typingText; }
    if (!on && typingEl) { typingEl.remove(); typingEl = null; sub.textContent = o.subtitle; }
  }
  /** the other side writes, after typing for a moment */
  async function say(text, x = {}) {
    const my = run;
    typing(true);
    await sleep(x.typingMs ?? o.typingMs(text));
    if (my !== run) return null;
    typing(false);
    return add({ from: x.from || "them", text, attachment: x.attachment });
  }
  function setQuick(list = []) {
    quickEl.hidden = !list.length;
    quickEl.innerHTML = list.map((q) => `<button type="button" class="wat__chip" data-wat-say="${esc(q)}">${esc(q)}</button>`).join("");
  }

  const waiting = [];
  async function deliver(text, attachment) {
    // typed while the other side is still answering: shown at once, answered in turn (as WhatsApp does)
    if (busy) { waiting.push(add({ from: "me", text, attachment })); return; }
    const mine = add({ from: "me", text, attachment });
    setQuick([]);
    emit("send", { text, attachment });
    if (o.send) busy = true;               // taken at once, so anything typed during the ticks waits its turn
    const my = run;
    await sleep(350); setTick(mine, "delivered");
    if (!o.send) return;
    try {
      await sleep(400); setTick(mine, "read");
      typing(true);
      const t0 = performance.now();
      let replies = await o.send(text, { history: log.map(({ el: _e, ...m }) => m), attachment });
      if (my !== run) return;
      if (replies == null) { typing(false); return; }
      replies = Array.isArray(replies) ? replies : [replies];
      for (const [i, r] of replies.entries()) {
        const rr = typeof r === "string" ? { text: r } : r;
        const wait = o.typingMs(rr.text) - (i === 0 ? performance.now() - t0 : 0);
        typing(true); if (wait > 0) await sleep(wait);
        if (my !== run) return;
        typing(false);
        add({ from: "them", text: rr.text, attachment: rr.attachment });
        if (rr.quick) setQuick(rr.quick);
      }
    } catch (e) {
      typing(false);
      add({ from: "note", text: "ההודעה לא נענתה. אפשר לנסות שוב." });
      emit("error", e);
    } finally {
      busy = false;
      const next = waiting.shift();
      if (next && my === run) { next.el.remove(); log.splice(log.indexOf(next), 1); deliver(next.text, next.attachment); }
    }
  }

  /** play([{ from, text, attachment, wait, quick, run }]) — a scripted conversation, step by step; `run` fires a callback */
  async function play(script) {
    const my = ++run;
    for (const s of script) {
      if (my !== run) return false;
      if (s.wait) await sleep(s.wait);
      if (my !== run) return false;
      if (s.from === "me") { const m = add({ from: "me", text: s.text, attachment: s.attachment }); await sleep(300); setTick(m, "read"); }
      else if (s.text || s.attachment) await say(s.text, s);
      if (s.quick) setQuick(s.quick);
      if (typeof s.run === "function") s.run(api);
    }
    return my === run;
  }

  root.querySelector(".wat__bar").addEventListener("submit", (e) => { e.preventDefault(); const t = input.value.trim(); if (!t) return; input.value = ""; deliver(t); });
  quickEl.addEventListener("click", (e) => { const b = e.target.closest("[data-wat-say]"); if (b) deliver(b.dataset.watSay); });
  $(".wat__clip").addEventListener("click", () => {
    sheet.hidden = !sheet.hidden;
    sheet.innerHTML = o.attachments.map((a, i) => `<button type="button" class="wat__pick" data-wat-file="${i}">${a.kind === "image" ? ICON.img : ICON.doc}<span>${esc(a.name)}</span></button>`).join("");
  });
  sheet.addEventListener("click", (e) => { const b = e.target.closest("[data-wat-file]"); if (!b) return; sheet.hidden = true; deliver(input.value.trim(), o.attachments[+b.dataset.watFile]); input.value = ""; });
  setQuick(o.quick);

  const api = {
    el: root, add, say, play, setQuick, typing,
    stop() { run++; typing(false); },
    clear() { run++; typing(false); log.length = 0; body.querySelectorAll(".wat__msg,.wat__note").forEach((n) => n.remove()); },
    messages: () => log.map(({ el: _e, ...m }) => m),
    send: (text, attachment) => deliver(text, attachment),
    on(ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); return api; },
    destroy() { run++; root.remove(); },
  };
  return api;
}
