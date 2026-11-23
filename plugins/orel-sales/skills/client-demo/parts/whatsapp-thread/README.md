# whatsapp-thread

A WhatsApp conversation inside the demo: header with typing status, bubbles with time and ticks (sent, delivered,
read), typing dots, documents and photos, quick-reply chips, and a composer. Play it from a script, or let the visitor
type and answer through `send(text)`, the hook where a real agent endpoint plugs in.

**When it earns its place:** the client's customers already reach them on WhatsApp, or the demo has an AI agent.
Seeing their own customer's question answered in their own business's name is usually the moment that lands.

```js
import { createWhatsAppThread } from "./whatsapp-thread.js";   // plus whatsapp-thread.css
const wa = createWhatsAppThread(el, { title: "העסק", subtitle: "חשבון עסקי",
  send: async (text, { history }) => agent.reply(text, history),        // string | {text, quick, attachment} | [..] | null
  quick: ["מה שעות הפתיחה?"], attachments: [{ name: "חשבונית.pdf", kind: "doc", size: 90000 }] });
wa.play([{ from: "me", text: "היי" }, { from: "them", text: "שלום! במה אפשר לעזור?", wait: 400, run: () => store.addLead() }]);
wa.on("message", (m) => feed.push(m));   wa.add({ from: "note", text: "השיחה הועברה לנציג" });   wa.stop(); wa.clear();
```

`from: "me"` is whoever holds the phone (the visitor); messages typed while a reply is pending are answered in turn. Time stamps come from `now()` or start at `startAt` and move a
minute per message, never from the wall clock. Restyle with `--part-wa-*` (head, wall, in, out, read, send) and
`--part-wa-height`.

**Does not decide:** what the agent knows or says, where the conversation is stored, or what it changes in the system.
Wire `on("message")` to `agent-activity` or `one-store` for the "what happened on the owner's screen" half.
Nothing is sent anywhere unless the `send` you pass sends it.
