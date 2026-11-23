# file-drop

Real files from the visitor's device: the system picker (the camera on a phone with `capture`), drag and drop at a
desk, limits on count, size and type with a plain message when one is hit, photo thumbnails, and files attached to
a specific item (a checklist line, a defect, a room) through keys, not only to the whole job.

**When it earns its place:** the client photographs, scans or collects documents today («אני מצלם כל חדר
ושולח לעצמי במייל»). Their own phone opening its own camera inside the demo is convincing in a way a fake button never is.

```js
import { createAttachments } from "./file-drop.js";         // plus file-drop.css
const files = createAttachments({ maxFiles: 5, maxBytes: 10 * 1048576, accept: "image/*,application/pdf", capture: "environment" });
files.mount(caseEl, "job-17");                                      // a drop zone with the list
rows.forEach((r) => files.mount(r.slotEl, `line-${r.id}`, { compact: true, label: "צילום" }));   // per line, with a count badge
files.on("change", ({ key, files: list, message }) => store.set((s) => { s.photos[key] = list.length; }));
files.list("line-3");  files.count("job-17");  files.all();  files.add(key, droppedFiles);
```

Each file is `{ id, key, name, size, type, file, url }` (`url` is an object URL for images, for thumbnails or a
document built with `doc-writer`).

**Does not decide:** where files go (nothing is uploaded; hand `file` to your queue or endpoint), what the limits
are for this client, or whether a photo is required: read `count(key)` before letting a step close.
