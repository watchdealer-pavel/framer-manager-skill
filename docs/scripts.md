# Scripts Reference

All scripts output **JSON to stdout** and **human-readable summaries to stderr**.
Run from the skill directory: `node scripts/<script>.js [args]`

## CMS — Collections & Fields

| Script | What it does |
|--------|-------------|
| `list_collections.js` | List all collections with field schemas |
| `create_collection.js <name> ['<fields>']` | Create a collection, optionally with fields |
| `manage_fields.js add\|remove\|reorder <collection> <args>` | Modify collection fields |

## CMS — Items

| Script | What it does |
|--------|-------------|
| `list_items.js <collection>` | List all items (with draft status) |
| `add_item.js <collection> <slug> '<fields>'` | Add an item |
| `update_item.js <id-or-slug> <collection> '<fields>'` | Update an item (supports `--slug` for renames) |
| `remove_item.js <collection> <id> [id2...]` | Remove item(s) |

## SEO & Redirects

| Script | What it does |
|--------|-------------|
| `get_custom_code.js` | View all custom code injections |
| `set_custom_code.js <location> '<html>'` | Inject code at headStart/headEnd/bodyStart/bodyEnd |
| `set_custom_code.js <location> --clear` | Clear custom code at a location |
| `list_redirects.js` | List all redirects |
| `manage_redirects.js add <from> <to>` | Add a redirect (supports `--all-locales`) |
| `manage_redirects.js remove <id>` | Remove a redirect |

## Publishing

| Script | What it does |
|--------|-------------|
| `publish.js` | Publish a preview |
| `publish.js --deploy` | Publish and deploy to production |
| `list_deployments.js` | View deployment history |
| `changed_paths.js` | See what changed since last publish |

## Pages, Styles & Assets

| Script | What it does |
|--------|-------------|
| `list_pages.js` | List all pages with paths |
| `list_styles.js [--colors] [--text]` | List design tokens |
| `screenshot.js <nodeId> [--format] [--scale] [--out]` | Capture a screenshot |
| `upload_image.js <file> [--alt "text"]` | Upload an image |

## Field Types

When adding or updating CMS items, field values are matched by name (case-insensitive):

| Type | Input Format | Example |
|------|-------------|---------|
| `string` | `"value"` | `"Hello World"` |
| `number` | `123` | `42` |
| `boolean` | `true` / `false` | `true` |
| `date` | `"YYYY-MM-DD"` | `"2026-02-23"` |
| `enum` | `"option-name"` | `"Tutorial"` |
| `color` | `"#hex"` or `"rgba(...)"` | `"#ff0000"` |
| `formattedText` | `{"value": "...", "contentType": "markdown"}` | See examples |
| `image` | `{"value": "https://...", "altText": "..."}` or `"url"` | `{"value": "https://img.com/photo.jpg", "altText": "A photo"}` |
| `file` | `{"value": "https://..."}` or `"url"` | `"https://files.com/doc.pdf"` |
| `link` | `{"value": "https://..."}` or `"url"` | `"https://example.com"` |
| `collectionReference` | `"item-id"` | `"abc123"` |
| `multiCollectionReference` | `["id1", "id2"]` | `["abc", "def"]` |
| `array` | `[item1, item2]` | `[{"value": "img.jpg"}]` |

## Localization

Add locale-specific slugs when creating or updating items:

```bash
node scripts/add_item.js "Blog" "my-post" '{"Title":"My Post"}' --locale de --localSlug mein-beitrag
```

## Error Handling

Scripts include retry logic for transient API errors and sanitize error output (no API keys or file paths leaked).

| Error | Cause | Fix |
|-------|-------|-----|
| `Config not found` | Missing config file | Copy `config/framer-config.example.json` → `config/framer-config.json` |
| `Connection timeout after 30s` | Bad project URL or API key | Verify both in your config |
| `Collection "X" not found` | Name mismatch | Run `list_collections.js` to check exact names |
| Retryable API errors | Transient WebSocket issues | Auto-retried up to 3 times |
