# Sources: what to read before building, at every depth

Build from evidence, then from taste. The demo makes the client say «זה בדיוק העסק שלי»; that only happens when its words, entities, statuses and scale come from them.

## The chain

1. **The exact client.** `my_clients`, then `get_client`. Two clients can share a name.
2. **Every relevant call, in full, yourself.** `get_transcript`, newest first, following `next_offset` to the end. Summaries and key quotes are navigation only; they miss the sharpest line.
3. **The proposal.** `get_proposal`: its lines are the source of truth for what is offered.
4. **Their own material.** Their Excel, forms, WhatsApp templates, screenshots of what they use today: whatever he has, ask him for the files.
5. **Their WhatsApp thread and timeline**, with the tools in the `my-clients` skill.
6. **Research of the business and its trade** → `research.md`. Always, not only when the call is thin.

When sources disagree: the latest explicit client confirmation → the proposal for scope → their current system or document → the full transcript for workflow, examples and constraints → older notes → inference, visibly labelled as yours.

## While reading

- Map **every ask of every person**, with the line that says it. Do not thin the owner's asks because the daily user spoke more.
- Underline their words for what they manage, their statuses, their customers, their problems. Those words go on the screens unchanged. Their Hebrew is the asset; polishing it kills it.
- Note the **moments** they described («בבוקר אני צריך לראות...», «כשלקוח מתקשר...»). Each becomes a thing that happens in the demo, one tap from the first screen.
- Note the scale they mentioned so the seed matches it.

## When evidence is thin

- No transcript, but he has notes from the call: the notes are the source. Mark it in the spec and build.
- Almost nothing (a phone number, a name, an industry): research carries the build. Say in one line what is missing and what you assumed, and build a small demo, unless one question to him would change the build. Then ask that one.

## Scope

A screen exists because someone asked for it (a call line, a proposal line, his words). That includes furniture screens: settings, reports, an account page. A feature from our catalogue the client never asked for does not take the place of one they did.

## demo-spec.json

Kept next to the app, never inside the published folder. It is also what you send with `request_build`.

```json
{
  "client": {"name": "", "clientId": ""},
  "choices": {
    "depth": "small | usual | pilot", "depthReason": "",
    "look": "<two lines: what their system feels like and what it is drawn from>",
    "partsTaken": [], "agent": "<none | whatsapp | voice | both>"
  },
  "sources": {"transcriptIds": [], "proposalIds": [], "documents": [], "publicSources": [], "notesFromRep": []},
  "screens": [{"name": "", "point": "who opens it and what they do there", "source": "call 12:40 / proposal line 3"}],
  "seed": {"scale": "", "anchorDate": "", "story": ""},
  "assumptions": [{"decision": "", "why": "", "by": "AI"}],
  "warnings": ["Operational numbers are seeded demo data."]
}
```

No raw transcript text in it.
