#!/usr/bin/env node
// Regenerates every client's copy of the Happenings skill from
// skill/happenings.md (HAP-4513). Run after editing the skill.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { allVariants } from "./variants.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");
const source = readFileSync(join(here, "skill/happenings.md"), "utf8");
const { version } = JSON.parse(readFileSync(join(here, "plugins/happenings/.claude-plugin/plugin.json"), "utf8"));

for (const [path, contents] of Object.entries(allVariants(source, version))) {
  const out = join(root, path);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, contents);
  console.log(`wrote ${path}`);
}
