// Show what changed since last publish
// Usage: node scripts/changed_paths.js

import { getFramer, sanitizeError } from "./connect.js";

const { framer, disconnect } = await getFramer();
try {
  const changes = await framer.getChangedPaths();
  console.log(JSON.stringify(changes, null, 2));
  const total = Object.values(changes).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
  console.error(`${total} changed path(s)`);
} catch (e) {
  console.error(`Error: ${sanitizeError(e)}`);
  process.exit(1);
} finally {
  await disconnect();
}
