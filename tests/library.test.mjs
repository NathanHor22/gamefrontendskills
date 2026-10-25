// Behaviour of the offline library: no network, no files outside temp dirs.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import {
  Library, applyEntries, check, loadVocabulary, main, normalize, resolve, retraction, search, show, similarity, stats,
} from "../skills/game-ui-frontend/scripts/library.mjs";

const vocab = loadVocabulary();
const TODAY = "2026-10-25";

const game = () => ({
  kind: "game", id: "persona-3-reload", title: "Persona 3 Reload", aliases: ["p3r"], genres: ["RPG"],
  visual_tags: ["blue", "diagonal"],
  sources: [{ id: "menu", url: "https://example.com/menu.png", type: "screenshot", visually_inspected: true,
    inspection: { method: "browser_view", on: TODAY } }],
  observations: [{ id: "p3r-menu", source_id: "menu", screen: "main_menu", evidence_level: "static_image",
    confidence: "high", observed: "A blue list with a white selected row.", website_translation: "Angular portfolio navigation" }],
});

const lib = (user = [], bundled = [game()], preferences = {}) => new Library({ bundled, user, vocab, preferences });

test("normalize handles typography and diacritics", () => {
  assert.equal(normalize("Marvel’s Spider-Man"), "marvel s spider man");
  assert.equal(normalize("Tōkon"), "tokon");
  assert.equal(normalize("--- !!!"), "");
});

test("similarity matches difflib ratio on known pairs", () => {
  assert.equal(similarity("abcd", "bcde"), 0.75);
  assert.equal(similarity("", ""), 1);
  assert.equal(similarity("abc", "xyz"), 0);
});

test("saved user resolution beats title similarity", () => {
  const l = lib([], [game(), { kind: "game", id: "persona-4-golden", title: "Persona 4 Golden" }],
    { title_resolutions: { "persona 3 golden": "persona-3-reload" } });
  const [first] = resolve(l, "persona 3 golden");
  assert.equal(first.id, "persona-3-reload");
  assert.equal(first.match, "saved_user_preference");
});

test("aliases resolve typos; unrelated short names don't", () => {
  const l = lib([], [game(), { kind: "game", id: "yakuza-0", title: "Yakuza 0", aliases: ["yakuzo 0"] },
    { kind: "game", id: "sifu", title: "Sifu" }]);
  assert.equal(resolve(l, "yakuzo 0", 1)[0].id, "yakuza-0");
  assert.ok(!resolve(l, "tekken").some((r) => r.id === "sifu"));
  for (const q of ["", "  ", "--- !!!"]) assert.deepEqual(resolve(l, q), []);
});

test("family queries list editions, and an exact title outranks them", () => {
  const fh = [
    { kind: "game", id: "forza-horizon-4", title: "Forza Horizon 4", family_queries: ["forza horizon"] },
    { kind: "game", id: "forza-horizon-5", title: "Forza Horizon 5", family_queries: ["forza horizon"] },
  ];
  let found = resolve(lib([], fh), "forza horizon");
  assert.deepEqual(new Set(found.map((r) => r.id)), new Set(["forza-horizon-4", "forza-horizon-5"]));
  assert.ok(found.every((r) => r.match === "family_query_candidate"));
  found = resolve(lib([], [...fh, { kind: "game", id: "forza-horizon", title: "Forza Horizon" }]), "forza horizon", 1);
  assert.equal(found[0].id, "forza-horizon");
});

test("unicode titles resolve", () => {
  const l = lib([], [{ kind: "game", id: "japanese", title: "ペルソナ" }, { kind: "game", id: "korean", title: "페르소나" }]);
  assert.equal(resolve(l, "ペルソナ", 1)[0].id, "japanese");
  assert.equal(resolve(l, "페르소나", 1)[0].id, "korean");
});

test("search is observation-level with screen filters", () => {
  const l = lib([{ kind: "pattern", id: "diagonal-index", title: "Diagonal index", tags: ["navigation"], proposal: "Slanted panels around native links for a portfolio." }]);
  const hits = search(l, "portfolio");
  assert.deepEqual(new Set(hits.map((h) => h.kind)), new Set(["observation", "pattern"]));
  assert.equal(search(l, "", { screen: "main_menu" })[0].id, "p3r-menu");
  assert.deepEqual(search(l, "", { screen: "title" }), []);
  assert.deepEqual(search(l, ""), []);
  assert.ok(Array.isArray(search(l, 'blue " OR NOT ) * ; --')));
});

test("show finds games, patterns and observations by id", () => {
  const l = lib();
  assert.equal(show(l, "persona-3-reload")[0].kind, "game");
  const [obs] = show(l, "p3r-menu");
  assert.equal(obs.kind, "observation");
  assert.equal(obs.game, "persona-3-reload");
  assert.equal(obs.source.id, "menu");
  assert.deepEqual(show(l, "missing"), []);
});

test("stage validates the whole batch and returns nothing on failure", () => {
  const l = lib();
  assert.throws(() => l.stage([
    { kind: "game", id: "first-valid", title: "First valid" },
    { kind: "game", id: "second", title: "Second", sources: [{ id: "bad", url: "file:///secrets", type: "screenshot" }] },
  ]), /http/);
  assert.equal(l.user.length, 0);
});

