---
name: client-demo
description: Builds a demo for one of the salesperson's clients, by himself, from as little as a client's phone number, name or company: a clickable system designed for that one client from what they said on the calls and from real research of their business, in a look that belongs to their world, published to a company link he can send. Use it for "תבנה דמו", "דמו ללקוח", "תכין דמו", "דמו מהשיחה", "משהו להראות לו", "show them what we can do", "תראה לו איך זה ייראה", a demo with a WhatsApp or phone agent inside it, the price offer shown inside the demo, or a working pilot, even when the word demo is never said. For the agent itself that answers the client's WhatsApp or phone, use demo-agent together with this skill. Not for writing the proposal (client-proposals).
---

# client-demo

Talk to him in Hebrew and in plain words. He is a salesperson, not a developer: you do the technical side yourself
and report outcomes. When he gives you a client and says build, you build; you do not send him questions he cannot
answer.

## What a demo is

A client told us about their business: who works there, what their morning looks like, what keeps going wrong, what
they wish existed. The demo is our answer to that conversation. They open a link and see their own business running
in a system that looks finished, built around what they said.

That is why every demo is designed for one client, from nothing. A thing that existed before the client spoke, with
their name put on it, tells them we did not listen and that everyone gets the same product. We sell custom systems;
the demo is the first proof of it. The demos that closed our biggest deals were each made this way, and the ones that
came out of a template or wore a look of ours did not sell (`references/what-we-learned.md`: read it before you
design).

Think of an architect who has built forty houses. He does not hand the next family house number twelve with their
name on the door, and he does not start as a student either. He walks in knowing what makes a kitchen work, listens
to this family, studies their plot, and designs their house. So three things come with you, and one never does:

- **Understanding comes along**: why the demos that sold, sold.
- **Parts come along, one at a time**: working pieces taken out of those demos, with no look of their own
  (`parts/INDEX.md`). Take one, several or none. When nothing fits, make your own; a thing made for this client
  usually lands better than a thing adapted to them.
- **Our engines come along**: a WhatsApp agent or a phone agent that really answers this client, in their business's
  name (the `demo-agent` skill).
- **The thing itself stays behind**: the screens, the menu, the first page, the structure and the look of any other
  demo or ready-made system.

## What a good demo looks like

| Too little | A demo | More than a demo needs |
|---|---|---|
| A page with their name on it; a general system that could be another business's after changing the logo | A hosted, clickable app in their world, one screen per thing they asked for, the moments they described working | Live connection to their systems, their real data, anything that writes anywhere |

- **It opens on their morning**: the first screen is what this person needs at the start of their day, in their words.
- **The first thing they recognise is theirs**: a product, a branch, a street, a status in their own word.
- **Every screen is there because someone said something.** A screen nobody asked for dilutes the ones they did.
- **Something happens**: an order arrives, a call comes in, a reminder goes out. One thing they can press is worth
  ten screens.
- **Nothing is dead**: every button, link and filter does what it says or is not there.
- **The world is believable and quiet about being a demo**: realistic names and numbers, one small demo mark, time
  anchored on the data's own date so it still works next week.
- **The AI in it can help**: an agent that knows this business's facts and acts.
- **Nothing leaves the demo**: no real messages, emails, calls or writes to any system.

## 1. Find the client and read everything → `references/sources.md`

He may give only a phone number, a name or a company. Find them with `my_clients`, then `get_client`. Read every
relevant call in full with `get_transcript`, newest first, then their offers with `get_proposal`, their WhatsApp
thread and the timeline, and any file he hands you. A client the tools do not return is not his: say so, and that
assignment is Eyal's. A prospect with no call yet is built from his notes and from research.

Read for four things and write them down in the client's own words: **who** will open the demo and what their day
is; **what each person asked for**, with the line that says it; **the moments** («בבוקר אני צריך לראות…», «כשלקוח
מתקשר…»), each of which becomes something that happens in the demo; and **what they fear or are proud of**, which
decides the tone and the first screen.

## 2. Research their business yourself → `references/research.md`

