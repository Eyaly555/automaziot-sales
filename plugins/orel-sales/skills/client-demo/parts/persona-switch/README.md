# persona-switch

One way in per role. Role tiles where each person lands on their own day, a "you are X" chip in the header to change
role from anywhere, and deep links that open as the right person (`#/jobs/17?as=tech-2`). The choice is kept for the
tab (or browser) and the URL always wins, so a link sent to one person opens as that person.

**When it earns its place:** more than one kind of person was on the call or will open the demo (owner, office,
field, customer). Each landing on their own morning is what makes each of them recognise the system as theirs.

```js
import { createPersonas, mountPersonaTiles, mountPersonaChip } from "./persona-switch.js";   // plus persona-switch.css
const ps = createPersonas({ personas: [{ id: "owner", name: "…", role: "בעלים", home: "#/today", can: ["money"] },
                                       { id: "tech", name: "…", role: "טכנאי", home: "#/my-day" }] });
mountPersonaTiles(loginEl, ps, { heading: "מי נכנס?" });  mountPersonaChip(headerEl, ps);
ps.on("change", (p) => router.render());  ps.current();  ps.link("#/job/17", "tech");  ps.can("money");
```

**Does not decide:** who the people are or what each one's day contains (that is the demo), and it is not security:
`can()` only hides what a role would not see. No password, no account; put a real gate in front if the demo shows
real client data.
