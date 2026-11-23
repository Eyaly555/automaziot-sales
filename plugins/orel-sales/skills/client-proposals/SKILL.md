---
name: client-proposals
description: Create and edit fully custom client proposals grounded in the call transcript. The services catalog is inspiration only, never a template. Use it whenever he asks to create a new proposal, edit services or pricing, add or remove a line, check a proposal's status or whether it was opened, review what a client said, or anything about offers. Triggers include "תכין הצעה", "הצעה ללקוח", "הצעת מחיר", "עדכן הצעה", "תוסיף להצעה", "תוריד שורה", "כמה זה יעלה", "מה הוא אמר בשיחה", "הוא פתח את ההצעה?", "create a proposal", "edit the offer", even when only a client name and a need are mentioned.
---

# Client proposals: transcript first, fully custom

Talk to him in Hebrew and in plain words. Tool names and field names are yours, not his.

## The contract

A proposal here is custom-designed for this client from this conversation. Not a catalog lookup, not a template. Every service, every description, every line of reasoning comes from what the client said on the call.

**Four absolute rules:**

0. **Read the transcript in full, always.** Before anything else (designing services, deciding to stop, asking a clarifying question, previewing, editing, declining) call `get_transcript` and read every word of every relevant call for this client, following `next_offset` to the end. A summary, a length or key quotes are not reading the transcript. Skipping this because a proposal already exists, the situation looks clear, he said "no analysis", or to save effort is a hard violation. If he asks what was said on the call and you have not loaded the text, your answer is invalid: load it first, then answer.
1. **The transcript is the source.** If it isn't in the transcript (or a related call of this client), it isn't in the proposal.
2. **The catalog is a thesaurus, not a menu.** Use it to see how similar problems were phrased. Never copy its text as the proposal.
3. **No external lookups.** No web search, no Googling the company, unless he asks.

**The contract test:** the client reads the proposal and says "yes, we discussed this", never "where did this come from?"

**Rationale honesty:** every `reasoning_he` and line reflects only what the client actually said. Never write «הלקוח ביקש X» or «ביקש במפורש X» for something they did not ask for, and never include a service they declined. A capability you recommend (rather than one they requested) is framed as a recommendation: open it with «מומלץ:».

**Stop and ask if:** budget is unclear, critical systems weren't named, the core pain wasn't articulated, or the transcript is too short or vague to design from. Guessing is worse than asking. You may only stop **after** reading the transcript in full.

## What is yours and what is Eyal's

Yours: drafts, edits to unsigned offers, sending each offer to Eyal's approval, sending the approved link yourself, recording that you sent it.

Eyal's, and the tools refuse them: any discount (he writes the request down, tells the client he will come back with an answer, and passes it to Eyal; on an offer of ₪20,000 or more before VAT that conversation is the meeting with Eyal), VAT, payment terms (default 50% on signing, 50% on delivery; any other split is closed with Eyal), legal text, anything signed, and an offer sent before the client was assigned to you (create a new one instead). A monthly fee to us never appears on an offer in any name.

Nothing goes to the client by itself, and no offer reaches a client before Eyal approved it. `create_proposal` makes a draft; `submit_for_approval` sends it to Eyal; when he approves, the client link appears, the salesperson sends it himself, and `mark_sent` records it. An offer Eyal returned comes back with his note: change exactly what the note asks with `update_proposal`, then submit again. A single deal over ₪30,000 needs Eyal's approval in advance, so say it to him before he promises the client anything. On his practice client («לקוח תרגול») approval is immediate and the exercise ends there: nothing built on it is ever sent, the client link stays hidden, and `mark_sent` is refused. Say so if he asks to send it; do not look for a way around.

## The tools

| Need | Tool |
|---|---|
| Find the client | `my_clients` |
| Identity, history, call headers, offers and real opens, meeting status | `get_client` |
| Full text of a call | `get_transcript` |
| Price sheet and what you may say | `pricing_rules` |
| How similar needs were phrased and priced | `find_similar_offers`, `search_solutions`, `services_catalog` |
| New draft | `create_proposal` |
| Read one offer: lines, computed totals, opens | `get_proposal` |
| Change an unsigned offer | `update_proposal` |
| Send a finished draft to Eyal's approval | `submit_for_approval` |
| Record that you sent the approved offer | `mark_sent` |

A client not on your list reads as not found. Do not look for it another way; assignment goes through Eyal.

