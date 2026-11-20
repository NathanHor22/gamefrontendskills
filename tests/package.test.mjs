// Portable skill contents, manifests, and the documentation agents read.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { Library, checkDocs, loadVocabulary, stats } from "../skills/game-ui-frontend/scripts/library.mjs";

const ROOT = path.resolve(".");
const SKILL = path.join(ROOT, "skills", "game-ui-frontend");

test("SKILL.md frontmatter is valid for Claude Code and Codex", () => {
  const text = fs.readFileSync(path.join(SKILL, "SKILL.md"), "utf8");
  const fm = /^---\n([\s\S]*?)\n---\n/.exec(text.replace(/\r\n/g, "\n"));
  assert.ok(fm, "frontmatter block");
  const name = /^name: (.+)$/m.exec(fm[1])?.[1];
  const description = /^description: (.+)$/m.exec(fm[1])?.[1];
  assert.equal(name, "game-ui-frontend");
  assert.equal(path.basename(SKILL), name, "directory name matches skill name");
  assert.ok(description && description.length > 100 && description.length <= 1024);
  assert.ok(text.split("\n").length < 200, "SKILL.md stays a short router");
});

test("manifests agree on name and version", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
  const plugin = JSON.parse(fs.readFileSync(path.join(ROOT, ".claude-plugin", "plugin.json"), "utf8"));
  const market = JSON.parse(fs.readFileSync(path.join(ROOT, ".claude-plugin", "marketplace.json"), "utf8"));
  assert.equal(plugin.name, "game-ui-frontend");
  assert.equal(plugin.version, pkg.version);
  assert.equal(market.plugins[0].name, plugin.name);
  assert.match(fs.readFileSync(path.join(SKILL, "agents", "openai.yaml"), "utf8"), /\$game-ui-frontend/);
});

test("doc links, evidence ids and the generated catalog are valid", () => {
  const lib = new Library({
    bundled: [...JSON.parse(fs.readFileSync(path.join(SKILL, "data", "games.json"))), ...JSON.parse(fs.readFileSync(path.join(SKILL, "data", "patterns.json")))],
    user: [], vocab: loadVocabulary(path.join(SKILL, "data")),
  });
  assert.deepEqual(checkDocs(lib), []);
});

test("README coverage numbers match the library", () => {
  const lib = new Library({
    bundled: [...JSON.parse(fs.readFileSync(path.join(SKILL, "data", "games.json"))), ...JSON.parse(fs.readFileSync(path.join(SKILL, "data", "patterns.json")))],
    user: [], vocab: loadVocabulary(path.join(SKILL, "data")),
  });
  const s = stats(lib);
  const readme = fs.readFileSync(path.join(ROOT, "README.md"), "utf8").replace(/\s+/g, " ");
  for (const [n, label] of [[s.games, "game/edition profiles"], [s.visual_observations, "visual observations"],
    [s.reviewed_image_sources, "reviewed images"], [s.reviewed_video_sources, "video sources"], [s.original_web_patterns, "original web interaction patterns"]]) {
    assert.ok(readme.includes(`${n} ${label}`), `README should say "${n} ${label}"`);
  }
});

test("the evidence check catches an unknown id", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "guf-docs-"));
  fs.mkdirSync(path.join(dir, "references", "research"), { recursive: true });
  fs.writeFileSync(path.join(dir, "bad.md"), "Evidence: `not-a-real-observation`\n[gone](missing.md)\n");
  const lib = new Library({ bundled: [], user: [], vocab: loadVocabulary(path.join(SKILL, "data")) });
  const errors = checkDocs(lib, dir);
  assert.ok(errors.some((e) => e.includes("not-a-real-observation")));
  assert.ok(errors.some((e) => e.includes("missing.md")));
});

test("previous setup commands point to skills.sh without writing to the website", () => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), "guf-website-"));
  fs.writeFileSync(path.join(project, "index.html"), "<title>Studio</title>");
  for (const command of ["install", "browser"]) {
    const r = spawnSync(process.execPath, [path.join(ROOT, "bin", "cli.mjs"), command, "--project"], { cwd: project, encoding: "utf8" });
    assert.equal(r.status, 1);
    const launcher = process.platform === "win32" ? "npx.cmd" : "npx";
    assert.ok(r.stderr.includes(`${launcher} skills@latest use NathanHor22/gamefrontendskills@game-ui-frontend`), r.stderr);
  }
  assert.deepEqual(fs.readdirSync(project), ["index.html"]);
  assert.equal(fs.readFileSync(path.join(project, "index.html"), "utf8"), "<title>Studio</title>");
});

test("one portable skill provides the research and three roles outside the website", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "guf-session-"));
  const project = path.join(temp, "website");
  const bundle = path.join(temp, "bundle");
  fs.mkdirSync(project);
  fs.cpSync(SKILL, bundle, { recursive: true, filter: (file) => path.basename(file) !== "node_modules" });
  const entry = fs.readFileSync(path.join(bundle, "SKILL.md"), "utf8");
  for (const role of ["game-design-philosopher", "gameplay-web-designer", "game-design-critic"]) {
    const profile = `agents/${role}.md`;
    assert.ok(entry.includes(profile) && fs.existsSync(path.join(bundle, profile)), role);
  }
  const r = spawnSync(process.execPath, [path.join(bundle, "scripts", "library.mjs"), "search", "--screen", "title"], {
    cwd: project, encoding: "utf8", env: { ...process.env, GAME_UI_FRONTEND_HOME: path.join(temp, "user") },
  });
  assert.equal(r.status, 0, r.stderr);
  assert.ok(JSON.parse(r.stdout).length >= 2);
  assert.deepEqual(fs.readdirSync(project), []);
});
