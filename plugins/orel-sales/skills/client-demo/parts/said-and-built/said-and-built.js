// said-and-built — the client's own sentences from the call, each beside what the system does with it and a door to
// the screen that answers it. The client reads their words taken seriously before they press anything.

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/**
 * createSaidAndBuilt(el, { heading, intro, items, open, seenKey })
 *   items  [{ id, quote, who, title, body, cta, href?, to? }]   quote = their words, verbatim; who = who said it
 *   open(item)   called when a door is pressed (route your app to item.to). Without it, item.href is followed.
 *   seenKey      remember which answers the visitor already opened (sessionStorage key), shown as visited
 * returns { el, markSeen(id), seen(), destroy }
 */
export function createSaidAndBuilt(el, opts = {}) {
  const o = { heading: "מה אמרתם, ומה המערכת עושה עם זה", intro: "", items: [], cta: "לראות", seenKey: null, ...opts };
  const seen = new Set(read());
  function read() { try { return o.seenKey ? JSON.parse(sessionStorage.getItem(o.seenKey) || "[]") : []; } catch { return []; } }
  function write() { try { o.seenKey && sessionStorage.setItem(o.seenKey, JSON.stringify([...seen])); } catch { /* private mode */ } }

  const root = document.createElement("section");
  root.className = "saidb";
  root.innerHTML = `<header class="saidb__head"><h2 class="saidb__h">${esc(o.heading)}</h2>${o.intro ? `<p class="saidb__intro">${esc(o.intro)}</p>` : ""}</header>
    <ol class="saidb__list">${o.items.map((it, i) => `<li class="saidb__item${seen.has(it.id ?? i) ? " is-seen" : ""}" data-saidb-id="${esc(it.id ?? i)}">
      <blockquote class="saidb__quote"><p>${esc(it.quote)}</p>${it.who ? `<footer>${esc(it.who)}</footer>` : ""}</blockquote>
      <div class="saidb__answer"><h3 class="saidb__title">${esc(it.title)}</h3>${it.body ? `<p class="saidb__body">${esc(it.body)}</p>` : ""}
        ${it.href && !o.open ? `<a class="saidb__go" href="${esc(it.href)}" data-saidb-go>${esc(it.cta || o.cta)}</a>` : `<button type="button" class="saidb__go" data-saidb-go>${esc(it.cta || o.cta)}</button>`}</div>
    </li>`).join("")}</ol>`;
  el.appendChild(root);
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-saidb-go]"); if (!b) return;
    const li = b.closest("[data-saidb-id]"), id = li.dataset.saidbId;
    const it = o.items.find((x, i) => String(x.id ?? i) === id);
    api.markSeen(id);
    if (o.open) { e.preventDefault(); o.open(it); }
  });
  const api = {
    el: root,
    markSeen(id) { seen.add(String(id)); write(); root.querySelector(`[data-saidb-id="${CSS.escape(String(id))}"]`)?.classList.add("is-seen"); },
    seen: () => [...seen],
    destroy: () => root.remove(),
  };
  return api;
}
