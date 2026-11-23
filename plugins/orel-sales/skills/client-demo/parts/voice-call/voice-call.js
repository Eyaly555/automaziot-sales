// voice-call — an AI phone call shown on screen: the caller rings, the call is answered, a timer runs, and the
// transcript appears line by line at the moment each was said. With a recording, the lines follow the audio and a
// tap on a line jumps there. Beside it, a card with the real number so the visitor can call the agent themselves.

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const PHONE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>';

/**
 * createVoiceCall(el, opts)
 *   caller        { name, number, note }   who is on the line
 *   agentName     the AI's name, shown on its lines
 *   lines         [{ who: "agent"|"caller"|"event", text, at }]   at = seconds from answer
 *   audio         an <audio> element or URL you host (optional): the lines then follow its currentTime
 *   autoAnswerMs  answer by itself after ringing this long (null = wait for the button)
 *   speed         playback speed of a scripted call (default 1)
 * returns { ring, answer, hangUp, seek, state, on, destroy }      events: "state" ({ state }) · "line" (line)
 */
export function createVoiceCall(el, opts = {}) {
  const o = { caller: { name: "", number: "" }, agentName: "", lines: [], autoAnswerMs: null, speed: 1, answerText: "מענה", hangText: "ניתוק", ringText: "שיחה נכנסת…", endText: "השיחה הסתיימה", ...opts };
  const lines = o.lines.slice().sort((a, b) => a.at - b.at);
  const listeners = {};
  const emit = (ev, d) => (listeners[ev] || []).forEach((fn) => fn(d));
  let state = "idle", t = 0, timer = null, ringTimer = null, shown = 0;
  const audio = typeof o.audio === "string" ? Object.assign(document.createElement("audio"), { src: o.audio, preload: "none" }) : o.audio || null;

  const root = document.createElement("section");
  root.className = "vcall";
  root.dataset.vcallState = "idle";
  root.innerHTML = `<header class="vcall__head">
      <span class="vcall__av" aria-hidden="true">${esc((o.caller.name || "?").slice(0, 1))}</span>
      <b class="vcall__name">${esc(o.caller.name)}</b>
      <small class="vcall__num" dir="ltr">${esc(o.caller.number)}</small>
      <span class="vcall__status" aria-live="polite"></span>
    </header>
    <ol class="vcall__lines" aria-label="תמלול השיחה"></ol>
    <div class="vcall__bar">
      <button type="button" class="vcall__btn vcall__btn--answer" data-vcall="answer">${PHONE}<span>${esc(o.answerText)}</span></button>
      <button type="button" class="vcall__btn vcall__btn--hang" data-vcall="hang">${PHONE}<span>${esc(o.hangText)}</span></button>
    </div>`;
  el.appendChild(root);
  const list = root.querySelector(".vcall__lines"), status = root.querySelector(".vcall__status");

  function set(s) { state = s; root.dataset.vcallState = s; paintStatus(); emit("state", { state: s }); }
  function paintStatus() { status.textContent = state === "ringing" ? o.ringText : state === "live" ? mmss(t) : state === "ended" ? `${o.endText} · ${mmss(t)}` : ""; }
  function lineEl(l, i) {
    const li = document.createElement("li");
    li.className = `vcall__line vcall__line--${l.who}`;
    li.innerHTML = l.who === "event" ? `<span>${esc(l.text)}</span>` : `<button type="button" class="vcall__say" data-vcall-at="${l.at}"><small>${esc(l.who === "agent" ? o.agentName : o.caller.name)} · ${mmss(l.at)}</small>${esc(l.text)}</button>`;
    li.dataset.i = i;
    return li;
  }
  // show every line whose time has come; mark the one being said now
  function sync() {
    while (shown < lines.length && lines[shown].at <= t) { list.appendChild(lineEl(lines[shown], shown)); emit("line", lines[shown]); shown++; list.scrollTop = list.scrollHeight; }
    list.querySelectorAll(".vcall__line").forEach((n) => n.classList.toggle("is-now", +n.dataset.i === shown - 1));
    paintStatus();
    if (!audio && shown >= lines.length && t >= (lines.at(-1)?.at || 0) + 2) api.hangUp();
  }
  function loop() {
    clearInterval(timer);
    timer = setInterval(() => { t = audio ? audio.currentTime : t + 0.25 * o.speed; sync(); }, 250);
  }

  const api = {
    el: root,
    ring() { if (state !== "idle" && state !== "ended") return api; list.innerHTML = ""; shown = 0; t = 0; set("ringing"); if (o.autoAnswerMs != null) ringTimer = setTimeout(api.answer, o.autoAnswerMs); return api; },
    answer() { if (state !== "ringing") return api; clearTimeout(ringTimer); set("live"); if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); audio.onended = () => api.hangUp(); } loop(); sync(); return api; },
    hangUp() { if (state === "ringing") { clearTimeout(ringTimer); set("ended"); return api; } if (state !== "live") return api; clearInterval(timer); if (audio) audio.pause(); set("ended"); return api; },
    /** jump to a second of the call (with audio: seeks the recording; scripted: shows everything up to it) */
    seek(sec) { if (audio) { audio.currentTime = sec; t = sec; } else { t = sec; } if (sec < (lines[shown - 1]?.at ?? 0)) { list.innerHTML = ""; shown = 0; } sync(); return api; },
    state: () => state,
    on(ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); return api; },
    destroy() { clearInterval(timer); clearTimeout(ringTimer); if (audio) audio.pause(); root.remove(); },
  };
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-vcall]"); if (b) { b.dataset.vcall === "answer" ? api.answer() : api.hangUp(); return; }
    const s = e.target.closest("[data-vcall-at]"); if (s && audio) api.seek(+s.dataset.vcallAt);
  });
  return api;
}

/** realNumberCard(el, { number, label, note }) — "call the real agent": a tel: link a visitor can press on a phone */
export function realNumberCard(el, { number, label = "התקשרו לסוכן בעצמכם", note = "" } = {}) {
  const digits = String(number || "").replace(/[^\d+]/g, "");
  const tel = digits.startsWith("0") ? "+972" + digits.slice(1) : digits;
  const card = document.createElement("aside");
  card.className = "vcall-real";
  card.innerHTML = `<b class="vcall-real__label">${esc(label)}</b><a class="vcall-real__num" href="tel:${esc(tel)}" dir="ltr">${PHONE}<span>${esc(number)}</span></a>${note ? `<small class="vcall-real__note">${esc(note)}</small>` : ""}`;
  el.appendChild(card);
  return { el: card, destroy: () => card.remove() };
}
