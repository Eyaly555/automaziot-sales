// device-frame — show a phone (or tablet) product on a desk screen: a bezel with its own status bar and its own
// scroll, so the phone screen scrolls inside the frame and the page around it stays put. On a real phone the frame
// dissolves and the content is simply the screen. Content is a node you pass, or a URL in an iframe.

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/**
 * createDeviceFrame(el, { kind = "phone"|"tablet", content (Node) | src (URL), time = "09:41", label, dissolveBelow = 600 })
 *   time            the status-bar clock: a string, or a function returning one (pass your demo clock)
 *   dissolveBelow   viewport width (px) under which the bezel disappears and the content fills the screen
 * returns { el, screen, setTime(text), scrollTo(top), destroy }
 */
export function createDeviceFrame(el, o = {}) {
  const kind = o.kind === "tablet" ? "tablet" : "phone";
  const root = document.createElement("figure");
  root.className = `dframe dframe--${kind}`;
  root.style.setProperty("--dframe-dissolve", `${o.dissolveBelow ?? 600}px`);
  root.innerHTML = `<div class="dframe__body">
      <div class="dframe__bar" aria-hidden="true"><span class="dframe__time"></span>${kind === "phone" ? '<span class="dframe__notch"></span>' : ""}<span class="dframe__icons"><i></i><i></i><i></i></span></div>
      <div class="dframe__screen"${o.label ? ` role="region" aria-label="${esc(o.label)}"` : ""}></div>
      ${kind === "phone" ? '<span class="dframe__home" aria-hidden="true"></span>' : ""}
    </div>${o.caption ? `<figcaption class="dframe__cap">${esc(o.caption)}</figcaption>` : ""}`;
  el.appendChild(root);
  const screen = root.querySelector(".dframe__screen"), timeEl = root.querySelector(".dframe__time");
  if (o.src) { const f = document.createElement("iframe"); f.className = "dframe__frame"; f.src = o.src; f.title = o.label || "מסך המכשיר"; screen.appendChild(f); }
  else if (o.content) screen.appendChild(o.content);
  // the dissolve is a container-free media rule set per instance, so two frames with different thresholds coexist
  const mq = typeof matchMedia !== "undefined" ? matchMedia(`(max-width: ${o.dissolveBelow ?? 600}px)`) : null;
  const onMq = () => root.classList.toggle("is-dissolved", !!(mq && mq.matches));
  mq && mq.addEventListener("change", onMq); onMq();
  const setTime = (t) => { timeEl.textContent = typeof t === "function" ? t() : t; };
  setTime(o.time ?? "09:41");
  const timer = typeof o.time === "function" ? setInterval(() => setTime(o.time), 15000) : null;
  return {
    el: root, screen, setTime,
    scrollTo: (top) => screen.scrollTo({ top, behavior: "smooth" }),
    destroy() { clearInterval(timer); mq && mq.removeEventListener("change", onMq); root.remove(); },
  };
}
