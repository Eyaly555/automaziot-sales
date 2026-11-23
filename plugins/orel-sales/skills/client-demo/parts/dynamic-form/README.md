# dynamic-form

The form follows the task. One template per task type (an inspection, an installation, a repair), each a list of
fields: text, number with unit, date, dropdown, long text, and checkbox groups. Switching type redraws the form and
keeps what was typed in fields both types share; required fields are marked and announced on submit.

**When it earns its place:** the client's people fill different forms for different jobs («לכל סוג עבודה
יש לנו דף אחר»). Showing the form change under their finger when the job type changes says "we read
your process".

```js
import { createDynamicForm } from "./dynamic-form.js";      // plus dynamic-form.css
const form = createDynamicForm(el, {
  types: [{ id: "inspect", label: "ביקורת" }, { id: "repair", label: "תיקון" }], type: job.kind,
  templates: { inspect: [{ id: "grade", type: "select", label: "ציון", options: ["עבר", "לא עבר"], required: true },
                         { id: "photos", type: "checkbox", label: "צולם", group: "תיעוד" }],
               repair:  [{ id: "item", type: "text", label: "מה תוקן" }, { id: "mins", type: "number", label: "זמן", unit: "דק׳" }] },
  onChange: ({ values }) => draft.save(values), onSubmit: ({ type, values }) => queue.add({ label: "טופס", data: { type, values } }) });
form.setType("repair");  form.values();  form.validate();  form.set({ item: "…" });
```

Options may be strings or `[value, label]` pairs.

**Does not decide:** the fields (write them from the client's own forms and words), where answers go, or rules
between fields beyond "required" (wire them in `onChange`).
