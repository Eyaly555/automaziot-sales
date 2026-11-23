#!/usr/bin/env node
// Publishes a built demo folder. Needs no token: the upload URL from the deploy_demo tool is a one-time
// ticket. Plain Node (18 or newer), no npm packages, works the same on Windows, macOS and Linux.
// Usage: node deploy-demo.mjs <folder> "<upload_url>"
//
// The server says where the demo goes. "spark" (the default): the folder is zipped here and uploaded in one
// request to our demo server, then the server confirms the address answers. "vercel" (the old path, kept
// for a switch-back): files go one by one through the company's server, as before.
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { deflateRawSync } from "node:zlib";

const [folder, uploadUrl] = process.argv.slice(2);
if (!folder || !uploadUrl) {
  console.error('שימוש: node deploy-demo.mjs <תיקייה> "<upload_url>"');
  process.exit(2);
}

const SKIP_DIRS = new Set([".git", ".vercel", "node_modules", ".github"]);
const SKIP_FILES = new Set([".DS_Store", "Thumbs.db", "desktop.ini"]);
const ALLOWED = new Set([
  "html", "htm", "css", "js", "mjs", "json", "map", "svg", "png", "jpg", "jpeg", "webp", "gif", "avif", "ico",
  "woff", "woff2", "ttf", "otf", "mp3", "mp4", "webm", "txt", "md", "xml", "webmanifest", "pdf", "csv",
]);
const TEXT = new Set(["html", "htm", "css", "js", "mjs", "json", "svg", "txt", "md", "xml", "webmanifest", "csv"]);
const FORBIDDEN_NAMES = /(^|\/)(demo-spec\.json|package(-lock)?\.json|vercel\.json|now\.json|\.env[^/]*|middleware\.[a-z]+)$/i;
const FORBIDDEN_DIRS = /(^|\/)(\.git|\.vercel|node_modules|api|\.github)\//i;

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) await walk(full, out);
    } else if (entry.isFile() && !SKIP_FILES.has(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

async function jsonOf(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { error: text.slice(0, 300) };
  }
}

// ───────── zip (stored or deflated), Node built-ins only ─────────

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function zip(files) {
  const chunks = [];
  const central = [];
  let offset = 0;
  for (const { path, bytes } of files) {
    const name = Buffer.from(path, "utf8");
    const deflated = deflateRawSync(bytes, { level: 9 });
    const useDeflate = deflated.length < bytes.length;
    const body = useDeflate ? deflated : bytes;
    const crc = crc32(bytes);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6); // UTF-8 names
    local.writeUInt16LE(useDeflate ? 8 : 0, 8);
    local.writeUInt32LE(0, 10); // time/date
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(bytes.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    chunks.push(local, name, body);
    const entry = Buffer.alloc(46);
    entry.writeUInt32LE(0x02014b50, 0);
    entry.writeUInt16LE(20, 4);
    entry.writeUInt16LE(20, 6);
    entry.writeUInt16LE(0x0800, 8);
    entry.writeUInt16LE(useDeflate ? 8 : 0, 10);
    entry.writeUInt32LE(0, 12);
    entry.writeUInt32LE(crc, 16);
    entry.writeUInt32LE(body.length, 20);
    entry.writeUInt32LE(bytes.length, 24);
    entry.writeUInt16LE(name.length, 28);
    entry.writeUInt32LE(0, 30); // extra, comment lengths
    entry.writeUInt32LE(0, 34); // disk, internal attrs
    entry.writeUInt32LE(0, 38); // external attrs
    entry.writeUInt32LE(offset, 42);
    central.push(entry, name);
    offset += local.length + name.length + body.length;
  }
  const centralBuf = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...chunks, centralBuf, end]);
}

// ───────── checks done here first, so a problem shows before anything is sent ─────────

function problemOf(path, bytes, forbid) {
  if (path.includes("..") || path.startsWith("/")) return "נתיב לא חוקי";
  if (FORBIDDEN_DIRS.test(path) || FORBIDDEN_NAMES.test(path)) return "הקובץ הזה לא עולה לדמו (demo-spec.json, package.json, .env ודומיהם נשארים במחשב)";
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED.has(ext)) return `סוג קובץ לא מאושר (.${ext})`;
  if (TEXT.has(ext) && forbid.length) {
    const body = bytes.toString("utf8").toLowerCase();
    if (forbid.some((value) => body.includes(String(value).toLowerCase()))) return "הקובץ מכיל טלפון או אימייל אמיתי של הלקוח. בדמו משתמשים בפרטים מדומים";
  }
  return null;
}

