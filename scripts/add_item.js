// Add a CMS item to a collection
// Usage: node scripts/add_item.js <collection-name-or-id> <slug> '<fieldData JSON>' [--locale <id> --localSlug <slug>]
//
// Field data JSON maps field names to values. For formattedText fields,
// use { "value": "# Hello", "contentType": "markdown" }
//
// Supported field types: string, number, boolean, date, enum, color,
// formattedText, image, file, link, collectionReference, multiCollectionReference, array
//
// Example:
//   node scripts/add_item.js "Blog Posts" my-post '{"Title":"My Post","Content":{"value":"# Hello","contentType":"markdown"}}'
//   node scripts/add_item.js "Blog Posts" my-post '{"Title":"My Post"}' --locale de --localSlug mein-beitrag

import { getFramer, safeParseJSON, sanitizeError, withRetry } from "./connect.js";
import { buildFieldData } from "./field_utils.js";

const args = process.argv.slice(2);
const positional = args.filter((a, i) => !a.startsWith("--") && (i === 0 || !args[i - 1]?.startsWith("--")));
const collectionArg = positional[0];
const slug = positional[1];
const fieldDataJson = positional[2];

if (!collectionArg || !slug || !fieldDataJson) {
  console.error('Usage: node scripts/add_item.js <collection> <slug> \'<fieldData JSON>\' [--locale <id> --localSlug <slug>]');
  process.exit(1);
}

function getFlag(name) {
  const idx = args.indexOf(name);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : null;
}

const localeId = getFlag("--locale");
const localSlug = getFlag("--localSlug");

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

  const fields = await collection.getFields();
  const fieldData = buildFieldData(inputData, fields);

  const itemInput = { slug, fieldData };

  // Localization support
  if (localeId && localSlug) {
    itemInput.slugByLocale = { [localeId]: localSlug };
  }

  await withRetry(() => collection.addItems([itemInput]));
  console.log(JSON.stringify({ success: true, slug, collection: collection.name }));
  console.error(`Added item "${slug}" to "${collection.name}"`);
} catch (e) {
  console.error(`Error: ${sanitizeError(e)}`);
  process.exit(1);
} finally {
  await disconnect();
}
