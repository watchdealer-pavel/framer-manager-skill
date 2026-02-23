// Publish preview and optionally deploy to production
// Usage: node scripts/publish.js [--deploy]

import { getFramer, sanitizeError, withRetry } from "./connect.js";

const shouldDeploy = process.argv.includes("--deploy");

const { framer, disconnect } = await getFramer();
try {
  const { deployment } = await withRetry(() => framer.publish());
  const result = { published: true, deploymentId: deployment.id, createdAt: deployment.createdAt };

  if (shouldDeploy) {
    const hostnames = await withRetry(() => framer.deploy(deployment.id));
    result.deployed = true;
    result.hostnames = hostnames.map((h) => h.hostname);
    console.error(`Published & deployed to ${hostnames.length} domain(s)`);
  } else {
    result.deployed = false;
    console.error(`Published deployment ${deployment.id} (preview only, use --deploy for production)`);
  }

  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(`Error: ${sanitizeError(e)}`);
  process.exit(1);
} finally {
  await disconnect();
}
