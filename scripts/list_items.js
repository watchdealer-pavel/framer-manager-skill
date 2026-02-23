// List items in a CMS collection
// Usage: node scripts/list_items.js <collection-name-or-id>

import { getFramer, sanitizeError } from "./connect.js";

const collectionArg = process.argv[2];
if (!collectionArg) {
  console.error("Usage: node scripts/list_items.js <collection-name-or-id>");
  process.exit(1);
}

const { framer, disconnect } = await getFramer();
try {
  const collections = await framer.getCollections();
  let collection = collections.find(
    (c) => c.id === collectionArg || c.name.toLowerCase() === collectionArg.toLowerCase()
  );

  if (!collection) {
    console.error(`Collection "${collectionArg}" not found. Available: ${collections.map(c => c.name).join(", ")}`);
    process.exit(1);
  }

  const items = await collection.getItems();
  const fields = await collection.getFields();
  const fieldMap = Object.fromEntries(fields.map((f) => [f.id, f.name]));

  const result = items.map((item) => {
    const data = {};
    if (item.fieldData) {
      for (const [fieldId, entry] of Object.entries(item.fieldData)) {
        const name = fieldMap[fieldId] || fieldId;
        data[name] = entry;
      }
    }
    return { id: item.id, slug: item.slug, draft: item.draft ?? false, fieldData: data };
  });

  console.log(JSON.stringify(result, null, 2));
  console.error(`Found ${result.length} item(s) in "${collection.name}"`);
} catch (e) {
  console.error(`Error: ${sanitizeError(e)}`);
  process.exit(1);
} finally {
  await disconnect();
}
