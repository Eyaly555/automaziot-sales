# guided-tour

A short walk through the demo for whoever opens it alone (the client's partner, the person they forward the link
to): a spotlight on one thing at a time, a card beside it with what it is and why it matters, next/back buttons,
Escape to leave, and arrow keys that follow the page direction. A step can prepare its screen first (open a tab,
run a moment) before it is lit. Remembers it was seen when you give it a `seenKey`.

**When it earns its place:** the demo will be opened without us in the room, or it has a moment that is easy to
miss. Keep it to three to six steps; a long tour is a manual nobody reads.

```js
import { createTour } from "./guided-tour.js";          // plus guided-tour.css
const tour = createTour([
  { target: null, title: "ברוכים הבאים", body: "…" },
  { target: "#late-jobs", title: "מה דורש החלטה עכשיו", body: "…" },
  { target: ".job-card", title: "עבודה אחת", before: () => router.go("jobs/17") },
], { seenKey: "my-demo-tour", onEnd: (reason) => track(reason) });
if (!tour.seen()) tour.start();    tour.next(); tour.back(); tour.end();
```

Restyle: `--part-gtour-dim` (the shade), `--part-gtour-edge`, `--part-accent`, `--part-surface`.

**Does not decide:** what the steps say or in which order, or when it starts. It does not block the page under it;
the spotlight is a visual guide, not a lock.
