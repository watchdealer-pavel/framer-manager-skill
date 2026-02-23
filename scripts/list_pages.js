// List all web pages with paths
// Usage: node scripts/list_pages.js

import { getFramer, sanitizeError } from "./connect.js";

const { framer, disconnect } = await getFramer();
try {
  const pages = await framer.getNodesWithType("WebPageNode");
  const result = pages.map((p) => ({
    id: p.id,
    path: p.path,
    collectionId: p.collectionId || null,
  }));
  console.log(JSON.stringify(result, null, 2));
  console.error(`Found ${result.length} page(s)`);
} catch (e) {
  console.error(`Error: ${sanitizeError(e)}`);
  process.exit(1);
} finally {
  await disconnect();
}
