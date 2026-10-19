#!/usr/bin/env python3
"""Offline game-reference library. Standard library only; never fetches URLs."""
from __future__ import annotations

import argparse
import difflib
import hashlib
import json
import re
import sqlite3
import sys
import unicodedata
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
SCHEMA = """
CREATE TABLE IF NOT EXISTS documents (
    kind TEXT NOT NULL CHECK(kind IN ('game', 'pattern')),
    id TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY(kind, id)
);
CREATE INDEX IF NOT EXISTS documents_id ON documents(id);
CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
    kind UNINDEXED, id UNINDEXED, title, text,
    tokenize='unicode61 remove_diacritics 2'
);
PRAGMA user_version=1;
"""


def normalize(value):
    value = unicodedata.normalize("NFKD", value.casefold())
    value = "".join(c for c in value if not unicodedata.combining(c))
    return " ".join(re.findall(r"[^\W_]+", value, flags=re.UNICODE))


def emit(value):
    print(json.dumps(value, ensure_ascii=False, indent=2))


def load_records(path):
    raw = path.read_text(encoding="utf-8-sig")
    if path.suffix.casefold() == ".jsonl":
        data = [json.loads(line) for line in raw.splitlines() if line.strip()]
    else:
        data = json.loads(raw)
    if not isinstance(data, list) or not all(isinstance(r, dict) for r in data):
        raise ValueError("Import must be a JSON array or JSONL containing objects")
    return data


def stable_observation_id(observation):
    value = json.dumps(observation, sort_keys=True, ensure_ascii=False)
    return "obs-" + hashlib.sha256(value.encode("utf-8")).hexdigest()[:20]


def keyed_merge(old, new, field):
    merged = {}
    for item in old + new:
        item = dict(item)
        key = item.get("id")
        if not key and field == "observations":
            key = stable_observation_id(item)
            item["id"] = key
        if not key:
            raise ValueError(f"Each {field} item needs an id")
        merged[key] = item
    return list(merged.values())


def merge_record(old, incoming):
    merged = dict(old)
    merged.update(incoming)
    merged.setdefault("kind", "game")
    if merged["kind"] == "game":
        for field in ("aliases", "family_queries", "genres", "visual_tags"):
            merged[field] = list(dict.fromkeys(old.get(field, []) + incoming.get(field, [])))
        for field in ("sources", "observations"):
            merged[field] = keyed_merge(old.get(field, []), incoming.get(field, []), field)
    return merged


def has_text(value):
    return isinstance(value, str) and bool(value.strip()) or (
        isinstance(value, list) and any(isinstance(x, str) and x.strip() for x in value)
    )


def validate(record):
    for field in ("id", "title"):
        if not isinstance(record.get(field), str) or not record[field].strip():
            raise ValueError(f"Missing or invalid {field}")
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", record["id"]):
        raise ValueError(f"Invalid record id: {record['id']}")
    kind = record.get("kind", "game")
    if kind not in ("game", "pattern"):
        raise ValueError("kind must be game or pattern")
    if kind == "pattern":
        if not has_text(record.get("proposal")):
            raise ValueError("Pattern needs an original proposal")
        return
    for field in ("aliases", "family_queries", "genres", "visual_tags"):
        if not isinstance(record.get(field, []), list) or not all(
            isinstance(x, str) for x in record.get(field, [])
        ):
            raise ValueError(f"{field} must be a list of strings")
    sources = record.get("sources", [])
    observations = record.get("observations", [])
    if not isinstance(sources, list) or not isinstance(observations, list):
        raise ValueError("sources and observations must be arrays")
    by_id = {}
    for source in sources:
        if not isinstance(source, dict) or not isinstance(source.get("id"), str):
            raise ValueError("Sources need string ids")
        if source["id"] in by_id:
            raise ValueError("Duplicate source id")
        raw_url = source.get("url", "")
        if not isinstance(raw_url, str):
            raise ValueError(f"Source URL must be a string: {source['id']}")
        url = urlsplit(raw_url)
        if url.scheme not in ("https", "http") or not url.netloc:
            raise ValueError(f"Source URL must be http(s): {source['id']}")
        if type(source.get("visually_inspected", False)) is not bool:
            raise ValueError("visually_inspected must be a boolean")
        by_id[source["id"]] = source
    for obs in observations:
        if not isinstance(obs, dict):
            raise ValueError("Observations must be objects")
        source = by_id.get(obs.get("source_id"))
        if not source:
            raise ValueError("Observation source_id must identify an existing source")
        if has_text(obs.get("observed")) and not source.get("visually_inspected"):
            raise ValueError("Visual observations require a visually inspected source")


