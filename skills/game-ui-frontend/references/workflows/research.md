# Research: adding game screens to the library

Use when a brief needs a game or screen type the library lacks (`node scripts/library.mjs screens` shows
coverage), or when the user asks to research a game. Record format and commands: [library.md](../library.md).

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