## Workflow

```
CREATE
 1. Find the client
 2. READ ALL RELEVANT TRANSCRIPTS IN FULL (mandatory)
 3. Check existing proposals
 4. Extract quotes, systems, pains, budget signal
 5. Read the client's card for calibration
 6. Read pricing_rules, design services from the conversation
 7. (optional) find_similar_offers, catalog
 8. Preview to him, wait for his OK
 9. create_proposal
10. Return links and summary

EDIT
 1. get_proposal
 2. RE-READ THE TRANSCRIPT IN FULL (mandatory)
 3. Make ONLY the requested change
 4. Preview the change, wait for his OK
 5. update_proposal
 6. Re-verify the whole proposal
 7. Return links and summary
```

Create and edit are distinct flows. Don't merge them.

## 1. Existing proposals: don't get stuck

`get_client` lists them. Multiple rows are revisions.

| Situation | Action |
|---|---|
| The latest sales call is **newer** than the latest proposal | Build the preview anyway and flag at the top: «יש כבר הצעה מ-X. זו גרסה חדשה או תוספת?» This is the common case |
| The latest call was **already mined** into a live proposal and no newer call exists | **Stop and ask.** Do not re-design from the same call; that creates duplicate scope. Ask which proposal to edit or what new information exists |
| The latest is signed | Locked. New scope is a new proposal |
| Drafts exist and he says "the latest" | The most recently updated draft, unless he named another |
| A draft and a signed proposal on different scope | Ask, it is genuinely ambiguous |
| An offer already sent | Lines a client already saw are frozen unless he asks to change them. When you do change one, say what the client will see differ |

Build-preview-with-flag beats stop-and-ask when there is fresh material. Stop only when there is nothing new to design from.

## 2. Read the transcripts: the source

**Multi-call rule:** read the most recent in full. Read `ai_summary` for older ones, and read them in full if relevant. If an earlier call contradicts the latest (changed budget, dropped requirement, new system), tell him; do not silently resolve it. Prioritise `sales_discovery` and `sales_followup` calls. `information_gathering` and `technical_review` are useful supplements.

The pre-extracted fields (`key_quotes`, `client_requests`, `client_concerns`, `next_steps`, `open_questions`) came from an earlier AI pass: use them to verify your own extraction, not as a substitute.

### Your extraction (no service without this)

Before designing any service, produce this yourself from the text:

| Field | What to capture |
|---|---|
| Pain points | 2 to 3 or more direct quotes in the client's own words |
| Systems named | Exact names, not generic "CRM" |
| Current workflow | How they work today, step by step |
| Budget signal | `tight` / `moderate` / `open` / `unstated`, from reactions, comparisons, "start small" |
| Priorities | What they emphasised, repeated, got excited about |
| Objections | Concerns, past bad experiences |
| Agreements | What they said yes and no to explicitly |
| Quotes to use | 3 to 7 verbatim quotes for `reasoning_he` |

If a section is empty or thin, tell him what's missing. **No quote, no service.**

## 3. Calibrate from the card

After the extract, read the card from `get_client` to calibrate tone, scope and price sensitivity. It never overrides the transcript.

| Signal | Effect |
|---|---|
| `claude_summary` | Tone and industry framing |
| Many old drafts, status offer followup | Price sensitive: respect budget signals hard |
| Recent history mentions a competitor | Address the difference in `reasoning_he` |
| Last contact over 14 days ago | May be cooling: keep lean |
| "Start small" in the call | 2 to 3 core services, not a bundle |
| An earlier signed sum | Budget ceiling reference |
| `known_systems` | Prioritise integrations with these |

## 4. Design services from the conversation

For each service, answer from the transcript:

1. What did the client say that this addresses? (quote or paraphrase)
2. What systems are involved? (their actual named systems)
3. What's the trigger, process and output? (a concrete workflow, not "automation")
4. Why does this client need this service? (in their words)
5. What does it cost? (`pricing_rules`: count atoms)

### Scope discipline

**Include:** what they explicitly asked for, what solves a pain they described, technical dependencies needed for those.

**Do not include:**
- Nice-to-have additions nobody mentioned.
- Separate lines for what is really one workflow.
- Padding: if 3 services solve the problem, don't add a 4th.
- **Items explicitly deferred.** Watch for «אפשר בשלב הבא», "phase 2", «ננסה בהמשך», «נראה איך מתקדמים», «אפשר עכשיו אפשר אחר כך». A casual mention does not make it scope. If the client understood a suggestion («הבנתי») but did not agree to it («כן בוא נעשה»), it stays out.

