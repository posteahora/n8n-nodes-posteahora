# n8n-nodes-posteahora

An [n8n](https://n8n.io) community node for [PosteAhora](https://posteahora.com) —
schedule and publish social posts across Instagram, X/Twitter, LinkedIn, Threads,
Facebook, TikTok and more, right from your workflows.

Build automations like *"new row in a sheet → generate caption → publish to every
channel"* without touching code.

## Installation

### Community Nodes (recommended)

In n8n: **Settings → Community Nodes → Install**, then enter:

```
n8n-nodes-posteahora
```

### Manual (self-hosted)

```bash
# in your n8n custom extensions folder (~/.n8n/custom)
npm install n8n-nodes-posteahora
```

### Docker

Mount a custom nodes folder and set `N8N_CUSTOM_EXTENSIONS` to it, then install
the package there.

## Credentials

1. In PosteAhora → **Settings → API & integrations**, create an API key
   (looks like `pah_live_…`).
2. In n8n, create a **PosteAhora API** credential and paste the key. Leave **Base
   URL** at its default unless you're self-hosting PosteAhora.

The credential is testable — n8n validates it against `GET /accounts` on save.

## Operations

| Operation | Description |
|-----------|-------------|
| **Get Accounts** | List connected social accounts (call first — you need the account IDs). |
| **Create Post** | Publish now, schedule, or draft a post to one or more channels. |
| **Get Posts** | List your posts, optionally filtered by status. |
| **Create Idea** | Add an idea to your backlog. |
| **Get Analytics** | Read performance metrics across platforms. |

For **Create Post**, add one **Channel** per target (Platform + Account ID from
*Get Accounts*), a caption, and choose **Draft**, **Schedule** (with a time), or
**Publish Now**.

## Resources

- REST API reference: [posteahora.com/docs/api](https://posteahora.com/docs/api)
- MCP server (for AI agents): [`@posteahora/mcp`](https://github.com/posteahora/mcp)
- CLI: [`@posteahora/cli`](https://github.com/posteahora/cli)

## License

[MIT](LICENSE)
