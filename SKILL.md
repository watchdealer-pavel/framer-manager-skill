---
name: framer-manager
description: >
  Manage Framer sites programmatically — CMS collections, content publishing, SEO custom code,
  redirects, deployments, pages, screenshots, and asset uploads. Use when asked to manage
  QuestionBase or any Framer-hosted site: post content, manage CMS items, inject SEO tags,
  handle redirects, publish/deploy changes, upload images, or audit pages.
  Do NOT use for non-Framer sites (chronotimepieces.com, chronoteka.com use different stacks).
  Do NOT use for visual design/layout editing — API cannot do drag-and-drop operations.
  Do NOT use for domain configuration beyond deploying to existing domains.
---

## When NOT to use this skill
- **Non-Framer sites** (chronotimepieces.com, chronoteka.com, etc.)
- **Visual design work** — API can't do drag-and-drop layout editing
- **Domain configuration** — can deploy to existing domains but not add new ones
- **Component/node manipulation** — not supported in current implementation
- **Managed collections** — use regular collections (managed collections are a Plugin API concept)

# Framer Manager

Programmatic Framer site management via the `framer-api` package (v0.1.1, open beta).

## Setup

1. Copy `config/framer-config.example.json` → `config/framer-config.json`
2. Set your project URL (from Framer: right-click project → Copy Link)
3. Get API key from Framer: Site Settings → General → API Keys → Generate
4. Create the API key file at the path specified in config (default: `config/.framer-api-key`)
5. Run `npm install` in the skill directory (required after cloning — `node_modules/` is not tracked)

## ⚠️ Pre-flight Check

Before running any script, verify:
```bash
# Config exists and is valid JSON
cat skills/framer-manager/config/framer-config.json

# Dependencies installed
ls skills/framer-manager/node_modules/framer-api/

# Quick connection test
cd ~/.openclaw/workspace/skills/framer-manager && node scripts/list_collections.js
```

## Scripts

All scripts output JSON to stdout, human-readable summaries to stderr.
Run from the skill directory: `node scripts/<script>.js [args]`

### CMS — Collections & Fields
| Script | Usage |
|--------|-------|
| `list_collections.js` | List all collections with field schemas |
| `create_collection.js` | `node scripts/create_collection.js <name> ['<fields JSON>']` |
| `manage_fields.js` | `node scripts/manage_fields.js add\|remove\|reorder <collection> <args>` |

### CMS — Items
| Script | Usage |
|--------|-------|
| `list_items.js` | `node scripts/list_items.js <collection-name-or-id>` |
| `add_item.js` | `node scripts/add_item.js <collection> <slug> '<fieldData JSON>' [--locale <id> --localSlug <slug>]` |
| `update_item.js` | `node scripts/update_item.js <item-id-or-slug> <collection> '<fieldData JSON>' [--locale <id> --localSlug <slug>]` |
| `remove_item.js` | `node scripts/remove_item.js <collection> <id1> [id2] ...` |

### SEO
| Script | Usage |
|--------|-------|
| `get_custom_code.js` | Get all custom code injections |
| `set_custom_code.js` | `node scripts/set_custom_code.js <location> '<html>'` |
| `list_redirects.js` | List all redirects |
| `manage_redirects.js` | `node scripts/manage_redirects.js add <from> <to> [status]` or `remove <id1> ...` |

### Publishing
| Script | Usage |
|--------|-------|
| `publish.js` | `node scripts/publish.js [--deploy]` |
| `list_deployments.js` | Show deployment history |
| `changed_paths.js` | Show what changed since last publish |

### Pages & Design
| Script | Usage |
|--------|-------|
| `list_pages.js` | List all web pages with paths |
| `screenshot.js` | `node scripts/screenshot.js <nodeId> [--format png\|jpeg] [--scale 2] [--out file]` |
| `list_styles.js` | `node scripts/list_styles.js [--colors] [--text] [--all]` |

### Assets
| Script | Usage |
|--------|-------|
| `upload_image.js` | `node scripts/upload_image.js <file-path> [--alt "alt text"]` |

## Config

See `config/framer-config.example.json`. The API key is read from a separate file (path in config) or from `FRAMER_API_KEY` env var. The `config/` directory is non-standard but documented — actual config files are gitignored.

## Field Types

`add_item.js` and `update_item.js` support all CMS field types:

| Type | Input Format |
|------|-------------|
| `string` | `"value"` |
| `number` | `123` |
| `boolean` | `true`/`false` |
| `date` | `"2026-01-15"` |
| `enum` | `"option-name"` |
| `color` | `"#ff0000"` |
| `formattedText` | `{"value": "# Markdown", "contentType": "markdown"}` |
| `image` | `{"value": "https://...", "altText": "desc"}` or `"https://..."` |
| `file` | `{"value": "https://..."}` or `"https://..."` |
| `link` | `{"value": "https://..."}` or `"https://..."` |
| `collectionReference` | `"item-id"` |
| `multiCollectionReference` | `["id1", "id2"]` |
| `array` | `[item1, item2, ...]` |

## Validation Gates

### Pre-flight
- Config exists: `config/framer-config.json` is present and valid JSON
- API key resolves: key file exists at configured path OR `FRAMER_API_KEY` env var is set
- Connection test: `node scripts/list_collections.js` returns without error

### Mid-workflow (CMS operations)
- Collection exists before adding/updating items (scripts verify this automatically)
- Item exists before updating (checked by slug/ID)
- Field names match collection schema (case-insensitive, unmatched fields are warned and skipped)

### Post-publish
- `publish.js` returns deployment ID
- If `--deploy` used, verify hostnames array is non-empty

## Error Handling

| Error | Likely Cause | Fix |
|-------|-------------|-----|
| `Config not found` | Missing config file | Copy `config/framer-config.example.json` → `config/framer-config.json` |
| `Config file contains invalid JSON` | Syntax error in config | Validate JSON syntax |
| `Connection timeout after 30s` | Invalid project URL or API key | Verify project URL format and API key |
| `Collection "X" not found` | Typo or case mismatch | Run `list_collections.js` to see exact names |
| `Item "X" not found` | Wrong slug/ID | Run `list_items.js <collection>` to find correct identifier |
| `Invalid JSON in fieldData` | Malformed JSON in CLI arg | Check JSON syntax, ensure proper quoting |
| Retryable API errors | Transient WebSocket issue | Scripts using `withRetry()` auto-retry up to 3 times |
| `npm install` fails | Node.js version mismatch | Requires Node 18+; check with `node --version` |

## API Notes

- WebSocket-based — scripts connect, do work, disconnect (30s connection timeout)
- `formattedText` fields accept markdown with `contentType: "markdown"`
- `withRetry()` wrapper available in `connect.js` for retry logic on transient errors
- `sanitizeError()` strips API keys and paths from error messages
- Open beta — API may change
