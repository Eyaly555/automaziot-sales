# voice-call

An AI phone call on screen: the caller rings, the call is answered, a timer runs, and the transcript appears line
by line at the second each was said, with events (what the agent wrote in the system) between the lines. With a
recording you host, the lines follow the audio and a tap on a line jumps there. `realNumberCard` adds the "call the
agent yourself" card with a `tel:` link.

**When it earns its place:** the demo includes a voice agent, or the client's day starts with phone calls. A real
recorded call with its transcript, plus a number they can dial from the meeting room, beats any description.

```js
import { createVoiceCall, realNumberCard } from "./voice-call.js";      // plus voice-call.css
const call = createVoiceCall(el, { caller: { name, number }, agentName: "שם הסוכנת",
  lines: [{ who: "agent", at: 0.4, text: "…" }, { who: "caller", at: 3.1, text: "…" }, { who: "event", at: 9, text: "נקבע תור" }],
  audio: "./call.mp3",            // optional; without it the script plays by itself (speed: 2 to show it faster)
  autoAnswerMs: 2500 });
call.ring(); call.answer(); call.hangUp(); call.seek(12); call.on("line", (l) => l.who === "event" && feed.add(l));
realNumberCard(sideEl, { number: "03-000-0000", note: "הסוכנת עונה 24/7" });
```

Restyle: `--part-vcall-bg`, `--part-vcall-paper`, `--part-vcall-agent`, `--part-vcall-caller`, `--part-vcall-answer`,
`--part-vcall-hang`, `--part-vcall-height`.

**Does not decide:** what is said (bring a real transcript or write one from the client's world), whether a real
line exists, or what the call changes in the system (listen to `line` events). It never dials anything itself.
