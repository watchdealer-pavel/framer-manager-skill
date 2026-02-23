// Get current custom code injections
// Usage: node scripts/get_custom_code.js

import { getFramer, sanitizeError } from "./connect.js";

const { framer, disconnect } = await getFramer();
try {
  const code = await framer.getCustomCode();
  console.log(JSON.stringify(code, null, 2));
  console.error("Retrieved custom code");
} catch (e) {
  console.error(`Error: ${sanitizeError(e)}`);
  process.exit(1);
} finally {
  await disconnect();
}
