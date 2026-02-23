// Take a screenshot of a page/node
// Usage: node scripts/screenshot.js <nodeId> [--format png|jpeg] [--scale 2] [--out file.png]
//
// If --out is provided, writes to file. Otherwise outputs base64 JSON.

import { getFramer, sanitizeError } from "./connect.js";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const nodeId = args[0];
if (!nodeId || nodeId.startsWith("--")) {
  console.error("Usage: node scripts/screenshot.js <nodeId> [--format png|jpeg] [--scale N] [--quality N] [--clip] [--out file]");
  process.exit(1);
}

function getArg(name) {
  const idx = args.indexOf(name);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : null;
}

const format = getArg("--format") || "png";
const scale = getArg("--scale") ? Number(getArg("--scale")) : undefined;
const quality = getArg("--quality") ? Number(getArg("--quality")) : undefined;
const clip = args.includes("--clip");
const outFile = getArg("--out");

// Path traversal protection for output file
if (outFile) {
  const resolved = resolve(process.cwd(), outFile);
  const cwd = process.cwd();
  if (!resolved.startsWith(cwd) && !resolved.startsWith("/tmp")) {
    console.error("Output path must be within current directory or /tmp.");
    process.exit(1);
  }
}

const { framer, disconnect } = await getFramer();
try {
  const opts = { format, scale };
  if (quality !== undefined) opts.quality = quality;
  if (clip) opts.clip = true;
  const { data, mimeType } = await framer.screenshot(nodeId, opts);

  if (outFile) {
    const resolved = resolve(process.cwd(), outFile);
    writeFileSync(resolved, data);
    console.log(JSON.stringify({ success: true, file: outFile, mimeType }));
    console.error(`Screenshot saved to ${outFile}`);
  } else {
    const base64 = Buffer.from(data).toString("base64");
    console.log(JSON.stringify({ mimeType, base64, byteLength: data.length }));
    console.error(`Screenshot captured (${data.length} bytes)`);
  }
} catch (e) {
  console.error(`Error: ${sanitizeError(e)}`);
  process.exit(1);
} finally {
  await disconnect();
}
