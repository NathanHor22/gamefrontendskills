# game-ui-frontend

An agent skill for **Claude Code** and **Codex** that improves or builds website UI using game interface
research, then checks the result in a real browser.

Website these days ugghhhh. Commander Chief would not approve. The battalion would not approve. I built my own style.

For a playable website, three agents connect the research to the visitor's task. The **game design philosopher**
extracts a rule, a choice and its consequence from footage. The **gameplay web designer** builds a loop
around something the visitor wants to do. The **design critic** tries that task and explains which choices
to keep, revise or remove. [Video studies and design philosophy](skills/game-ui-frontend/references/research/game-design-philosophy.md) · [Brief-to-direction guide](skills/game-ui-frontend/references/art-direction.md)

## Run with skills.sh

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

`skills use` loads one skill into a temporary directory outside your repository. npm may cache the CLI,
and the temporary directory can remain available after the command exits. [How skills.sh runs a skill](https://github.com/vercel-labs/skills/blob/main/docs/commands.md#skills-use)

Research needs no browser dependencies. For screenshots and verification, ask the agent to follow the
browser setup in the supplied `SKILL.md`. Playwright and axe-core go beside that temporary skill copy;
Chromium uses Playwright's browser cache. Existing project dependencies can also be reused.

The philosopher, designer and critic are [three roles](skills/game-ui-frontend/agents/) inside this one
skill. The session reads their prompts from the temporary copy and can delegate each role from there.

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

Build a playable experience:

```text
Use game-ui-frontend to design our print studio as a small retro workshop. Let visitors choose
an artwork and ink, pull a proof and keep a copy. Use the philosopher, designer and critic.
```

Open the [Print Room](skills/game-ui-frontend/templates/print-room.html) locally to try the reference
experience. For another subject, use its actual materials, decisions and outcomes.

For a page or component redesign, the skill follows this workflow.

1. **Intake.** It reads your repo (stack, tokens, fonts) and asks only for what it can't find.
2. **Audit** (`audit.mjs`). It takes screenshots at phone, tablet and desktop widths, makes an inventory of interactive elements, and checks for generic-UI signals (single typeface, uniform rounded buttons, `transition: all`, colour-only hovers, uniform card grids, no reduced-motion support) and accessibility violations.
3. **Diagnosis.** It maps each section of your site to a game screen type: hero → title screen, nav → main menu, project grid → character select, modal → pause, and so on.
4. **Evidence.** It reads the relevant game records or timestamped studies and explains what each contributes.
5. **Directions.** For an open brief it compares distinct rendered options. For a specified direction it develops that choice. A brief centered on a mechanic gets a working interaction that a visitor can try.
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
    research/                  video studies · design philosophy · Warframe navigation · generated catalog
    art-direction.md           brief, reference decisions and worked website directions
    library.md                 data model and commands
  agents/                      philosophy, website design and critique roles · skill metadata
  templates/                   print room, buttons, navigation, selector and overlay
  scripts/                     library.mjs · audit.mjs · verify.mjs · capture.mjs
  data/                        games.json · patterns.json · vocabulary.json · preferences.json
  examples/                    worked example · optional authored-site studies
```

The original component templates have browser verification tests, available locally or through the manual
CI run. The Print Room journey test changes the inks and checks the downloadable proof.

## The library

```sh
node skills/game-ui-frontend/scripts/library.mjs screens                   # screen types + coverage
node skills/game-ui-frontend/scripts/library.mjs search --screen title     # everything for a screen type
node skills/game-ui-frontend/scripts/library.mjs search "exterior marker" --limit 5
node skills/game-ui-frontend/scripts/library.mjs resolve "dragonball fighterz"
node skills/game-ui-frontend/scripts/library.mjs show tk8-options-mask-and-selection-sweep
```

The library holds 47 game/edition profiles, 136 visual observations from 111 reviewed images and 12 video
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
- A per-domain source policy in `data/preferences.json` controls research. Game UI Database blocks AI agents,
  and Interface In Game prohibits crawling. Browser scripts enforce the source policy.
- Browser scripts open the URL you give them and its same-origin links. Audit, capture and verification
  save their reports in the system temporary directory by default and print the output path.

See [CREDITS.md](CREDITS.md) for source acknowledgements.

## Develop

```sh
npm ci --ignore-scripts
node --test tests/library.test.mjs tests/package.test.mjs
npm run check                              # data + doc integrity (links, evidence ids, catalog freshness)
npm run docs                               # regenerate the research catalog after editing data
```

Browser verification is optional. To run it locally:

```sh
npx playwright install chromium
node --test --test-concurrency=1 tests/browser.test.mjs
```

Pushes and pull requests run the library and packaging tests on Linux and Windows (Node 20 and 22),
without installing Chromium. To include browser tests, use **Actions → Check skill and library → Run workflow**.
That manual browser job uses Ubuntu 24.04, supported by the pinned Playwright version.

## Roadmap

- Automated research: scheduled discovery from permitted sources (official APIs, press kits, your own
  captures), vision triage, Playwright frame capture from permitted video, and a review queue.
- More title, pause, loading and settings screens.
- Automate the eval runs in [evals/](evals/) (briefs and rubric exist; scoring is manual today).

## License

MIT for the original code, instructions, analysis and proposals. Linked games, images, footage, fonts and
trademarks belong to their owners.
