---
name: pre-call-brief
description: Prepares the salesperson for a call or meeting with one of his clients, from the CRM: who they are, what was said, what they saw, what to ask, what to offer. Use it for "תכין אותי לשיחה", "מה אני צריך לדעת על", "יש לי שיחה עם", "פגישה עם", "brief", "מי זה", "מה המצב עם", even when he only names a client and a time.
---

# pre-call-brief

Everything comes from the tools; they return only his own clients. If `my_clients` does not find the name, say it is not on his list and that assignment goes through Eyal. Do not look elsewhere.

## Read

1. `my_clients` to find them, then `get_client`.
2. Every transcript that matters with `get_transcript`, newest first and in full. Summaries miss the sharpest line, so a brief built on them alone is not a brief. Older calls: summary, unless it contradicts the latest. If it does, say so.
3. The whole story with `client_timeline`, and the WhatsApp thread with `client_whatsapp`: what they asked, what they did not answer, how they write. Open tasks on this client with `client_tasks`.
4. Their proposals: what was offered, what they opened and when (`views`). Machine opens and his own are already removed, so a zero there is a real zero.
5. `search_solutions` and `find_similar_offers` for this need and industry. `news_today` only if something truly connects.
6. If an objection is likely, `kb_doc` slug `objections` has the answers that work in our calls; `call-playbook` has the call structure.

## Write

Hebrew, one screen, readable on a phone a minute before the call. Lead with the one thing that matters most.

- **בשורה אחת:** who they are and where the deal stands.
- **מה הם אמרו:** 2 to 4 real lines in their words, in «».
- **מה עוד לא יודעים:** what the next call has to reveal, as the actual questions to ask.
- **מה הם ראו:** offer, sum as the system computed it, opened or not and when.
- **מה מציעים:** the direction, and how similar needs were solved (what was built, which systems). `component_band` is the price of one line in an offer, not a deal: use it only to sense the size, never say it to the client. Never a client name, never an amount.
- **איפה זה עלול להיתקע:** the objection likely to come, with what to answer.
- **היעד של השיחה:** the next step that fits where the deal stands. After a first call: an offer to Eyal's approval today. An approved offer under ₪20,000 before VAT that they opened: a yes and a signature, closed by him. From ₪20,000, once they opened it: the meeting with Eyal. Use the `meeting` line in `get_client`: if a meeting is not allowed yet, say what is missing.

An empty section says so plainly («עדיין לא הייתה שיחה מתומללת») rather than disappearing. Mark what you inferred as inferred. Never invent a fact about the client.

When it is a first call or he knows little about the business, look the business up on the web (their site, what they do, how big they are) and add **מי הם בחוץ** in two lines, with public facts marked as public. For the right thing to offer, use the `what-we-sell` skill.