async function readFolder() {
  const root = await stat(folder).catch(() => null);
  if (!root?.isDirectory()) throw new Error(`התיקייה לא נמצאה: ${folder}`);
  const paths = await walk(folder);
  if (!paths.length) throw new Error("התיקייה ריקה.");
  const files = [];
  for (const full of paths) files.push({ path: relative(folder, full).split(sep).join("/"), bytes: await readFile(full) });
  if (!files.some((f) => f.path === "index.html")) {
    throw new Error("חסר index.html בתיקייה הראשית. העלה את התיקייה הבנויה (למשל dist), לא את תיקיית הפרויקט.");
  }
  return files;
}

async function publishToSpark(info) {
  const files = await readFolder();
  const forbid = Array.isArray(info.forbid) ? info.forbid : [];
  for (const f of files) {
    const problem = problemOf(f.path, f.bytes, forbid);
    if (problem) throw new Error(`${f.path}: ${problem}.`);
  }
  const bundle = zip(files);
  const max = Number(info.max_bytes) || 50 * 1024 * 1024;
  if (bundle.length > max) throw new Error(`הדמו גדול מדי (${(bundle.length / 1048576).toFixed(1)}MB, עד ${max / 1048576}MB). כווץ תמונות וסרטונים.`);
  console.log(`מעלה ${files.length} קבצים (${(bundle.length / 1048576).toFixed(1)}MB)...`);

  const form = new FormData();
  form.append("ticket", info.hub_ticket);
  form.append("bundle", new Blob([bundle], { type: "application/zip" }), "demo.zip");
  const published = await fetch(info.publish_url, { method: "POST", body: form });
  const answer = await jsonOf(published);
  if (!published.ok) {
    // A ticket opens one upload, also a failed one: the next try starts from deploy_demo.
    const again = ["ticket_used", "bad_ticket"].includes(answer.code) || published.status >= 400 ? " תקן אם צריך, ואז התחל שוב עם deploy_demo (כרטיס ההעלאה כבר נוצל)." : "";
    throw new Error(`${answer.error || `ההעלאה נכשלה (${published.status})`}${again}`);
  }

  console.log("עלה, מחכה שהקישור יענה...");
  // A new address can take a couple of minutes to reach the internet.
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const done = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: { file_count: answer.file_count ?? files.length, total_bytes: answer.total_bytes ?? bundle.length } }),
    });
    const status = await jsonOf(done);
    if (done.ok && status.status === "ready") {
      console.log(`READY ${status.url}`);
      return;
    }
    if (done.status !== 409) throw new Error(status.error || `האישור נכשל (${done.status})`);
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
  throw new Error("הדמו עלה, אבל הכתובת עוד לא ענתה אחרי 4 דקות. בדוק אותה בעוד כמה דקות עם my_demos; אם עדיין לא, התחל שוב עם deploy_demo.");
}

// ───────── the old path (SALES_DEMO_TARGET=vercel on the server) ─────────

function urlWith(params) {
  const url = new URL(uploadUrl);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return url;
}

async function publishToVercel() {
  const root = await stat(folder).catch(() => null);
  if (!root?.isDirectory()) throw new Error(`התיקייה לא נמצאה: ${folder}`);
  const paths = await walk(folder);
  if (!paths.length) throw new Error("התיקייה ריקה.");
  console.log(`מעלה ${paths.length} קבצים...`);
  const uploaded = [];
  const queue = [...paths];
  async function worker() {
    for (let full = queue.shift(); full; full = queue.shift()) {
      const path = relative(folder, full).split(sep).join("/");
      const bytes = await readFile(full);
      const response = await fetch(urlWith({ path }), { method: "PUT", body: bytes });
      const body = await jsonOf(response);
      if (!response.ok) throw new Error(body.error || `העלאה נכשלה (${response.status})`);
      uploaded.push(body);
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker));

  const finalize = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ files: uploaded }) });
  const started = await jsonOf(finalize);
  if (!finalize.ok) throw new Error(started.error || `הפריסה נכשלה (${finalize.status})`);
  console.log("נפרס, מחכה שהקישור יענה...");
  for (let attempt = 0; attempt < 40; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const status = await jsonOf(await fetch(uploadUrl));
    if (status.status === "ready") {
      console.log(`READY ${status.url}`);
      return;
    }
    if (status.status === "failed") throw new Error(status.error || "הפריסה נכשלה");
  }
  throw new Error("הקישור לא ענה אחרי שתי דקות. נסה שוב עוד מעט.");
}

async function main() {
  const first = await fetch(uploadUrl);
  const info = await jsonOf(first);
  if (!first.ok) throw new Error(info.error || `הכתובת לא תקינה (${first.status}). התחל שוב עם deploy_demo.`);
  if (info.target === "spark") {
    if (info.status === "ready") {
      console.log(`READY ${info.url}`);
      return;
    }
    if (!info.hub_ticket || !info.publish_url) throw new Error(info.error || "ההעלאה הזו כבר הסתיימה. התחל שוב עם deploy_demo.");
    return publishToSpark(info);
  }
  return publishToVercel();
}

main().catch((error) => {
  console.error(`FAILED ${error.message}`);
  process.exit(1);
});
