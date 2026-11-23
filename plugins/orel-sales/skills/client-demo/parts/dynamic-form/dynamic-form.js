// dynamic-form — the form follows the task. Templates per task type (an inspection, an installation, a repair), each
// a list of fields: text, number, date, select, textarea, checkbox groups. Switching type redraws the form and keeps
// what was already typed in fields both types share; required fields are checked on submit with a plain message.

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
let uid = 0;
// keep keyboard focus across a repaint: find the focused control again by its data-* attributes
const keepFocus = (root, paint) => {
  const a = root.contains(document.activeElement) ? document.activeElement : null;
  const sel = a ? [...a.attributes].filter((x) => x.name.startsWith("data-")).map((x) => `[${x.name}="${CSS.escape(x.value)}"]`).join("") : "";
  paint();
  if (sel) root.querySelector(sel)?.focus({ preventScroll: true });
};

/**
 * createDynamicForm(el, { templates, types, type, values, submitText, onChange, onSubmit })
 *   templates  { [type]: [{ id, type: "text"|"number"|"date"|"select"|"textarea"|"checkbox", label, options?, required?,
 *                          placeholder?, hint?, group?, rows?, unit? }] }
 *   types      [{ id, label }] — shown as a type switch (leave out to hide the switch)
 * returns { setType, type, values, set, validate, reset, destroy }
 */
export function createDynamicForm(el, opts = {}) {
  const o = { templates: {}, types: null, submitText: "שמירה", requiredText: "שדה חובה", typeLabel: "סוג המשימה", ...opts };
  let type = o.type || Object.keys(o.templates)[0];
  const values = { ...(o.values || {}) };
  const id = `dform${++uid}`;
  const root = document.createElement("form");
  root.className = "dform";
  root.noValidate = true;
  el.appendChild(root);

  const field = (f) => {
    const fid = `${id}-${f.id}`, v = values[f.id];
    const req = f.required ? ` required aria-required="true"` : "";
    const lab = `<label class="dform__label" for="${fid}">${esc(f.label)}${f.required ? ' <span class="dform__req" aria-hidden="true">*</span>' : ""}</label>`;
    const hint = f.hint ? `<small class="dform__hint" id="${fid}-h">${esc(f.hint)}</small>` : "";
    const desc = f.hint ? ` aria-describedby="${fid}-h"` : "";
    if (f.type === "select") return `<div class="dform__field">${lab}<select class="dform__input" id="${fid}" data-dform="${f.id}"${req}${desc}><option value="">בחירה…</option>${(f.options || []).map((op) => { const [val, text] = Array.isArray(op) ? op : [op, op]; return `<option value="${esc(val)}"${String(v ?? "") === String(val) ? " selected" : ""}>${esc(text)}</option>`; }).join("")}</select>${hint}</div>`;
    if (f.type === "textarea") return `<div class="dform__field dform__field--wide">${lab}<textarea class="dform__input" id="${fid}" rows="${f.rows || 3}" data-dform="${f.id}" placeholder="${esc(f.placeholder || "")}"${req}${desc}>${esc(v ?? "")}</textarea>${hint}</div>`;
    const t = f.type === "number" ? "number" : f.type === "date" ? "date" : "text";
    return `<div class="dform__field">${lab}<span class="dform__wrap"><input class="dform__input" id="${fid}" type="${t}" data-dform="${f.id}" value="${esc(v ?? "")}" placeholder="${esc(f.placeholder || "")}"${t === "number" ? ' inputmode="decimal"' : ""}${req}${desc}>${f.unit ? `<span class="dform__unit">${esc(f.unit)}</span>` : ""}</span>${hint}</div>`;
  };
  const checks = (group, list) => `<fieldset class="dform__group"><legend>${esc(group)}</legend>${list.map((f) => `<label class="dform__check"><input type="checkbox" data-dform="${f.id}"${values[f.id] ? " checked" : ""}><span>${esc(f.label)}</span></label>`).join("")}</fieldset>`;

  function render() {
    const fields = o.templates[type] || [];
    const groups = new Map(), parts = [];
    fields.forEach((f) => {
      if (f.type === "checkbox") { const g = f.group || "סימון"; if (!groups.has(g)) { groups.set(g, []); parts.push({ group: g }); } groups.get(g).push(f); }
      else parts.push({ f });
    });
    root.innerHTML = `${o.types ? `<div class="dform__types" role="radiogroup" aria-label="${esc(o.typeLabel)}">${o.types.map((t) => `<button type="button" role="radio" class="dform__type" aria-checked="${t.id === type}" data-dform-type="${esc(t.id)}">${esc(t.label)}</button>`).join("")}</div>` : ""}
      <div class="dform__fields">${parts.map((p) => (p.f ? field(p.f) : checks(p.group, groups.get(p.group)))).join("")}</div>
      <p class="dform__msg" role="alert"></p>
      <button type="submit" class="dform__submit">${esc(o.submitText)}</button>`;
    root.dataset.dformType = type;
  }
  const read = (n) => (n.type === "checkbox" ? n.checked : n.value);

  root.addEventListener("input", (e) => { const n = e.target.closest("[data-dform]"); if (!n) return; values[n.dataset.dform] = read(n); n.removeAttribute("aria-invalid"); o.onChange && o.onChange({ type, values: api.values(), field: n.dataset.dform }); });
  root.addEventListener("change", (e) => { const n = e.target.closest("[data-dform]"); if (n) { values[n.dataset.dform] = read(n); o.onChange && o.onChange({ type, values: api.values(), field: n.dataset.dform }); } });
  root.addEventListener("click", (e) => { const b = e.target.closest("[data-dform-type]"); if (b) api.setType(b.dataset.dformType); });
  root.addEventListener("submit", (e) => { e.preventDefault(); const bad = api.validate(); if (!bad.length) o.onSubmit && o.onSubmit({ type, values: api.values() }); });

  const api = {
    el: root,
    type: () => type,
    /** switch template; values of fields with the same id carry over */
    setType(t) { if (!o.templates[t] || t === type) return api; type = t; keepFocus(root, render); o.onChange && o.onChange({ type, values: api.values(), field: null }); return api; },
    /** only the values of the current template's fields */
    values: () => Object.fromEntries((o.templates[type] || []).map((f) => [f.id, values[f.id] ?? (f.type === "checkbox" ? false : "")])),
    set(patch) { Object.assign(values, patch); render(); return api; },
    /** marks missing required fields, focuses the first, returns their ids */
    validate() {
      const missing = (o.templates[type] || []).filter((f) => f.required && (values[f.id] == null || String(values[f.id]).trim() === "" || values[f.id] === false));
      root.querySelectorAll("[aria-invalid]").forEach((n) => n.removeAttribute("aria-invalid"));
      missing.forEach((f) => root.querySelector(`[data-dform="${f.id}"]`)?.setAttribute("aria-invalid", "true"));
      root.querySelector(".dform__msg").textContent = missing.length ? `${o.requiredText}: ${missing.map((f) => f.label).join(", ")}` : "";
      if (missing.length) root.querySelector(`[data-dform="${missing[0].id}"]`)?.focus();
      return missing.map((f) => f.id);
    },
    reset() { for (const k in values) delete values[k]; render(); return api; },
    destroy: () => root.remove(),
  };
  render();
  return api;
}
