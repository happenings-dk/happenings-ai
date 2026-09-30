# Happenings for your AI

Connects any MCP-capable AI to the Happenings pages an organiser runs, and
teaches it how to run a page well (HAP-4513). Organisers set it up from Connect,
under Settings, then AI (`/beta/settings/ai`).

## The two parts

- **The connector**: `https://api.happenings.social/page/mcp`. The page-level
  Happenings CLI as a remote MCP server (streamable HTTP), behind OAuth 2.1
  with PKCE, dynamic client registration and RFC 9207 `iss`. Adding it takes
  only the URL; signing in picks the pages, and every command stays limited by
  the person's role on each page. Tools: `hap_help` (read-only) and `hap_run`.
- **The skill**: `skill/happenings.md` is the single source. `node build.mjs`
  generates every client's copy from it; a backoffice test fails when one is
  stale.

## Per client

| Client | Connector | Skill |
|---|---|---|
| Claude (web, Desktop, app) | URL: Customize, Connectors, Add custom connector. Team/Enterprise: an owner adds it under Organization settings, Connectors | Download `happenings-skill.zip`, upload under Customize, Skills |
| ChatGPT | URL: Settings, Apps and connectors, Advanced settings, Developer mode, Create (paid plans) | Copy `chatgpt-instructions.txt` into a project or custom GPT |
| Claude Code | `claude mcp add --transport http happenings https://api.happenings.social/page/mcp` | `mkdir -p ~/.claude/skills/happenings && curl -fsSL https://connect.happenings.social/downloads/ai/SKILL.md -o ~/.claude/skills/happenings/SKILL.md`, or both in one: the plugin below |
| Cursor | Install link `cursor://anysphere.cursor-deeplink/mcp/install?name=happenings&config=…`, or `~/.cursor/mcp.json` | `.cursor/rules/happenings.mdc` |
| VS Code (Copilot) | Install link `vscode:mcp/install?…`, or `.vscode/mcp.json` with `"type": "http"` | Append `AGENTS.md` |
| Windsurf | `~/.codeium/windsurf/mcp_config.json` with `serverUrl` | Append `AGENTS.md` |
| Gemini CLI | `gemini mcp add --transport http happenings https://api.happenings.social/page/mcp` | Append `GEMINI.md` to `~/.gemini/GEMINI.md`, or both in one: the extension below |
| Codex CLI | `codex mcp add happenings --url https://api.happenings.social/page/mcp`, then `codex mcp login happenings` | Append `AGENTS.md` to `~/.codex/AGENTS.md` |

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

The monorepo is private, so neither works until this folder is published. Set
`HAPPENINGS_AI_REPO=<owner>/<repo>` on the backoffice Worker and Connect shows
both commands; until then it shows the separate connector and skill steps.

A Claude Desktop extension (`.mcpb`) is not built: Desktop already takes the
remote connector by URL, and `.mcpb` targets local servers.

## Editing the skill

1. Edit `skill/happenings.md`.
2. `node integrations/ai/build.mjs`
3. Commit the regenerated files (here and in `web/apps/backoffice/public/downloads/ai/`).
