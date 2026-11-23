# seed-world

A believable Israeli world drawn from one number: Hebrew first and last names (gendered), mobile and landline numbers
in the real formats, streets and cities, valid-check-digit ID numbers, businesses, amounts that bunch toward the middle,
and dates counted from the data's own `asOf` day so the demo still reads right next week.

**When it earns its place:** any demo whose screens show people, customers, jobs or money. A thin seed makes every
screen thin; draw the world first and derive every screen from it.

```js
import { createWorld } from "./seed-world.js";
const w = createWorld({ seed: 2026, asOf: "2026-03-04T08:30" });      // asOf is required
const customers = w.people(240).map((p) => ({ ...p, address: w.address({ city: p.city }), since: w.within(365) }));
const jobs = customers.flatMap((c) => Array.from({ length: w.int(0, 4) }, () => ({ id: w.id("J-", 5), who: c.id, at: w.within(30), sum: w.amount(400, 9000) })));
w.story(jobs, [{ name: "stuck", share: 0.04, apply: (j) => (j.stuck = true) }, { name: "vip", count: 3, apply: (j) => (j.sum *= 4) }]);
w.fmtDate(w.daysAgo(2));   // "02/03/2026"     w.e164("054-012-3456") → "972540123456"
```

Also exported: `rng(seed)` (mulberry32), `hashString`, `idCheckDigit`, `LISTS` (the name, street and city pools, to
extend with the client's own region).

**Does not decide:** the client's domain (products, statuses, stations), how many of anything, or what goes wrong.
The story hook only applies the plots you write. Pair it with `one-store` to hold the drawn world and `time-anchor`
for a moving clock; neither is required.

Phone numbers drawn here are invented so that they connect to nobody (the subscriber part begins with 0). Keep it
that way: a seeded person behind a real "call" or WhatsApp link would dial a stranger. A real number in a demo is
only ever the business's own published one or our demo line.
