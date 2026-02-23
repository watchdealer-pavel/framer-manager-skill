// Add, remove, or reorder fields on an existing collection
// Usage:
//   node scripts/manage_fields.js add <collection> '<fields JSON>'
//   node scripts/manage_fields.js remove <collection> <fieldId1> [fieldId2] ...
//   node scripts/manage_fields.js reorder <collection> '<fieldIds JSON array>'
//
// Examples:
//   node scripts/manage_fields.js add "Blog Posts" '[{"name":"Author","type":"string"}]'
//   node scripts/manage_fields.js remove "Blog Posts" field_abc123
//   node scripts/manage_fields.js reorder "Blog Posts" '["field_1","field_2","field_3"]'

import { getFramer, safeParseJSON, sanitizeError, withRetry } from "./connect.js";

const [action, collectionArg, ...rest] = process.argv.slice(2);
if (!action || !["add", "remove", "reorder"].includes(action) || !collectionArg) {
  console.error("Usage: manage_fields.js add|remove|reorder <collection> <args>");
  process.exit(1);
}

// Validate before connecting
if (action === "add" && !rest[0]) {
  console.error("Usage: manage_fields.js add <collection> '<fields JSON>'");
  process.exit(1);
}
if (action === "remove" && rest.length === 0) {
  console.error("Usage: manage_fields.js remove <collection> <fieldId1> [fieldId2] ...");
  process.exit(1);
}
if (action === "reorder" && !rest[0]) {
  console.error("Usage: manage_fields.js reorder <collection> '<fieldIds JSON array>'");
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

  if (action === "add") {
    const fieldDefs = safeParseJSON(rest[0], "fields");
    if (!Array.isArray(fieldDefs)) {
      console.error("Fields must be a JSON array.");
      process.exit(1);
    }
    const createFields = fieldDefs.map((f) => {
      const field = { name: f.name, type: f.type };
      if (f.type === "formattedText" && f.contentType) field.contentType = f.contentType;
      if (f.type === "enum" && f.cases) field.cases = f.cases;
      if (f.type === "file" && f.allowedFileTypes) field.allowedFileTypes = f.allowedFileTypes;
      if ((f.type === "collectionReference" || f.type === "multiCollectionReference") && f.collectionId) {
        field.collectionId = f.collectionId;
      }
      if (f.required !== undefined) field.required = f.required;
      return field;
    });

    const added = await withRetry(() => collection.addFields(createFields));
    const result = added.map((f) => ({ id: f.id, name: f.name, type: f.type }));
    console.log(JSON.stringify(result, null, 2));
    console.error(`Added ${result.length} field(s) to "${collection.name}"`);
  } else if (action === "remove") {
    await withRetry(() => collection.removeFields(rest));
    console.log(JSON.stringify({ success: true, removed: rest }));
    console.error(`Removed ${rest.length} field(s) from "${collection.name}"`);
  } else if (action === "reorder") {
    const fieldIds = safeParseJSON(rest[0], "fieldIds");
    if (!Array.isArray(fieldIds)) {
      console.error("Field IDs must be a JSON array.");
      process.exit(1);
    }
    await withRetry(() => collection.setFieldOrder(fieldIds));
    console.log(JSON.stringify({ success: true, order: fieldIds }));
    console.error(`Reordered ${fieldIds.length} field(s) in "${collection.name}"`);
  }
} catch (e) {
  console.error(`Error: ${sanitizeError(e)}`);
  process.exit(1);
} finally {
  await disconnect();
}
