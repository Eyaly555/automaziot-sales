# one-store

One in-memory truth for the demo. Name a truth once (`define("late", selector)`), and the KPI, the list, the card and
the phone all read it: `count("late")` is always `rows("late").length`, so a figure and the rows it opens never
disagree. Change notifications (all, or only when a selected value changes), `batch()` for a simulation tick, optional
session/local persistence, `reset()` back to the seed.

**When it earns its place:** more than one screen shows the same number, or something the visitor does (closing a
job, an incoming order, a live run) has to move figures everywhere at once. "One truth per number" is what makes a
demo read as a system and not something improvised.

```js
import { createStore } from "./one-store.js";
const store = createStore(seededWorld, { persist: "session", key: "my-demo", version: 2 });
store.define("open", (s) => s.jobs.filter((j) => !j.done)).define("late", (s) => store.rows("open").filter((j) => j.due < s.now));
store.bind(kpiEl, "late");                                  // text stays equal to count("late")
store.bind(sumEl, () => store.sum("open", (j) => j.amount), (n) => "₪" + n.toLocaleString("he-IL"));
store.subscribe("late", (n, prev) => n > prev && flash(kpiEl));
store.set((s) => { s.jobs.push(newJob); });   store.batch(() => tick());   store.reset();
```

Persistence is JSON: Dates come back as Dates (ISO strings are revived); Maps, Sets and functions do not survive.

**Does not decide:** the shape of the world, what "late" means for this client (write the definition on screen next
to the figure), or any rendering. Pairs naturally with `seed-world` (the initial state), `live-run` (mutations in
`batch`) and `drill` (a figure opening `rows(name)`); none of them is required.
