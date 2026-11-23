# map-links

The deep links a person in the field presses: navigate with Waze or Google Maps (by coordinates when you have them,
by address otherwise), call, WhatsApp with a drafted message, SMS, e-mail. Israeli numbers normalised
(`054-012-3456` → `+972540123456`). It only builds links; the visitor's own phone acts when they press one.

**When it earns its place:** a job, delivery or visit has an address and a person («הנהג מעתיק את
הכתובת לווייז ביד»). Waze opening on their phone in the meeting is a small, very real moment.

```js
import { mountActions, wazeUrl, mapsUrl, telUrl, whatsappUrl, intlPhone } from "./map-links.js";   // map-links.css optional
mountActions(jobEl, { place: { lat: 32.08, lng: 34.78, address: job.address }, phone: job.contactPhone,
                      whatsapp: { phone: job.contactPhone, text: "אני בדרך, מגיע בעוד 10 דקות" } });
mountActions(secureSiteEl, { place: { note: "ניווט לפי תיאום מראש" } });       // no coordinates: says so, no dead button
wazeUrl({ address: "הרצל 10, חדרה" });  telUrl("03-555-0100");  intlPhone("050 012 3456");
```

**Does not decide:** which places get coordinates, which actions a role may see, or anything about sending: a
WhatsApp link only opens a draft. In a demo, use numbers you control (yours, or a fictitious one that goes nowhere).
