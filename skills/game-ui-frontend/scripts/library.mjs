#!/usr/bin/env node
// Offline game-UI reference library. Node standard library only.
// Bundled research lives in ../data and is read-only; the user's own additions
// live in GAME_UI_FRONTEND_HOME (default ~/.game-ui-frontend) and are merged on read,
// so reinstalling or upgrading the skill never hides or deletes them.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const SKILL_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function paths(env = process.env) {
  const home = env.GAME_UI_FRONTEND_HOME || path.join(os.homedir(), ".game-ui-frontend");
  return {
    skill: SKILL_ROOT,
    data: path.join(SKILL_ROOT, "data"),
    home,
    store: path.join(home, "library.json"),
    preferences: path.join(home, "preferences.json"),
  };
}

export function normalize(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("en")
    .match(/[\p{L}\p{N}]+/gu)?.join(" ") ?? "";
}

const tokens = (value) => (normalize(value) ? normalize(value).split(" ") : []);

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8").replace(/^﻿/, ""));
}

export function loadRecords(file) {
  const raw = fs.readFileSync(file, "utf8").replace(/^﻿/, "");
  const data = file.toLowerCase().endsWith(".jsonl")
    ? raw.split(/\r?\n/).filter((l) => l.trim()).map((l) => JSON.parse(l))
    : JSON.parse(raw);
  if (!Array.isArray(data) || !data.every((r) => r && typeof r === "object" && !Array.isArray(r))) {
    throw new Error("Import must be a JSON array or JSONL of objects");
  }
  return data;
}

export function loadVocabulary(dir = paths().data) {
  return readJson(path.join(dir, "vocabulary.json"));
}

// ---------- validation ----------

const isText = (v) =>
  (typeof v === "string" && v.trim() !== "") || (Array.isArray(v) && v.some((x) => typeof x === "string" && x.trim()));

/** Throws on the first problem. strict = rules for new imports (bundled legacy data is checked non-strict). */
export function validate(record, vocab, { strict = false } = {}) {
  const where = record?.id ?? "(no id)";
  const fail = (msg) => { throw new Error(`${where}: ${msg}`); };
  for (const f of ["id", "title"]) if (typeof record[f] !== "string" || !record[f].trim()) fail(`missing ${f}`);
  if (!SLUG.test(record.id)) fail(`invalid id "${record.id}"`);
  const kind = record.kind ?? "game";
  if (kind === "pattern") {
    if (!isText(record.proposal)) fail("pattern needs a proposal");
    if (record.tags !== undefined && !(Array.isArray(record.tags) && record.tags.every((t) => typeof t === "string"))) fail("tags must be strings");
    return;
  }
  if (kind !== "game") fail("kind must be game or pattern");
  for (const f of ["aliases", "family_queries", "genres", "visual_tags"]) {
    const v = record[f] ?? [];
    if (!Array.isArray(v) || !v.every((x) => typeof x === "string")) fail(`${f} must be a list of strings`);
  }
  const sources = record.sources ?? [];
  const observations = record.observations ?? [];
  if (!Array.isArray(sources) || !Array.isArray(observations)) fail("sources and observations must be arrays");
  const byId = new Map();
  for (const s of sources) {
    if (!s || typeof s.id !== "string" || !s.id) fail("every source needs a string id");
    if (byId.has(s.id)) fail(`duplicate source id ${s.id}`);
    if (typeof s.url !== "string") fail(`source URL must be a string: ${s.id}`);
    let url;
    try { url = new URL(s.url); } catch { fail(`source URL must be http(s): ${s.id}`); }
    if (!["http:", "https:"].includes(url.protocol)) fail(`source URL must be http(s): ${s.id}`);
    if (!vocab.source_types.includes(s.type)) fail(`source ${s.id} type "${s.type}" not in vocabulary`);
    if (typeof (s.visually_inspected ?? false) !== "boolean") fail("visually_inspected must be a boolean");
    if (s.visually_inspected) {
      const ins = s.inspection;
      if (!ins || !(ins.method in vocab.inspection_methods)) fail(`source ${s.id} needs inspection.method`);
      if (!DATE.test(ins.on ?? "")) fail(`source ${s.id} needs inspection.on (YYYY-MM-DD)`);
      if (strict && ins.method === "unrecorded") fail(`source ${s.id}: new research must record how it was inspected`);
      if (ins.sha256 !== undefined && !/^[0-9a-f]{64}$/.test(ins.sha256)) fail(`source ${s.id}: sha256 must be 64 hex chars`);
      if (strict && ["image_fetched", "user_capture"].includes(ins.method) && !ins.sha256) fail(`source ${s.id}: ${ins.method} needs sha256`);
    }
    byId.set(s.id, s);
  }
  const seen = new Set();
  for (const o of observations) {
    if (!o || typeof o !== "object") fail("observations must be objects");
    if (typeof o.id !== "string" || !SLUG.test(o.id)) fail("every observation needs a slug id");
    if (seen.has(o.id)) fail(`duplicate observation id ${o.id}`);
    seen.add(o.id);
    const src = byId.get(o.source_id);
    if (!src) fail(`observation ${o.id}: source_id must identify an existing source`);
    if (!(o.screen in vocab.screens)) fail(`observation ${o.id}: screen "${o.screen}" not in vocabulary`);
    if (!(o.evidence_level in vocab.evidence_levels)) fail(`observation ${o.id}: unknown evidence_level "${o.evidence_level}"`);
    if (!vocab.confidence.includes(o.confidence)) fail(`observation ${o.id}: confidence must be ${vocab.confidence.join("/")}`);
    if (isText(o.observed) && !src.visually_inspected) fail(`observation ${o.id}: visual observations require a visually inspected source`);
    if (o.evidence_level === "documented_text" && isText(o.observed)) fail(`observation ${o.id}: documented_text cannot carry visual observations`);
    if (o.evidence_level === "video_frames" && !(o.media_positions?.length || o.source_locator)) {
      fail(`observation ${o.id}: video_frames needs media_positions or source_locator`);
    }
  }
}