test("visual claims need an inspected source with a recorded method", () => {
  const l = lib();
  const base = { kind: "game", id: "unseen", title: "Unseen" };
  const src = { id: "page", url: "https://example.com", type: "official_page" };
  const obs = { id: "unseen-obs", source_id: "page", screen: "title", evidence_level: "static_image", confidence: "high", observed: "A claim" };
  assert.throws(() => l.stage([{ ...base, sources: [{ ...src, visually_inspected: false }], observations: [obs] }]), /visually inspected/);
  assert.throws(() => l.stage([{ ...base, sources: [{ ...src, visually_inspected: true, inspection: { method: "unrecorded", on: TODAY } }], observations: [obs] }]), /record how/);
  assert.throws(() => l.stage([{ ...base, sources: [{ ...src, visually_inspected: true, inspection: { method: "image_fetched", on: TODAY } }], observations: [obs] }]), /sha256/);
  const ok = l.stage([{ ...base, sources: [{ ...src, visually_inspected: true, inspection: { method: "browser_view", on: TODAY } }], observations: [obs] }]);
  assert.equal(ok.length, 1);
});

test("vocabulary is enforced", () => {
  const l = lib();
  const bad = (o) => ({ kind: "game", id: "x-game", title: "X", sources: [{ id: "s", url: "https://e.com/x.png", type: "screenshot", visually_inspected: true, inspection: { method: "browser_view", on: TODAY } }],
    observations: [{ id: "x-obs", source_id: "s", screen: "title", evidence_level: "static_image", confidence: "high", observed: "x", ...o }] });
  assert.throws(() => l.stage([bad({ screen: "splash" })]), /screen "splash"/);
  assert.throws(() => l.stage([bad({ confidence: "very high" })]), /confidence/);
  assert.throws(() => l.stage([bad({ evidence_level: "video_frames" })]), /media_positions/);
  assert.throws(() => l.stage([bad({ evidence_level: "documented_text" })]), /documented_text/);
});

test("ids are unique across games, patterns and observations", () => {
  const l = lib();
  assert.throws(() => l.stage([{ kind: "pattern", id: "p3r-menu", title: "Clash", proposal: "x" }]), /used twice/);
  assert.throws(() => l.stage([{ kind: "game", id: "dup", title: "Dup", sources: [{ id: "a", url: "https://e.com/a", type: "official_page" }, { id: "a", url: "https://e.com/b", type: "official_page" }] }]), /duplicate sources/);
});

test("partial updates merge; re-import is idempotent", () => {
  const entries = [{ kind: "game", id: "persona-3-reload", title: "Persona 3 Reload", aliases: ["persona3"] }];
  const l = lib(entries);
  const [record] = l.games();
  assert.equal(record.observations.length, 1);
  assert.deepEqual(new Set(record.aliases), new Set(["p3r", "persona3"]));
  const twice = lib([...entries, ...entries]);
  assert.equal(stats(twice).visual_observations, 1);
  assert.equal(search(twice, "blue").filter((h) => h.kind === "observation").length, 1);
});

test("retraction removes bundled data without editing it", () => {
  const base = lib();
  const r = retraction(base, "persona-3-reload", { observation: "p3r-menu" });
  const after = lib([r]);
  assert.equal(after.games()[0].observations.length, 0);
  assert.equal(base.bundled[0].observations.length, 1);
  const gone = lib([retraction(base, "persona-3-reload", { record: true })]);
  assert.equal(gone.games().length, 0);
  assert.throws(() => retraction(base, "persona-3-reload", {}), /Name what/);
  const srcGone = applyEntries([game()], [{ kind: "game", id: "persona-3-reload", retract: { sources: ["menu"] } }]);
  assert.equal(srcGone[0].observations.length, 0, "observations of a retracted source go with it");
});

test("patterns don't count as game study", () => {
  const s = stats(lib([{ kind: "pattern", id: "diagonal-index", title: "Diagonal index", proposal: "x" }]));
  assert.equal(s.games, 1);
  assert.equal(s.games_with_visual_study, 1);
  assert.equal(s.original_web_patterns, 1);
  assert.equal(s.observations_by_screen.main_menu, 1);
});

test("CLI import writes only to the user store and survives a fresh open", async () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "guf-"));
  const p = { skill: path.resolve("skills/game-ui-frontend"), data: path.resolve("skills/game-ui-frontend/data"), home, store: path.join(home, "library.json"), preferences: path.join(home, "preferences.json") };
  const file = path.join(home, "in.json");
  fs.writeFileSync(file, JSON.stringify([{ kind: "game", id: "new-reference", title: "New Reference" }]));
  const out = [];
  const write = process.stdout.write;
  process.stdout.write = (s) => { out.push(s); return true; };
  try {
    assert.equal(await main(["import", "--file", file], p), 0);
    assert.equal(await main(["stats"], p), 0);
  } finally {
    process.stdout.write = write;
  }
  const s = JSON.parse(out.at(-1));
  assert.equal(s.user_added_records, 1);
  assert.ok(fs.existsSync(p.store));
  const reopened = Library.open(p);
  assert.ok(reopened.games().some((g) => g.id === "new-reference"));
  assert.ok(reopened.games().length > 40, "bundled research is still present");
});

test("the bundled library passes its own check", () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "guf-"));
  const p = { skill: path.resolve("skills/game-ui-frontend"), data: path.resolve("skills/game-ui-frontend/data"), home, store: path.join(home, "library.json"), preferences: path.join(home, "preferences.json") };
  const result = check(Library.open(p));
  assert.deepEqual(result.errors, []);
});
