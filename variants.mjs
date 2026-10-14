// Every client's copy of the Happenings skill, generated from the one source,
// skill/happenings.md (HAP-4513). Pure functions: build.mjs writes the files,
// and a backoffice test regenerates them in memory to prove nothing drifted.
import { crc32 } from "node:zlib";

export const CONNECTOR_URL = "https://api.happenings.social/mcp";

/** Splits `---\nfront\n---\nbody` into its frontmatter fields and body. */
export function parseSkill(source) {
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(source);
  if (!match) throw new Error("skill/happenings.md needs YAML frontmatter");
  const [, front, body] = match;
  const name = /^name:\s*(.+)$/m.exec(front)?.[1]?.trim();
  const folded = /^description:\s*>-?\n((?:[ \t]+.*\n?)+)/m.exec(front);
  const description = folded
    ? folded[1].split("\n").map((line) => line.trim()).filter(Boolean).join(" ")
    : /^description:\s*(.+)$/m.exec(front)?.[1]?.trim();
  if (!name || !description) throw new Error("skill frontmatter needs name and description");
  return { name, description, body: body.trimStart() };
}

const GENERATED = "<!-- Generated from integrations/ai/skill/happenings.md. Edit that file, then run node integrations/ai/build.mjs. -->";

/** Claude (claude.ai upload, Desktop, Claude Code plugin): the source as is. */
export function claudeSkill(source) {
  return source;
}

/** AGENTS.md: read by Codex, Cursor, VS Code Copilot and Windsurf. */
export function agentsMd(source) {
  const { body } = parseSkill(source);
  return `${GENERATED}\n\n${body}`;
}

/** A Cursor project rule, attached when the request is about the page. */
export function cursorRule(source) {
  const { description, body } = parseSkill(source);
  // JSON-quoted: the description has ": " in it, which a plain YAML value cannot hold.
  return `---\ndescription: ${JSON.stringify(description)}\nalwaysApply: false\n---\n\n${body}`;
}

/** Gemini CLI extension context file. */
export function geminiMd(source) {
  const { body } = parseSkill(source);
  return `${GENERATED}\n\n${body}`;
}

/** The Gemini CLI extension manifest: the connector plus the context file. */
export function geminiExtension(version) {
  return `${JSON.stringify(
    {
      name: "happenings",
      version,
      description: "Run the Happenings pages you manage from Gemini CLI: events, tickets, sales, members and deals.",
      mcpServers: { happenings: { httpUrl: CONNECTOR_URL } },
      contextFileName: "GEMINI.md",
    },
    null,
    2,
  )}\n`;
}

/** Plain text for ChatGPT project instructions or a custom GPT. */
export function chatgptInstructions(source) {
  const { body } = parseSkill(source);
  return body;
}

/**
 * A minimal, deterministic zip (stored, no compression). Fixed timestamps and
 * the given file order, so the same input always builds the same bytes.
 * `files` is a list of `{ name, data }` with forward-slash paths.
 */
export function storedZip(files) {
  const dosDate = ((2026 - 1980) << 9) | (1 << 5) | 1;
  const locals = [];
  const centrals = [];
  let offset = 0;

  for (const file of files) {
    const data = Buffer.isBuffer(file.data) ? file.data : Buffer.from(file.data, "utf8");
    const name = Buffer.from(file.name, "utf8");
    const crc = crc32(data) >>> 0;

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6); // UTF-8 names
    local.writeUInt16LE(0, 8); // stored
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(dosDate, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(dosDate, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);

    locals.push(local, name, data);
    centrals.push(central, name);
    offset += local.length + name.length + data.length;
  }

  const directory = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);

  return Buffer.concat([...locals, directory, end]);
}

/** `<folder>/SKILL.md`, the shape claude.ai takes for an uploaded skill. */
export function skillZip(folder, skill) {
  return storedZip([{ name: `${folder}/SKILL.md`, data: skill }]);
}

/** The plugin's hand-written files, relative to plugins/happenings. */
export const PLUGIN_SOURCE_FILES = [
  ".claude-plugin/plugin.json",
  ".mcp.json",
  "commands/members.md",
  "commands/new-event.md",
  "commands/sales.md",
  "commands/this-week.md",
];

/**
 * The Claude plugin as one file to download and add in Claude: the connector
 * (`.mcp.json`), the skill and the commands, under a top folder named after
 * the plugin. `pluginFiles` maps each PLUGIN_SOURCE_FILES path to its
 * contents; the skill is the generated copy, so it can never lag the source.
 */
export function pluginZip(folder, pluginFiles, skill) {
  const files = PLUGIN_SOURCE_FILES.map((path) => {
    if (pluginFiles[path] === undefined) throw new Error(`plugin file missing: ${path}`);
    return { name: `${folder}/${path}`, data: pluginFiles[path] };
  });
  files.push({ name: `${folder}/skills/${folder}/SKILL.md`, data: skill });
  return storedZip(files);
}

/**
 * Every generated file, as repo-relative path -> contents. build.mjs writes
 * them; the backoffice test compares them with what is committed.
 */
export function allVariants(source, version, pluginFiles) {
  const skill = claudeSkill(source);
  return {
    "web/apps/backoffice/public/downloads/ai/happenings-plugin.zip": pluginZip("happenings", pluginFiles, skill),
    "integrations/ai/plugins/happenings/skills/happenings/SKILL.md": skill,
    "integrations/ai/AGENTS.md": agentsMd(source),
    "integrations/ai/GEMINI.md": geminiMd(source),
    "integrations/ai/gemini-extension.json": geminiExtension(version),
    "web/apps/backoffice/public/downloads/ai/happenings-skill.zip": skillZip("happenings", skill),
    "web/apps/backoffice/public/downloads/ai/SKILL.md": skill,
    "web/apps/backoffice/public/downloads/ai/GEMINI.md": geminiMd(source),
    "web/apps/backoffice/public/downloads/ai/AGENTS.md": agentsMd(source),
    "web/apps/backoffice/public/downloads/ai/happenings.mdc": cursorRule(source),
    "web/apps/backoffice/public/downloads/ai/chatgpt-instructions.txt": chatgptInstructions(source),
  };
}