def connect(path, write=False):
    seeded_default = not path.is_file() and path.resolve() == (ROOT / "data" / "library.sqlite").resolve()
    if write:
        path.parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(path)
        conn.executescript(SCHEMA)
    elif seeded_default:
        conn = sqlite3.connect(":memory:")
        conn.executescript(SCHEMA)
    else:
        if not path.is_file():
            raise ValueError(f"Library not found: {path}. Import seed JSON files first.")
        conn = sqlite3.connect(path.resolve().as_uri() + "?mode=ro", uri=True)
    conn.row_factory = sqlite3.Row
    if seeded_default:
        try:
            import_records(conn, [*load_records(ROOT / "data" / "games.json"),
                                  *load_records(ROOT / "data" / "patterns.json")])
        except Exception:
            conn.close()
            raise
    return conn


def text_values(value):
    if isinstance(value, dict):
        return " ".join(text_values(v) for k, v in value.items() if k != "url")
    if isinstance(value, list):
        return " ".join(text_values(v) for v in value)
    return str(value) if isinstance(value, str) else ""


def import_records(conn, records):
    pending = {}
    for record in records:
        for field in ("sources", "observations"):
            items = record.get(field, [])
            if not isinstance(items, list) or not all(isinstance(item, dict) for item in items):
                raise ValueError(f"{field} must be an array of objects")
            keys = [item["id"] for item in items if "id" in item]
            if not all(isinstance(key, str) and key for key in keys):
                raise ValueError(f"{field} ids must be nonempty strings")
            if len(keys) != len(set(keys)):
                raise ValueError(f"Duplicate {field} id in one record")
        key = (record.get("kind", "game"), record.get("id"))
        # Fail clearly before using a malformed key in SQL.
        if key[0] not in ("game", "pattern") or not isinstance(key[1], str):
            raise ValueError("Record needs a valid kind and string id")
        if key in pending:
            old = pending[key]
        else:
            row = conn.execute("SELECT body FROM documents WHERE kind=? AND id=?", key).fetchone()
            old = json.loads(row[0]) if row else {}
        merged = merge_record(old, record)
        validate(merged)
        pending[key] = merged
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    with conn:
        for key, record in pending.items():
            conn.execute(
                "INSERT INTO documents VALUES(?,?,?,?,?) "
                "ON CONFLICT(kind,id) DO UPDATE SET title=excluded.title,body=excluded.body,updated_at=excluded.updated_at",
                (*key, record["title"], json.dumps(record, ensure_ascii=False), now),
            )
            conn.execute("DELETE FROM search_index WHERE kind=? AND id=?", key)
            conn.execute("INSERT INTO search_index VALUES(?,?,?,?)", (*key, record["title"], text_values(record)))
    return {"imported_documents": len(pending)}


def records(conn, kind=None):
    query = "SELECT body FROM documents"
    rows = conn.execute(query + " WHERE kind=? ORDER BY id", (kind,)) if kind else conn.execute(query + " ORDER BY kind,id")
    return [json.loads(row[0]) for row in rows]


def evidence(record):
    observations = record.get("observations", [])
    return {
        "sources": len(record.get("sources", [])),
        "visual_observations": sum(bool(has_text(o.get("observed"))) for o in observations),
    }