// ---------- merging ----------

function keyedMerge(oldItems = [], newItems = [], field) {
  const merged = new Map();
  for (const item of [...oldItems, ...newItems]) {
    if (!item?.id) throw new Error(`each ${field} item needs an id`);
    merged.set(item.id, { ...item });
  }
  return [...merged.values()];
}

export function mergeRecord(old, incoming) {
  const merged = { ...old, ...incoming };
  delete merged.retract;
  merged.kind ??= "game";
  if (merged.kind === "game") {
    for (const f of ["aliases", "family_queries", "genres", "visual_tags"]) {
      merged[f] = [...new Set([...(old[f] ?? []), ...(incoming[f] ?? [])])];
    }
    for (const f of ["sources", "observations"]) merged[f] = keyedMerge(old[f], incoming[f], f);
  }
  const r = incoming.retract;
  if (r) {
    for (const f of ["aliases", "family_queries", "genres", "visual_tags"]) {
      if (r[f]) merged[f] = (merged[f] ?? []).filter((x) => !r[f].includes(x));
    }
    if (r.observations) merged.observations = merged.observations.filter((o) => !r.observations.includes(o.id));
    if (r.sources) {
      merged.sources = merged.sources.filter((s) => !r.sources.includes(s.id));
      merged.observations = merged.observations.filter((o) => !r.sources.includes(o.source_id));
    }
  }
  return merged;
}

const key = (r) => `${r.kind ?? "game"}:${r.id}`;

/** Applies a list of user entries (records, partial updates, retractions) on top of base records. */
export function applyEntries(base, entries) {
  const map = new Map(base.map((r) => [key(r), r]));
  for (const entry of entries) {
    const k = key(entry);
    if (entry.retracted) { map.delete(k); continue; }
    map.set(k, mergeRecord(map.get(k) ?? {}, entry));
  }
  return [...map.values()];
}

// ---------- library ----------

export class Library {
  constructor({ bundled = [], user = [], vocab, preferences = {} }) {
    this.vocab = vocab;
    this.preferences = preferences;
    this.bundled = bundled;
    this.user = user;
    this.records = applyEntries(bundled, user).sort((a, b) => key(a).localeCompare(key(b)));
    this.userIds = new Set(user.map(key));
    this.index = buildIndex(this.records);
  }

