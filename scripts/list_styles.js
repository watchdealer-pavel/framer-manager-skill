// List color styles and text styles
// Usage: node scripts/list_styles.js [--colors] [--text] [--all]
//
// Default (no flags): lists both color and text styles.

import { getFramer, sanitizeError } from "./connect.js";

const args = process.argv.slice(2);
const showColors = args.includes("--colors") || args.includes("--all") || (!args.includes("--text"));
const showText = args.includes("--text") || args.includes("--all") || (!args.includes("--colors"));

const { framer, disconnect } = await getFramer();
try {
  const result = {};

  if (showColors) {
    const colorStyles = await framer.getColorStyles();
    result.colorStyles = colorStyles.map((s) => ({
      id: s.id,
      name: s.name,
      light: s.light,
      dark: s.dark,
    }));
  }

  if (showText) {
    const textStyles = await framer.getTextStyles();
    result.textStyles = textStyles.map((s) => ({
      id: s.id,
      name: s.name,
      tag: s.tag,
      font: s.font,
    }));
  }

  console.log(JSON.stringify(result, null, 2));
  const counts = [];
  if (result.colorStyles) counts.push(`${result.colorStyles.length} color style(s)`);
  if (result.textStyles) counts.push(`${result.textStyles.length} text style(s)`);
  console.error(`Found ${counts.join(", ")}`);
} catch (e) {
  console.error(`Error: ${sanitizeError(e)}`);
  process.exit(1);
} finally {
  await disconnect();
}
