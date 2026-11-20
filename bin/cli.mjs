#!/usr/bin/env node
// Standalone tools and migration help for earlier installations.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKILL = "game-ui-frontend";
const SOURCE = path.join(PKG_ROOT, "skills", SKILL);
const USE = "npx skills@latest use NathanHor22/gamefrontendskills@game-ui-frontend";

const HELP = `game-ui-frontend: game interface research for website UI

Usage: npx game-ui-frontend <command> [options]

  Run the skill for one session:
    ${USE} --agent codex
    ${USE} --agent claude-code

  mcp   Print config for adding the Playwright MCP server to Claude Code and Codex.
  doctor
        Check Node, installed copies, Playwright and Chromium.
  uninstall [--claude] [--codex] [--project] [--dir <path>]
  library|audit|verify|capture [...args]
        Run a skill script directly from this package.`;

function parse(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) { out._.push(a); continue; }
    const next = argv[i + 1];
    if (a === "--dir") { out.dir = next; i++; } else out[a.slice(2)] = true;
  }
  return out;
}

function targets(opts) {
  if (opts.dir) return [{ tool: "custom", dir: path.resolve(opts.dir, SKILL) }];
  const home = os.homedir();
  const codexHome = process.env.CODEX_HOME || path.join(home, ".codex");
  const base = opts.project
    ? { claude: path.join(process.cwd(), ".claude", "skills"), codex: path.join(process.cwd(), ".agents", "skills") }
    : { claude: path.join(home, ".claude", "skills"), codex: path.join(codexHome, "skills") };
  let tools = ["claude", "codex"].filter((t) => opts[t]);
  if (!tools.length) {
    tools = opts.project ? ["claude", "codex"]
      : ["claude", "codex"].filter((t) => fs.existsSync(t === "claude" ? path.join(home, ".claude") : codexHome));
    if (!tools.length) tools = ["claude"];
  }
  return tools.map((tool) => ({ tool, dir: path.join(base[tool], SKILL) }));
}

function mcp() {
  console.log(`Playwright MCP gives the agent live browser tools (navigate, click, hover, screenshot).
The skill's scripts are still used for anything reported as verified.

Claude Code:
  claude mcp add playwright -- npx @playwright/mcp@latest

Codex (~/.codex/config.toml):
  [mcp_servers.playwright]
  command = "npx"
  args = ["@playwright/mcp@latest"]
`);
  return 0;
}

async function doctor(opts) {
  const ok = (m) => console.log(`✓ ${m}`), bad = (m) => console.log(`✗ ${m}`);
  const major = Number(process.versions.node.split(".")[0]);
  (major >= 20 ? ok : bad)(`Node ${process.versions.node} (needs ≥ 20)`);
  let found = false;
  const checks = opts.dir ? targets(opts) : targets({ claude: true, codex: true, project: opts.project });
  for (const { tool, dir } of checks) {
    if (!fs.existsSync(path.join(dir, "SKILL.md"))) { console.log(`· ${tool}: not installed (${dir})`); continue; }
    found = true;
    ok(`${tool}: installed at ${dir}`);
    const pw = path.join(dir, "node_modules", "playwright");
    if (!fs.existsSync(pw)) { console.log(`· ${tool}: Playwright not installed next to the skill`); continue; }
    try {
      const { chromium } = await import(pathToFileURL(path.join(pw, "index.mjs")).href);
      const b = await chromium.launch();
      ok(`${tool}: Chromium ${b.version()} launches`);
      await b.close();
    } catch (e) {
      bad(`${tool}: Chromium did not launch: ${e.message.split("\n")[0]}`);
    }
  }
  if (!found) console.log(`Use the temporary skill with: ${USE}`);
  return 0;
}

function uninstall(opts) {
  for (const { tool, dir } of targets(opts)) {
    if (fs.existsSync(dir)) { fs.rmSync(dir, { recursive: true, force: true }); console.log(`✓ removed ${tool}: ${dir}`); }
  }
  console.log("Your research and preferences in ~/.game-ui-frontend were left in place.");
  return 0;
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  const opts = parse(rest);
  switch (command) {
    case "install": case "browser":
      console.error(`Run ${USE} and paste the printed prompt into your coding agent.`);
      return 1;
    case "mcp": return mcp();
    case "doctor": return doctor(opts);
    case "uninstall": return uninstall(opts);
    case "library": case "audit": case "verify": case "capture":
      return spawnSync(process.execPath, [path.join(SOURCE, "scripts", `${command}.mjs`), ...rest], { stdio: "inherit" }).status ?? 1;
    default:
      console.log(HELP);
      return command && command !== "help" && command !== "--help" ? 1 : 0;
  }
}

main().then((code) => { process.exitCode = code; }).catch((e) => { console.error(e.message); process.exitCode = 1; });