  static open(p = paths()) {
    const bundled = [...loadRecords(path.join(p.data, "games.json")), ...loadRecords(path.join(p.data, "patterns.json"))];
    const user = fs.existsSync(p.store) ? loadRecords(p.store) : [];
    return new Library({ bundled, user, vocab: loadVocabulary(p.data), preferences: loadPreferences(p) });
  }

  games() { return this.records.filter((r) => (r.kind ?? "game") === "game"); }
  patterns() { return this.records.filter((r) => r.kind === "pattern"); }

  /** Validates a batch against the merged library and returns the new user-store entries. Nothing is written. */
  stage(entries) {
    const pending = [...this.user];
    const touched = new Set();
    for (const entry of entries) {
      if (entry.kind && !["game", "pattern"].includes(entry.kind)) throw new Error("kind must be game or pattern");
      if (typeof entry.id !== "string") throw new Error("every entry needs a string id");
      for (const f of ["sources", "observations"]) {
        const ids = (entry[f] ?? []).map((x) => x?.id);
        if (new Set(ids).size !== ids.length) throw new Error(`${entry.id}: duplicate ${f} id in one entry`);
      }
      pending.push(entry);
      touched.add(key(entry));
    }
    const merged = applyEntries(this.bundled, pending);
    for (const r of merged) if (touched.has(key(r))) validate(r, this.vocab, { strict: true });
    assertUniqueIds(merged);
    return pending;
  }
}

function assertUniqueIds(records) {
  // Game, pattern and observation ids share one namespace so `show <id>` is unambiguous.
  const seen = new Map();
  for (const r of records) {
    for (const id of [r.id, ...(r.observations ?? []).map((o) => o.id)]) {
      if (seen.has(id)) throw new Error(`id "${id}" is used twice (${seen.get(id)} and ${key(r)})`);
      seen.set(id, key(r));
    }
  }
}

export function loadPreferences(p = paths()) {
  const merge = (base, over) => {
    const out = { ...base };
    for (const [k, v] of Object.entries(over)) {
      out[k] = v && typeof v === "object" && !Array.isArray(v) && typeof out[k] === "object" && !Array.isArray(out[k])
        ? merge(out[k], v) : v;
    }
    return out;
  };
  let prefs = {};
  for (const file of [path.join(p.data, "preferences.json"), path.join(p.data, "preferences.local.json"), p.preferences]) {
    const value = readJson(file, null);
    if (value === null) continue;
    if (typeof value !== "object" || Array.isArray(value)) throw new Error(`${file} must contain a JSON object`);
    prefs = merge(prefs, value);
  }
  const res = prefs.title_resolutions ?? {};
  if (typeof res !== "object" || !Object.values(res).every((v) => typeof v === "string")) {
    throw new Error("title_resolutions must map names to game ids");
  }
  return prefs;
}

// ---------- search ----------

function docText(...parts) {
  return parts.flat(Infinity).filter((x) => typeof x === "string").join(" \n ");
}

