# drill

Every number opens its rows. Mark a figure with `data-drill="<key>"`; pressing it (or Enter on it) opens a sheet
with exactly the rows that make it up: title, definition, count, rows, an optional sum, and each row a door onward.
A sheet from the end side on a desk, from the bottom on a phone; Escape and the shade close it and focus returns
to the figure. `check: true` warns in the console when a figure on screen disagrees with its own rows.

**When it earns its place:** any screen with figures. A number that opens to the exact rows behind it is what
makes an owner trust a dashboard, and what makes a demo read as a system.

```js
import { makeDrillable } from "./drill.js";          // plus drill.css
kpiEl.innerHTML = `<b data-drill="late">${store.count("late")}</b>`;
makeDrillable(document.body, { check: true, resolve: (key) => ({
  title: "באיחור", note: "מועד המסירה עבר והעבודה פתוחה",                  // the definition, on screen
  rows: store.rows(key), columns: [["לקוח", "customer"], ["מועד", (r) => clock.date(r.due)], ["סכום", (r) => money(r.sum), "end"]],
  onRow: (r) => router.go(`job/${r.id}`), total: null }) });          // total: (r) => r.sum under a money figure
```

**Does not decide:** what a figure means or which rows are behind it: `resolve` answers from your own data
(`one-store` named truths fit exactly, but any function works). It adds no figures; it makes yours open.
