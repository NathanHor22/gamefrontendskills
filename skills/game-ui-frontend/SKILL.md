---
name: game-ui-frontend
description: Develop original websites from game design research. Use for game design philosophy, creative direction, playable website mechanics, 3D environments, retro startups, mission flows, character selection and expressive controls. Includes a research agent, a website design agent, a design critic, a searchable game library, working frontend examples and browser verification.
---

# Game UI for frontend websites

A game gives someone a reason to act and makes the consequence visible. Start with what the visitor
came to do. Study how a game handles an equivalent decision, then design the website's own space,
controls and feedback around its subject.

All paths below are relative to this skill's directory. Run scripts with the skill's **absolute** path
from the user's project directory. With `skills use`, resolve paths from the temporary supporting directory
provided in the prompt. Read the research, role prompts and templates from that directory. Keep the skill
bundle and its dependencies there. Only write the website changes or deliverables the user requested
into their project.

## Pick the workflow

| The user wants… | Follow |
| --- | --- |
| "Improve my site / page / component" (existing code or URL) | [workflows/improve.md](references/workflows/improve.md) |
| "Build a site / page with these game principles" | [workflows/build.md](references/workflows/build.md) |
| "Study these videos", "give my site a creative direction", or "make it feel playable" | [Art direction](references/art-direction.md) routes the brief to source moments. For an interaction loop, spatial environment or retro startup, use the agents below. |
| "Research <game>" or the library lacks a screen type | [workflows/research.md](references/workflows/research.md) |
| Check that controls behave (after any UI change) | [workflows/verify.md](references/workflows/verify.md) |

For an open design brief, compare distinct rendered directions. For a specific direction, develop it
directly. For an experience built around a mechanic, prototype a whole visitor action and its consequence.
Verify the resulting journey in the browser when implementation is requested.

Before composing either design, use [From a website brief to an art direction](references/art-direction.md).
Explain the visitor’s decision, what they see on arrival, what exploring reveals, and which action commits.
Carry the project’s own subject through the art and controls. Keep decorative numbering and filler microcopy out of the interface.

## Research, design and critique

For a game-led experience, give the [game design philosopher](agents/game-design-philosopher.md) the brief and
sources. Pass its findings to the [gameplay web designer](agents/gameplay-web-designer.md), then ask the
[design critic](agents/game-design-critic.md) to challenge the direction or play the built journey. Pass the
critic's strongest objection back to the designer and verify the change. Use the relevant role alone for a
research-only, transfer-only or review request. When the runtime supports delegation, pass each role
prompt and the absolute temporary skill path to a separate general subagent in the session.
When working alone, apply the profiles in sequence and identify the review as a self-review.

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
- **Working code:** [Print Room](templates/print-room.html) demonstrates a playable 3D workshop and a local
  PNG export. The [component templates](templates/) cover buttons, navigation, a selector and an overlay.
  Translate the applicable behavior into the project's stack.
- **Evidence:** [research/findings.md](references/research/findings.md) (synthesis) and
  [research/catalog.md](references/research/catalog.md) (every observation by screen type and game).
- **Example answer:** [examples/worked-example.md](examples/worked-example.md).

## Rules that always apply

1. **Original work.** Game images are research, not assets. No game logos, characters, fonts or wholesale screen
   copies. Borrow placement, layering, state logic and motion order; draw new art.
2. **Evidence honesty.** Separate what a source shows (`observed`) from interpretation and from your proposals.
   A screenshot can't establish motion, timing or hover. Cite a library observation ID or a source playhead
   from the linked video study for game-derived decisions.
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
