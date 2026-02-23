// List all redirects
// Usage: node scripts/list_redirects.js

import { getFramer, sanitizeError } from "./connect.js";

const { framer, disconnect } = await getFramer();
try {
  const redirects = await framer.getRedirects();
  console.log(JSON.stringify(redirects, null, 2));
  console.error(`Found ${redirects.length} redirect(s)`);
} catch (e) {
  console.error(`Error: ${sanitizeError(e)}`);
  process.exit(1);
} finally {
  await disconnect();
}
