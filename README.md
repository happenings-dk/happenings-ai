# Happenings for your AI

Connects any MCP-capable AI to the Happenings pages an organiser runs, and
teaches it how to run a page well (HAP-4513). Organisers set it up from Connect,
under Settings, then AI (`/beta/settings/ai`).

## The two parts

- **The connector**: `https://api.happenings.social/mcp`. The page-level
  Happenings CLI as a remote MCP server (streamable HTTP), behind OAuth 2.1
  with PKCE, dynamic client registration and RFC 9207 `iss`. Adding it takes
  only the URL; signing in picks the pages, and every command stays limited by
  the person's role on each page. Tools: `hap_help` and `hap_read` (read-only)
  and `hap_run`.
- **The skill**: `skill/happenings.md` is the single source. `node build.mjs`
  generates every client's copy from it; a backoffice test fails when one is
  stale.

## Per client

| Client | Connector | Skill |
|---|---|---|
| Claude (web, Desktop, app) | URL: Customize, Connectors, Add custom connector. Team/Enterprise: an owner adds it under Organization settings, Connectors | Download `happenings-skill.zip`, upload under Customize, Skills |
| ChatGPT | URL: Settings, Apps and connectors, Advanced settings, Developer mode, Create (paid plans) | Copy `chatgpt-instructions.txt` into a project or custom GPT |
| Claude Code | `claude mcp add --transport http happenings https://api.happenings.social/mcp` | `mkdir -p ~/.claude/skills/happenings && curl -fsSL https://connect.happenings.social/downloads/ai/SKILL.md -o ~/.claude/skills/happenings/SKILL.md`, or both in one: the plugin below |
| Cursor | Install link `cursor://anysphere.cursor-deeplink/mcp/install?name=happenings&config=…`, or `~/.cursor/mcp.json` | `.cursor/rules/happenings.mdc` |
| VS Code (Copilot) | Install link `vscode:mcp/install?…`, or `.vscode/mcp.json` with `"type": "http"` | Append `AGENTS.md` |
| Windsurf | `~/.codeium/windsurf/mcp_config.json` with `serverUrl` | Append `AGENTS.md` |
| Gemini CLI | `gemini mcp add --transport http happenings https://api.happenings.social/mcp` | Append `GEMINI.md` to `~/.gemini/GEMINI.md`, or both in one: the extension below |
| Codex CLI | `codex mcp add happenings --url https://api.happenings.social/mcp`, then `codex mcp login happenings` | Append `AGENTS.md` to `~/.codex/AGENTS.md` |

Every client above uses the remote URL with OAuth; none needs a local stdio
fallback. OAuth callbacks allowlisted for them: Claude
(`https://claude.ai/api/mcp/auth_callback`), ChatGPT
(`https://chatgpt.com/connector_platform_oauth_redirect` and
`/connector/oauth/{id}`), VS Code (`https://vscode.dev/redirect`,
`https://insiders.vscode.dev/redirect`), Cursor's fallback
(`cursor://anysphere.cursor-mcp/oauth/callback`) and loopback
(`http://localhost:*`, `127.0.0.1`) for Cursor, Claude Code, Gemini CLI, Codex
and Windsurf.

## Bundles (one step for both)

This folder is laid out to be published as its own public repository, which
serves two bundles at once:

- **Claude Code plugin marketplace**: `.claude-plugin/marketplace.json` and
  `plugins/happenings` (the `.mcp.json` connector, the skill and four
  commands: `/happenings:this-week`, `:sales`, `:new-event`, `:members`).
  `claude plugin marketplace add <owner>/<repo> && claude plugin install happenings@happenings`
- **Gemini CLI extension**: `gemini-extension.json` and `GEMINI.md`.
  `gemini extensions install https://github.com/<owner>/<repo>`

- **Claude plugin as a file**: `happenings-plugin.zip`, built by `build.mjs`
  from `plugins/happenings` and served by Connect at
  `/downloads/ai/happenings-plugin.zip`. One download holds the connector
  (`.mcp.json`), the skill and the four commands, for adding in Claude without
  a terminal. It is hosted on our own site and does not depend on the public
  repository. Connect shows it as "Both in one step" when Claude is picked. The
  public site serves the same bytes at `/skills/happenings-plugin.zip`
  (`web/apps/user-web/scripts/sync-skills.mjs` copies it at build time) and
  links it from `/mcp` and `/guide/mcp`.

The monorepo is private, so the first two work only from the published copy of
this folder. Set
`HAPPENINGS_AI_REPO=<owner>/<repo>` on the backoffice Worker and Connect shows
both commands; until then it shows the separate connector and skill steps.

A Claude Desktop extension (`.mcpb`) is not built: Desktop already takes the
remote connector by URL, and `.mcpb` targets local servers.

## MCP Registry

Happenings Connect is listed in the official MCP Registry
(`registry.modelcontextprotocol.io`) as `social.happenings/connect`
(`https://api.happenings.social/mcp`); the entry is `registry/connect.server.json`.
Directories that read the registry pick it up from there. The earlier entries
`social.happenings/page-tools` and `social.happenings/page-cli` are deprecated:
`/mcp` became Happenings Connect on 2026-10-14 and `/page/mcp` is its former
address. The operator connector is not listed.

The `social.happenings` namespace is proven by a TXT record on
`happenings.social` (`v=MCPv1; k=ed25519; p=…`). The private key was not kept.
To publish a change, bump `version` in the entry, then:

```bash
openssl genpkey -algorithm Ed25519 -out key.pem   # OpenSSL 3, not LibreSSL
openssl pkey -in key.pem -pubout -outform DER | tail -c 32 | base64
# replace the p= value of the MCPv1 TXT record in Cloudflare with that output
mcp-publisher login dns --domain happenings.social \
  --private-key "$(openssl pkey -in key.pem -noout -text | grep -A3 'priv:' | tail -n +2 | tr -d ' :\n')"
mcp-publisher publish registry/connect.server.json
rm key.pem
```

## Editing the skill

1. Edit `skill/happenings.md`.
2. `node integrations/ai/build.mjs`
3. Commit the regenerated files (here and in `web/apps/backoffice/public/downloads/ai/`).

The same applies after editing a plugin command or manifest, since the plugin
zip is built from them. A new command file must be added to
`PLUGIN_SOURCE_FILES` in `variants.mjs`; a test fails if it is not. Bump
`version` in `plugins/happenings/.claude-plugin/plugin.json` and
`.claude-plugin/marketplace.json` together when the plugin changes.
