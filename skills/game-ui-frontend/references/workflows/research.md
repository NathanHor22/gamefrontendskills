# Research: adding game screens to the library

Use when the user asks to study a game, analyse supplied footage or extend the library. For a website
build with a missing reference, choose the nearest documented game decision in the bundle and explain
the adaptation. The [library guide](../library.md) covers record formats and research commands.

The CLI indexes structured game records and patterns. A game can also appear in a video essay without
having its own record. Check the [video-study index](../art-direction.md) before repeating the research.
For example, the [3rd Strike roster comparison](../research/character-select.md) can be cited by playhead.
For an opening or an animated menu, the [start-screen studies](../research/title-screens.md) link each family to its footage. Look up an individual edition with `node scripts/library.mjs resolve "Gran Turismo PSP"` or inspect a single sequence with `node scripts/library.mjs show gran-turismo-psp-opening-study`.

## 1. Source policy (read `data/preferences.json` → `source_policy`)

| Policy | Meaning |
| --- | --- |
| `excluded` | Never visit, cite or derive from it (Mobbin, CodePen by default) |
| `no_automated_access` | No scripted or agent browsing. Game UI Database blocks AI agents in robots.txt. A human may browse it and hand you captures |
| `link_only` | Cite individual pages the user or existing records point to. Never crawl listings or pagination (Interface In Game's terms prohibit crawling) |
| *(not listed)* | Normal, polite access to individual pages |

The browser scripts refuse URLs whose policy is anything other than normal access.

**Preferred sources, in order:**
1. The user's own captures and screenshots (put them in a folder and give the paths).
2. Official sources: game sites, press kits, publisher manuals, developer/artist portfolios.
3. Edition-specific capture archives viewed one page at a time (e.g. MobyGames screenshot pages).
4. Individual pages already cited in the library.

## 2. Identify the exact edition

Resolve the title (`library.mjs resolve`). Remakes, remasters, ports and seasons have different UIs: record
`edition`/`build_notes`, and never attribute a remake's screen to the original.

## 3. Look at the image yourself

For a video essay, inspect the cited sequence and distinguish game footage, the essayist's graphics or
voiceover, and any developer explanation. A playhead identifies the sampled moment. Widely spaced
storyboard images can support changes of composition across shots. To claim movement within one shot,
check adjacent frames from that shot. In a research-and-direction request, connect each finding to the
visitor's decision using [the art-direction guide](../art-direction.md).

When the user asks for a full reading of an essay, read every available caption cue in order, including the opening, asides, corrections and closing material. Prefer the authored track where available. Note which track you used and where it omits speech, mishears a name or continues into music. Check uncertain words against the recording, a legible on-screen credit or the speaker's own published material. Identify any uncertainty that survives that check. A sponsor's analogy or an autobiographical aside can explain a preference without establishing how an interface performs. The [completed essay readings](../research/essay-readings.md) show what that distinction changes in a build.

At the same playhead, identify what the player needs to know, the element that conveys it, the input if visible and the resulting state. Write original timestamped notes and identify explanatory overlays or camera mods. In a compilation, inspect each requested game independently. A gameplay clip can supply a target or status cue even when it never opens a menu.

You must actually view each image or frame (browser view, fetched image, or a user capture). Text about an
image is not inspection. Record **how** you viewed it (`inspection.method`) and when (`inspection.on`). For
fetched files and user captures, record the `sha256` of the bytes you viewed.

Motion claims need several frames at recorded playheads (`media_positions`) from a clip, or live interaction.
One frame is a still image. A frame from the user's own recording is the best motion evidence: ask for one
when motion matters.

## 4. Write the observation (one per screen)

Describe in this order: **zones** (where things sit), **selection** (how the chosen item differs, inside and
outside its box), **type**, **shape and material**, **what stays still**. Then separately:

- `observed`: only what is visible.
- `inferred`: plausible mechanism or unseen behaviour, marked as uncertain.
- `website_translation`: an original web proposal. It is not a claim about the game.

Choose `screen` from the vocabulary (`library.mjs screens`). Use `screen_label` for the game's own name for it.

## 5. Import and check

```
node scripts/library.mjs import --file new-research.json
node scripts/library.mjs check
node scripts/library.mjs show <new-observation-id>
```

Imports go to your user store (`~/.game-ui-frontend/library.json`, or `GAME_UI_FRONTEND_HOME`), validated as
a whole batch. Nothing is written if any record fails. Wrong data can be removed with `retract`.

## 6. Contribute back (optional)

To add research to the bundled library for everyone, add records to `data/games.json` in a pull request, run
`node scripts/library.mjs docs --write` (regenerates the catalog) and `npm test`.

## Planned

Automated research (scheduled discovery from permitted APIs, vision triage, Playwright frame capture from
permitted video sources) is planned. Until then research is manual and per-brief.