function buildIndex(records) {
  const docs = [];
  for (const r of records) {
    if (r.kind === "pattern") {
      docs.push({
        kind: "pattern", id: r.id, title: r.title, screen: null, genres: [],
        text: docText(r.proposal, r.fits, r.implementation, Object.values(r.motion_spec ?? {})),
        boost: docText(r.title, r.tags),
      });
      continue;
    }
    docs.push({
      kind: "game", id: r.id, title: r.title, screen: null, genres: r.genres ?? [],
      text: docText(r.build_notes, r.edition, r.edition_notes, r.coverage, r.research_status),
      boost: docText(r.title, r.aliases, r.visual_tags, r.franchise),
    });
    for (const o of r.observations ?? []) {
      docs.push({
        kind: "observation", id: o.id, game: r.id, title: `${r.title} — ${o.screen_label ?? o.screen}`,
        screen: o.screen, genres: r.genres ?? [], evidence: o.evidence_level, confidence: o.confidence,
        text: docText(o.observed, o.inferred, o.website_translation, o.motion_study ? JSON.stringify(o.motion_study) : []),
        boost: docText(r.title, o.screen_label, r.visual_tags),
      });
    }
  }
  const df = new Map();
  let totalLen = 0;
  for (const d of docs) {
    d.tf = new Map();
    const all = [...tokens(d.text), ...tokens(d.boost), ...tokens(d.boost), ...tokens(d.boost)];
    for (const t of all) d.tf.set(t, (d.tf.get(t) ?? 0) + 1);
    d.len = all.length;
    totalLen += d.len;
    for (const t of d.tf.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  }
  return { docs, df, avgLen: totalLen / Math.max(docs.length, 1) };
}

function snippet(text, terms, width = 220) {
  const flat = text.replace(/\s+/g, " ").trim();
  const lower = normalize(flat);
  let at = -1;
  for (const t of terms) {
    const m = new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).exec(lower);
    if (m && (at < 0 || m.index < at)) at = m.index;
  }
  // normalize() can shift offsets slightly; this is only a preview window.
  const start = Math.max(0, at - width / 3);
  const out = flat.slice(start, start + width);
  return (start > 0 ? "…" : "") + out + (start + width < flat.length ? "…" : "");
}

export function search(lib, query, { screen, genre, kind, evidence, game, limit = 8 } = {}) {
  const terms = [...new Set(tokens(query))];
  const filtersOn = screen || genre || kind || evidence || game;
  if (!terms.length && !filtersOn) return [];
  const { docs, df, avgLen } = lib.index;
  const N = docs.length;
  const g = genre && normalize(genre);
  const hits = [];
  for (const d of docs) {
    if (screen && d.screen !== screen) continue;
    if (kind && d.kind !== kind) continue;
    if (evidence && d.evidence !== evidence) continue;
    if (game && d.game !== game && d.id !== game) continue;
    if (g && !d.genres.some((x) => normalize(x).includes(g))) continue;
    let score = 0;
    let matched = 0;
    for (const t of terms) {
      const f = d.tf.get(t);
      if (!f) continue;
      matched += 1;
      const idf = Math.log(1 + (N - df.get(t) + 0.5) / (df.get(t) + 0.5));
      score += idf * (f * 2.2) / (f + 1.2 * (0.25 + 0.75 * d.len / avgLen));
    }
    if (terms.length && score === 0) continue;
    // Prefer documents that contain every query word over ones repeating a single word.
    if (terms.length) score *= 0.4 + 0.6 * (matched / terms.length) ** 2;
    hits.push({ d, score });
  }
  hits.sort((a, b) => b.score - a.score || a.d.title.localeCompare(b.d.title));
  return hits.slice(0, limit).map(({ d, score }) => ({
    kind: d.kind, id: d.id, ...(d.game ? { game: d.game } : {}), title: d.title,
    ...(d.screen ? { screen: d.screen, evidence: d.evidence, confidence: d.confidence } : {}),
    score: Math.round(score * 100) / 100,
    excerpt: snippet(d.text || d.boost, terms),
    user_added: lib.userIds.has(`${d.kind === "pattern" ? "pattern" : "game"}:${d.game ?? d.id}`),
  }));
}

// ---------- title resolution ----------

/** Ratcliff/Obershelp similarity (same definition as Python's difflib ratio). */
export function similarity(a, b) {
  if (!a.length && !b.length) return 1;
  const matches = (s1, s2) => {
    if (!s1.length || !s2.length) return 0;
    let best = 0, i1 = 0, i2 = 0;
    const prev = new Array(s2.length + 1).fill(0);
    for (let i = 1; i <= s1.length; i++) {
      let diag = 0;
      for (let j = 1; j <= s2.length; j++) {
        const tmp = prev[j];
        prev[j] = s1[i - 1] === s2[j - 1] ? diag + 1 : 0;
        if (prev[j] > best) { best = prev[j]; i1 = i - best; i2 = j - best; }
        diag = tmp;
      }
    }
    if (!best) return 0;
    return best + matches(s1.slice(0, i1), s2.slice(0, i2)) + matches(s1.slice(i1 + best), s2.slice(i2 + best));
  };
  return (2 * matches(a, b)) / (a.length + b.length);
}

