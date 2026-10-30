# game-ui-frontend

An agent skill for **Claude Code** and **Codex** that improves or builds website UI using game interface
research, then checks the result in a real browser.

Games have spent decades solving hard interface problems on a single screen: one focal subject, a selection
you can't miss, a primary action that looks like nothing else, and motion with order and asymmetry. This skill
gives your agent a library of studied game screens (title screens, main menus, character select, pause,
settings, results…), guides for placement, components and styles derived from them, working reference code,
and Playwright scripts that audit your site and verify every control it changes.

## Use through skills.sh without a permanent install

You need Node.js **22.20 or newer**, Git, and an installed, signed-in Codex CLI or Claude Code.
Run the matching command from your website project:

```sh
# Codex
npx skills@latest use NathanHor22/gamefrontendskills@game-ui-frontend --agent codex

# Claude Code
npx skills@latest use NathanHor22/gamefrontendskills@game-ui-frontend --agent claude-code
```

On Windows, use `npx.cmd` if PowerShell blocks `npx.ps1`.

Then describe your design task in the session that opens. To print the skill prompt for an existing
coding-agent chat on the same machine, omit `--agent codex` or `--agent claude-code`.

[skills.sh's `use` command](https://github.com/vercel-labs/skills/blob/main/docs/commands.md#skills-use)
fetches the instructions, research and scripts into a temporary directory. It does not register a permanent
agent skill or add skill files to your project. Files still reach your machine: npm can cache the CLI,
and temporary supporting files may remain after the session. A public GitHub skill is readable and downloadable.

Research needs no browser dependencies. For screenshots and verification, ask the agent to follow the
browser setup in the supplied `SKILL.md`. Playwright and axe-core go beside that temporary skill copy;
Chromium uses Playwright's browser cache. Existing project dependencies can also be reused.

## Use it

Improve an existing site:

```text
Use the game-ui-frontend skill to improve the UI of http://localhost:3000.
It's a portfolio for an architecture studio; keep the brand colours.
```

Build something new:

```text
Use game-ui-frontend to build a landing page for our rhythm-game studio.
Take composition from Taiko no Tatsujin and navigation clarity from Street Fighter 6.
```

Work on one piece:

```text
With game-ui-frontend, redesign the project grid on /work as a character-select style index, then verify it.
```

What the agent does:

1. **Intake.** It reads your repo (stack, tokens, fonts) and asks only for what it can't find.
2. **Audit** (`audit.mjs`). It takes screenshots at phone, tablet and desktop widths, makes an inventory of interactive elements, and checks for generic-UI signals (single typeface, uniform rounded buttons, `transition: all`, colour-only hovers, uniform card grids, no reduced-motion support) and accessibility violations.
3. **Diagnosis.** It maps each section of your site to a game screen type: hero → title screen, nav → main menu, project grid → character select, modal → pause, and so on.
4. **Evidence.** It pulls the relevant studied screens from the library.
5. **Directions.** It writes 2–3 distinct directions and renders each as a static mock. It compares them side by side (`capture.mjs`) and waits for your choice.
6. **Implementation** in your stack, highest-impact sections first.
7. **Verification** (`verify.mjs`) in real Chromium:
   - states, frame strips of entry and exit motion
   - interruption, hover flicker, and decoration stealing clicks
   - keyboard reach and focus visibility, target size, pixel-measured contrast
   - reduced motion, phone layout and accessibility
8. **Report.** You get before/after images, the evidence behind each decision, and the verification results.

## What's inside

```
skills/game-ui-frontend/
  SKILL.md                     the agent's entry point (short router)
  references/
    workflows/                 improve · build · research · verify
    layout/                    screen-map (website surface → game screen, zone diagrams) · placement rules
    components/                buttons · navigation · selectors · panels · forms · feedback
    styles/                    typography · colour & material · shape · motion
    research/                  findings (synthesis) · catalog (generated: every observation by screen and game)
    library.md                 data model and commands
  templates/                   tokens.css + working demos: buttons, navigation, selector, overlay
  scripts/                     library.mjs · audit.mjs · verify.mjs · capture.mjs
  data/                        games.json · patterns.json · vocabulary.json · preferences.json
  examples/                    worked example · optional authored-site studies
```

The templates are original, held to the same bar as your code: each one passes `verify.mjs` in CI.

## The library

```sh
node skills/game-ui-frontend/scripts/library.mjs screens                   # screen types + coverage
node skills/game-ui-frontend/scripts/library.mjs search --screen title     # everything for a screen type
node skills/game-ui-frontend/scripts/library.mjs search "exterior marker" --limit 5
node skills/game-ui-frontend/scripts/library.mjs resolve "dragonball fighterz"
node skills/game-ui-frontend/scripts/library.mjs show tk8-options-mask-and-selection-sweep
```

The library holds 44 game/edition profiles, 128 visual observations from 107 reviewed images and 9 video
sources, and 24 original web interaction patterns (`library.mjs stats` gives the current numbers). It's
selected research, not an exhaustive catalogue. Coverage is uneven: character select, mode select, main
menu and hub screens are well covered, while title, pause, loading and settings screens are thin (see
`library.mjs screens`).

Every observation separates what the source shows (`observed`) from interpretation (`inferred`) and from an
original web proposal (`website_translation`). Each one records its screen type, its evidence level (still
image, video frames, production sheet, text) and how the source was inspected. A screenshot is never treated as
evidence of motion.

Your own research goes to `~/.game-ui-frontend/library.json` (`library.mjs import --file …`), separate from
the bundled data. Upgrades never overwrite or hide it, and `retract` removes mistakes. Personal preferences go
in `~/.game-ui-frontend/preferences.json`.

## Sources and rules

- Game images are research, not assets: the skill borrows principles (placement, layering, state logic,
  motion order) and draws original art. No game assets are bundled.
- A per-domain source policy in `data/preferences.json` controls research. Mobbin and CodePen are excluded;
  Game UI Database is never browsed automatically (it blocks AI agents); Interface In Game is link-only (its
  terms prohibit crawling). Browser scripts refuse those domains.
- Browser scripts only open the URL you give them and its same-origin links, never submit forms or log in,
  and write output to `.game-ui-frontend/runs/` in your project. Add that folder to your `.gitignore`.

See [CREDITS.md](CREDITS.md) for source acknowledgements.

## Develop

```sh
npm install && npx playwright install chromium
npm test                                   # library, packaging, docs and browser tests
npm run check                              # data + doc integrity (links, evidence ids, catalog freshness)
npm run docs                               # regenerate the research catalog after editing data
```

CI runs the library and packaging tests on Linux and Windows (Node 20 and 22) and the browser tests on Linux.

## Roadmap

- Automated research: scheduled discovery from permitted sources (official APIs, press kits, your own
  captures), vision triage, Playwright frame capture from permitted video, and a review queue.
- More title, pause, loading and settings screens.
- Automate the eval runs in [evals/](evals/) (briefs and rubric exist; scoring is manual today).

## License

MIT for the original code, instructions, analysis and proposals. Linked games, images, footage, fonts and
trademarks belong to their owners.
