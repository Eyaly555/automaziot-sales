// drill — every number opens its rows. Mark any figure with data-drill="<key>", and pressing it (or Enter on it)
// opens a sheet with exactly the rows that make it up: the title, the count, the rows, each row a door onward.
// With check: true it warns in the console when a figure on screen disagrees with its own rows.

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/**
 * makeDrillable(scope, { resolve, check = false, closeText })
 *   scope            the element whose [data-drill] figures open (document.body is fine)
 *   resolve(key, el) → { title, note?, rows, columns: [[label, (row) => value, align?]], empty?, onRow?(row), total? }
 *                    total: optional (row) => number, summed under the list (a sum the figure shows)
 * returns { open(key, from?), close(), destroy() }
 */
export function makeDrillable(scope, { resolve, check = false, closeText = "סגירה" } = {}) {
  let sheet = null, lastFrom = null;
  // figures become real controls: focusable, announced as buttons
  const arm = () => scope.querySelectorAll("[data-drill]").forEach((n) => {
    if (n.tagName !== "BUTTON" && n.tagName !== "A") { if (!n.hasAttribute("tabindex")) n.tabIndex = 0; n.setAttribute("role", "button"); }
    n.classList.add("drill-fig");
    if (check) { const d = resolve(n.dataset.drill, n); const shown = parseFloat(String(n.textContent).replace(/[^\d.-]/g, "")); if (d && !d.total && Number.isFinite(shown) && shown !== d.rows.length) console.warn(`drill: "${n.dataset.drill}" shows ${shown} but has ${d.rows.length} rows`); }
  });
  const mo = typeof MutationObserver !== "undefined" ? new MutationObserver(arm) : null;
  mo && mo.observe(scope, { childList: true, subtree: true });
  arm();

  function close() {
    if (!sheet) return;
    sheet.remove(); sheet = null;
    document.removeEventListener("keydown", onKey);
    lastFrom && lastFrom.isConnected && lastFrom.focus();
  }
  function onKey(e) { if (e.key === "Escape") close(); }
  function open(key, from) {
    const d = resolve(key, from);
    if (!d) return;
    close();
    lastFrom = from || document.activeElement;
    const cols = d.columns || [["", (r) => String(r)]];
    sheet = document.createElement("div");
    sheet.className = "drill";
    sheet.innerHTML = `<div class="drill__shade" data-drill-close></div>
      <section class="drill__sheet" role="dialog" aria-modal="true" aria-labelledby="drill-t" tabindex="-1">
        <header class="drill__head"><div><h2 class="drill__title" id="drill-t">${esc(d.title)}</h2>${d.note ? `<p class="drill__note">${esc(d.note)}</p>` : ""}</div>
          <span class="drill__count">${d.rows.length}</span><button type="button" class="drill__x" data-drill-close aria-label="${esc(closeText)}">×</button></header>
        ${d.rows.length ? `<div class="drill__scroll"><table class="drill__table"><thead><tr>${cols.map(([l, , a]) => `<th style="text-align:${a || "start"}">${esc(l)}</th>`).join("")}</tr></thead>
          <tbody>${d.rows.map((r, i) => `<tr${d.onRow ? ` tabindex="0" data-drill-row="${i}" class="is-door"` : ""}>${cols.map(([, f, a]) => `<td style="text-align:${a || "start"}">${esc(typeof f === "function" ? f(r) : r[f])}</td>`).join("")}</tr>`).join("")}</tbody>
          ${d.total ? `<tfoot><tr><td colspan="${cols.length}">סה״כ: <b>${esc(d.rows.reduce((t, r) => t + (Number(d.total(r)) || 0), 0).toLocaleString("he-IL"))}</b></td></tr></tfoot>` : ""}</table></div>`
          : `<p class="drill__empty">${esc(d.empty || "אין שורות מאחורי המספר הזה כרגע.")}</p>`}
      </section>`;
    document.body.appendChild(sheet);
    sheet.addEventListener("click", (e) => {
      if (e.target.closest("[data-drill-close]")) return close();
      const tr = e.target.closest("[data-drill-row]"); if (tr && d.onRow) { const row = d.rows[+tr.dataset.drillRow]; close(); d.onRow(row); }
    });
    sheet.addEventListener("keydown", (e) => { const tr = e.target.closest("[data-drill-row]"); if (tr && e.key === "Enter") tr.click(); });
    document.addEventListener("keydown", onKey);
    sheet.querySelector(".drill__sheet").focus();
  }
  const onClick = (e) => { const n = e.target.closest("[data-drill]"); if (n && scope.contains(n)) { e.preventDefault(); open(n.dataset.drill, n); } };
  const onEnter = (e) => { if ((e.key === "Enter" || e.key === " ") && e.target.matches && e.target.matches("[data-drill]:not(button):not(a)")) { e.preventDefault(); open(e.target.dataset.drill, e.target); } };
  scope.addEventListener("click", onClick);
  scope.addEventListener("keydown", onEnter);
  return { open, close, destroy() { close(); mo && mo.disconnect(); scope.removeEventListener("click", onClick); scope.removeEventListener("keydown", onEnter); } };
}
