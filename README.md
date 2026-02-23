<p align="center">
  <img src="assets/logo.png" alt="Framer Manager" width="200" />
</p>

<h1 align="center">Framer Manager</h1>

<p align="center">
  <strong>Manage Framer sites programmatically — CMS, SEO, redirects, publishing, and more.</strong>
</p>

---

## Install

### Any agent (Claude Code, Cursor, Codex, OpenClaw, etc.)

```bash
npx skills add watchdealer-pavel/framer-manager-skill
```

### Tell your agent to install it

Paste this into your agent chat:

```
Install the Framer Manager skill:

git clone https://github.com/watchdealer-pavel/framer-manager-skill.git ~/.openclaw/workspace/skills/framer-manager
cd ~/.openclaw/workspace/skills/framer-manager && npm install
cp config/framer-config.example.json config/framer-config.json

Then ask me for:
1. My Framer project URL
2. My Framer API key

Save the API key to config/.framer-api-key and put the project URL in config/framer-config.json.
Test with: node scripts/list_collections.js
Read SKILL.md for full usage.
```

### Manual

```bash
git clone https://github.com/watchdealer-pavel/framer-manager-skill.git
cd framer-manager-skill && npm install
cp config/framer-config.example.json config/framer-config.json
# Add your project URL to config/framer-config.json
# Save your API key:
echo "your-key" > config/.framer-api-key
```

---

## Setup — Get Your Credentials

You need two things from Framer:

### Project URL

1. Go to [framer.com](https://framer.com) → your dashboard
2. **Right-click** your project → **Copy Link**
3. Looks like: `https://framer.com/projects/MySite--a1b2c3d4e5`

### API Key

1. Open your project in Framer
2. **⚙️ Site Settings** → **General** → **API Keys** → **Generate**
3. Copy it immediately — it won't be shown again

> ⚠️ Keep this key secure. Don't commit it to git. The `.framer-api-key` file is gitignored.

> 💡 The Server API is **free during beta**.

---

## What Can It Do?

| Category | Capabilities |
|----------|-------------|
| **CMS** | Create collections, manage fields, add/update/remove items, markdown content |
| **SEO** | Inject `<head>`/`<body>` code (structured data, meta tags, tracking scripts) |
| **Redirects** | Add, remove, list redirects (with localization support) |
| **Publishing** | Preview builds, deploy to production, view deployment history |
| **Pages** | List all pages, take screenshots |
| **Assets** | Upload images, audit design tokens (colors, fonts) |

**Limitations:** No visual editing, no domain config, no static page SEO (CMS pages only).

---

## Quick Example

Just tell your agent what you want:

> **You:** Publish a new blog post on my Framer site about AI agents. Title it "Why AI Agents Will Run Your Website by 2027". Make it engaging, add some stats, and deploy it live.

Your agent will:
1. Run `list_collections.js` to find your blog collection and field schema
2. Write the article content in markdown
3. Run `add_item.js` to create the CMS entry
4. Run `publish.js --deploy` to push it live

That's it — article goes from idea to live URL in one conversation.

Or run it manually:

```bash
node scripts/add_item.js "Blog" "ai-agents-2027" '{"Title":"Why AI Agents Will Run Your Website by 2027","Content":{"value":"# The Age of AI Agents\n\nBy 2027, most websites will be managed by autonomous agents...","contentType":"markdown"}}'
node scripts/publish.js --deploy
```

📖 **[Full script reference →](docs/scripts.md)** · **[More examples →](docs/examples.md)**

---

## API

Built on [`framer-api`](https://www.npmjs.com/package/framer-api) v0.1.1 (open beta). WebSocket-based, auto-retry on transient errors, 30s connection timeout. All scripts output JSON to stdout.

## License

MIT

<p align="center">
  Built for <a href="https://openclaw.ai">OpenClaw</a> agents who manage Framer sites without clicking buttons.
</p>
