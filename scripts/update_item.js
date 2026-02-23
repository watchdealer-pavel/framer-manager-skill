// Update an existing CMS item by ID or slug
// Usage: node scripts/update_item.js <item-id-or-slug> <collection-name-or-id> '<fieldData JSON>' [--locale <id> --localSlug <slug>]
//
// Supports all field types: string, number, boolean, date, enum, color,
// formattedText, image, file, link, collectionReference, multiCollectionReference, array
//
// Example:
//   node scripts/update_item.js my-post "Blog Posts" '{"Title":"Updated Title"}'
//   node scripts/update_item.js my-post "Blog Posts" '{"Title":"Updated"}' --locale de --localSlug aktualisiert

import { getFramer, safeParseJSON, sanitizeError, withRetry } from "./connect.js";
import { buildFieldData } from "./field_utils.js";

const args = process.argv.slice(2);
const positional = args.filter((a, i) => !a.startsWith("--") && (i === 0 || !args[i - 1]?.startsWith("--")));
const itemArg = positional[0];
const collectionArg = positional[1];
const fieldDataJson = positional[2];

if (!itemArg || !collectionArg || !fieldDataJson) {
  console.error('Usage: node scripts/update_item.js <item-id-or-slug> <collection> \'<fieldData JSON>\' [--locale <id> --localSlug <slug>]');
  process.exit(1);
}

function getFlag(name) {
  const idx = args.indexOf(name);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : null;
}

const localeId = getFlag("--locale");
const localSlug = getFlag("--localSlug");
const newSlug = getFlag("--slug");

const inputData = safeParseJSON(fieldDataJson, "fieldData");

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

  const items = await collection.getItems();
  const item = items.find((i) => i.id === itemArg || i.slug === itemArg);
  if (!item) {
    console.error(`Item "${itemArg}" not found in "${collection.name}".`);
    process.exit(1);
  }

  const fields = await collection.getFields();
  const fieldData = buildFieldData(inputData, fields);

  const attrs = { slug: newSlug || item.slug, fieldData };

  // Localization support
  if (localeId && localSlug) {
    attrs.slugByLocale = { [localeId]: localSlug };
  }

  await withRetry(() => item.setAttributes(attrs));
  console.log(JSON.stringify({ success: true, id: item.id, slug: item.slug }));
  console.error(`Updated item "${item.slug}" in "${collection.name}"`);
} catch (e) {
  console.error(`Error: ${sanitizeError(e)}`);
  process.exit(1);
} finally {
  await disconnect();
}
