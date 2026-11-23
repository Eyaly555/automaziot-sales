// signature-pad — a finger or mouse signature on a canvas, crisp on any screen, with the signer's name beside it.
// Pointer events cover mouse, pen and touch in one path; the canvas is sized to its box and the device pixel ratio,
// and the drawing survives a resize. The pen colour and width come from CSS so the builder restyles it in one place.

/**
 * createSignaturePad(el, opts) → { isEmpty, clear, undo, toDataURL, value, on, destroy }
 *   opts.height     px, default 180
 *   opts.label      text under the line, default "חתימה"
 *   opts.nameField  true (default) shows "שם החותם"; false hides it
 *   opts.minInk     how many points count as a signature (stops a stray tap), default 12
 * events: "change" ({ empty }) after every stroke, clear or undo
 */
export function createSignaturePad(el, opts = {}) {
  const o = { height: 180, label: "חתימה", nameField: true, minInk: 12, clearText: "ניקוי", undoText: "ביטול קו", namePlaceholder: "שם מלא", nameLabel: "שם החותם", ...opts };
  const root = document.createElement("div");
  root.className = "sigp";
  root.innerHTML = `<div class="sigp__pad" style="block-size:${o.height}px">
      <canvas class="sigp__canvas" aria-label="${o.label}" role="img"></canvas>
      <span class="sigp__line" aria-hidden="true"></span><span class="sigp__hint">${o.label}</span>
    </div>
    <div class="sigp__bar">
      <button type="button" class="sigp__btn" data-sigp="undo">${o.undoText}</button>
      <button type="button" class="sigp__btn" data-sigp="clear">${o.clearText}</button>
    </div>
    ${o.nameField ? `<label class="sigp__name"><span>${o.nameLabel}</span><input class="sigp__input" autocomplete="name" placeholder="${o.namePlaceholder}"></label>` : ""}`;
  el.appendChild(root);

  const canvas = root.querySelector("canvas"), pad = root.querySelector(".sigp__pad");
  const ctx = canvas.getContext("2d");
  const strokes = [];
  let current = null;
  const listeners = {};
  const emit = (ev, d) => (listeners[ev] || []).forEach((fn) => fn(d));

  const pen = () => {
    const cs = getComputedStyle(root);
    return { color: cs.getPropertyValue("--part-sig-ink").trim() || "#1a1a1a", width: parseFloat(cs.getPropertyValue("--part-sig-width")) || 2.4 };
  };
  const points = () => strokes.reduce((n, s) => n + s.length, 0);

  function size() {
    const r = pad.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(r.width * dpr)); canvas.height = Math.max(1, Math.round(r.height * dpr));
    canvas.style.inlineSize = r.width + "px"; canvas.style.blockSize = r.height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paint();
  }
  // points are stored as fractions of the box, so a resize redraws the same signature
  function paint() {
    const r = pad.getBoundingClientRect(), p = pen();
    ctx.clearRect(0, 0, r.width, r.height);
    ctx.strokeStyle = p.color; ctx.lineWidth = p.width; ctx.lineCap = "round"; ctx.lineJoin = "round";
    for (const s of strokes) {
      ctx.beginPath();
      s.forEach(([x, y], i) => { const X = x * r.width, Y = y * r.height; if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); });
      if (s.length === 1) ctx.lineTo(s[0][0] * r.width + 0.1, s[0][1] * r.height);
      ctx.stroke();
    }
    root.classList.toggle("is-signed", !api.isEmpty());
  }
  const at = (e) => { const r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; };

  const down = (e) => { e.preventDefault(); canvas.setPointerCapture?.(e.pointerId); current = [at(e)]; strokes.push(current); paint(); };
  const move = (e) => { if (!current) return; e.preventDefault(); current.push(at(e)); paint(); };
  const up = () => { if (!current) return; current = null; emit("change", { empty: api.isEmpty() }); };

  canvas.style.touchAction = "none";
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-sigp]"); if (!b) return;
    if (b.dataset.sigp === "clear") api.clear(); else api.undo();
  });
  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(size) : null;

  const api = {
    el: root,
    isEmpty: () => points() < o.minInk,
    clear() { strokes.length = 0; paint(); emit("change", { empty: true }); },
    undo() { strokes.pop(); paint(); emit("change", { empty: api.isEmpty() }); },
    /** PNG of the signature only (transparent background), for a report or a document */
    toDataURL: (type = "image/png") => canvas.toDataURL(type),
    /** { image, name, empty } — what a form saves */
    value: () => ({ image: api.isEmpty() ? null : canvas.toDataURL("image/png"), name: root.querySelector(".sigp__input")?.value.trim() || "", empty: api.isEmpty() }),
    on(ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); return api; },
    destroy() { ro ? ro.disconnect() : removeEventListener("resize", size); root.remove(); },
  };
  ro ? ro.observe(pad) : addEventListener("resize", size);
  size();
  return api;
}
