# signature-pad

A signature drawn with a finger, pen or mouse on a canvas, crisp on any pixel ratio, redrawn on resize, with undo,
clear and the signer's name. Returns a PNG for a report, a delivery note or a certificate.

**When it earns its place:** the moment a job closes in the field (a delivery, an inspection, a visit), or any
approval the client today does on paper. A real signature appearing on the document that follows is what makes the
flow feel finished.

```js
import { createSignaturePad } from "./signature-pad.js";     // plus <link rel="stylesheet" href="signature-pad.css">
const sig = createSignaturePad(document.querySelector("#sign"), { label: "חתימת הלקוח", height: 200 });
sig.on("change", ({ empty }) => (saveBtn.disabled = empty));
saveBtn.onclick = () => { const { image, name } = sig.value(); report.add({ image, name }); };
sig.clear(); sig.undo(); sig.isEmpty(); sig.destroy();
```

Pen colour and width: `--part-sig-ink`, `--part-sig-width`. Frame: `--part-line`, `--part-surface`, `--part-radius`.
Options: `height`, `label`, `nameField: false`, `minInk` (points before it counts as signed), and every button text.

**Does not decide:** the consent text above it, where the image is stored, or what document it goes into
(`doc-writer` can place it; not required). It does not timestamp: stamp with your demo clock.