const evidenceSummary = (game) => {
  const obs = game.observations ?? [];
  return {
    sources: (game.sources ?? []).length,
    visual_observations: obs.filter((o) => isText(o.observed)).length,
    screens: [...new Set(obs.map((o) => o.screen))],
  };
};

export function resolve(lib, query, limit = 6) {
  const q = normalize(query);
  if (!q) return [];
  const resolutions = lib.preferences.title_resolutions ?? {};
  const preferred = Object.entries(resolutions).find(([k]) => normalize(k) === q)?.[1];
  let found = [];
  for (const game of lib.games()) {
    const labels = [game.title, game.id, ...(game.aliases ?? [])];
    let [best, label] = labels.map((x) => [similarity(q, normalize(x)), x]).sort((a, b) => b[0] - a[0])[0];
    let match = "fuzzy_candidate";
    const family = (game.family_queries ?? []).find((x) => normalize(x) === q);
    if (preferred === game.id) [best, match] = [1.1, "saved_user_preference"];
    else if (labels.some((x) => normalize(x) === q)) [best, match] = [1, "exact_title_or_alias"];
    else if (family) [best, match, label] = [0.95, "family_query_candidate", family];
    else if (labels.some((x) => normalize(x).includes(q))) [best, match] = [Math.max(best, 0.82), "partial_title_candidate"];
    if (best >= 0.55) {
      found.push({ id: game.id, title: game.title, score: Math.round(best * 1000) / 1000, match, matched_label: label, evidence: evidenceSummary(game) });
    }
  }
  if (found.some((r) => r.match === "family_query_candidate")) {
    found = found.filter((r) => ["family_query_candidate", "exact_title_or_alias", "saved_user_preference"].includes(r.match));
  }
  return found.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, limit);
}

// ---------- show / stats / check ----------

export function show(lib, id) {
  const out = [];
  for (const r of lib.records) {
    if (r.id === id) out.push(r);
    const o = (r.observations ?? []).find((x) => x.id === id);
    if (o) {
      out.push({
        kind: "observation", game: r.id, game_title: r.title, ...o,
        source: (r.sources ?? []).find((s) => s.id === o.source_id),
      });
    }
  }
  return out;
}

export function stats(lib) {
  const games = lib.games();
  const obs = games.flatMap((g) => g.observations ?? []);
  const visual = obs.filter((o) => isText(o.observed));
  const sources = games.flatMap((g) => g.sources ?? []);
  const inspected = sources.filter((s) => s.visually_inspected);
  const uniq = (list) => new Set(list.map((s) => s.url)).size;
  const screens = Object.fromEntries(Object.keys(lib.vocab.screens).map((s) => [s, 0]));
  for (const o of visual) screens[o.screen] += 1;
  const methods = {};
  for (const s of inspected) methods[s.inspection?.method] = (methods[s.inspection?.method] ?? 0) + 1;
  const motion = visual.filter((o) => ["video_frames", "live_interaction"].includes(o.evidence_level)
    && Array.isArray(o.motion_study?.states_observed) && o.motion_study.states_observed.length >= 2);
  return {
    games: games.length,
    games_with_visual_study: games.filter((g) => (g.observations ?? []).some((o) => isText(o.observed))).length,
    games_identity_only: games.filter((g) => !(g.observations ?? []).some((o) => isText(o.observed))).map((g) => g.id),
    visual_observations: visual.length,
    observations_by_screen: screens,
    reviewed_image_sources: uniq(inspected.filter((s) => ["screenshot", "design_reference"].includes(s.type))),
    reviewed_video_sources: uniq(inspected.filter((s) => s.type === "video")),
    inspection_methods: methods,
    motion_sequence_observations: motion.length,
    original_web_patterns: lib.patterns().length,
    user_added_records: lib.user.length,
    scope: "Selected, sourced research. Not an exhaustive catalogue.",
  };
}

