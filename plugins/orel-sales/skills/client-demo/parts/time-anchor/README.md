# time-anchor

The demo's own clock. `now()` is the data's date (`asOf`) plus the time the page has been open, so the demo shows
"today 09:14" next week exactly as it does today, and still moves while the visitor watches. Hebrew dates
(dd/mm/yyyy), 24-hour times, relative words («לפני 3 שעות», «אתמול 14:20», «בעוד שעתיים»), working days
(Sunday–Thursday by default), and named windows (`today`, `week`, `month`, `30d`) counted from the data's now.

**When it earns its place:** anything on screen says "today", "late", "this week" or "3 hours ago". Windows counted
from the wall clock rot within days; this is the fix.

```js
import { createClock } from "./time-anchor.js";
const clock = createClock({ asOf: world.asOf, rate: 1, workDays: [0, 1, 2, 3, 4], dayStart: "07:30", dayEnd: "17:00" });
clock.mount(headerTimeEl, (d) => `${clock.weekday(d)} ${clock.time(d)}`);
clock.relative(job.updatedAt);  clock.inWindow(job.at, "7d");  clock.since("month");
clock.at(-1, "14:30");  clock.addWorkDays(order.at, 3);  clock.nextOpen();     // skips nights and the weekend
clock.advance(2 * 36e5);  clock.setRate(60);  createClock({ asOf, frozen: true }); // frozen for screenshots
```

**Does not decide:** the client's working week or hours (pass them), time zones (it uses the browser's local time),
or how a live run moves time (`live-run` has its own clock and may call `set()` here). `seed-world` has its own small
date helpers, so neither needs the other.
