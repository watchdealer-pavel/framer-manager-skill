// Shared field data builder for add_item.js and update_item.js
// Maps human-friendly field name/value pairs to Framer API field data format.

/**
 * Build fieldData object from input data and collection fields.
 * Supports all field types: string, number, boolean, date, enum, color,
 * formattedText, image, file, link, collectionReference, multiCollectionReference, array
 *
 * @param {Object} inputData - Key/value pairs where keys are field names
 * @param {Array} fields - Collection field definitions from getFields()
 * @returns {Object} fieldData keyed by field ID
 */
export function buildFieldData(inputData, fields) {
  const fieldByName = new Map(fields.map((f) => [f.name.toLowerCase(), f]));
  const fieldData = {};

  for (const [key, value] of Object.entries(inputData)) {
    const field = fieldByName.get(key.toLowerCase());
    if (!field) {
      console.error(`Warning: field "${key}" not found, skipping`);
      continue;
    }

    switch (field.type) {
      case "formattedText":
        if (typeof value === "object" && value.value) {
          fieldData[field.id] = {
            type: "formattedText",
            value: value.value,
            contentType: value.contentType || "markdown",
          };
        } else {
          fieldData[field.id] = {
            type: "formattedText",
            value: String(value),
            contentType: "markdown",
          };
        }
        break;

      case "boolean":
        fieldData[field.id] = { type: "boolean", value: Boolean(value) };
        break;

      case "number":
        fieldData[field.id] = { type: "number", value: Number(value) };
        break;

      case "date":
        fieldData[field.id] = { type: "date", value: String(value) };
        break;

      case "image": {
        const imgEntry = { type: "image", value: typeof value === "object" ? (value.url || value.value || null) : String(value) };
        if (typeof value === "object" && (value.alt || value.altText)) {
          imgEntry.alt = value.alt || value.altText;
        }
        fieldData[field.id] = imgEntry;
        break;
      }

      case "file":
        fieldData[field.id] = { type: "file", value: typeof value === "object" ? (value.url || value.value || null) : String(value) };
        break;

      case "link":
        fieldData[field.id] = { type: "link", value: typeof value === "object" ? (value.url || value.value || null) : String(value) };
        break;

      case "enum":
        fieldData[field.id] = { type: "enum", value: String(value) };
        break;

      case "color":
        fieldData[field.id] = { type: "color", value: String(value) };
        break;

      case "collectionReference":
        fieldData[field.id] = { type: "collectionReference", value: String(value) };
        break;

      case "multiCollectionReference":
        fieldData[field.id] = {
          type: "multiCollectionReference",
          value: Array.isArray(value) ? value.map(String) : [String(value)],
        };
        break;

      case "array":
        fieldData[field.id] = {
          type: "array",
          value: Array.isArray(value) ? value : [value],
        };
        break;

      default:
        // Fallback: string
        fieldData[field.id] = { type: "string", value: String(value) };
        break;
    }
  }

  return fieldData;
}
