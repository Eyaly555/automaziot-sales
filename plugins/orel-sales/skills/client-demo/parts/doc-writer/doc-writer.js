// doc-writer — a document that writes itself from the data: a certificate, a visit report, a delivery note, a quote.
// Blocks appear one after another as if being written, values are filled in from the record, a signature image can
// sit in it, and print() prints only the document. What it says is all yours; it brings the paper and the writing.

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const reduce = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * createDocument(el, spec, { animate = true, stepMs = 220 })
 * spec = { title, subtitle, number, date, from: { name, lines: [] }, to: { label, name, lines: [] }, blocks: [ … ], footer }
 *   block kinds:
 *     { heading }                                     a section title
 *     { text }                                        a paragraph
 *     { fields: [[label, value], …] }                 label/value pairs
 *     { table: { columns: [..], rows: [[..], ..], align?: ["start","end",..] } }
 *     { check: [[label, ok: true|false|null, note?], …] }   a checklist with ✓ ✗ —
 *     { signature: { image, name, role, date } }     image = a data URL (e.g. from signature-pad)
 *     { html }                                        your own markup (escaped by you)
 * returns { el, write(), update(spec), print(), html() }
 */
export function createDocument(el, spec, { animate = true, stepMs = 220 } = {}) {
  const root = document.createElement("article");
  root.className = "docw";
  el.appendChild(root);
  let cur = spec, run = 0;

  const block = (b) => {
    if (b.heading) return `<h2 class="docw__h">${esc(b.heading)}</h2>`;
    if (b.text) return `<p class="docw__p">${esc(b.text)}</p>`;
    if (b.fields) return `<dl class="docw__fields">${b.fields.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>`;
    if (b.table) { const al = b.table.align || []; return `<div class="docw__tablewrap"><table class="docw__table"><thead><tr>${b.table.columns.map((c, i) => `<th style="text-align:${al[i] || "start"}">${esc(c)}</th>`).join("")}</tr></thead><tbody>${b.table.rows.map((r) => `<tr>${r.map((c, i) => `<td style="text-align:${al[i] || "start"}">${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`; }
    if (b.check) return `<ul class="docw__check">${b.check.map(([k, ok, note]) => `<li class="docw__ck docw__ck--${ok === true ? "ok" : ok === false ? "bad" : "na"}"><span class="docw__mark" aria-label="${ok === true ? "תקין" : ok === false ? "לא תקין" : "לא נבדק"}">${ok === true ? "✓" : ok === false ? "✗" : "—"}</span><span>${esc(k)}</span>${note ? `<small>${esc(note)}</small>` : ""}</li>`).join("")}</ul>`;
    if (b.signature) { const s = b.signature; return `<div class="docw__sig">${s.image ? `<img src="${esc(s.image)}" alt="חתימה">` : `<span class="docw__sigline"></span>`}<span>${esc(s.name || "")}${s.role ? ` · ${esc(s.role)}` : ""}</span>${s.date ? `<small>${esc(s.date)}</small>` : ""}</div>`; }
    if (b.html) return `<div class="docw__html">${b.html}</div>`;
    return "";
  };
  const party = (p, cls) => p ? `<div class="docw__party ${cls}">${p.label ? `<small>${esc(p.label)}</small>` : ""}<b>${esc(p.name)}</b>${(p.lines || []).map((l) => `<span>${esc(l)}</span>`).join("")}</div>` : "";

  function render(s) {
    root.innerHTML = `<header class="docw__head">
        ${party(s.from, "docw__from")}
        <div class="docw__meta">${s.number ? `<span class="docw__num">${esc(s.number)}</span>` : ""}${s.date ? `<time>${esc(s.date)}</time>` : ""}</div>
      </header>
      <h1 class="docw__title">${esc(s.title || "")}</h1>${s.subtitle ? `<p class="docw__sub">${esc(s.subtitle)}</p>` : ""}
      ${party(s.to, "docw__to")}
      <div class="docw__blocks">${(s.blocks || []).map((b) => `<section class="docw__b">${block(b)}</section>`).join("")}</div>
      ${s.footer ? `<footer class="docw__foot">${esc(s.footer)}</footer>` : ""}`;
  }

  const api = {
    el: root,
    /** replay the writing: blocks appear one after another */
    async write() {
      const my = ++run;
      render(cur);
      if (!animate || reduce()) { root.classList.add("is-written"); return; }
      root.classList.remove("is-written"); root.classList.add("is-writing");
      const parts = [...root.querySelectorAll(".docw__title, .docw__sub, .docw__to, .docw__b, .docw__foot")];
      parts.forEach((p) => p.classList.add("docw__pending"));
      for (const p of parts) { await sleep(stepMs); if (my !== run) return; p.classList.remove("docw__pending"); p.classList.add("docw__in"); }
      root.classList.remove("is-writing"); root.classList.add("is-written");
    },
    update(s) { cur = { ...cur, ...s }; render(cur); root.classList.add("is-written"); return api; },
    /** print only this document (the rest of the page is hidden while printing) */
    print() {
      const html = document.documentElement;
      html.classList.add("docw-printing"); root.classList.add("is-printing");
      const done = () => { html.classList.remove("docw-printing"); root.classList.remove("is-printing"); removeEventListener("afterprint", done); };
      addEventListener("afterprint", done);
      window.print();
      setTimeout(done, 1000);
    },
    html: () => root.outerHTML,
    destroy() { run++; root.remove(); },
  };
  render(cur);
  if (animate) api.write(); else root.classList.add("is-written");
  return api;
}
