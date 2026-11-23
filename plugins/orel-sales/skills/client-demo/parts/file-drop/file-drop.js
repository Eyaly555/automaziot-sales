// file-drop — real files from the device: the system picker (camera on a phone), drag and drop at a desk, limits
// on count, size and type with a plain message when one is hit, thumbnails for photos, and files attached to a
// specific item (a checklist line, a defect, a room) rather than to the whole job. Nothing is uploaded anywhere:
// the files stay in the page as File objects (and object URLs) for the demo to use.

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const size = (n) => (n >= 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB");
const okType = (file, accept) => !accept || accept.split(",").map((s) => s.trim()).some((a) => a.endsWith("/*") ? file.type.startsWith(a.slice(0, -1)) : a.startsWith(".") ? file.name.toLowerCase().endsWith(a.toLowerCase()) : file.type === a);

/**
 * createAttachments({ maxFiles = 5, maxBytes = 10 MB, accept = "image/*,application/pdf", capture })
 * One registry for the page; files are kept per key ("panel-7", "defect-3", "job").
 * returns { mount(el, key, opts), add(key, files), list(key), count(key), remove(key, id), all(), clear(key), on("change") }
 */
export function createAttachments({ maxFiles = 5, maxBytes = 10 * 1048576, accept = "image/*,application/pdf", capture = null } = {}) {
  const byKey = new Map(), listeners = [];
  let seq = 0;
  const emit = (key, msg) => listeners.forEach((fn) => fn({ key, files: api.list(key), message: msg || "" }));

  const api = {
    /** add(key, FileList | File[]) → { added, refused: [{ name, why }] } — limits applied in order */
    add(key, files) {
      const list = byKey.get(key) || [];
      const refused = [], added = [];
      for (const f of Array.from(files || [])) {
        if (list.length >= maxFiles) { refused.push({ name: f.name, why: `הגעתם למגבלה של ${maxFiles} קבצים` }); continue; }
        if (!okType(f, accept)) { refused.push({ name: f.name, why: "סוג קובץ שלא מתקבל כאן" }); continue; }
        if (f.size > maxBytes) { refused.push({ name: f.name, why: `גדול מ־${size(maxBytes)}` }); continue; }
        const item = { id: `f${++seq}`, key, name: f.name, size: f.size, type: f.type, file: f, url: f.type.startsWith("image/") && typeof URL !== "undefined" ? URL.createObjectURL(f) : null };
        list.push(item); added.push(item);
      }
      byKey.set(key, list);
      emit(key, refused.length ? refused.map((r) => `${r.name}: ${r.why}`).join(" · ") : "");
      return { added, refused };
    },
    list: (key) => (byKey.get(key) || []).slice(),
    count: (key) => (byKey.get(key) || []).length,
    remove(key, id) { const list = byKey.get(key) || []; const i = list.findIndex((x) => x.id === id); if (i > -1) { list[i].url && URL.revokeObjectURL(list[i].url); list.splice(i, 1); } emit(key); },
    clear(key) { (byKey.get(key) || []).forEach((x) => x.url && URL.revokeObjectURL(x.url)); byKey.delete(key); emit(key); },
    all: () => [...byKey.values()].flat(),
    on(ev, fn) { if (ev === "change") listeners.push(fn); return api; },

    /**
     * mount(el, key, { label, compact, hint }) — the control for one item. compact = a small camera/clip button with a
     * count badge (for a line in a checklist); otherwise a drop zone with the files listed under it.
     */
    mount(el, key, o = {}) {
      const root = document.createElement("div");
      root.className = `fdrop${o.compact ? " fdrop--compact" : ""}`;
      root.innerHTML = `<label class="fdrop__zone">
          <input type="file" class="fdrop__input" ${maxFiles > 1 ? "multiple" : ""} accept="${esc(accept)}"${capture ? ` capture="${esc(capture)}"` : ""}>
          <span class="fdrop__label">${esc(o.label || (o.compact ? "צירוף" : "בחירת קבצים או גרירה לכאן"))}</span>
          ${o.compact ? `<span class="fdrop__badge" aria-label="קבצים מצורפים">0</span>` : `<small class="fdrop__hint">${esc(o.hint || `עד ${maxFiles} קבצים, עד ${size(maxBytes)} כל אחד`)}</small>`}
        </label>
        <p class="fdrop__msg" role="status" aria-live="polite"></p>
        <ul class="fdrop__list"></ul>`;
      el.appendChild(root);
      const input = root.querySelector("input"), zone = root.querySelector(".fdrop__zone"), listEl = root.querySelector(".fdrop__list"), msg = root.querySelector(".fdrop__msg"), badge = root.querySelector(".fdrop__badge");
      const paint = (m) => {
        const files = api.list(key);
        if (badge) { badge.textContent = files.length; badge.hidden = !files.length; }
        root.classList.toggle("has-files", files.length > 0);
        listEl.innerHTML = files.map((f) => `<li class="fdrop__file">${f.url ? `<img class="fdrop__thumb" src="${f.url}" alt="">` : `<span class="fdrop__ext" aria-hidden="true">${esc((f.name.split(".").pop() || "").slice(0, 4).toUpperCase())}</span>`}
          <span class="fdrop__name">${esc(f.name)}</span><small class="fdrop__size">${size(f.size)}</small>
          <button type="button" class="fdrop__rm" data-fdrop-rm="${f.id}" aria-label="הסרת ${esc(f.name)}">×</button></li>`).join("");
        if (m !== undefined) msg.textContent = m;
      };
      input.addEventListener("change", () => { api.add(key, input.files); input.value = ""; });
      zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("is-over"); });
      zone.addEventListener("dragleave", () => zone.classList.remove("is-over"));
      zone.addEventListener("drop", (e) => { e.preventDefault(); zone.classList.remove("is-over"); api.add(key, e.dataTransfer.files); });
      root.addEventListener("click", (e) => { const b = e.target.closest("[data-fdrop-rm]"); if (b) api.remove(key, b.dataset.fdropRm); });
      const off = (ev) => { if (ev.key === key) paint(ev.message); };
      listeners.push(off); paint("");
      return { el: root, destroy() { listeners.splice(listeners.indexOf(off), 1); root.remove(); } };
    },
  };
  return api;
}
