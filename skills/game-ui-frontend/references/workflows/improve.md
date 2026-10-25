# Workflow A: improve an existing website's UI

Use when the user says "improve my site / this page / our UI with game design principles". Scripts are in
`scripts/`; run them with the skill's absolute path. Output folders go under `.game-ui-frontend/runs/` in the
user's project; suggest adding `.game-ui-frontend/` to their `.gitignore`.

## 1. Intake (ask only what you cannot find)

Find in the repo first: framework, styling system, component library, design tokens, existing fonts, dev
server command and port, and any design docs. Then confirm or ask:

| Need | Why |
| --- | --- |
| URL to inspect (local dev server preferred) | The audit and verification run against it |
| What the site is for, who uses it, the one thing visitors should do | Decides the focal subject and primary action |
| References: games, a vibe, or "you choose" | Starting points for research |
| Constraints: brand colours/fonts, things that must not change, deadlines | Keeps the direction applicable |
| Scope: one component, one page, or the whole site | Sizes the work |

If the user named games, run `node scripts/library.mjs resolve "<name>"` for each. An ambiguous edition
(e.g. "Persona 3 Golden") gets one short question only if it changes the design; otherwise state the assumption.

Start the dev server if needed (follow the project's own scripts). Browser tools open only the URL the user
gave you and its same-origin links. They never submit forms, log in or buy anything.

## 2. Audit

```
node scripts/audit.mjs <url> --pages 6
```

Read `summary.md`, then **look at the screenshots** (desktop and 390px) yourself. The automated signals
(single typeface, uniform rounded rectangles, `transition: all`, colour-only hovers, uniform card grids, no
reduced-motion support, accessibility violations) are a starting list, not the diagnosis.

## 3. Diagnose with the screen map

For each page section, write one row:

| Section | Screen type ([screen-map.md](../layout/screen-map.md)) | What it does now | What the game equivalent does better | Priority |
| --- | --- | --- | --- | --- |
| Hero | `title` | Centred H1 + two equal buttons | One focal subject, one primary action, quiet secondary | High |
| Header nav | `main_menu` | Five links, underline on hover | Travelling marker, current page persistent | Medium |
| Projects | `character_select` | 3×N equal cards | Stable roster + large preview stage | High |

Prioritise by (visitor impact × how generic it is now) ÷ effort. Fix the focal surfaces first (hero, primary
action, main index), then navigation, then forms, feedback and details.

## 4. Gather evidence

For each prioritised screen type:

```
node scripts/library.mjs search --screen character_select
node scripts/library.mjs search "detached marker preview" --screen character_select
node scripts/library.mjs show <observation-id>
```

Use 2–4 observations per screen type, from different games. If the library is thin for a screen type
(`node scripts/library.mjs screens` shows counts), research new references with [research.md](research.md)
before designing, or say plainly that the direction rests on fewer references.

## 5. Directions: render them, don't just describe them

Write 2–3 **genuinely different** directions (different material, shape vocabulary and motion character,
not three accent colours). For each:

- **Name** and a one-line idea ("Print registration desk").
- **Evidence**: which observations informed which decision.
- **Material** and **shape vocabulary** ([color-material.md](../styles/color-material.md), [shape.md](../styles/shape.md)).
- **Type roles** ([typography.md](../styles/typography.md)).
- **Signature control**: anatomy plus enter/exit/interruption ([buttons.md](../components/buttons.md), [motion.md](../styles/motion.md)).
- **Placement** of the prioritised sections ([placement.md](../layout/placement.md)).

Then build each direction as a **throwaway static mock** of the most important section (usually the hero plus
primary action, or the main index). Use plain HTML/CSS in `.game-ui-frontend/mocks/<direction>.html`, starting
from `templates/tokens.css` and the matching template. Compare them in one image:

```
node scripts/capture.mjs .game-ui-frontend/mocks/a.html .game-ui-frontend/mocks/b.html .game-ui-frontend/mocks/c.html --labels "A,B,C"
```

Look at `compare-1440.png` and `compare-390.png` yourself, then show the user the directions with the images'
paths and a recommendation. **Wait for their choice** before changing their code.

## 6. Implement in their stack

- Follow the repo's conventions: framework components, CSS approach, token files, naming, tests.
- Add the direction's tokens (colour roles, type scale, angle, seam, motion timings) to the project's token
  system first, then convert components one at a time in priority order.
- Use the templates as reference implementations, not paste-ins. Translate them into the project's components.
- Keep behaviour: routes, forms, analytics hooks and accessibility attributes stay working.
- Don't break unrelated pages; scope new styles.

## 7. Verify each changed component

```
node scripts/verify.mjs <url> --selector "<css for the control>" [--context "<css for its container>"] [--long-label]
```

Fix every `fail`, consider every `warn`, and **look at the strips** (`states-strip.png`, `enter-strip.png`,
`exit-strip.png`) to judge the art itself; the script checks behaviour, not taste. Repeat until clean or
until 3 rounds, then report what remains. See [verify.md](verify.md).

## 8. Report

Give the user:

- What changed, per section, and which evidence informed it.
- Before/after: `node scripts/capture.mjs <before-url> <after-url> --labels "before,after"` (keep a
  before-capture from step 2, or use a git stash/branch to serve the old version).
- Verification summary: pass/warn/fail counts and anything left open, honestly.
- Next steps they might want: the next priority sections, and research gaps.

## Don't

- Don't redesign everything when asked about one component.
- Don't paste game assets, logos or fonts; draw original art.
- Don't claim a hover/motion behaviour of a game that the evidence doesn't show.
- Don't skip verification because "it's just CSS".
