// Inject custom code (structured data, meta tags) into head/body
// Usage: node scripts/set_custom_code.js <location> '<html>'
// Locations: headStart, headEnd, bodyStart, bodyEnd
//
// Example:
//   node scripts/set_custom_code.js headEnd '<script type="application/ld+json">{"@context":"https://schema.org"}</script>'

import { getFramer, sanitizeError, withRetry } from "./connect.js";

const [location, ...rest] = process.argv.slice(2);
const html = rest.length > 0 ? rest.join(" ") : null;
const clearing = html === null || html === "" || html === "null" || html === "--clear";

if (!location) {
  console.error("Usage: node scripts/set_custom_code.js <location> '<html>'");
  console.error("       node scripts/set_custom_code.js <location> --clear");
  console.error("Locations: headStart, headEnd, bodyStart, bodyEnd");
  process.exit(1);
}

const validLocations = ["headStart", "headEnd", "bodyStart", "bodyEnd"];
if (!validLocations.includes(location)) {
  console.error(`Invalid location "${location}". Must be one of: ${validLocations.join(", ")}`);
  process.exit(1);
}

// Warn about potential script injection risks
if (html && /<script[^>]+src\s*=/i.test(html)) {
  console.error("⚠️  WARNING: Input contains <script> with external src. Verify this is intentional.");
}

const { framer, disconnect } = await getFramer();
try {
  const codeValue = clearing ? null : html;
  await withRetry(() => framer.setCustomCode({ html: codeValue, location }));
  if (clearing) {
    console.log(JSON.stringify({ success: true, location, cleared: true }));
    console.error(`Cleared custom code at ${location}`);
  } else {
    console.log(JSON.stringify({ success: true, location, htmlLength: html.length }));
    console.error(`Set custom code at ${location} (${html.length} chars)`);
  }
} catch (e) {
  console.error(`Error: ${sanitizeError(e)}`);
  process.exit(1);
} finally {
  await disconnect();
}
