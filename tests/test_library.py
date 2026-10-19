"""Behavior checks for the portable library; run without network or saved test DBs."""
import importlib.util
import json
import sqlite3
import sys
import unittest
import tempfile
from unittest.mock import patch
from pathlib import Path

sys.dont_write_bytecode = True
script = Path(__file__).resolve().parents[1] / "gamedev/scripts/library.py"
spec = importlib.util.spec_from_file_location("gamedev_library", script)
library = importlib.util.module_from_spec(spec)
spec.loader.exec_module(library)


class LibraryBehavior(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.test_root = Path(self.temp.name)
        (self.test_root / "data").mkdir()
        (self.test_root / "data/preferences.json").write_text(json.dumps({
            "title_resolutions": {"persona 3 golden": "persona-3-reload"},
            "personal_reference_sites": ["https://default.example/"]
        }), encoding="utf-8")
        self.root_patch = patch.object(library, "ROOT", self.test_root)
        self.root_patch.start()
        self.conn = sqlite3.connect(":memory:")
        self.conn.row_factory = sqlite3.Row
        self.conn.executescript(library.SCHEMA)
        self.game = {
            "id": "persona-3-reload", "title": "Persona 3 Reload",
            "aliases": ["p3r"], "visual_tags": ["blue", "diagonal"],
            "sources": [{"id": "menu", "url": "https://example.com/menu.png",
                         "visually_inspected": True, "type": "screenshot"}],
            "observations": [{"source_id": "menu", "observed": ["A blue image"],
                              "website_translation": ["Angular portfolio navigation"]}],
        }
        library.import_records(self.conn, [self.game])

    def tearDown(self):
        self.conn.close()
        self.root_patch.stop()
        self.temp.cleanup()

    def test_user_resolution_beats_title_similarity(self):
        golden = {"id": "persona-4-golden", "title": "Persona 4 Golden"}
        library.import_records(self.conn, [golden])
        found = library.resolve(self.conn, "persona 3 golden", 6)
        self.assertEqual(found[0]["id"], "persona-3-reload")
        self.assertEqual(found[0]["match"], "saved_user_preference")

    def test_spelling_alias_and_typography(self):
        library.import_records(self.conn, [{"id": "yakuza-0", "title": "Yakuza 0", "aliases": ["yakuzo 0"]}])
        self.assertEqual(library.resolve(self.conn, "yakuzo 0", 1)[0]["id"], "yakuza-0")
        self.assertEqual(library.normalize("Marvel’s Spider-Man"), "marvel s spider man")

    def test_idempotent_import_keeps_search_and_observations_unique(self):
        library.import_records(self.conn, [self.game, self.game])
        self.assertEqual(library.stats(self.conn)["visual_observations"], 1)
        self.assertEqual(len(library.search(self.conn, "blue", 10)), 1)
        self.assertTrue(library.check(self.conn)["ok"])

    def test_partial_update_preserves_research(self):
        library.import_records(self.conn, [{"id": "persona-3-reload", "title": "Persona 3 Reload", "aliases": ["persona3"]}])
        record = library.records(self.conn, "game")[0]
        self.assertEqual(len(record["observations"]), 1)
        self.assertEqual(len(record["sources"]), 1)
        self.assertIn("p3r", record["aliases"])
        self.assertIn("persona3", record["aliases"])

    def test_invalid_batch_has_no_partial_document_write(self):
        with self.assertRaises(ValueError):
            library.import_records(self.conn, [
                {"id": "first-valid", "title": "First valid"},
                {"id": "second-invalid", "title": "Second", "sources": [
                    {"id": "bad", "url": "file:///secrets", "visually_inspected": False}]},
            ])
        self.assertEqual(len(library.records(self.conn)), 1)
        self.assertEqual(library.search(self.conn, "First valid", 5), [])

    def test_metadata_cannot_be_marked_as_visual_evidence(self):
        with self.assertRaises(ValueError):
            library.import_records(self.conn, [{"id": "unseen", "title": "Unseen", "sources": [
                {"id": "page", "url": "https://example.com", "visually_inspected": False}],
                "observations": [{"source_id": "page", "observed": "Unseen UI claim"}]}])

    def test_patterns_are_not_counted_as_game_study(self):
        library.import_records(self.conn, [{"kind": "pattern", "id": "diagonal-index", "title": "Diagonal index",
            "proposal": "Use slanted panels around native links for a portfolio."}])
        stats = library.stats(self.conn)
        self.assertEqual(stats["cataloged_games"], 1)
        self.assertEqual(stats["visually_studied_games"], 1)
        self.assertEqual(stats["original_web_patterns"], 1)
        found = library.search(self.conn, "portfolio", 10)
        self.assertEqual({r["kind"] for r in found}, {"game", "pattern"})

    def test_query_syntax_is_treated_as_words(self):
        self.assertIsInstance(library.search(self.conn, 'blue " OR NOT ) * ; --', 10), list)
        self.assertEqual(library.search(self.conn, '" ) *', 10), [])


    def test_video_still_is_not_counted_as_a_motion_sequence(self):
        library.import_records(self.conn, [{
            "id": "motion-example", "title": "Motion Example",
            "sources": [{"id": "clip", "url": "https://example.com/video", "type": "video", "visually_inspected": True}],
            "observations": [
                {"id": "one-frame", "source_id": "clip", "observed": "A single static selection pose.",
                 "evidence_level": "video_frames", "motion_study": {"states_observed": ["selected"]}},
                {"id": "sequence", "source_id": "clip", "observed": "A panel closes, then another opens.",
                 "evidence_level": "video_frames", "motion_study": {"states_observed": ["closed", "opening", "open"]}},
            ],
        }])
        result = library.stats(self.conn)
        self.assertEqual(result["reviewed_video_source_urls"], 1)
        self.assertEqual(result["observations_from_video_frames"], 2)
        self.assertEqual(result["motion_sequence_observations"], 1)
        self.assertEqual(result["games_with_motion_sequences"], 1)


    def test_family_query_preserves_edition_candidates_and_exact_title(self):
        library.import_records(self.conn, [
            {"id": "forza-horizon-4", "title": "Forza Horizon 4", "family_queries": ["forza horizon"]},
            {"id": "forza-horizon-5", "title": "Forza Horizon 5", "family_queries": ["forza horizon"]},
        ])
        candidates = library.resolve(self.conn, "forza horizon", 6)
        self.assertEqual({r["id"] for r in candidates}, {"forza-horizon-4", "forza-horizon-5"})
        self.assertTrue(all(r["match"] == "family_query_candidate" for r in candidates))
        library.import_records(self.conn, [{"id": "forza-horizon", "title": "Forza Horizon"}])
        self.assertEqual(library.resolve(self.conn, "forza horizon", 1)[0]["id"], "forza-horizon")


    def test_unicode_titles_and_empty_queries(self):
        library.import_records(self.conn, [
            {"id": "japanese", "title": "ペルソナ"},
            {"id": "korean", "title": "페르소나"},
        ])
        self.assertEqual(library.resolve(self.conn, "ペルソナ", 1)[0]["id"], "japanese")
        self.assertEqual(library.resolve(self.conn, "페르소나", 1)[0]["id"], "korean")
        self.assertEqual(library.normalize("Tōkon"), "tokon")
        for query in ("", "  ", "--- !!!"):
            self.assertEqual(library.resolve(self.conn, query, 6), [])

    def test_malformed_url_is_a_clear_validation_error(self):
        with self.assertRaisesRegex(ValueError, "URL must be a string"):
            library.import_records(self.conn, [{"id": "bad-url", "title": "Bad URL", "sources": [
                {"id": "bad", "url": 42, "visually_inspected": False}]}])
        self.assertEqual(len(library.records(self.conn)), 1)

    def test_duplicate_ids_in_one_payload_reject_the_whole_batch(self):
        with self.assertRaisesRegex(ValueError, "Duplicate sources"):
            library.import_records(self.conn, [
                {"id": "would-be-valid", "title": "Valid"},
                {"id": "duplicate", "title": "Duplicate", "sources": [
                    {"id": "same", "url": "https://example.com/a"},
                    {"id": "same", "url": "https://example.com/b"},
                ]},
            ])
        self.assertEqual(len(library.records(self.conn)), 1)

    def test_local_preferences_merge_dictionaries_and_replace_lists(self):
        (self.test_root / "data/preferences.local.json").write_text(json.dumps({
            "title_resolutions": {"my other reference": "persona-4-golden"},
            "personal_reference_sites": ["https://local.example/"]
        }), encoding="utf-8")
        prefs = library.load_preferences()
        self.assertEqual(prefs["title_resolutions"], {
            "persona 3 golden": "persona-3-reload", "my other reference": "persona-4-golden"})
        self.assertEqual(prefs["personal_reference_sites"], ["https://local.example/"])

    def write_seeds(self):
        (self.test_root / "data/games.json").write_text(json.dumps([self.game]), encoding="utf-8")
        (self.test_root / "data/patterns.json").write_text("[]", encoding="utf-8")

    def test_missing_default_database_reads_seeds_without_writing(self):
        self.write_seeds()
        path = self.test_root / "data/library.sqlite"
        conn = library.connect(path)
        try:
            self.assertEqual(library.stats(conn)["cataloged_games"], 1)
            self.assertTrue(library.check(conn)["ok"])
        finally:
            conn.close()
        self.assertFalse(path.exists())

    def test_first_persistent_import_keeps_bundled_seeds(self):
        self.write_seeds()
        path = self.test_root / "data/library.sqlite"
        conn = library.connect(path, write=True)
        try:
            library.import_records(conn, [{"id": "new-reference", "title": "New Reference"}])
        finally:
            conn.close()
        conn = library.connect(path)
        try:
            self.assertEqual(library.stats(conn)["cataloged_games"], 2)
        finally:
            conn.close()


if __name__ == "__main__":
    unittest.main(verbosity=2)
