# Parts for client demos

These are optional pieces of behaviour, each small, self-contained and free of any look of its own.
Take one, several or none: each part works alone, and none of them requires another.
The design of the demo is never taken from here; its screens, words, order and look come from this client.

Each folder holds `<part>.js` (an ES module, no imports outside its folder, no network, no build), an optional
`<part>.css` styled only through `--part-*` custom properties, a `README.md` and an `example.html` with an invented
business. Examples are ES modules: open them through any static server (`python -m http.server` in this folder; `python3` on a Mac),
not from `file://`. Every part was checked in a real browser at phone and desk width before it was shipped.

## Data and state
- `seed-world` — a believable Israeli world from one seed (names, phones, streets, ID numbers, businesses, dates from `asOf`, a story hook) — any demo with people or money in it.
- `one-store` — one in-memory truth with named selectors, so a KPI and its rows never disagree — more than one screen shows the same number.
- `time-anchor` — the demo's own clock anchored on the data's date, Hebrew relative times, working days, named windows — anything says "today", "late" or "this week".
- `csv-export` — export exactly what is on screen to a CSV Excel opens correctly in Hebrew — the client lives in Excel.

## Moments
- `live-run` — "run the day": a clock with speeds, scripted and generated events, working hours — the client described a flow over a day.
- `incoming` — a call, order, lead or message arrives visibly and offers its actions — a moment starts with something arriving.
- `whatsapp-thread` — a WhatsApp conversation, scripted or answered through a `send()` hook — their customers write on WhatsApp, or there is an agent.
- `voice-call` — an on-screen phone call with its transcript line by line, plus a "call the real number" card — a voice agent or a phone-heavy day.
- `agent-activity` — what the AI just did: steps lit in order and writes that open their records — any agent in the demo.

## Trust and recognition
- `said-and-built` — the client's own sentences, each beside what the system does and a door to its screen — a demo built from a call.
- `persona-switch` — role tiles, a "you are X" chip, deep links that open as the right person — more than one kind of person will open it.
- `demo-mark` — one quiet mark that explains, on press, where the data comes from — any demo shown outside the room.
- `guided-tour` — a short spotlight walk through the screens — the demo will be opened without us.

## Field and documents
- `offline-queue` — work saved on the device without signal and sent in order when it returns, with retries — people work in basements, sites, roads.
- `signature-pad` — a finger signature, crisp and resizable, with the signer's name — a job closes with a signature.
- `file-drop` — real files from the device, limits, thumbnails, files attached per item — they photograph or collect documents today.
- `doc-writer` — a certificate, report or note that writes itself from the data and prints — a document is re-typed after the work today.
- `barcode39` — a real, scannable Code 39 barcode as SVG — paper moves with the work (job cards, boxes, labels).
- `dynamic-form` — form templates chosen by task type, dropdowns, required checks — different jobs have different forms.
- `map-links` — Waze, Maps, call, WhatsApp, SMS links with Israeli numbers normalised — jobs with an address and a person.

## Frames
- `device-frame` — a phone or tablet bezel with its own scroll that dissolves on a real phone — a phone product shown on a laptop.
- `drill` — any figure marked `data-drill` opens the exact rows behind it — any screen with numbers.
- `view-controls` — time window, facet filters with counts, flags, sort, the choice in words — any list longer than a screen.
- `offer-page` — the offer as a demo page: tracks, add-ons, hours, live sum with VAT, each line a door; refuses unpriced lines — a project-sized offer.

## Combining without coupling
`seed-world` → `one-store` → `drill` / `view-controls` is the usual data spine. `live-run` mutates the store in
`batch()` and fires `incoming`. `whatsapp-thread` or `voice-call` feed `agent-activity`. `signature-pad`,
`file-drop` and `dynamic-form` produce items for `offline-queue` and content for `doc-writer`. Each pairing is
wired in your own code; no part imports another.
