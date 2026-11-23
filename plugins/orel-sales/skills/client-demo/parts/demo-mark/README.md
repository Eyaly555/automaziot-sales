# demo-mark

One quiet mark in a corner that says "this is a demonstration" and, on press, one sentence about where the data
comes from. The rest of the demo stays believable: no «לדוגמה» on every row, no banner over the first screen.
One per page (mounting again replaces it); hidden when printing.

**When it earns its place:** every demo that is shown outside the room or left with the client. Honest without
breaking the spell.

```js
import { mountDemoMark } from "./demo-mark.js";       // plus demo-mark.css
const mark = mountDemoMark({ text: "הדגמה", corner: "bottom-start",
  detail: "הנתונים נבנו מהשיחה שלנו ומהאתר שלכם. שום הודעה לא יוצאת." });
mark.setDetail("…");  mark.open();  mark.destroy();
mountDemoMark({ container: phoneScreenEl, corner: "top-end" });   // inside a device frame instead of the page
```

Restyle: `--part-dmark-bg`, `--part-dmark-ink`, `--part-dmark-line`, `--part-dmark-dot`. Corners are logical
(`start` is the right side in Hebrew).

**Does not decide:** the wording (write it for this client: what came from their call, what is invented), or
anything else about the demo's honesty, such as an agent saying it is an AI.
