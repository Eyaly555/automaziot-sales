# doc-writer

A document that writes itself from the data: a certificate of conformity, a visit report, a delivery note, a quote.
The blocks appear one after another as if being written, every value comes from the record, a drawn signature can
sit in it, and `print()` prints only the document. Change the record, call `update()`, and the paper follows.

**When it earns its place:** the client today types, scans or re-keys a document after the work («ממלאים ביד,
ומישהי במשרד מקלידה את זה שוב בערב»). The document appearing by itself, already correct, is the moment the pain disappears.

```js
import { createDocument } from "./doc-writer.js";         // plus doc-writer.css
const doc = createDocument(el, {
  title: "תעודת התאמה", number: job.id, date: clock.date(job.closedAt),
  from: { name: business.name, lines: [business.address] }, to: { label: "עבור", name: customer.name },
  blocks: [{ heading: "בדיקות" }, { check: job.checks.map((c) => [c.label, c.ok, c.note]) },
           { table: { columns: ["פריט", "כמות"], rows: job.parts.map((p) => [p.name, p.qty]), align: ["start", "end"] } },
           { signature: { image: sig.value().image, name: sig.value().name } }],
}, { stepMs: 200 });
doc.update({ blocks: newBlocks });  doc.write();  doc.print();
```

Block kinds: `heading`, `text`, `fields`, `table`, `check`, `signature`, `html`. Restyle the paper with
`--part-docw-font`, `--part-docw-ink`, `--part-docw-rule`, `--part-docw-width`; add the client's own header
(logo, colours, regulatory lines) as an `html` block or around the element.

**Does not decide:** what the document is, its wording or legal content, its numbering, or any sums (pass them in
from the data; it never calculates). PDF is the browser's "save as PDF" from `print()`.
