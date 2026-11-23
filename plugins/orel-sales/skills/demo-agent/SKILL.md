---
name: demo-agent
description: Builds a real AI agent for one of the salesperson's clients, in that client's business's name, that the client can talk to from their own phone: on WhatsApp, by calling a phone number, or in a web chat. The agent is written for that one business from the calls and from research, and it answers only that client's number. Use it for "תבנה לו סוכן", "סוכן וואטסאפ ללקוח", "סוכן קולי", "שיתקשר וידבר עם הסוכן", "עובד AI ללקוח", "מזכירה וירטואלית", "בוט לוואטסאפ שלו", "שיראה איך זה עונה ללקוחות שלו", "תחבר את המספר שלו", "תפעיל את הסוכן ל…", "תכבה את הסוכן", "מה המספר שהוא צריך לחייג", or a demo whose point is an agent that answers. Use it together with client-demo when the agent lives inside a demo.
---

# demo-agent

The strongest thing we can show a business owner is their own agent answering their own phone: they write on
WhatsApp or call a number, and something that knows their business answers in their name. You build that agent
here, for one client, by yourself. The engines behind it are the company's proven ones and you never see them: you
write who the agent is and what it knows, save it, and connect the client's number.

Talk to him in Hebrew and plainly. He does not need to know how it works; he needs to know what the client should
do and what they will experience.

## What makes it land, and what kills it

- **It is theirs.** Its name, its way of talking, what it knows and what it does are written for this business. A
  general assistant with their name on it is the agent version of a template, and the owner can tell in one answer.
- **It can help.** A conversation that ends in "אין לי מידע" or "נציג יחזור אליך" shows the opposite of what we
  sell. Every question a customer of this business would really ask has an answer in what you gave it.
- **It never invents.** Every fact it states is in its knowledge. A price, an hour or a policy you could not source
  is left out, and the agent says honestly that it will check, in a natural way.
- **It sounds like a person from that business**, in correct Hebrew, short, without scripts.

## 1. Read the client and research the business

Exactly as in `client-demo`: the calls in full (`get_transcript`), the offer, the WhatsApp thread, then real
research (`client-demo/references/research.md`). For an agent, read for three more things:

- **Who contacts this business and why**: the ten things their customers really ask or want, in the customers'
  words. Their site, their reviews and their FAQ show this; so does the call, when the owner describes his day.
- **The facts those answers need**: hours, address and areas, services and what each includes, how booking works,
  what a customer must bring or send, policies, who to reach for what. Only what a source states.
- **What the owner said the agent should do**, and what worries him about an AI talking to his customers.

Write the facts down with the source of each (their page, or the call). A fact with no source is not a fact: go
back and find it, or leave it out.

## 2. Write the agent → `references/writing-the-agent.md`

Two things, both in that file's shape: the **character and instructions** (who it is, who it talks to, what it is
for, how it thinks, what it must never do) and the **knowledge** (short titled pieces, each with its source). If the
agent will also answer the phone, a **voice version** as well (`references/voice.md`): a phone call is not a chat
read aloud.

It is an AI, not a script: give it context, knowledge and reasons, the way you would brief a sharp new employee on
their first day. No reply templates, no "if the customer says X answer Y", no lists of forbidden words.

## 3. Save it and wait for it to come up

`demo_agent_save` with the client, the agent's name, the business's name, the channels (`webchat`, `whatsapp`,
`voice`), the chat part and the voice part. It checks what you wrote and starts the build. `demo_agent_status`
tells you when it is live and gives the web-chat link. If it failed, the reason is there: fix that and save again.

## 4. Talk to it yourself before anyone else does

Open the web-chat link and be a customer of that business: ask a price, ask the hours, ask for the thing the owner
complained about, ask something it cannot know. Read every answer against the knowledge. An invented fact, a dead
end or a robotic line means the knowledge or the instructions are missing something: fix the cause and save
again. Do not add a rule for the one bad answer. Then let him try it on his own phone
(`demo_agent_bind` with his own number). His own number is the work phone Eyal saved on his record; when the tool
refuses it, the number is not saved there yet: say that Eyal adds it in the sales admin screen, and that until then
he tries the agent in the web chat.

## 5. Connect the client's number

`my_demo_lines` shows the numbers a client can reach an agent on. `demo_agent_bind` connects one phone number to
one agent on one line:

| Line | The client does | How it behaves |
|---|---|---|
| The demo phone number | Calls it from their own phone | Their agent answers them by name of their business. Any other caller hears one sentence and the call ends |
| The demo WhatsApp number | Writes to it from their own WhatsApp | Their agent answers. Other numbers get nothing |
| His own WhatsApp number (once Eyal connected it) | Writes to him as usual | **Off by default.** The agent answers only inside a window he opens for that client with `demo_agent_whatsapp_window`, and it closes by itself. Outside the window, his chats are his |

Only the client's own numbers on file, or his own phone, can be connected. A number of the client that is not on
their card yet is added to the card by Eyal first. The tool returns exactly what to tell
the client: which number, until when. A connection on the demo lines lasts 14 days. `demo_agent_unbind` ends it;
`my_demo_agents` shows everything he has running.

His own WhatsApp carries his real conversations with these same people. Open the window when the client is ready
to try it ("תכתוב לי עכשיו בוואטסאפ ותראה"), for the time the trial takes, and tell him when it closes. Never leave
it open as a habit.

## 6. Wire it into the demo

When the agent lives inside a demo, the round trip is the moment that sells: the conversation the client just had
shows up on the owner's screen as the lead, the booking or the task it created. Use the `whatsapp-thread`,
`voice-call` and `agent-activity` parts in `client-demo/parts/`, and put a card on the first screen with the number
to write to or call.

## Lines that hold

- A demo agent never writes or calls first, never contacts anyone but the connected number, and never touches the
  client's systems. It shows what the real one will do.
- It says nothing about our prices. The client's own prices are its knowledge only when a source states them.
- No other client's name or details anywhere in an agent.
- Sending the client the number and inviting them to try is his message to send (`follow-up-writer`).
- When the owner wants the real thing (connected to their systems, on their own number, for all their customers),
  that is the offer: `client-proposals`.
