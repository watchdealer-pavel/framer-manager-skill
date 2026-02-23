// Upload an image, return asset reference for CMS use
// Usage: node scripts/upload_image.js <file-path> [--alt "alt text"] [--name "filename"]
//
// Example:
//   node scripts/upload_image.js ./photo.jpg --alt "A nice photo"

import { getFramer, withRetry, sanitizeError } from "./connect.js";
import { readFileSync, statSync } from "node:fs";
import { basename, resolve, extname } from "node:path";

const args = process.argv.slice(2);
const filePath = args[0];
if (!filePath || filePath.startsWith("--")) {
  console.error('Usage: node scripts/upload_image.js <file-path> [--alt "text"] [--name "name"]');
  process.exit(1);
}

function getArg(name) {
  const idx = args.indexOf(name);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : null;
}

// Validate file extension
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".avif"];
const ext = extname(filePath).toLowerCase();
if (!ALLOWED_EXTENSIONS.includes(ext)) {
  console.error(`Invalid file type "${ext}". Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`);
  process.exit(1);
}

// Path traversal protection — resolve and check it's not reading sensitive system files
const resolvedPath = resolve(filePath);
const BLOCKED_PREFIXES = ["/etc", "/proc", "/sys", "/dev", "/var/run"];
if (BLOCKED_PREFIXES.some((p) => resolvedPath.startsWith(p))) {
  console.error("File path is not allowed.");
  process.exit(1);
}

// Check file size (max 20MB)
try {
  const stat = statSync(resolvedPath);
  if (stat.size > 20 * 1024 * 1024) {
    console.error("File too large (max 20MB).");
    process.exit(1);
  }
} catch {
  console.error("File not found or not readable.");
  process.exit(1);
}

const altText = getArg("--alt");
const name = getArg("--name") || basename(filePath);

const { framer, disconnect } = await getFramer();
try {
  const imageBytes = readFileSync(resolvedPath);
  const mimeMap = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".gif": "image/gif", ".webp": "image/webp", ".svg": "image/svg+xml", ".avif": "image/avif" };
  const mimeType = mimeMap[ext] || "application/octet-stream";
  const opts = { image: { bytes: imageBytes, mimeType }, name };
  if (altText) opts.altText = altText;

  const asset = await withRetry(() => framer.uploadImage(opts));
  const result = { id: asset.id, name: asset.name };

  // Try to get dimensions
  try {
    const dims = await asset.measure();
    result.width = dims.width;
    result.height = dims.height;
  } catch {}

  console.log(JSON.stringify(result, null, 2));
  console.error(`Uploaded image "${name}"`);
} catch (e) {
  console.error(`Error: ${sanitizeError(e)}`);
  process.exit(1);
} finally {
  await disconnect();
}
