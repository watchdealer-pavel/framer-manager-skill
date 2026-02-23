// Create a new CMS collection with optional field definitions
// Usage: node scripts/create_collection.js <name> ['<fields JSON>']
//
// Fields JSON is an array of field definitions. Supported types:
//   boolean, number, string, formattedText, image, file, link, date, color,
//   enum, collectionReference, multiCollectionReference, array, divider
//
// Examples:
//   node scripts/create_collection.js "Blog Posts"
//   node scripts/create_collection.js "Blog Posts" '[{"name":"Title","type":"string"},{"name":"Body","type":"formattedText","contentType":"markdown"},{"name":"Published","type":"boolean"},{"name":"Category","type":"enum","cases":[{"name":"Tech"},{"name":"Design"}]},{"name":"Cover","type":"image"},{"name":"Attachment","type":"file","allowedFileTypes":["application/pdf"]},{"name":"Related","type":"collectionReference","collectionId":"abc123"},{"name":"Tags","type":"multiCollectionReference","collectionId":"def456"},{"name":"Gallery","type":"array"},{"name":"---","type":"divider"}]'

import { getFramer, safeParseJSON, sanitizeError, withRetry } from "./connect.js";

const [name, fieldsJson] = process.argv.slice(2);
if (!name) {
  console.error("Usage: node scripts/create_collection.js <name> ['<fields JSON>']");
  process.exit(1);
}

const { framer, disconnect } = await getFramer();
try {
  const collection = await withRetry(() => framer.createCollection(name));
  const result = { id: collection.id, name: collection.name, fields: [] };

  // Add fields if provided
  if (fieldsJson) {
    const fieldDefs = safeParseJSON(fieldsJson, "fields");
    if (!Array.isArray(fieldDefs)) {
      console.error("Fields must be a JSON array.");
      process.exit(1);
    }

    const createFields = fieldDefs.map((f) => {
      const field = { name: f.name, type: f.type };

      // Type-specific properties
      if (f.type === "formattedText" && f.contentType) {
        field.contentType = f.contentType;
      }
      if (f.type === "enum" && f.cases) {
        field.cases = f.cases;
      }
      if (f.type === "file" && f.allowedFileTypes) {
        field.allowedFileTypes = f.allowedFileTypes;
      }
      if ((f.type === "collectionReference" || f.type === "multiCollectionReference") && f.collectionId) {
        field.collectionId = f.collectionId;
      }
      if (f.required !== undefined) {
        field.required = f.required;
      }

      return field;
    });

    const addedFields = await withRetry(() => collection.addFields(createFields));
    result.fields = addedFields.map((af) => ({ id: af.id, name: af.name, type: af.type }));
  }

  console.log(JSON.stringify(result, null, 2));
  console.error(`Created collection "${name}" with ${result.fields.length} field(s)`);
} catch (e) {
  console.error(`Error: ${sanitizeError(e)}`);
  process.exit(1);
} finally {
  await disconnect();
}
