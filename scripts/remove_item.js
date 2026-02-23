// Remove CMS item(s) by ID
// Usage: node scripts/remove_item.js <collection-name-or-id> <id1> [id2] ...

import { getFramer, sanitizeError, withRetry } from "./connect.js";

const [collectionArg, ...ids] = process.argv.slice(2);
if (!collectionArg || ids.length === 0) {
  console.error("Usage: node scripts/remove_item.js <collection> <id1> [id2] ...");
  process.exit(1);
}

const { framer, disconnect } = await getFramer();
try {
  const collections = await framer.getCollections();
  const collection = collections.find(
    (c) => c.id === collectionArg || c.name.toLowerCase() === collectionArg.toLowerCase()
  );
  if (!collection) {
    console.error(`Collection "${collectionArg}" not found.`);
    process.exit(1);
  }

  await withRetry(() => collection.removeItems(ids));
  console.log(JSON.stringify({ success: true, removed: ids }));
  console.error(`Removed ${ids.length} item(s) from "${collection.name}"`);
} catch (e) {
  console.error(`Error: ${sanitizeError(e)}`);
  process.exit(1);
} finally {
  await disconnect();
}
