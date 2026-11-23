# The price offer inside the demo

Only for a project-sized offer (several modules, tracks, above roughly 35,000 ש"ח), and only when Eyal said which proposal to base it on. If the client has several proposals, stop and ask which; never pick the latest by yourself. Otherwise a demo shows no price.

The offer can live as one more screen of the client's own demo instead of only the long contract page. The client chooses where to start, sees what it costs, and each line takes them to the screen in their demo that it pays for. Built this way once, unasked, it got the best reaction any offer got.

## The shape (find this client's own)

The `offer-page` part in `parts/` is a working start for the mechanics (tracks, the live sum, a door from each line to its screen). The drawing and the look are this client's.

- **The offer drawn as its real shape**: a road, a building, a calendar, a set of rooms. Find the fork or order that actually exists in the scope and draw it.
- **Tracks as cards with their own price**, computed from the line prices, never typed.
- **The sum is the focal figure.** It counts to its new value, shows VAT under it, and opens its own breakdown line by line.
- **Every line opens over the screen**: price, description, what is included, why in the client's own words, and «לראות בהדגמה», a door to the demo screen that line pays for. That door is what makes it land.
- **Add-ons as tiles.** A «דרך / רשימה» switch gives the same offer as a plain grouped list.
- **The choice lives in the address**, so a configured offer can be sent as a link. The last step links to the formal contract for signing.

## The truth contract

- The source is `get_proposal`. Copy client-facing fields only: name, description, what is included, reasoning, price, ticked. Nothing else enters the demo.
- Every price and total comes from those lines. After any edit to the proposal: copy again, publish again, check the totals again.
- **Never open the client's `/p/` link to check it**: a view flips a draft to sent. Use `preview_for_you_only`.