**No discovery quantities in deliverable text.** The proposal describes what we deliver and must scale without re-pricing when they add branches, employees, vendors or volume. Numbers from the call (4 branches, 200 invoices a month, the employee who checks prices) go in `internal_summary`, never in `name_he`, `description_he`, `what_included` or `reasoning_he`. Naming people on the client's side other than the buyer is the same mistake. The one exception is a genuine ceiling, stated as a limit: «תמיכה עד 50 משתמשים פעילים».

**Confidential:** what a client said in confidence, or anything personal, stays out of the proposal entirely. If a call was marked confidential, ask before using it.

### Budget signal to proposal size

| Signal | Default shape |
|---|---|
| `tight` | 2 to 3 core services, well under any ceiling they gave |
| `moderate` | 3 to 5 services, the full scope they described |
| `open` | 4 to 7 services, with enablers they'd benefit from, still grounded |
| `unstated` | Focused: 3 to 4, not comprehensive |

### base_packages and addons

`base_packages` are the core services that deliver the main outcome. `addons` are optional additions on top. Don't force the split: if everything is core, `addons` is empty.

### Field quality

| Field | Weak | Strong |
|---|---|---|
| `reasoning_he` | «ישפר יעילות» | «בשיחה אמרת: 'זהו, זה מה שאני צריך, משהו פשוט.' השירות נותן בדיוק את זה.» |
| `name_he` | «אינטגרציית CRM» | «שמירה אוטומטית של לידים מוואטסאפ ל-CRM» |
| `description_he` | Generic | «כאשר ליד שולח הודעה, הבוט מזהה ושומר ב-CRM, ונציג מקבל התראה» |
| `description_he` (quantities) | «מערכת ל-4 סניפים עם 15-20 עובדים לסניף» | «מערכת רב-סניפית. מספר הסניפים והעובדים מנוהל מתוך הממשק וניתן להרחיב בכל עת» |
| `what_included` (people) | «הדרכה ל<שם> ולמנהלי הסניפים» | «הדרכת צוות הלקוח על התהליך החדש» |

**Hebrew voice:** every Hebrew field reads as native Hebrew, not a translation. If it sounds translated, rewrite it.

**Pattern for `reasoning_he`:** «בשיחה ציינת ש-[ציטוט]. השירות הזה פותר את זה על ידי [איך].»

## 5. Price: count, then check

Read `pricing_rules` before pricing anything. Identify each service's family, count its atoms from the transcript, apply the sheet, never below the floor, round to 50. A count you are unsure of rounds up. Put one sentence with the count behind each price in `internal_summary` («סוכן + 4 פעולות + מאגר ידע = 5,000 + 3,200 + 3,000»).

The two rules that override the sheet: image and voice-note understanding is free in every agent, always, never a line and never a tool. And never charge to connect two things built in the same offer: no «חיבור X ל-Y» line; a client-visible capability on that data is one tool on the agent (+800). Integration rows are only for a system the client already runs.

The price follows the count, never the client's own framing of a task as "easy" or "hard". A line's price is never lowered to reach a total: scope shrinks instead, or a smaller real first phase. Above roughly 15,000 present phases. Below 3,500 no proposal goes out; the tool warns.

Then, after you designed from the conversation and never before:

- `find_similar_offers` for how similar needs were phrased and what one matching line cost (`component_band`: the band of one line in an offer, never of a deal). Anonymous, for your sanity check only: if your line lands far outside its band, recount. Never tell a client what someone else paid, and never quote a band.
- `services_catalog` for scope and phrasing. Do not copy its text; rewrite in the client's language. Its dependency fields matter only if the transcript supports them; do not auto-add.

Don't compute totals for the client yourself. `create_proposal` and `get_proposal` return totals the system computed; those are the only numbers you quote.

## 6. Monthly costs

**Default: empty.** Do not compute or itemise third-party monthly costs in a proposal unless he explicitly asks. When he does, third-party only, itemised with a total, in `monthly_recurring_costs` through `update_proposal`, and it never includes a fee to us. Check current prices rather than guessing. Naming a specific AI model in client text: generic wording («מודל שפה מתקדם») unless the version truly matters.

