#!/usr/bin/env node
// Regenerates every client's copy of the Happenings skill from
// skill/happenings.md (HAP-4513), and the downloadable Claude plugin from
// plugins/happenings. Run after editing the skill, a command or a manifest.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { PLUGIN_SOURCE_FILES, allVariants } from "./variants.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");
const source = readFileSync(join(here, "skill/happenings.md"), "utf8");
const { version } = JSON.parse(readFileSync(join(here, "plugins/happenings/.claude-plugin/plugin.json"), "utf8"));

const pluginFiles = Object.fromEntries(
  PLUGIN_SOURCE_FILES.map((path) => [path, readFileSync(join(here, "plugins/happenings", path))]),
);

for (const [path, contents] of Object.entries(allVariants(source, version, pluginFiles))) {
  const out = join(root, path);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, contents);
  console.log(`wrote ${path}`);
}
