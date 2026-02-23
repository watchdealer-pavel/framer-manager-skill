# Examples

## Post a blog article

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

## Inject SEO structured data

```bash
node scripts/set_custom_code.js headEnd '<script type="application/ld+json">{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Company",
  "url": "https://yoursite.com"
}</script>'
```

## Bulk redirect old URLs

```bash
node scripts/manage_redirects.js add /old-blog/post-1 /blog/post-1
node scripts/manage_redirects.js add /old-blog/post-2 /blog/post-2
node scripts/publish.js --deploy
```

## Create a new collection with fields

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

## Agent instructions (optional)

If your agent doesn't auto-discover the skill via `SKILL.md`, paste this into your `AGENTS.md`:

```markdown
## Framer Manager Skill

Location: `~/.openclaw/workspace/skills/framer-manager/`
Use for: Managing Framer-hosted websites (CMS content, SEO, redirects, publishing).

Run scripts from the skill directory:
cd ~/.openclaw/workspace/skills/framer-manager && node scripts/<script>.js [args]

Key rules:
- All scripts output JSON to stdout, summaries to stderr
- formattedText fields accept markdown via {"value": "...", "contentType": "markdown"}
- Always list_collections.js first to discover collection names and field schemas
- Use publish.js --deploy to push changes live (without --deploy, it's preview only)
```
