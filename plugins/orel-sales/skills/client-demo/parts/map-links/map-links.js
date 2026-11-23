// map-links — the deep links a person in the field presses: navigate with Waze or Google Maps, call, WhatsApp, SMS,
// e-mail. Israeli numbers normalised (054-012-3456 → +972540123456). Builds links only; nothing is opened or sent
// until the visitor presses one, and then it is their own phone that acts.

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/** "054-012-3456" | "+972 54 012 3456" | "03-0550000" → "+972540123456" (null if it is not a number) */
export function intlPhone(phone, country = "972") {
  let d = String(phone || "").replace(/[^\d+]/g, "");
  if (!d) return null;
  if (d.startsWith("+")) return d;
  if (d.startsWith("00")) return "+" + d.slice(2);
  if (d.startsWith(country)) return "+" + d;
  if (d.startsWith("0")) return `+${country}${d.slice(1)}`;
  return "+" + d;
}

const where = (p) => (p && p.lat != null && p.lng != null ? { ll: `${p.lat},${p.lng}` } : p && p.address ? { q: p.address } : null);

/** Waze: by coordinates when you have them (exact), otherwise by address text */
export function wazeUrl(place) {
  const w = where(place); if (!w) return null;
  return w.ll ? `https://waze.com/ul?ll=${w.ll}&navigate=yes` : `https://waze.com/ul?q=${encodeURIComponent(w.q)}&navigate=yes`;
}
/** Google Maps directions to the place */
export function mapsUrl(place) {
  const w = where(place); if (!w) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(w.ll || w.q)}`;
}
export const telUrl = (phone) => { const p = intlPhone(phone); return p ? `tel:${p}` : null; };
export const smsUrl = (phone, body) => { const p = intlPhone(phone); return p ? `sms:${p}${body ? `?body=${encodeURIComponent(body)}` : ""}` : null; };
/** wa.me opens a chat with the number and (optionally) a drafted message; the visitor still presses send */
export const whatsappUrl = (phone, text) => { const p = intlPhone(phone); return p ? `https://wa.me/${p.slice(1)}${text ? `?text=${encodeURIComponent(text)}` : ""}` : null; };
export const mailUrl = (to, subject, body) => `mailto:${encodeURIComponent(to)}${subject || body ? "?" + new URLSearchParams({ ...(subject ? { subject } : {}), ...(body ? { body } : {}) }).toString().replace(/\+/g, "%20") : ""}`;

/**
 * mountActions(el, { place: { lat, lng, address, note }, phone, whatsapp: { phone, text }, labels })
 * A row of big buttons; a place without coordinates or an address shows its note instead of a navigation button.
 */
export function mountActions(el, o = {}) {
  const L = { waze: "Waze", maps: "מפות", call: "חיוג", wa: "וואטסאפ", ...o.labels };
  const links = [];
  const wz = wazeUrl(o.place), mp = mapsUrl(o.place);
  if (wz) links.push(["waze", wz, L.waze]);
  if (mp) links.push(["maps", mp, L.maps]);
  if (o.phone) links.push(["call", telUrl(o.phone), L.call]);
  if (o.whatsapp) links.push(["wa", whatsappUrl(o.whatsapp.phone, o.whatsapp.text), L.wa]);
  const root = document.createElement("div");
  root.className = "mlinks";
  root.innerHTML = `${o.place && o.place.address ? `<span class="mlinks__addr">${esc(o.place.address)}</span>` : ""}
    ${!wz && o.place && o.place.note ? `<span class="mlinks__note">${esc(o.place.note)}</span>` : ""}
    <span class="mlinks__row">${links.map(([k, href, label]) => `<a class="mlinks__a mlinks__a--${k}" href="${esc(href)}"${k === "waze" || k === "maps" || k === "wa" ? ' target="_blank" rel="noopener"' : ""} data-mlinks="${k}">${esc(label)}</a>`).join("")}</span>`;
  el.appendChild(root);
  return { el: root, links: Object.fromEntries(links.map(([k, h]) => [k, h])), destroy: () => root.remove() };
}
