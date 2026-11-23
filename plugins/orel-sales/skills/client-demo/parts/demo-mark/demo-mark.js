// demo-mark — one quiet mark that says "this is a demonstration", and on press, one sentence about where the data
// comes from. The world stays believable; the visitor is never misled. One per page: mounting again replaces it.

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
let current = null;

/**
 * mountDemoMark({ text, detail, corner, container })
 *   text     the mark itself (default "הדגמה")
 *   detail   what opens on press: where the data comes from, what is real (default: a neutral sentence)
 *   corner   "bottom-start" (default) | "bottom-end" | "top-start" | "top-end"   — logical, so RTL-correct
 *   container  where to put it (default document.body); inside a container it is positioned within it
 * returns { el, open, close, setDetail, destroy }
 */
export function mountDemoMark({ text = "הדגמה", detail = "כל השמות, המספרים והאירועים כאן הם נתוני הדגמה. שום הודעה לא יוצאת ושום מערכת אמיתית לא משתנה.", corner = "bottom-start", container } = {}) {
  current && current.destroy();
  const root = document.createElement("div");
  root.className = `dmark dmark--${corner}${container ? " dmark--in" : ""}`;
  root.innerHTML = `<button type="button" class="dmark__btn" aria-expanded="false" aria-controls="dmark-detail">${esc(text)}</button>
    <p class="dmark__detail" id="dmark-detail" role="note" hidden>${esc(detail)}</p>`;
  (container || document.body).appendChild(root);
  const btn = root.querySelector("button"), box = root.querySelector("p");
  const set = (open) => { box.hidden = !open; btn.setAttribute("aria-expanded", open); };
  btn.addEventListener("click", () => set(box.hidden));
  const onKey = (e) => { if (e.key === "Escape" && !box.hidden) { set(false); btn.focus(); } };
  const onDoc = (e) => { if (!root.contains(e.target)) set(false); };
  document.addEventListener("keydown", onKey);
  document.addEventListener("pointerdown", onDoc);
  current = {
    el: root, open: () => set(true), close: () => set(false),
    setDetail: (t) => { box.textContent = t; },
    destroy() { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onDoc); root.remove(); if (current && current.el === root) current = null; },
  };
  return current;
}
