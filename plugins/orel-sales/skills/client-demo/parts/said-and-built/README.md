# said-and-built

The client's own sentences from the call, each beside what the system does with it and a door to the screen that
answers it. They read their words taken seriously before they press anything; each door they open is marked.

**When it earns its place:** almost always on the first page of a demo built from a call. It is the clearest proof
that the demo was built for them and not poured from a template. Use only lines the client really said, verbatim
and short; never what our own people said on the call, never internal notes.

```js
import { createSaidAndBuilt } from "./said-and-built.js";          // plus said-and-built.css
createSaidAndBuilt(el, {
  heading: "מה סיפרתם לנו, ומה בנינו מזה", intro: "מהשיחה שלנו ב־12/03",
  items: [{ id: "late", quote: "…their words…", who: "שם ותפקיד", title: "מה בנינו", body: "שורה או שתיים", cta: "לפתוח", to: "late" }],
  open: (it) => router.go(it.to),           // or give each item an href and leave open out
  seenKey: "my-demo-said" });               // remember opened doors for this tab
```

Restyle: `--part-saidb-quote` (quote size), `--part-saidb-quote-bg`, `--part-saidb-h`, `--part-accent`. The layout
is a plain responsive grid; replace the CSS entirely when the demo's own look wants a different form (a column, a
timeline, a page per sentence).

**Does not decide:** which sentences, how many (three to seven usually), what the answers say, or where the doors
lead. It never paraphrases: what you pass is what is shown.
