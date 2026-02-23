// Show deployment history
// Usage: node scripts/list_deployments.js

import { getFramer, sanitizeError } from "./connect.js";

const { framer, disconnect } = await getFramer();
try {
  const deployments = await framer.getDeployments();
  console.log(JSON.stringify(deployments, null, 2));
  console.error(`Found ${deployments.length} deployment(s)`);
} catch (e) {
  console.error(`Error: ${sanitizeError(e)}`);
  process.exit(1);
} finally {
  await disconnect();
}
