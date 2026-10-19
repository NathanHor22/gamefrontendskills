# Research library

## Storage and retrieval

`data/library.sqlite` is a searchable local SQLite database, using FTS5 for lexical retrieval. It runs with Python's standard library and needs no API key or external service. It stores game profiles, exact title aliases, source provenance, individual visual observations, and independent website design patterns. It is not a vector index or a trained model.

`data/games.json` and `data/patterns.json` are the portable research seeds. When the default `data/library.sqlite` is absent, read commands query those seeds in memory. A first import creates a local database containing the seeds and new records; later imports update it. Generated databases are ignored by Git. Export an installed database before replacing a copy with later additions. `data/style-examples.json` contains optional credited public website observations; it does not define the installing user’s identity. No helper command makes network requests or collects a website. Never visit or source from Mobbin/Mobin or CodePen.

Run with the helper's actual absolute path. Read commands open an existing database read-only, or query bundled seeds in memory when the default database is absent:

```text
python scripts/library.py stats
python scripts/library.py resolve "yakuzo 0"
python scripts/library.py search "angular blue navigation"
python scripts/library.py show persona-3-reload
python scripts/library.py check
python scripts/library.py export --file my-library.json
```

`resolve` ranks exact names, known aliases, saved user resolutions, and fuzzy candidates. A candidate match is not an automatic assertion that two titles are equivalent. A game may list `family_queries` for unqualified series references. These return `family_query_candidate`, while an exact original game title still outranks sequel candidates; do not save a broad family name as a false exact-title alias. `search` finds both game notes and original web patterns. Inspect returned `kind` and evidence fields before using the result. The FTS index is keyword based; the agent should translate conceptual questions into several useful queries.

## Add records

Create a UTF-8 JSON array (or JSONL with one object per line). Import with:

```text
python scripts/library.py import --file new-research.json
```

Imports validate the full batch before writing. Repeated explicit source or observation IDs inside one record are rejected; upserts across separate records or imports remain supported. Existing game metadata is updated; sources merge by source ID, and observations merge by explicit ID or content-derived ID. Existing observations and sources are retained unless explicitly replaced using the same ID. Re-importing a batch does not duplicate the same records. Data and search entries commit together. Back up the database before intentionally replacing established analysis.

Game record fields:

```json
{
  "kind": "game",
  "id": "exact-game-edition",
  "title": "Exact Game Title",
  "aliases": ["Common misspelling"],
  "franchise": "Franchise name",
  "genres": ["Genre"],
  "visual_tags": ["Observed or clearly labeled search terms"],
  "sources": [{
    "id": "official-menu-image",
    "url": "https://example.com/source-page",
    "title": "Credited source title",
    "type": "screenshot",
    "visually_inspected": true,
    "notes": "Exactly what was viewed, edition and access limits."
  }],
  "observations": [{
    "id": "menu-hierarchy",
    "source_id": "official-menu-image",
    "screen_type": "menu",
    "observed": ["Only details visible in the inspected image."],
    "inferred": ["Clearly separated interpretation, if needed."],
    "website_translation": ["Original web adaptation, not a fact about the game."],
    "confidence": "high"
  }]
}
```

The example URL is a schema illustration, not research. Real imports require an actual retrieved source. A record with observations requires a matching source marked visually inspected; a text-only source can establish title identity but cannot support visual observations. Source IDs are unique within a game. Include the image's own URL as a separate source or in source notes when useful, and cite its surrounding credited page in the answer.

Pattern records have `kind: "pattern"`, a stable `id`, `title`, `tags`, and `proposal` describing an original website design move. They may include `fits`, `implementation`, and `motion_spec` containing states, enter/exit sequences, interruption, keyboard, touch, and reduced-motion design. These are original proposals to evolve with the user, not a gallery of finished components. Patterns do not count as reviewed game screens, and broad aesthetic tags are not proof of a particular game's visual characteristics.

For developer layout guides and state sheets, use source type `design_reference` and observation evidence `production_reference`. Their annotations describe intended design, not observed runtime animation. For actual motion studies, add a source identifying the exact clip/live page and an observation with `evidence_level` such as `live_interaction`, `video_frames`, or `source_defined`. Include observed state transitions and any timing provenance in additional fields. `visually_inspected` only means the source was viewed: it does not mean the transition was frame-measured. A source code-defined value must not be presented as a timing measured on the deployed website. Keep user-described reference behavior separate from observed evidence. Static screenshots in the initial game seed do not verify Persona's hover choreography.

## Evidence and coverage

- Cataloged game: a title identity record exists.
- Sourced game: at least one source link has been verified.
- Visually studied game: at least one source has actually been viewed and an observation is saved.
- Reviewed image source: an inspected screenshot or design-reference URL, counted once. `stats` separates screenshot-type images and `design_reference` production sheets. A composite remains one image source even when several insets are analyzed. Do not count an entire gallery or a video as many images.
- Observations: individual analytical records; many observations can come from one image.

Set an observation's optional `category` to `interface` or `atmosphere` so environment-only study is counted separately from interface research. The current seed explicitly labels the Yakuza 0 street image as atmosphere only. The stats command reports these game counts separately.

Report those counts separately. The collection focuses on selected reference games and related studies; it does not represent the whole Interface In Game catalog. The library can store thousands of records, but storage capacity is not evidence of research coverage. `stats` separately reports inspected video sources, observations from video frames, and motion-sequence observations with at least two recorded states. A single video frame is not a studied transition. Source playhead timestamps locate evidence; do not present them as game-response latency or fitted easing.

## Grow toward a comprehensive collection

Start with exact game identities and their available screen categories. Obtain an authorized collection or export before bulk ingestion. Interface In Game's terms at https://interfaceingame.com/terms-and-conditions/ prohibit crawling and scraping. A site-wide screenshot mirror is not included in this skill.

For an authorized collection, import metadata first as unreviewed source records. Track stable source IDs and exact editions, deduplicate identical URLs, and process visual review in resumable batches. Inspect each image or clip, then add original analysis and web adaptations. Keep unavailable, skipped, cataloged, and reviewed entries distinguishable. Report the denominator and reviewed count; a file import alone does not mark every image studied.

For each website request, research the few references that best answer its design problem, save that research, and retrieve relevant previous notes. Prefer quality and diversity of composition, navigation, typography, and motion over many near-identical screenshots. Supplement with official sources or user-provided captures when a site lacks older titles.

Revisit sources for edition-specific or interaction claims. A static image cannot establish animation timing or full navigation behavior. Record observation date, platform, source credit, and licensing details in optional fields when known. Keep images as links unless storage is authorized; save original analysis rather than copied articles.
