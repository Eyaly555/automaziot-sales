// barcode39 — a real Code 39 barcode as SVG, readable by any scanner from the screen or from paper. Code 39 is the
// common symbology on routing cards, work orders, labels and asset tags: no check digit required, wide:narrow 3:1,
// a quiet zone of ten narrow bars. Digits, capital letters, space and - . $ / + % only.

const C39 = {
  0: "000110100", 1: "100100001", 2: "001100001", 3: "101100000", 4: "000110001", 5: "100110000", 6: "001110000", 7: "000100101", 8: "100100100", 9: "001100100",
  A: "100001001", B: "001001001", C: "101001000", D: "000011001", E: "100011000", F: "001011000", G: "000001101", H: "100001100", I: "001001100", J: "000011100",
  K: "100000011", L: "001000011", M: "101000010", N: "000010011", O: "100010010", P: "001010010", Q: "000000111", R: "100000110", S: "001000110", T: "000010110",
  U: "110000001", V: "011000001", W: "111000000", X: "010010001", Y: "110010000", Z: "011010000", "-": "010000101", ".": "110000100", " ": "011000100",
  $: "010101000", "/": "010100010", "+": "010001010", "%": "000101010", "*": "010010100",
};
const escXml = (s) => String(s).replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" }[c]));

/** the text reduced to what Code 39 can carry (upper-cased; other characters dropped) */
export function code39Clean(text) {
  return String(text).toUpperCase().split("").filter((ch) => C39[ch] && ch !== "*").join("");
}

/** does the text encode without losing anything? */
export const code39Valid = (text) => code39Clean(text) === String(text).toUpperCase() && String(text).length > 0;

/**
 * code39SVG(text, { narrow = 2, height = 54, quiet, showText = true, label, title }) → SVG string
 * Bars are fill="currentColor" so the colour follows CSS (keep it dark on light: scanners need contrast).
 */
export function code39SVG(text, o = {}) {
  const narrow = o.narrow ?? 2, wide = narrow * 3, height = o.height ?? 54, quiet = o.quiet ?? narrow * 10, showText = o.showText !== false;
  const clean = code39Clean(text), label = o.label ?? clean;
  const chars = ("*" + clean + "*").split("");
  const bars = [];
  let x = quiet;
  chars.forEach((ch, ci) => {
    const pat = C39[ch];
    for (let i = 0; i < 9; i++) { const w = pat[i] === "1" ? wide : narrow; if (i % 2 === 0) bars.push([x, w]); x += w; }
    if (ci < chars.length - 1) x += narrow;               // the narrow gap between characters
  });
  const W = x + quiet, textH = showText ? 18 : 0, H = height + textH;
  return `<svg class="bc39" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${escXml(o.title || "ברקוד " + label)}" direction="ltr">`
    + `<rect width="${W}" height="${H}" fill="var(--part-bc39-bg, #fff)"/>`
    + bars.map(([bx, bw]) => `<rect x="${bx}" y="0" width="${bw}" height="${height}" fill="currentColor"/>`).join("")
    + (showText ? `<text x="${W / 2}" y="${height + 14}" text-anchor="middle" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="13" letter-spacing="2" fill="currentColor">${escXml(label)}</text>` : "")
    + `</svg>`;
}

/** mountBarcode(el, text, opts) — puts the SVG in an element and returns { set(text), el } */
export function mountBarcode(el, text, opts = {}) {
  const box = document.createElement("span");
  box.className = "bc39-box";
  box.dir = "ltr";
  el.appendChild(box);
  const set = (t) => { box.innerHTML = code39SVG(t, opts); box.dataset.value = code39Clean(t); return api; };
  const api = { el: box, set, destroy: () => box.remove() };
  return set(text);
}
