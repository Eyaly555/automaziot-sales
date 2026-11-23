# Designing the look

The look decides whether the client sees their own business or a product of ours with their name on it. Write the
look and its reason in `demo-spec.json` before the first screen. Nothing is preset: no house style, no kit to pour
the screens into.

## Collect what their world looks like

- **Their brand as it really is**: logo, colours, type, photographs, the tone of their site and printed material.
- **The materials of their trade**: ink and paper for a printer, steel and drawings for a workshop, a ledger for an
  accountant, a route sheet for a driver, a chart for a clinic. What do their people hold and look at all day?
- **The documents and tools they already use**: their order form, their work card, their spreadsheet, the screen of
  the system they complain about. A demo that echoes the good parts of those feels familiar on first sight.
- **The mood of the place**: a busy counter, a quiet office, a field team on phones in the sun, a control room.
- **Who looks at it and where**: a manager at a desk, a technician with one hand, an owner on a phone at night.

## Then design it

Decide in two lines what this system feels like, and carry one strong idea through every screen: palette,
typography, shape, density, motion, how a person moves through it. Give the system a name of its own when one fits
their idea of their work. Build the hardest real screen first, look at it on a phone and on a desk, and only then
build the rest.

Craft that holds under any look: text large enough to read on a phone (body 16px and up), contrast of at least
4.5:1, touch targets of 44px, one clear action per screen, numbers that line up, real Hebrew typography set right
to left, empty and loading states designed like the rest, motion that explains a change and never decorates.

Parts have no look: every colour, radius and font in them is a CSS variable with a neutral fallback. Take a part,
then dress it in this client's design or rebuild it your way.

Two cases settle the look before you start: the demo adds to a system the client already runs (keep that system's
design), or the client already saw a demo of ours (that design is theirs now; ask for it with `request_build`).

## Signs the look is not theirs yet

- It would fit another business after changing the logo and one colour.
- It looks like a dashboard product, or like any other demo.
- Their real photographs and logo exist and the demo uses neutral shapes instead.
- The colours came from a preset and not from anything of theirs.
