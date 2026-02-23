// List all CMS collections with field schemas
// Usage: node scripts/list_collections.js

import { getFramer, sanitizeError } from "./connect.js";

const { framer, disconnect } = await getFramer();
try {
  const collections = await framer.getCollections();
  const result = [];

  for (const col of collections) {
    const fields = await col.getFields();
    result.push({
      id: col.id,
      name: col.name,
      fields: fields.map((f) => ({ id: f.id, name: f.name, type: f.type })),
    });
  }

  console.log(JSON.stringify(result, null, 2));
  console.error(`Found ${result.length} collection(s)`);
} catch (e) {
  console.error(`Error: ${sanitizeError(e)}`);
  process.exit(1);
} finally {
  await disconnect();
}
