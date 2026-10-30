---
name: game-ui-frontend
description: Design, improve and verify website and web-app UI using game interface research (title screens, main menus, character select, pause, settings, results). Use when the user wants to improve a site's UI "with game design principles", build a page inspired by named games, or create distinctive buttons, navigation, selectors, overlays, layouts and motion instead of generic components. Includes a searchable library of studied game screens, layout and component guides, working reference code, and Playwright scripts that audit a site and verify controls in a real browser. Not for game development or gameplay systems.
---

# Game UI for frontend websites

Games have solved hard interface problems for one screen at a time: one focal subject, an unmistakable
selection, a primary action that looks like nothing else, and motion with order and asymmetry. This skill
turns studied game screens into original website UI, then proves the result works in a real browser.

All paths below are relative to this skill's directory. Run scripts with the skill's **absolute** path
from the user's project directory. With `skills use`, resolve paths from the temporary supporting directory
provided in the prompt. No permanent skill installation or repository checkout is needed.

## Pick the workflow

| The user wants… | Follow |
| --- | --- |
| "Improve my site / page / component" (existing code or URL) | [workflows/improve.md](references/workflows/improve.md) |
| "Build a site / page with these game principles" | [workflows/build.md](references/workflows/build.md) |
| "Research <game>" or the library lacks a screen type | [workflows/research.md](references/workflows/research.md) |
| Check that controls behave (after any UI change) | [workflows/verify.md](references/workflows/verify.md) |

Both design workflows run: intake → (audit) → map sections to screen types → gather evidence → 2–3
**rendered** directions → user picks → implement in their stack → verify → report.

## Tools

```
node scripts/library.mjs search --screen character_select       # evidence for a screen type
node scripts/library.mjs search "exterior marker" --limit 5      # by idea
node scripts/library.mjs resolve "dragonball fighterz"           # informal game names → ids
node scripts/library.mjs show <id>                               # full record
node scripts/library.mjs screens                                 # screen types, web equivalents, coverage

node scripts/audit.mjs <url> [--pages 6]                         # screenshots + inventory + generic-UI signals
node scripts/capture.mjs <a> <b> <c> --labels "A,B,C"            # side-by-side mocks or before/after
node scripts/verify.mjs <url> --selector "<css>" [--context "<css>"] [--click-first "<css>"] [--viewport 390x844]
```

Library commands need only Node ≥ 20. Browser scripts need Playwright and axe-core. Reuse them if available;
otherwise install them beside this skill copy (including when it is temporary):

```sh
npm install --prefix "<absolute skill directory>" --no-save --package-lock=false playwright@1.56.1 axe-core@4.10.3
node "<absolute skill directory>/node_modules/playwright/cli.js" install chromium
```

Use `npm.cmd` on Windows if PowerShell blocks `npm.ps1`. Keep this setup outside the user's project;
Chromium is downloaded into Playwright's browser cache. Research alone needs none of these dependencies.
Never claim a visual or behavioural check you could not run. If Playwright MCP tools are
available, use them for exploring; use the scripts for anything you report as verified.

**Always look at the images** the scripts write (screenshots, `*-strip.png`). The scripts measure behaviour;
judging the art is your job.

## Where to put things and what to build

- **Placement:** [layout/screen-map.md](references/layout/screen-map.md) maps every website surface to its game
  screen, with zone diagrams and evidence. [layout/placement.md](references/layout/placement.md) gives zones,
  scale contrast, anchoring, frame-breaking art, layer order and responsive recomposition.
- **Components:** [buttons](references/components/buttons.md) · [navigation](references/components/navigation.md) ·
  [selectors](references/components/selectors.md) · [panels](references/components/panels.md) ·
  [forms](references/components/forms.md) · [feedback](references/components/feedback.md)
- **Styles:** [typography](references/styles/typography.md) · [colour and material](references/styles/color-material.md) ·
  [shape](references/styles/shape.md) · [motion](references/styles/motion.md)
- **Working code:** [templates/](templates/) has `tokens.css`, `buttons.html`, `navigation.html`, `selector.html` and
  `overlay.html`. Each passes `verify.mjs`. Translate them into the project's stack; don't paste them in.
- **Evidence:** [research/findings.md](references/research/findings.md) (synthesis) and
  [research/catalog.md](references/research/catalog.md) (every observation by screen type and game).
- **Example answer:** [examples/worked-example.md](examples/worked-example.md).

## Rules that always apply

1. **Original work.** Game images are research, not assets. No game logos, characters, fonts or wholesale screen
   copies. Borrow placement, layering, state logic and motion order; draw new art.
2. **Evidence honesty.** Separate what a source shows (`observed`) from interpretation and from your proposals.
   A screenshot can't establish motion, timing or hover. Cite observation ids for game-derived decisions.
3. **Directions must differ in material, shape vocabulary and motion**, not in accent colour. Reject any direction
   that would fit an unrelated startup after a colour swap.
4. **Never move or reshape a control's hit area on hover.** Move child layers; decorative art is `pointer-events: none`;
   `clip-path` goes on pseudo-elements.
5. **Every interactive element defines** rest, intent (hover = focus-visible), pressed, selected/current, disabled
   and reduced-motion states, with entry and exit as different gestures and clean interruption.
6. **Semantic HTML first:** links navigate, buttons act, native inputs where possible, DOM order = reading order.
7. **Respect the source policy** in `data/preferences.json` (and the user's `~/.game-ui-frontend/preferences.json`):
   excluded sites are never used; sites marked `no_automated_access` or `link_only` are never crawled.
8. **Scope:** research requests produce research and directions; build only what was asked; never publish or deploy.

## Preferences

Read `data/preferences.json`, then the user's `~/.game-ui-frontend/preferences.json` if present (objects merge,
lists replace). The user's explicit instructions win. `examples/authored-sites.json` holds optional credited
example sites from this skill's author; don't assume they reflect the current user's identity or taste.
