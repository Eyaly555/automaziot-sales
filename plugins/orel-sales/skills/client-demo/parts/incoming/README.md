# incoming

Something arrives while the visitor watches: a call rings, an order lands, a lead comes in, a message pops. An
arrival card slides in (a call pulses), offers its actions, and `show()` resolves with the one pressed, so the demo
can open the screen that handles it. Several stack (newest on top); Escape dismisses; optional short ring tone made
in the browser (off by default, no file, no network).

**When it earns its place:** the client described a moment that starts with something arriving (a call, an order from
the site, a lead from an ad). One trigger they can press is worth ten screens.

```js
import { createIncoming } from "./incoming.js";                // plus incoming.css
const inc = createIncoming({ max: 3, sound: false });
const r = await inc.show({ kind: "call", title: customer.name, detail: "שואל על ההזמנה מאתמול", meta: "לקוח קיים",
  actions: [{ id: "answer", label: "מענה", primary: true }, { id: "later", label: "אחזור אליו" }], timeoutMs: 20000 });
if (r === "answer") openCustomer(customer.id);                    // "dismiss" | "timeout" otherwise
run.on("moment", (m) => inc.show({ kind: "order", title: m.label }));   // fired by a live-run, if you use one
```

Kinds: `call`, `order`, `lead`, `message` (each has its own icon and word; pass `label` or `icon` to change them).
Position and look: `--part-inc-top`, `--part-inc-side`, `--part-inc-call`, `--part-accent`, `--part-surface`.

**Does not decide:** what happens after the press (you open the screen), what the arrival contains, or when it
fires (a button, a timer, a `live-run` moment). It never calls, sends or rings a real phone.
