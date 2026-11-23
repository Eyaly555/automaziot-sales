# barcode39

A real Code 39 barcode as inline SVG: a scanner reads it from the screen or from print. Code 39 is the usual
symbology on routing cards, work orders, shelf and asset labels: no check digit, any scanner, a proper quiet zone.

**When it earns its place:** the client's world has paper that moves with the work (a job card, a box, a tool, a
file). A barcode they could actually scan on the card in the demo is the kind of detail nobody asked for and
everybody recognises.

```js
import { code39SVG, mountBarcode, code39Valid } from "./barcode39.js";     // barcode39.css is optional
el.innerHTML = code39SVG("WO-2603-0417", { height: 60, narrow: 2, showText: true });
const bc = mountBarcode(cardEl, job.id);  bc.set(nextJob.id);
code39Valid("abc-12");   // true (it upper-cases);  code39Valid("א-12") → false: Hebrew cannot be encoded
```

Characters: 0–9, A–Z, space and `- . $ / + %`; anything else is dropped (check with `code39Valid`). Bars are
`currentColor`; keep them dark on light (`--part-bc39-ink`, `--part-bc39-bg`). The SVG is always left-to-right.

**Does not decide:** what is encoded (use the client's real id format), or scanning: reading a barcode with a
camera is a separate piece (a station screen can simply accept the scanner as keyboard input).