/** Integrity check over the merged library plus the skill's own documents. */
export function check(lib, { docs = true } = {}) {
  const errors = [];
  const warnings = [];
  for (const r of lib.records) {
    try {
      validate(r, lib.vocab, { strict: lib.userIds.has(key(r)) && !lib.bundled.some((b) => key(b) === key(r)) });
    } catch (e) { errors.push(e.message); }
  }
  try { assertUniqueIds(lib.records); } catch (e) { errors.push(e.message); }
  const s = stats(lib);
  if (s.inspection_methods.unrecorded) warnings.push(`${s.inspection_methods.unrecorded} inspected sources have no recorded inspection method (legacy seed data)`);
  if (s.games_identity_only.length) warnings.push(`identity-only games without visual study: ${s.games_identity_only.join(", ")}`);
  const thin = Object.entries(s.observations_by_screen).filter(([k, n]) => n < 3 && k !== "atmosphere").map(([k, n]) => `${k} (${n})`);
  if (thin.length) warnings.push(`screen types with fewer than 3 observations: ${thin.join(", ")}`);
  if (docs) errors.push(...checkDocs(lib));
  return { ok: errors.length === 0, errors, warnings, records_checked: lib.records.length };
}

function walk(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === "node_modules" ? [] : walk(p, ext);
    return p.endsWith(ext) ? [p] : [];
  });
}

