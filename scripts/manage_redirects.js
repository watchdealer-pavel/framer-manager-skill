// Add or remove redirects
// Usage:
//   node scripts/manage_redirects.js add <from> <to> [--all-locales]
//   node scripts/manage_redirects.js remove <id1> [id2] ...
//
// Example:
//   node scripts/manage_redirects.js add /old-page /new-page
//   node scripts/manage_redirects.js add /old /new --all-locales
//   node scripts/manage_redirects.js remove abc123

import { getFramer, withRetry, sanitizeError } from "./connect.js";

const [action, ...args] = process.argv.slice(2);
if (!action || !["add", "remove"].includes(action)) {
  console.error("Usage: manage_redirects.js add <from> <to> [status] | remove <id1> ...");
  process.exit(1);
}

// Validate args before connecting
if (action === "add") {
  const nonFlags = args.filter((a) => !a.startsWith("--"));
  if (nonFlags.length < 2) {
    console.error("Usage: manage_redirects.js add <from> <to> [--all-locales]");
    process.exit(1);
  }
}
if (action === "remove" && args.length === 0) {
  console.error("Usage: manage_redirects.js remove <id1> [id2] ...");
  process.exit(1);
}

const { framer, disconnect } = await getFramer();
try {
  if (action === "add") {
    const nonFlags = args.filter((a) => !a.startsWith("--"));
    const [from, to] = nonFlags;
    const expandToAllLocales = args.includes("--all-locales");
    const result = await withRetry(() => framer.addRedirects([{ from, to, expandToAllLocales }]));
    console.log(JSON.stringify(result, null, 2));
    console.error(`Added redirect: ${from} → ${to}${expandToAllLocales ? " (all locales)" : ""}`);
  } else {
    await withRetry(() => framer.removeRedirects(args));
    console.log(JSON.stringify({ success: true, removed: args }));
    console.error(`Removed ${args.length} redirect(s)`);
  }
} catch (e) {
  console.error(`Error: ${sanitizeError(e)}`);
  process.exit(1);
} finally {
  await disconnect();
}
