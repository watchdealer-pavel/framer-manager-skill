<p align="center">
  <img src="assets/logo.png" alt="Framer Manager" width="200" />
</p>

<h1 align="center">Framer Manager</h1>

<p align="center">
  <strong>Programmatic Framer site management for OpenClaw agents and humans alike.</strong>
  <br />
  CMS content · SEO injection · Redirects · Publishing · Screenshots
</p>

<p align="center">
  <a href="#install-via-agent">Install via Agent</a> •
  <a href="#getting-your-framer-api-key">Get API Key</a> •
  <a href="#manual-installation">Manual Install</a> •
  <a href="#scripts">Scripts</a> •
  <a href="#field-types">Field Types</a>
</p>

---

## Installation

### One-liner (any agent)

```bash
npx skills add watchdealer-pavel/framer-manager-skill
```

Works with Claude Code, OpenClaw, Cursor, Codex, Windsurf, Roo Code, and [37 more agents](https://skills.sh).

After installing, you still need to configure your Framer API key and project URL — see [setup](#getting-your-framer-api-key) below.

---

### Install via Agent

**Paste this into your OpenClaw agent chat** (Telegram, Discord, etc.):

```
Install the Framer Manager skill:

git clone https://github.com/watchdealer-pavel/framer-manager-skill.git ~/.openclaw/workspace/skills/framer-manager
cd ~/.openclaw/workspace/skills/framer-manager && npm install
cp config/framer-config.example.json config/framer-config.json

Then ask me for:
1. My Framer project URL (I'll get it from framer.com → right-click project → Copy Link)
2. My Framer API key (I'll get it from Site Settings → General → API Keys → Generate)

Save the API key to config/.framer-api-key and put the project URL in config/framer-config.json.
Test the connection by running: node scripts/list_collections.js
Read SKILL.md for full usage reference.
```

That's it. Your agent handles the rest — you just hand over the two credentials when asked.

---

## What is this?

A collection of Node.js scripts that wrap the [Framer Server API](https://www.framer.com/developers/server-api-introduction) (`framer-api` v0.1.1) to manage Framer websites without touching the GUI.

**What you can do:**
- 📝 Create, update, and delete CMS collection items (blog posts, pages, etc.)
- 🏗️ Create collections and manage field schemas
- 🔍 Inject custom SEO code (`<head>`, `<body>` — structured data, meta tags, tracking)
- 🔀 Manage redirects programmatically
- 🚀 Publish previews and deploy to production
- 📸 Take screenshots of any page/node
- 🎨 Audit color and text styles
- 🖼️ Upload images for CMS use

**What you can't do** (Framer API limitations):
- Visual drag-and-drop layout editing
- Domain configuration (can deploy to existing domains only)
- Page-level SEO settings on static (non-CMS) pages
- Modify animations, interactions, or hover states

---

## Getting Your Framer Project URL

1. Go to [framer.com](https://framer.com) and log in
2. Find your project in the dashboard
3. **Right-click** the project thumbnail → **Copy Link**
4. You'll get something like: `https://framer.com/projects/MySite--a1b2c3d4e5`

That's your project URL.

---

## Getting Your Framer API Key

API keys are generated per-project and authenticate as the user who created them.

1. Open your project in Framer
2. Click the **⚙️ gear icon** (top-right) to open **Site Settings**
3. Go to the **General** section
4. Scroll down to **API Keys**
5. Click **Generate** to create a new key
6. **Copy the key immediately** — it won't be shown again

> ⚠️ **Keep this key secure.** It has full access to your project. Don't commit it to git, don't share it publicly. Store it in a password manager or a local file that's gitignored.

> 💡 **During beta, the Server API is free.** Framer plans to charge per-use eventually with a monthly free allowance. A full hour of processing will likely cost a few dollars.

---

## Manual Installation

If you're not using OpenClaw, or prefer to set things up yourself:

### 1. Clone

```bash
git clone https://github.com/watchdealer-pavel/framer-manager-skill.git
cd framer-manager-skill
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure

```bash
cp config/framer-config.example.json config/framer-config.json
```

Edit `config/framer-config.json`:

```json
{
  "projectUrl": "https://framer.com/projects/YourProject--xxxxx",
  "apiKeyFile": "./config/.framer-api-key",
  "defaultCollection": "Blog Posts",
  "autoPublish": false,
  "autoDeploy": false
}
```

### 4. Save your API key

```bash
echo "your-api-key-here" > config/.framer-api-key
```

> This file is gitignored and never committed.

Alternatively, set the `FRAMER_API_KEY` environment variable instead of using a file.

### 5. Test

```bash
node scripts/list_collections.js
```

If you see JSON output with your collections — you're in.

---

## Scripts

All scripts output **JSON to stdout** and **human-readable summaries to stderr**.
Run from the repo root: `node scripts/<script>.js [args]`

### CMS — Collections & Fields

| Script | What it does |
|--------|-------------|
| `list_collections.js` | List all collections with field schemas |
| `create_collection.js <name> ['<fields>']` | Create a collection, optionally with fields |
| `manage_fields.js add\|remove\|reorder <collection> <args>` | Modify collection fields |

### CMS — Items

| Script | What it does |
|--------|-------------|
| `list_items.js <collection>` | List all items (with draft status) |
| `add_item.js <collection> <slug> '<fields>'` | Add an item |
| `update_item.js <id-or-slug> <collection> '<fields>'` | Update an item (supports `--slug` for renames) |
| `remove_item.js <collection> <id> [id2...]` | Remove item(s) |

### SEO & Redirects

| Script | What it does |
|--------|-------------|
| `get_custom_code.js` | View all custom code injections |
| `set_custom_code.js <location> '<html>'` | Inject code at headStart/headEnd/bodyStart/bodyEnd |
| `set_custom_code.js <location> --clear` | Clear custom code at a location |
| `list_redirects.js` | List all redirects |
| `manage_redirects.js add <from> <to>` | Add a redirect (supports `--all-locales`) |
| `manage_redirects.js remove <id>` | Remove a redirect |

### Publishing

| Script | What it does |
|--------|-------------|
| `publish.js` | Publish a preview |
| `publish.js --deploy` | Publish and deploy to production |
| `list_deployments.js` | View deployment history |
| `changed_paths.js` | See what changed since last publish |

### Pages, Styles & Assets

| Script | What it does |
|--------|-------------|
| `list_pages.js` | List all pages with paths |
| `list_styles.js [--colors] [--text]` | List design tokens |
| `screenshot.js <nodeId> [--format] [--scale] [--out]` | Capture a screenshot |
| `upload_image.js <file> [--alt "text"]` | Upload an image |

---

## OpenClaw Integration

### Agent Instructions (Optional)

If your agent doesn't automatically discover the skill via `SKILL.md`, paste this into your `AGENTS.md` or system prompt:

```markdown
## Framer Manager Skill

Location: `~/.openclaw/workspace/skills/framer-manager/`
Use for: Managing Framer-hosted websites (CMS content, SEO, redirects, publishing).

### Usage
Run scripts from the skill directory:
cd ~/.openclaw/workspace/skills/framer-manager && node scripts/<script>.js [args]

### Common Operations
- List collections: `node scripts/list_collections.js`
- Add blog post: `node scripts/add_item.js "Blog" "my-slug" '{"Title":"My Post","Content":{"value":"# Hello","contentType":"markdown"}}'`
- Inject structured data: `node scripts/set_custom_code.js headEnd '<script type="application/ld+json">...</script>'`
- Publish + deploy: `node scripts/publish.js --deploy`
- Add redirect: `node scripts/manage_redirects.js add /old-path /new-path`

### Key Rules
- All scripts output JSON to stdout, summaries to stderr
- formattedText fields accept markdown via `{"value": "...", "contentType": "markdown"}`
- Always `list_collections.js` first to discover collection names and field schemas
- Use `publish.js --deploy` to push changes live (without --deploy, it's preview only)
```

---

## Manual Usage

### Post a blog article

```bash
# 1. Check your collection schema
node scripts/list_collections.js

# 2. Add the post
node scripts/add_item.js "Blog Posts" "my-first-post" '{
  "Title": "My First Post",
  "Content": {
    "value": "# Hello World\n\nThis is my first post written via the API.",
    "contentType": "markdown"
  },
  "Author": "Pavel",
  "Published Date": "2026-02-23",
  "Featured": false
}'

# 3. Publish and deploy
node scripts/publish.js --deploy
```

### Inject SEO structured data

```bash
node scripts/set_custom_code.js headEnd '<script type="application/ld+json">{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Company",
  "url": "https://yoursite.com"
}</script>'
```

### Bulk redirect old URLs

```bash
node scripts/manage_redirects.js add /old-blog/post-1 /blog/post-1
node scripts/manage_redirects.js add /old-blog/post-2 /blog/post-2
node scripts/publish.js --deploy
```

### Create a new collection with fields

```bash
node scripts/create_collection.js "Resources" '[
  {"name": "Title", "type": "string"},
  {"name": "Description", "type": "string"},
  {"name": "Content", "type": "formattedText", "contentType": "markdown"},
  {"name": "Category", "type": "enum", "cases": [{"name": "Guide"}, {"name": "Tutorial"}, {"name": "Case Study"}]},
  {"name": "Cover Image", "type": "image"},
  {"name": "Published", "type": "date"}
]'
```

---

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
| `formattedText` | `{"value": "...", "contentType": "markdown"}` | See examples above |
| `image` | `{"value": "https://...", "altText": "..."}` or `"url"` | `{"value": "https://img.com/photo.jpg", "altText": "A photo"}` |
| `file` | `{"value": "https://..."}` or `"url"` | `"https://files.com/doc.pdf"` |
| `link` | `{"value": "https://..."}` or `"url"` | `"https://example.com"` |
| `collectionReference` | `"item-id"` | `"abc123"` |
| `multiCollectionReference` | `["id1", "id2"]` | `["abc", "def"]` |
| `array` | `[item1, item2]` | `[{"value": "img.jpg"}]` |

---

## Localization

Add locale-specific slugs when creating or updating items:

```bash
node scripts/add_item.js "Blog" "my-post" '{"Title":"My Post"}' --locale de --localSlug mein-beitrag
```

---

## Error Handling

Scripts include retry logic for transient API errors and sanitize error output (no API keys or file paths leaked).

| Error | Cause | Fix |
|-------|-------|-----|
| `Config not found` | Missing config file | Run the config setup from [Quick Start](#quick-start) |
| `Connection timeout after 30s` | Bad project URL or API key | Verify both in your config |
| `Collection "X" not found` | Name mismatch | Run `list_collections.js` to check exact names |
| Retryable API errors | Transient WebSocket issues | Auto-retried up to 3 times |

---

## API Notes

- Built on `framer-api` v0.1.1 (open beta, free)
- WebSocket-based — scripts connect, work, disconnect (30s timeout)
- `formattedText` fields natively accept markdown (`contentType: "markdown"`)
- The API may change during beta — pin your dependency version

---

## License

MIT

---

<p align="center">
  Built for <a href="https://openclaw.ai">OpenClaw</a> agents who manage Framer sites without clicking buttons.
</p>