export function checkDocs(lib, root = SKILL_ROOT) {
  const errors = [];
  const ids = new Set(lib.records.flatMap((r) => [r.id, ...(r.observations ?? []).map((o) => o.id)]));
  for (const file of walk(root, ".md")) {
    const text = fs.readFileSync(file, "utf8");
    const rel = path.relative(root, file).split(path.sep).join("/");
    for (const m of text.matchAll(/\]\(([^)\s#]+)(?:#[^)]*)?\)/g)) {
      const target = m[1];
      if (/^[a-z]+:/i.test(target)) continue;
      if (!fs.existsSync(path.resolve(path.dirname(file), decodeURI(target)))) errors.push(`${rel}: broken link ${target}`);
    }
    for (const line of text.split("\n").filter((l) => /^\s*(?:[-*]\s+)?\*{0,2}Evidence:?\*{0,2}:?/.test(l))) {
      for (const m of line.matchAll(/`([a-z0-9]+(?:-[a-z0-9]+)+)`/g)) {
        if (!ids.has(m[1])) errors.push(`${rel}: evidence id \`${m[1]}\` is not in the library`);
      }
    }
  }
  const catalog = path.join(root, "references", "research", "catalog.md");
  const bundledOnly = new Library({ bundled: lib.bundled, user: [], vocab: lib.vocab, preferences: lib.preferences });
  if (!fs.existsSync(catalog) || fs.readFileSync(catalog, "utf8") !== renderCatalog(bundledOnly)) {
    errors.push("references/research/catalog.md is stale; run: node scripts/library.mjs docs --write");
  }
  return errors;
}

// ---------- generated catalog ----------

const mdEscape = (s) => String(s).replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();

export function renderCatalog(lib) {
  const s = stats(lib);
  const screens = lib.vocab.screens;
  const games = lib.games();
  const lines = [
    "# Research catalog",
    "",
    "<!-- Generated by `node scripts/library.mjs docs --write`. Do not edit by hand. -->",
    "",
    `${s.games} game/edition profiles, ${s.games_with_visual_study} with visual study, ${s.visual_observations} visual observations, ${s.reviewed_image_sources} reviewed image sources, ${s.reviewed_video_sources} reviewed video sources, ${s.original_web_patterns} original web patterns. Selected research, not an exhaustive catalogue.`,
    "",
    "Use `node scripts/library.mjs show <id>` for any id below.",
    "",
    "## By screen type",
    "",
    "| Screen | Website equivalent | Observations |",
    "| --- | --- | --- |",
  ];
  for (const [id, v] of Object.entries(screens)) {
    const list = games.flatMap((g) => (g.observations ?? []).filter((o) => o.screen === id && isText(o.observed)).map((o) => `\`${o.id}\``));
    lines.push(`| \`${id}\` ${v.label} | ${v.web} | ${list.length ? list.join(", ") : "— gap —"} |`);
  }
  lines.push("", "## By game", "");
  for (const g of games) {
    lines.push(`### ${g.title}`, "", `\`${g.id}\`${g.genres?.length ? ` · ${g.genres.join(", ")}` : ""}`, "");
    const note = g.build_notes ?? g.edition_notes ?? g.coverage ?? g.research_status;
    if (note) lines.push(`> ${mdEscape(note)}`, "");
    const obs = g.observations ?? [];
    if (obs.length) {
      lines.push("| Observation | Screen | Evidence | Source |", "| --- | --- | --- | --- |");
      for (const o of obs) {
        const src = (g.sources ?? []).find((x) => x.id === o.source_id);
        const link = src ? `[${mdEscape(src.title ?? src.id)}](${src.page_url ?? src.url})` : "";
        lines.push(`| \`${o.id}\` ${mdEscape(o.screen_label ?? "")} | \`${o.screen}\` | ${o.evidence_level}, ${o.confidence} | ${link} |`);
      }
      lines.push("");
    } else {
      lines.push("No visual observations yet.", "");
    }
  }
  lines.push("## Original web patterns", "", "| Pattern | Fits | Tags |", "| --- | --- | --- |");
  for (const p of lib.patterns()) {
    lines.push(`| \`${p.id}\` ${mdEscape(p.title)} | ${mdEscape((p.fits ?? []).join(", "))} | ${mdEscape((p.tags ?? []).join(", "))} |`);
  }
  return lines.join("\n") + "\n";
}

// ---------- user store ----------

function writeStore(p, entries) {
  fs.mkdirSync(path.dirname(p.store), { recursive: true });
  const tmp = `${p.store}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(entries, null, 2) + "\n");
  fs.renameSync(tmp, p.store);
}

export function retraction(lib, gameId, { observation, source, alias, record } = {}) {
  const existing = lib.records.find((r) => r.id === gameId);
  if (!existing) throw new Error(`No record with id: ${gameId}`);
  const kind = existing.kind ?? "game";
  if (record) return { kind, id: gameId, retracted: true };
  const retract = {};
  if (observation) retract.observations = [observation];
  if (source) retract.sources = [source];
  if (alias) retract.aliases = [alias];
  if (!Object.keys(retract).length) throw new Error("Name what to retract: --observation, --source, --alias or --record");
  return { kind, id: gameId, title: existing.title, retract };
}

// ---------- link check (network; run manually) ----------

export async function checkLinks(lib, { limit = 500, game, concurrency = 4, timeoutMs = 12000 } = {}) {
  const policy = lib.preferences.source_policy ?? {};
  const blocked = (url) => {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const rule = Object.entries(policy).find(([d]) => host === d || host.endsWith(`.${d}`))?.[1];
    return rule && rule !== "allowed" ? rule : null;
  };
  const targets = lib.games().filter((g) => !game || g.id === game)
    .flatMap((g) => (g.sources ?? []).map((s) => ({ game: g.id, source: s.id, url: s.url })))
    .slice(0, limit);
  const results = [];
  let next = 0;
  async function worker() {
    while (next < targets.length) {
      const t = targets[next++];
      const rule = blocked(t.url);
      if (rule) { results.push({ ...t, status: "skipped", reason: `source_policy: ${rule}` }); continue; }
      try {
        const res = await fetch(t.url, {
          method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(timeoutMs),
          headers: { "user-agent": "game-ui-frontend-linkcheck/2 (+https://github.com/NathanHor22/gamefrontendskills)" },
        });
        results.push({ ...t, status: res.status, ok: res.ok });
      } catch (e) {
        results.push({ ...t, status: "error", ok: false, reason: e.name === "TimeoutError" ? "timeout" : e.message });
      }
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return {
    checked: results.filter((r) => r.status !== "skipped").length,
    broken: results.filter((r) => r.ok === false),
    skipped: results.filter((r) => r.status === "skipped").length,
  };
}

// ---------- CLI ----------

const HELP = `Usage: node scripts/library.mjs <command> [options]

  resolve <name>                 match an informal game name to library ids
  search [words] [filters]       rank observations, games and patterns
      --screen <type>  --genre <g>  --kind game|observation|pattern
      --evidence <level>  --game <id>  --limit <n>
  show <id>                      a game, pattern or observation by id
  screens                        screen vocabulary with web equivalents and coverage
  stats                          coverage counts
  check                          validate data, ids, links between docs, generated catalog
  import --file <json|jsonl>     add or update research in your user store
  retract <id> --observation <id> | --source <id> | --alias <a> | --record
  export --file <path>           write your user store entries
  links [--game <id>]            check source URLs over the network (respects source_policy)
  docs [--write]                 render references/research/catalog.md
  where                          print data and user-store paths`;

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const k = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) out[k] = true;
      else { out[k] = next; i++; }
    } else out._.push(a);
  }
  return out;
}

const emit = (v) => {
  process.stdout.write(JSON.stringify(v, null, 2) + "\n");
  return 0;
};

export async function main(argv = process.argv.slice(2), p = paths()) {
  const args = parseArgs(argv);
  const [command, ...rest] = args._;
  const limit = args.limit === undefined ? undefined : Number(args.limit);
  if (limit !== undefined && !(Number.isInteger(limit) && limit >= 1 && limit <= 200)) throw new Error("--limit must be 1-200");
  const lib = Library.open(p);
  switch (command) {
    case "resolve":
      return emit(resolve(lib, rest.join(" "), limit ?? 6));
    case "search": {
      if (args.screen && !(args.screen in lib.vocab.screens)) throw new Error(`Unknown screen "${args.screen}". Run: screens`);
      return emit(search(lib, rest.join(" "), { screen: args.screen, genre: args.genre, kind: args.kind, evidence: args.evidence, game: args.game, limit: limit ?? 8 }));
    }
    case "show": {
      const found = show(lib, rest[0] ?? "");
      if (!found.length) throw new Error(`No record with id: ${rest[0]}`);
      return emit(found);
    }
    case "screens": {
      const counts = stats(lib).observations_by_screen;
      return emit(Object.entries(lib.vocab.screens).map(([id, v]) => ({ id, ...v, observations: counts[id] })));
    }
    case "stats":
      return emit(stats(lib));
    case "check": {
      const result = check(lib);
      emit(result);
      return result.ok ? 0 : 1;
    }
    case "import": {
      if (!args.file || args.file === true) throw new Error("import needs --file");
      const entries = lib.stage(loadRecords(path.resolve(args.file)));
      writeStore(p, entries);
      return emit({ imported_entries: entries.length - lib.user.length, store: p.store });
    }
    case "retract": {
      const entry = retraction(lib, rest[0], args);
      const entries = lib.stage([entry]);
      writeStore(p, entries);
      return emit({ retracted: entry, store: p.store });
    }
    case "export": {
      if (!args.file || args.file === true) throw new Error("export needs --file");
      const dest = path.resolve(args.file);
      if (dest === path.resolve(p.store)) throw new Error("Export destination cannot be the store itself");
      fs.writeFileSync(dest, JSON.stringify(lib.user, null, 2) + "\n");
      return emit({ exported_entries: lib.user.length, file: dest });
    }
    case "links": {
      const result = await checkLinks(lib, { game: args.game, limit: limit ?? 500 });
      emit(result);
      return result.broken.length ? 1 : 0;
    }
    case "docs": {
      const text = renderCatalog(new Library({ bundled: lib.bundled, user: [], vocab: lib.vocab, preferences: lib.preferences }));
      const file = path.join(p.skill, "references", "research", "catalog.md");
      if (args.write) { fs.writeFileSync(file, text); return emit({ wrote: file }); }
      process.stdout.write(text);
      return 0;
    }
    case "where":
      return emit(p);
    default:
      process.stdout.write(HELP + "\n");
      return command && command !== "help" ? 1 : 0;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href) {
  main().then((code) => { process.exitCode = code ?? 0; }).catch((e) => {
    process.stderr.write(`Library error: ${e.message}\n`);
    process.exitCode = 1;
  });
}
