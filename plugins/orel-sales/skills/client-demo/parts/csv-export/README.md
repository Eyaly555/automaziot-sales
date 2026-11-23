# csv-export

"Export to Excel" that opens correctly in Excel in Hebrew: UTF-8 with a byte-order mark, CRLF lines, quoted cells,
numbers kept as numbers, dates as dd/mm/yyyy, and cells starting with `=`, `+`, `-` or `@` neutralised so Excel
does not run them as formulas. Exports exactly the rows and columns you pass, as a download made in the browser.

**When it earns its place:** the client lives in Excel today, or their accountant does. A button that hands them
exactly the list on screen, readable in their own Excel, answers "and can I take it out?" on the spot.

```js
import { toCsv, downloadCsv } from "./csv-export.js";
downloadCsv(view.apply(rows), [["לקוח", "customer"], ["סכום", (r) => r.sum], ["מועד", (r) => r.due]], "חובות-פתוחים");
const text = toCsv(rows, columns);     // the same text, if you want to show or attach it
```

**Does not decide:** which columns (use the ones on screen, in their order), number formatting inside Excel, or
real .xlsx files (CSV is enough for a demo and needs no library).
