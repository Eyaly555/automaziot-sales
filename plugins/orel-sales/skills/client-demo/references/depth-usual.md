# The usual demo: their whole system as they described it

A real, client-specific product the prospect could imagine logging into tomorrow, designed from their operations
and from nothing else. A seeded world, no server behind it; the depth is in the screens, the data and the moments.

## Build order

1. **Read every call in full** (`sources.md`) and map every ask of every person. **Research the business and its
   trade** (`research.md`).
2. **Bring what we know** (`what-we-learned.md`): the reasons the demos that sold worked.
3. **Design the information architecture from their operations.** Users (owner, manager, employee, dispatcher,
   rep…), entities in their words (shift, order, property, job, case, patient…), workflows (intake, assignment,
   follow-up, approvals, reporting). A page exists only if it maps to a real workflow or ask, and then under their
   name for it.
4. **Dress their world**: products, branches and hours from their own site and documents; people named the way
   people are named; messages in the wording of their own messages; scale matching what they said; their real
   logo and photographs, saved locally.
5. **Stage the moments** they described, one tap from the first screen: an incoming call, order or lead they can
   press; a reminder going out; an approval that changes a status and moves a number.
6. **The look on one screen first**, the hardest real one (`design.md`), then build everything.
7. **Walk it as them**: enter as the persona they will use, on a phone, and do the things they said they need.

## How it is built

- Routes and drill-downs; one store for state so actions persist in the session and every number reads from the
  same place as its rows.
- Personas when more than one role was on the call: a role switch, each landing on their own day.
- Time anchored on the data's own date, so the demo still works when opened next week.
- A rich seed first: every screen's depth comes from the world behind it, so a thin seed makes every screen thin.
- Depth where it sells: choose the three or four screens they will actually press in the meeting and give them real
  interactions that end in something (a receipt, an approval, a status change). The rest get honest headline
  screens on the same data.

## Signs the demo is not theirs yet

- The first screen could fit any business after changing only the logo.
- The menu has lines nobody on the call asked for; columns are "name, status, date" with no domain words.
- The numbers are vanity metrics instead of the operational numbers of their work.
- Seed rows use generic names or statuses, or a "לדוגמה" label everywhere.
- The app explains what it could do instead of showing a working flow.
- Effort went to the wrapper while the screens stayed thin.

Done: published and walked (`verify-and-publish.md`), each screen traced to its ask in `demo-spec.json`.