def load_preferences():
    def merge(base, override):
        result = dict(base)
        for key, value in override.items():
            if isinstance(value, dict) and isinstance(result.get(key), dict):
                result[key] = merge(result[key], value)
            else:
                result[key] = value
        return result
    prefs = {}
    for name in ("preferences.json", "preferences.local.json"):
        path = ROOT / "data" / name
        if path.exists():
            value = json.loads(path.read_text(encoding="utf-8-sig"))
            if not isinstance(value, dict):
                raise ValueError(f"{name} must contain a JSON object")
            prefs = merge(prefs, value)
    resolutions = prefs.get("title_resolutions", {})
    if not isinstance(resolutions, dict) or not all(isinstance(k, str) and isinstance(v, str) for k, v in resolutions.items()):
        raise ValueError("title_resolutions must map names to game ids")
    return prefs


def resolve(conn, query, limit):
    prefs = load_preferences()
    normalized = normalize(query)
    if not normalized:
        return []
    preference = next((v for k, v in prefs.get("title_resolutions", {}).items() if normalize(k) == normalized), None)
    found = []
    for game in records(conn, "game"):
        labels = [game["title"], game["id"], *game.get("aliases", [])]
        scored = [(difflib.SequenceMatcher(None, normalized, normalize(x)).ratio(), x) for x in labels]
        best, label = max(scored)
        reason = "fuzzy_candidate"
        if preference == game["id"]:
            best, reason = 1.1, "saved_user_preference"
        elif any(normalize(x) == normalized for x in labels):
            best, reason = 1.0, "exact_title_or_alias"
        elif any(normalize(x) == normalized for x in game.get("family_queries", [])):
            best, reason = .95, "family_query_candidate"
            label = next(x for x in game["family_queries"] if normalize(x) == normalized)
        elif normalized and any(normalized in normalize(x) for x in labels):
            best, reason = max(best, .82), "partial_title_candidate"
        if best >= .48:
            found.append({"id": game["id"], "title": game["title"], "score": round(best, 3),
                          "match": reason, "matched_label": label, "evidence": evidence(game)})
    if any(r["match"] == "family_query_candidate" for r in found):
        found = [r for r in found if r["match"] in ("family_query_candidate", "exact_title_or_alias", "saved_user_preference")]
    return sorted(found, key=lambda r: (-r["score"], r["title"]))[:limit]


def search(conn, query, limit):
    tokens = re.findall(r"[^\W_]+", query, flags=re.UNICODE)
    if not tokens:
        return []
    match = " OR ".join('"' + token.replace('"', '""') + '"' for token in tokens)
    rows = conn.execute(
        "SELECT kind,id,title,snippet(search_index,3,'[',']',' ... ',28) AS excerpt,"
        "bm25(search_index,0,0,5,1) AS rank FROM search_index "
        "WHERE search_index MATCH ? ORDER BY rank LIMIT ?", (match, limit)
    )
    return [dict(row) for row in rows]


