# view-controls

Bend any list to the question of the moment: a time window (today, 7 days, this month), filters per facet with
how many rows each choice would leave, one-tap flags ("late only"), a sort, the choice said back in plain words,
and a reset. The logic has no markup (`createView`); a plain bar (`mountViewBar`) is included to restyle or skip.
Windows count from the data's own now, which you pass.

**When it earns its place:** any list longer than a screen, or one the client will want to ask "only this week"
or "only the north". A list that answers a narrower question in one tap feels like their tool, not a report.

```js
import { createView, mountViewBar } from "./view-controls.js";     // view-controls.css for the bar
const spec = { now: () => clock.now(),
  time: { get: (r) => r.at, options: [["today", "היום"], ["7d", "7 ימים"], ["month", "החודש"], ["all", "הכול"]], value: "7d" },
  facets: [{ id: "who", label: "אחראי", get: (r) => r.owner }], flags: [{ id: "late", label: "באיחור", test: (r) => r.late }],
  sort: [{ id: "due", label: "לפי מועד", by: (a, b) => a.due - b.due }] };
const view = createView(spec, { key: "jobs", persist: "url" });     // the choice lives in the address (shareable)
mountViewBar(barEl, view, spec, () => store.rows("open"));
view.on("change", render);  view.apply(rows);  view.only("who", "דנה");  view.say(view.apply(rows).length);
```

**Does not decide:** which facets matter for this client, the words of the windows, or what the list looks like.
Options with nothing behind them stay visible with a zero, so the visitor learns the answer is none.
