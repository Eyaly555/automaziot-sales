// csv-export — "export to Excel" that opens correctly in Excel in Hebrew: UTF-8 with a byte-order mark, CRLF lines,
// quoted cells, numbers left as numbers, dates as dd/mm/yyyy. Exports exactly the rows and columns you pass (what
// is on screen), as a real file download made in the browser. Nothing leaves the page.

const BOM = "﻿";
const pad = (n) => String(n).padStart(2, "0");
const cell = (v) => {
  if (v == null) return "";
  if (v instanceof Date) return `${pad(v.getDate())}/${pad(v.getMonth() + 1)}/${v.getFullYear()}`;
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "";
  const s = String(v);
  // a leading = + - @ would be read by Excel as a formula: neutralise it
  const safe = /^[=+\-@]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s) ? "'" + s : s;
  return /[",\r\n;]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

/**
 * toCsv(rows, columns) → string
 *   columns  [[header, (row) => value | "key"], …]
 */
export function toCsv(rows, columns) {
  const head = columns.map(([h]) => cell(h)).join(",");
  const body = rows.map((r) => columns.map(([, f]) => cell(typeof f === "function" ? f(r) : r[f])).join(","));
  return BOM + [head, ...body].join("\r\n") + "\r\n";
}

/** downloadCsv(rows, columns, filename) — saves the file through the browser (no server, no network) */
export function downloadCsv(rows, columns, filename = "export.csv") {
  const blob = new Blob([toCsv(rows, columns)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: filename.endsWith(".csv") ? filename : filename + ".csv" });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return { rows: rows.length, filename: a.download };
}
