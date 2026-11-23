// persona-switch — one way in per role. Role tiles where each person lands on their own day, a small "you are X"
// switch to change role at any moment, and deep links that open as the right person (…?as=<id>), so a link sent to
// the field manager opens as the field manager.

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/**
 * createPersonas({ personas, param = "as", key = "demo-persona", storage = "session", fallback })
 *   personas  [{ id, name, role, initials?, home: "#/today", note? }]
 * returns { list, current, set(id, { go }), link(path, id), can(id?, what), on("change"), fromUrl() }
 */
export function createPersonas({ personas = [], param = "as", key = "demo-persona", storage = "session", fallback } = {}) {
  const store = (() => { try { return storage === "local" ? localStorage : storage === "session" ? sessionStorage : null; } catch { return null; } })();
  const byId = new Map(personas.map((p) => [p.id, p]));
  const listeners = [];
  const fromUrl = () => {
    if (typeof location === "undefined") return null;
    const q = new URLSearchParams(location.search).get(param);
    const h = location.hash.includes("?") ? new URLSearchParams(location.hash.split("?")[1]).get(param) : null;
    return byId.has(h) ? h : byId.has(q) ? q : null;
  };
  let cur = fromUrl() || (() => { try { return store && store.getItem(key); } catch { return null; } })() || fallback || null;
  if (cur && !byId.has(cur)) cur = null;
  if (cur) try { store && store.setItem(key, cur); } catch { /* ignore */ }

  const api = {
    list: () => personas.slice(),
    current: () => (cur ? byId.get(cur) : null),
    /** set(id, { go: true }) switches role and (by default) lands on that person's home */
    set(id, { go = true } = {}) {
      if (!byId.has(id)) return api;
      cur = id;
      try { store && store.setItem(key, id); } catch { /* ignore */ }
      listeners.forEach((fn) => fn(byId.get(id)));
      if (go && typeof location !== "undefined" && byId.get(id).home) location.hash = api.link(byId.get(id).home, id).replace(/^.*#/, "#");
      return api;
    },
    /** link("#/jobs/17", "tech-2") → "#/jobs/17?as=tech-2": a door that opens as that person */
    link(path, id = cur) {
      if (!id) return path;
      const [base, q = ""] = path.split("?"), p = new URLSearchParams(q); p.set(param, id);
      return `${base}?${p}`;
    },
    /** can("finance") with personas[i].can = ["finance", ...]: hide what this role would not see */
    can(what, id = cur) { const p = byId.get(id); return !!p && (!p.can || p.can.includes(what)); },
    fromUrl,
    on(ev, fn) { if (ev === "change") listeners.push(fn); return api; },
    clear() { cur = null; try { store && store.removeItem(key); } catch { /* ignore */ } listeners.forEach((fn) => fn(null)); return api; },
  };
  if (typeof addEventListener !== "undefined") addEventListener("hashchange", () => { const u = fromUrl(); if (u && u !== cur) api.set(u, { go: false }); });
  return api;
}

/** mountPersonaTiles(el, personas, { heading }) — the role tiles: who are you today? */
export function mountPersonaTiles(el, ps, { heading = "מי נכנס?" } = {}) {
  const root = document.createElement("section");
  root.className = "pers";
  root.innerHTML = `${heading ? `<h2 class="pers__h">${esc(heading)}</h2>` : ""}<ul class="pers__tiles">${ps.list().map((p) => `<li><button type="button" class="pers__tile" data-pers="${esc(p.id)}">
      <span class="pers__av" aria-hidden="true">${esc(p.initials || p.name.slice(0, 1))}</span>
      <span class="pers__txt"><b>${esc(p.name)}</b><small>${esc(p.role)}</small>${p.note ? `<span class="pers__note">${esc(p.note)}</span>` : ""}</span></button></li>`).join("")}</ul>`;
  el.appendChild(root);
  const paint = () => root.querySelectorAll("[data-pers]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.pers === ps.current()?.id));
  root.addEventListener("click", (e) => { const b = e.target.closest("[data-pers]"); if (b) ps.set(b.dataset.pers); });
  ps.on("change", paint); paint();
  return { el: root, destroy: () => root.remove() };
}

/** mountPersonaChip(el, personas) — "you are X" in the header; opens a short list to switch role anywhere */
export function mountPersonaChip(el, ps, { label = "נכנסת בתור" } = {}) {
  const root = document.createElement("div");
  root.className = "pers-chip";
  root.innerHTML = `<button type="button" class="pers-chip__btn" aria-haspopup="true" aria-expanded="false"></button><ul class="pers-chip__menu" hidden></ul>`;
  el.appendChild(root);
  const btn = root.querySelector("button"), menu = root.querySelector("ul");
  const paint = () => {
    const p = ps.current();
    btn.innerHTML = p ? `<span class="pers__av" aria-hidden="true">${esc(p.initials || p.name.slice(0, 1))}</span><span>${esc(label)} <b>${esc(p.name)}</b> · ${esc(p.role)}</span>` : `<span>${esc(label)}…</span>`;
    menu.innerHTML = ps.list().map((x) => `<li><button type="button" data-pers="${esc(x.id)}" aria-pressed="${x.id === p?.id}">${esc(x.name)} <small>${esc(x.role)}</small></button></li>`).join("");
  };
  const toggle = (open) => { menu.hidden = !open; btn.setAttribute("aria-expanded", open); };
  btn.addEventListener("click", () => toggle(menu.hidden));
  menu.addEventListener("click", (e) => { const b = e.target.closest("[data-pers]"); if (b) { toggle(false); ps.set(b.dataset.pers); } });
  root.addEventListener("keydown", (e) => { if (e.key === "Escape") { toggle(false); btn.focus(); } });
  ps.on("change", paint); paint();
  return { el: root, destroy: () => root.remove() };
}
