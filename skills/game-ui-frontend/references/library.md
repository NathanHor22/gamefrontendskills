# Library: data model and commands

The library is plain JSON searched in memory by `scripts/library.mjs` (Node ≥ 20, no dependencies, no network
except the explicit `links` command).

- **Bundled research:** `data/games.json`, `data/patterns.json` (read-only, updated with the skill).
- **Vocabulary:** `data/vocabulary.json`: screen types, source types, evidence levels, inspection methods.
- **Your additions:** `~/.game-ui-frontend/library.json` (override the folder with `GAME_UI_FRONTEND_HOME`).
  Merged on read, so upgrading the skill never hides or deletes them.
- **Your preferences:** `~/.game-ui-frontend/preferences.json`, merged over `data/preferences.json`
  (objects merge, lists and values replace).

## Commands

```
node scripts/library.mjs resolve "dragonball fighterz"
node scripts/library.mjs search "detached marker" --screen main_menu --limit 5
node scripts/library.mjs search --screen title                  # everything for a screen type
node scripts/library.mjs search "ledger" --genre racing --kind observation
node scripts/library.mjs show tk8-options-mask-and-selection-sweep
node scripts/library.mjs screens                                # vocabulary + coverage counts
node scripts/library.mjs stats
node scripts/library.mjs check                                  # data, ids, doc links, catalog freshness
node scripts/library.mjs import --file research.json            # into your user store
node scripts/library.mjs retract persona-3-reload --observation <id>   # or --source, --alias, --record
node scripts/library.mjs export --file backup.json
node scripts/library.mjs links [--game <id>]                    # network: check source URLs (respects source_policy)
node scripts/library.mjs docs --write                           # regenerate references/research/catalog.md
```

`search` ranks observations (one per screen), games and patterns with BM25 over their text; results carry
`screen`, `evidence` and `confidence`. Translate a design question into several keyword searches.

`resolve` matches informal names (typos, aliases, family names). A `family_query_candidate` lists the studied
editions for a series name; it doesn't claim the series has one UI.

## Game record

```json
{
  "kind": "game",
  "id": "exact-game-edition",
  "title": "Exact Game Title",
  "aliases": ["common misspelling"],
  "family_queries": ["series name"],
  "franchise": "Series",
  "genres": ["racing"],
  "visual_tags": ["observed search terms"],
  "edition": "Which edition/build this is, and what it is not",
  "reviewed_on": "2026-10-25",
  "sources": [{
    "id": "official-menu-image",
    "url": "https://example.com/image.jpg",
    "page_url": "https://example.com/page-that-shows-it",
    "title": "Credited source title",
    "type": "screenshot",
    "visually_inspected": true,
    "inspection": { "method": "image_fetched", "on": "2026-10-25", "sha256": "<64 hex>" },
    "notes": "Edition, capture limits, what is and isn't game UI in the image"
  }],
  "observations": [{
    "id": "game-screen-slug",
    "source_id": "official-menu-image",
    "screen": "main_menu",
    "screen_label": "Main menu",
    "category": "interface",
    "evidence_level": "static_image",
    "observed": "Only what is visible.",
    "inferred": "Marked interpretation.",
    "website_translation": "Original web proposal.",
    "confidence": "high",
    "confidence_note": "optional qualifier",
    "media_positions": ["0:12.400", "0:12.650"],
    "motion_study": {
      "states_observed": ["…", "…"], "layer_order": "…", "entry": "…", "exit": "…",
      "interruptions": "…", "timing_provenance": "…", "gaps": ["…"]
    }
  }]
}
```

### Validation rules

- Ids are lowercase slugs, unique across games, patterns and observations (so `show <id>` is unambiguous).
- `screen`, source `type`, `evidence_level`, `inspection.method`, `confidence` must come from the vocabulary.
- An observation with `observed` text needs a source with `visually_inspected: true` and an `inspection`.
- New imports can't use `inspection.method: "unrecorded"` (only legacy bundled data has it);
  `image_fetched` and `user_capture` need a `sha256`.
- `video_frames` observations need `media_positions` or a `source_locator`.
- `documented_text` observations (manuals, interviews) can't carry `observed` text.
- Imports validate the whole batch against the merged library and write nothing if anything fails.

### Merging

Re-importing a record updates it: scalar fields replace; `aliases`, `genres`, `visual_tags` and `family_queries`
union; `sources` and `observations` merge by `id`. To remove something, use `retract` (it writes a retraction
entry to your store; bundled data is never edited).

## Pattern record

Original web proposals, not game facts: `kind: "pattern"`, `id`, `title`, `tags`, `proposal`, `fits`,
`implementation`, `motion_spec` (`states`, `enter_sequence`, `exit_sequence`, `interruption`, `keyboard`,
`touch`, `reduced_motion`).

## Evidence levels

| Level | Establishes | Doesn't establish |
| --- | --- | --- |
| `static_image` | Layout, silhouettes, type, captured state | Motion, timing, hover, exit |
| `video_frames` | State order, layering at recorded playheads | Exact easing or duration, pointer hover |
| `live_interaction` | Observed responses to input | Precise timing unless measured |
| `production_reference` | Designer intent (layout guides, state sheets) | Runtime behaviour |
| `source_defined` | Implementation values from code/spec | Rendered result |
| `documented_text` | Described functions | Any visual claim |
