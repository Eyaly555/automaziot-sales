// agent-activity — what the AI employee just did, on the owner's screen. Each turn of a conversation becomes an
// entry: who wrote and on which channel, the steps the agent took (recognised, understood, checked, acted), lit one
// after another, and what it wrote in the system, each write a door to the record it created. This is the half of
// an agent demo that turns "a nice chat" into "work that happened".

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const CH = { whatsapp: "וואטסאפ", voice: "שיחה", web: "צ׳אט באתר", email: "מייל", sms: "SMS" };

/**
 * createAgentActivity(el, { title, onOpen(write, turn), max, empty, stepMs })
 * record(turn) → the entry element
 *   turn = { channel, who, said, at (string), steps: [{ label, say, state?: "ok"|"warn"|"blocked" }],
 *            writes: [{ label, kind, id }], handoff?: { to, why } }
 */
export function createAgentActivity(el, opts = {}) {
  const o = { title: "מה הסוכן עשה", max: 30, empty: "עוד לא היו פניות. כשמישהו יכתוב או יתקשר, תראו כאן כל צעד.", stepMs: 380, wroteText: "נכתב במערכת", noWriteText: "ענה מתוך הנתונים — לא נדרש שינוי", ...opts };
  const root = document.createElement("section");
  root.className = "agact";
  root.innerHTML = `<header class="agact__head"><h2 class="agact__title">${esc(o.title)}</h2><span class="agact__count" aria-live="polite">0</span></header>
    <p class="agact__empty">${esc(o.empty)}</p><ol class="agact__list"></ol>`;
  el.appendChild(root);
  const list = root.querySelector(".agact__list"), count = root.querySelector(".agact__count"), empty = root.querySelector(".agact__empty");
  const turns = [];
  const listeners = {};
  const emit = (ev, d) => (listeners[ev] || []).forEach((fn) => fn(d));

  function record(turn) {
    const t = { steps: [], writes: [], ...turn };
    turns.unshift(t);
    const li = document.createElement("li");
    li.className = "agact__turn";
    li.innerHTML = `<div class="agact__who"><span class="agact__ch agact__ch--${esc(t.channel || "web")}">${esc(CH[t.channel] || t.channel || "")}</span>
        <b>${esc(t.who || "")}</b>${t.at ? `<time>${esc(t.at)}</time>` : ""}</div>
      ${t.said ? `<blockquote class="agact__said">${esc(t.said)}</blockquote>` : ""}
      <ol class="agact__steps">${t.steps.map((s, i) => `<li class="agact__step agact__step--${esc(s.state || "ok")}" style="--agact-i:${i}"><b>${esc(s.label)}</b>${s.say ? `<span>${esc(s.say)}</span>` : ""}</li>`).join("")}</ol>
      ${t.handoff ? `<p class="agact__handoff">הועבר ל${esc(t.handoff.to)}${t.handoff.why ? ` · ${esc(t.handoff.why)}` : ""}</p>` : ""}
      <div class="agact__wrote"><small>${esc(o.wroteText)} · ${t.writes.length}</small>
        ${t.writes.length ? `<ul>${t.writes.map((w, i) => `<li><button type="button" class="agact__door" data-agact-w="${i}">${esc(w.label)}</button></li>`).join("")}</ul>` : `<span class="agact__none">${esc(o.noWriteText)}</span>`}</div>`;
    li.addEventListener("click", (e) => { const b = e.target.closest("[data-agact-w]"); if (b) { const w = t.writes[+b.dataset.agactW]; o.onOpen && o.onOpen(w, t); emit("open", { write: w, turn: t }); } });
    list.prepend(li);
    while (list.children.length > o.max) list.lastElementChild.remove();
    // light the steps in order, then the writes: the visitor sees the work happen, not a finished list
    const steps = [...li.querySelectorAll(".agact__step")];
    li.classList.add("is-running");
    steps.forEach((s, i) => setTimeout(() => s.classList.add("is-done"), o.stepMs * (i + 1)));
    setTimeout(() => { li.classList.remove("is-running"); li.classList.add("is-done"); emit("done", t); }, o.stepMs * (steps.length + 1));
    count.textContent = turns.length;
    empty.hidden = true;
    emit("record", t);
    return li;
  }

  const api = {
    el: root, record,
    turns: () => turns.slice(),
    clear() { turns.length = 0; list.innerHTML = ""; count.textContent = "0"; empty.hidden = false; },
    on(ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); return api; },
    destroy() { root.remove(); },
  };
  return api;
}
