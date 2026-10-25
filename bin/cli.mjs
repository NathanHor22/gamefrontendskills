#!/usr/bin/env node
// Installer and launcher for the game-ui-frontend skill (Claude Code and Codex).
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKILL = "game-ui-frontend";
const SOURCE = path.join(PKG_ROOT, "skills", SKILL);
const BROWSER_DEPS = ["playwright@1.56.1", "axe-core@4.10.3"];

const HELP = `game-ui-frontend: game interface research for website UI

Usage: npx game-ui-frontend <command> [options]

  install [--claude] [--codex] [--project] [--dir <path>]
        Copy the skill into Claude Code (~/.claude/skills) and/or Codex (~/.codex/skills).
        With no target flag, installs for every tool found on this machine (Claude Code if none).
        --project installs into ./.claude/skills and/or ./.agents/skills of the current project.
  browser [--claude] [--codex] [--project] [--dir <path>]
        Install Playwright + axe-core next to the installed skill and download Chromium.
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

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".DS_Store") continue;
    const src = path.join(from, entry.name), dest = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dest);
    else fs.copyFileSync(src, dest);
  }
}

/** Replaces the skill files but keeps an existing node_modules (browser deps). User data lives elsewhere. */
function install(opts) {
  const results = [];
  for (const { tool, dir } of targets(opts)) {
    if (fs.existsSync(dir)) {
      for (const entry of fs.readdirSync(dir)) {
        if (entry !== "node_modules") fs.rmSync(path.join(dir, entry), { recursive: true, force: true });
      }
    }
    copyDir(SOURCE, dir);
    results.push({ tool, dir });
  }
  for (const r of results) console.log(`✓ installed for ${r.tool}: ${r.dir}`);
  console.log(`
Next:
  • Browser checks (audit/verify/capture):  npx game-ui-frontend browser${opts.project ? " --project" : ""}
  • Optional Playwright MCP for exploring:  npx game-ui-frontend mcp
  • Then ask your agent, e.g. "Use the game-ui-frontend skill to improve the UI of http://localhost:3000"
Your own research and preferences are stored in ~/.game-ui-frontend and survive reinstalls.`);
  return 0;
}

function run(cmd, args, cwd) {
  // npm is a .cmd shim on Windows and needs a shell; node itself must not get one (paths with spaces).
  const r = spawnSync(cmd, args, { cwd, stdio: "inherit", shell: process.platform === "win32" && cmd === "npm" });
  return r.status ?? 1;
}

function browser(opts) {
  for (const { tool, dir } of targets(opts)) {
    if (!fs.existsSync(path.join(dir, "SKILL.md"))) {
      console.error(`✗ ${tool}: skill not installed at ${dir}; run install first`);
      return 1;
    }
    if (!fs.existsSync(path.join(dir, "package.json"))) {
      fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({ name: `${SKILL}-runtime`, private: true, type: "module" }, null, 2) + "\n");
    }
    console.log(`Installing ${BROWSER_DEPS.join(", ")} into ${dir}`);
    if (run("npm", ["install", "--no-audit", "--no-fund", "--omit=dev", ...BROWSER_DEPS], dir) !== 0) return 1;
  }
  const [first] = targets(opts);
  const cli = path.join(first.dir, "node_modules", "playwright", "cli.js");
  console.log("Downloading Chromium (shared by all installs)…");
  return run(process.execPath, [cli, "install", "chromium"], first.dir);
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
    if (!fs.existsSync(pw)) { console.log(`· ${tool}: Playwright not installed next to the skill (run: npx game-ui-frontend browser)`); continue; }
    try {
      const { chromium } = await import(pathToFileURL(path.join(pw, "index.mjs")).href);
      const b = await chromium.launch();
      ok(`${tool}: Chromium ${b.version()} launches`);
      await b.close();
    } catch (e) {
      bad(`${tool}: Chromium did not launch: ${e.message.split("\n")[0]}`);
    }
  }
  if (!found) bad("no installed copy found; run: npx game-ui-frontend install");
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
    case "install": return install(opts);
    case "browser": return browser(opts);
    case "mcp": return mcp();
    case "doctor": return doctor(opts);
    case "uninstall": return uninstall(opts);
    case "library": case "audit": case "verify": case "capture":
      return run(process.execPath, [path.join(SOURCE, "scripts", `${command}.mjs`), ...rest], process.cwd());
    default:
      console.log(HELP);
      return command && command !== "help" && command !== "--help" ? 1 : 0;
  }
}

main().then((code) => { process.exitCode = code; }).catch((e) => { console.error(e.message); process.exitCode = 1; });