def stats(conn):
    games = records(conn, "game")
    sources = [s for g in games for s in g.get("sources", [])]
    inspected = [s for s in sources if s.get("visually_inspected")]
    def motion_sequences(game):
        return [o for o in game.get("observations", [])
                if o.get("evidence_level") in ("video_frames", "live_interaction")
                and has_text(o.get("observed"))
                and isinstance(o.get("motion_study"), dict)
                and isinstance(o["motion_study"].get("states_observed"), list)
                and len(o["motion_study"]["states_observed"]) >= 2]
    return {
        "cataloged_games": len(games),
        "sourced_games": sum(bool(g.get("sources")) for g in games),
        "visually_studied_games": sum(any(has_text(o.get("observed")) for o in g.get("observations", [])) for g in games),
        "games_with_reviewed_interface_observations": sum(any(has_text(o.get("observed")) and o.get("category", "interface") == "interface" for o in g.get("observations", [])) for g in games),
        "games_with_reviewed_atmosphere_observations": sum(any(has_text(o.get("observed")) and o.get("category") == "atmosphere" for o in g.get("observations", [])) for g in games),
        "unique_source_urls": len({s["url"] for s in sources}),
        "visually_inspected_source_urls": len({s["url"] for s in inspected}),
        "reviewed_screenshot_urls": len({s["url"] for s in inspected if s.get("type") == "screenshot"}),
        "reviewed_design_reference_urls": len({s["url"] for s in inspected if s.get("type") == "design_reference"}),
        "reviewed_image_source_urls": len({s["url"] for s in inspected if s.get("type") in ("screenshot", "design_reference")}),
        "reviewed_video_source_urls": len({s["url"] for s in inspected if s.get("type") == "video"}),
        "observations_from_video_frames": sum(o.get("evidence_level") == "video_frames" and has_text(o.get("observed")) for g in games for o in g.get("observations", [])),
        "motion_sequence_observations": sum(len(motion_sequences(g)) for g in games),
        "games_with_motion_sequences": sum(bool(motion_sequences(g)) for g in games),
        "visual_observations": sum(evidence(g)["visual_observations"] for g in games),
        "original_web_patterns": len(records(conn, "pattern")),
        "scope": "Sourced research corpus with catalog, visual, and motion coverage distinguished; not exhaustive.",
    }


def check(conn):
    errors = []
    integrity = conn.execute("PRAGMA integrity_check").fetchone()[0]
    if integrity != "ok":
        errors.append(integrity)
    for record in records(conn):
        try:
            validate(record)
        except (ValueError, TypeError, KeyError) as exc:
            errors.append(f"{record.get('id')}: {exc}")
    docs = {tuple(r) for r in conn.execute("SELECT kind,id FROM documents")}
    indexed = [tuple(r) for r in conn.execute("SELECT kind,id FROM search_index")]
    if docs != set(indexed) or len(indexed) != len(docs):
        errors.append("Search index does not match document keys")
    return {"ok": not errors, "errors": errors, "documents_checked": len(docs)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--db", type=Path, default=ROOT / "data" / "library.sqlite")
    commands = parser.add_subparsers(dest="command", required=True)
    importer = commands.add_parser("import", help="Import authorized JSON/JSONL data")
    importer.add_argument("--file", type=Path, required=True)
    for name in ("resolve", "search"):
        sub = commands.add_parser(name)
        sub.add_argument("query")
        sub.add_argument("--limit", type=int, default=6)
    show = commands.add_parser("show")
    show.add_argument("id")
    commands.add_parser("stats")
    commands.add_parser("check")
    exporter = commands.add_parser("export")
    exporter.add_argument("--file", type=Path, required=True)
    args = parser.parse_args()
    if hasattr(args, "limit") and not 1 <= args.limit <= 100:
        parser.error("--limit must be between 1 and 100")
    try:
        batch = load_records(args.file) if args.command == "import" else None
        conn = connect(args.db, write=args.command == "import")
        try:
            if args.command == "import":
                emit(import_records(conn, batch))
            elif args.command == "resolve":
                emit(resolve(conn, args.query, args.limit))
            elif args.command == "search":
                emit(search(conn, args.query, args.limit))
            elif args.command == "show":
                found = [json.loads(r[0]) for r in conn.execute("SELECT body FROM documents WHERE id=?", (args.id,))]
                if not found:
                    raise ValueError(f"No record with id: {args.id}")
                emit(found[0] if len(found) == 1 else found)
            elif args.command == "stats":
                emit(stats(conn))
            elif args.command == "check":
                result = check(conn)
                emit(result)
                return 0 if result["ok"] else 1
            elif args.command == "export":
                if args.file.resolve() == args.db.resolve():
                    raise ValueError("Export destination cannot overwrite the database")
                args.file.write_text(json.dumps(records(conn), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
                emit({"exported_documents": len(records(conn)), "file": str(args.file.resolve())})
        finally:
            conn.close()
        return 0
    except (ValueError, TypeError, KeyError, OSError, sqlite3.Error, json.JSONDecodeError) as exc:
        print(f"Library error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    raise SystemExit(main())
