# agent-activity

What the AI employee just did, on the owner's screen. Each conversation turn becomes an entry: who wrote and on
which channel, the steps the agent took (recognised, understood, checked, acted), lit one after another, any
hand-off to a person, and what it wrote in the system, each write a door to the record it created.

**When it earns its place:** the demo has an agent (WhatsApp, voice, web chat). A chat alone looks like a chatbot;
the same chat ending as a job, lead or appointment on the owner's screen shows an employee.

```js
import { createAgentActivity } from "./agent-activity.js";        // plus agent-activity.css
const feed = createAgentActivity(el, { title: "מה הסוכן עשה היום", onOpen: (w) => openRecord(w.kind, w.id) });
feed.record({ channel: "whatsapp", who: customer.name, at: clock.time(now), said: text,
  steps: [{ label: "זוהה", say: "לקוח קיים" }, { label: "הובן", say: "שינוי מועד" }, { label: "בוצע", say: "התור הוזז" }],
  writes: [{ label: "תור ביום ג׳ 10:00", kind: "appointment", id: "a-19" }],
  handoff: null });                                    // or { to: "מנהלת המשמרת", why: "ביקש החזר" }
wa.on("message", (m) => m.from === "me" && agent.handle(m).then(feed.record));   // fed by a whatsapp-thread, if used
```

Step `state`: `ok` (default), `warn`, `blocked`. Events: `record`, `done` (after the steps lit), `open`.

**Does not decide:** what the agent understood or did (you pass the turn, from a real agent trace or a script) or
what a door opens. It writes nothing anywhere itself.