## 7. Create

1. Find the client.
2. Read all relevant transcripts in full and build the extract. Before anything else, including before checking existing proposals.
3. Check existing proposals, now that you know what is in the call.
4. Card calibration.
5. Design and price.
6. **Preview to him and wait for his OK:**

```
הצעה מוצעת ל-{שם}

אות תקציבי: {tight / moderate / open / unstated}

שירותים:
  בסיס ({N}):
    1. {שם} ₪{מחיר}
       מה: {שורה על מה כלול}
       למה: {ציטוט}
       ספירה: {הספירה שמאחורי המחיר}
  תוספות ({M}):
    ...

לפני מע"מ, בערך: ₪{סכום} (המערכת תחשב סופית)

מה השארתי בחוץ ולמה: {שלב ב', דברים שלא נסגרו}
```

7. After his OK, `create_proposal`. Identity comes from the client's card by itself. Pass `pain_points`, `main_goals`, `current_systems` from the call and `internal_summary` with the counts and call quantities.
8. Return the output below.

The tool's field shape for each line: `name_he`, `description_he`, `what_included[]`, `systems_involved[]`, `reasoning_he`, `price`, `category_id` (one of: `foundation`, `ai_agent`, `data`, `visibility`, `automation`, `integration`, `voice`, `documents`, `custom`, `workforce`, `operations`, `support`), optional `delivery_timeframe`. Ids and the rest are filled by the server.

## 8. Edit

**Which is "the latest":** only drafts: the most recently updated. An offer you already sent and a newer draft: ask if unclear. Signed: cannot be edited, propose a new one for the added scope.

1. `get_proposal`, show him the current state of what changes. Keep its `updated_at`.
2. Re-read the transcript. If he asks to add a service the transcript does not support, ask for the source.
3. Make only the requested change. No cleanups of other fields. No unsolicited re-optimisation.
4. Preview the change, then `update_proposal` with `expected_updated_at` and `item_ops`:
   - add: `{"op":"add","section":"base_packages","item":{...}}`
   - change: `{"op":"update","id":"<line id>","fields":{"price":2000}}`
   - remove: `{"op":"remove","id":"<line id>"}`
5. **Re-verify after every edit** with `get_proposal`: every remaining service still traces to the transcript; no two services do the same job; totals and any monthly text still match the set; the base and addons split still makes sense. If anything is off, tell him before calling it done.

If the tool says someone saved in the meantime, read it again and redo the change on what is there now. Editing a sent offer invalidates a page the client has open, so never edit one while the client is deciding unless he asked.

## 9. Before returning anything

Run silently:

- [ ] Every service has a direct quote or paraphrase from the transcript behind it
- [ ] All Hebrew reads as native Hebrew
- [ ] Every price follows the sheet, with its count in `internal_summary`
- [ ] Budget signal respected
- [ ] No items explicitly deferred in the call
- [ ] No discovery quantities or named people in deliverable text
- [ ] No monthly fee to us; monthly costs empty unless he asked
- [ ] No other client's name or anything that identifies one, anywhere
- [ ] Any AI model named in client text is current, or generic
- [ ] The system described matches what was agreed in the call, not an earlier brief the call changed
- [ ] Previewed and he said OK
- [ ] Anything ambiguous flagged, not silently decided

Any unchecked item: fix before returning.

## 10. Output

```
✅ {נוצרה / עודכנה} הצעה ל-{שם}

שירותים:
  1. {שם} ₪{מחיר}
  ...

לפני מע"מ: ₪{מהמערכת}
כולל מע"מ: ₪{מהמערכת}

🔗 קישור ללקוח: {client_link}
👁 לבדיקה שלך בלבד: {preview_for_you_only}

שאלות פתוחות: {אם יש}
```

Lead with the client link: that is the one he forwards. **He must not click it himself and nothing should open it for testing:** an open is recorded, a draft flips to sent, and a meeting qualifies only on a real client open. For his own look he uses the preview link. Then offer the short send message through the `follow-up-writer` skill, and remind him to say when he sent it so you can call `mark_sent`. The meeting with Eyal becomes possible only after sending and a real open; `get_client` shows where that stands.

**Signals he asks about** («הוא פתח?»): `views` in `get_proposal`. It counts people only, after sending. WhatsApp's link preview, crawlers and his own opens are removed, so a machine open never reads as interest.