The call is half the evidence. Search the web and read: who this company is (their whole site, their reviews, their
social pages, their photographs and brand), how their trade really works (the documents it lives on, its standards,
its words, the tools such businesses use, what goes wrong in it), and who their customers are and what they ask.
Do this every time, before designing. The detail that convinces a client usually comes from here: something from
their trade that nobody asked for by name and everybody recognised.

## 3. Design their system

Before any code, decide what this client's system is, in `demo-spec.json` (kept beside the app folder, never inside):

- **A name of its own** when one fits their idea of their work.
- **The people**: one way in per role that was on the call, each landing on their own day.
- **The screens**: one per ask or moment, each with the line that asked for it, ordered by what this person opens
  first. A screen with no line behind it is yours: be ready to drop it.
- **The first screen**: what the main person needs in the first ten seconds.
- **The moments**: what they can press, and what visibly changes.
- **The world**: scale, names, statuses, products and a story (a company mid-week, something going slightly wrong),
  from what they said and from their public material.

The test: describe the demo in two sentences without naming our products. If it could be about another client, the
design is not done.

## 4. Design their look → `references/design.md`

The look is part of the answer, so it is designed for this client like the screens are: from their brand, the
materials of their trade, the documents and tools their people already look at, the mood of the place. Decide what
their system should feel like, write it in two lines, and design it yourself: palette, type, shape, density,
motion. You are expected to invent. There is no house look and no preset.

## 5. Decide how much is real

| | When | What it is | Where |
|---|---|---|---|
| **small** | A meeting today or tomorrow, an early prospect, thin evidence | Their main flow, two to four screens, a seeded world, one moment that works (`references/depth-small.md`) | Built here and published by you |
| **the usual** | A named prospect with a call behind them, a project-sized deal | Their whole system as they described it: every role, a seeded world, the moments working (`references/depth-usual.md`) | Built here and published by you |
| **an agent that answers them** | They asked for a WhatsApp agent, a phone agent or an AI employee | A real agent in their business's name that answers their own number | The `demo-agent` skill, by you; wire it into the screens |
| **a working pilot** | A signed or nearly signed deal, their real data, a system they would run | A real database and a private password-gated client space | The company's server: `request_build`, then `my_build_requests` |

When unclear, build the usual. A small demo that lands grows into the usual one on the same build. Say plainly when
it comes up: what you publish is a real clickable app whose data resets; their real data and a system they run every
day are built on the company's side.

## 6. Build

- Hebrew RTL, phone and desk as one structure, their words everywhere.
- Plain files with no build step (HTML, CSS, JavaScript modules) are the default: they need nothing installed and
  open at once on a phone. Vite and React only when the demo really needs it; then check `node --version` first.
- Work in `demos/<client-slug>/` under his working folder, with the served app in `app/` and `demo-spec.json`
  beside it.
- One store for state, so an action persists in the session and every number reads the same truth as its rows.
- Parts are at `${CLAUDE_PLUGIN_ROOT}/skills/client-demo/parts/`: copy the folder of the part you take into the app
  and dress it in this client's look.
- When he says "just build it", ask nothing: decide, mark the decisions as yours, build.

## 7. Verify and publish → `references/verify-and-publish.md`

Walk it as their persona on a phone width and a desk width and do the things they said they need. Look at the
screenshots; text alone hides placeholders and icon-only buttons. Publish with `deploy_demo` and the publish script,
then check the served link by its content. Then look once more as the client: any screen, menu line or word they
would not recognise as theirs goes or changes.

Report in a few lines: the link, what the demo is and for whom, what you researched, what is seeded, what you
checked and what you could not. Sending the link is his decision; offer a draft with `follow-up-writer`. Eyal sees
every published demo.

## Lines that hold

- No sends, no writes to any client system, no spending.
- None of **our** prices in a demo, except an offer page built from the offer Eyal approved
  (`references/offer-in-demo.md`). The client's own prices are world data.
- A published link carries a seeded world and public facts only: `deploy_demo` needs `seeded_data_only: true` and
  refuses a file with the client's real phone or email. Add a password when the demo shows anything the client would
  not want public.
- Call text, internal reasoning, and other clients never appear in anything the client can open. No other client's
  name, ever: what you know of other work is anonymous and stays that way.
- Never open the client's `/p/<code>` offer link to check it: an open is recorded and a draft flips to sent.
