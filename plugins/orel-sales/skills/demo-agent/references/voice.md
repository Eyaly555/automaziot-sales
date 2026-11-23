# The voice version

A phone agent is the same agent with a different body. People hear it once, at the speed of speech, and they
interrupt. Write a separate voice version; never paste the chat instructions.

## What the line already does, so you write none of it

Every agent on the company's demo phone line runs inside a fixed frame. The frame already tells the agent:

- how to speak on a phone: one or two short sentences, one question at most, numbers, prices, dates and times in
  words, a phone number digit by digit, no lists, a shorter repeat when the caller says «הלו?», one goodbye;
- that it answers the moment the call connects, stops at once when interrupted, and waits for the caller to finish;
- that this is a demonstration line connected to no system: it cannot book, send, write down, transfer or check,
  and never says that it did. Asked for such a step, it says that in this demonstration it only talks, and that in
  the real system this is exactly the step that would happen;
- that it states only facts from your brief, and says plainly when something is not there;
- that it does not talk about how it is built or about our prices.

Repeating any of this, or contradicting it, makes the agent worse. Your part is this agent at this business.

## What you write (`voice`)

- **`prompt`** (up to 16,000 characters; a sharp one is far shorter). Three things:
  - **Who the agent is**: its name, its role at this business, whether it speaks as a woman or a man (feminine when
    you say nothing), and its tone: the warmth of a family clinic, the speed of a towing dispatcher.
  - **The business's facts a caller asks about**: hours, where it is, what it offers and what each thing includes,
    how booking or ordering works, what to bring, policies, and its own prices only when the business publishes
    them. Write facts as sentences the way they are said aloud, an address the way you would tell it to a driver.
    Choose the fifteen facts that matter on the phone over the sixty that exist: a phone agent with too much is slow.
  - **Who calls and what a good call is**: the three or four reasons people phone this business, and what the
    caller should leave the call with.
  It must not contain: tools, transfers, bookings or messages as things it does, a promise that someone will call
  back as if it were arranged, our prices, anything from another client, or rules about how to speak.
- **`greeting`** (up to 400 characters): the first sentence the caller hears, said exactly as you write it. One
  short sentence with the business's name and the agent's name, ending in an open question, the way a person at
  that business answers the phone.
- **`voice`**: one of marin, cedar, alloy, ash, ballad, coral, echo, sage, shimmer, verse. Choose by the character;
  marin when unsure.
- **`language`**: `he`, or `en` for a business that works in English.

## Listening to it

Connect your own phone with `demo_agent_bind` and call the demo number before the client does. A call cannot be
judged by reading. Listen for the first second, for what happens when you interrupt, for a price or an hour said
aloud, for a question it has no fact for, and for how it ends. If the conversation is off, the cause is in what
you wrote: too many facts, a missing answer, a tone that does not fit. Fix that and save again.

The line allows a call of up to eight minutes, two calls at once, and ten calls a day from one number. A number
that is not connected to an agent hears one sentence and the call ends.
