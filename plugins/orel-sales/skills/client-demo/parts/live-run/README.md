# live-run

"Run the day": one button and the visitor watches their business work. A demo clock with speeds, pause and jump
ahead; scripted moments at set times (the 09:00 delivery); generated arrivals at a steady rate counted in demo
minutes, so the floor fills at the same pace at ×10 and ×240; working hours that skip nights and the weekend; and a
seeded random source so a replay looks the same in the meeting as it did in rehearsal.

**When it earns its place:** the client described a flow over time (orders through stations, calls through a day,
vehicles on routes). Seeing it move while they watch is worth ten static screens.

```js
import { createLiveRun, mountRunControls } from "./live-run.js";       // plus live-run.css for the strip
const run = createLiveRun({ start: world.asOf, shift: { days: [0, 1, 2, 3, 4], start: "07:30", end: "17:00" },
  every:  [{ mins: 85, label: "הזמנה חדשה", do: ({ now, rng }) => store.set((s) => { s.orders.push(newOrder(now, rng)); }) }],
  script: [{ at: "10:15", label: "הלקוח הגדול התקשר", do: (ctx) => incoming.show(bigCall) }],
  onTick: ({ now, mins }) => store.batch(() => advanceJobs(now, mins)) });
mountRunControls(headerEl, run, { ffMins: 60 });
run.play("x60"); run.pause(); run.fastForward(240); run.reset(); run.on("moment", (m) => feed.add(m));
```

**Does not decide:** what moves, where, or how long a station takes: that logic is the client's and lives in your
`onTick`. It draws nothing except the optional control strip. Pairs with `one-store` (mutate in `batch`, every
figure follows) and `incoming` (a scripted moment that rings); neither is required.
