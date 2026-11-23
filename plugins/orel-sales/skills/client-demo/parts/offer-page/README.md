# offer-page

The price offer as one more page of the demo. Tracks as cards with their own price (computed from their lines),
add-ons as tiles, hourly lines counted with a stepper (hours × rate), monthly lines in their own pane, and the
sum as the focal figure: it counts to its new value, shows VAT under it and opens line by line. Every line opens
with what it is, what is included, why (in the client's own words) and a door to the demo screen it pays for. The
choice lives in the address (`?ot=b&oa=o1&oh=10`) so a configured offer can be sent as a link.

**When it earns its place:** a project-sized offer (several modules or tracks). The price stops being a number and
becomes the thing they just used. Small offers do not need it.

```js
import { createOffer } from "./offer-page.js";        // plus offer-page.css
createOffer(el, { vatRate: 0.18,                        // required: never assumed
  tracks: [{ id: "a", name: "…", lines: ["l1", "l2"] }, { id: "b", name: "…", lines: ["l1", "l2", "l3"] }],
  lines: proposalLines.map((p) => ({ id: p.id, kind: p.kind, name: p.name, price: p.price, desc: p.description,
    includes: p.includes, why: p.clientQuote, door: { label: "לראות בהדגמה", open: () => router.go(p.screen) } })),
  contract: { label: "לחוזה ולחתימה", href: contractUrl } });
```

**The truth contract:** every figure comes from the lines you pass, copied from the signed or drafted proposal.
A line whose price is missing, `NaN` or negative is shown as «אין מחיר — לא נכלל בסכום», is not summed, cannot be
ticked, and a console warning names it. It never rounds to whole shekels, completes or invents a price; a proposal discount is passed as
`discountPct` and shown as its own line. Internal notes never go in.

**Does not decide:** the drawn shape of this client's offer (a road with its one real fork, a building, a
calendar): draw it around this list. Nor discounts, payment terms, or legal text: those stay in the contract.
