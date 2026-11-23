# offline-queue

Work saved on the device when there is no signal, and sent in order when it returns. An online switch the visitor
flips, items stored locally (they survive a reload), an ordered drain one item at a time, retries with back-off, a
"failed" state with a retry button, and a log. The upload is a function you supply.

**When it earns its place:** people in the field (basements, sites, security areas, the road). Flipping the switch
off, working, and watching the queue empty in order when it comes back answers the "but what if there is no
reception?" question in the meeting.

```js
import { createOfflineQueue, mountQueueStatus } from "./offline-queue.js";   // plus offline-queue.css for the status
const q = createOfflineQueue({ key: "my-demo-queue", retries: 3, now: () => clock.now(),
  upload: async (item) => store.set((s) => { s.received.push(item.data); }),   // or your endpoint, if you have one
  failFirst: (item) => item.kind === "photo" });                              // show one retry on purpose
q.add({ label: "טופס ביקור — דירה 4", kind: "form", data: formValues });
mountQueueStatus(fieldScreenEl, q);   q.setOnline(false);   q.on("drained", ({ sent }) => toast(`${sent} נשלחו`));
```

**Does not decide:** what is queued or what "sent" means (your `upload`), conflict handling (none: items are sent
as they were made), or real connectivity: the switch is the demo's, `navigator.onLine` is not read. Pairs with
`file-drop`, `signature-pad` and `dynamic-form` as producers of items; none is required.
