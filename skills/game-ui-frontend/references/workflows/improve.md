# Workflow A: improve an existing website's UI

Use when the user says "improve my site / this page / our UI with game design principles". Run the scripts
in `scripts/` with the skill's absolute path. Each browser command prints its output path in the system
temporary directory. Use `--out <directory>` when the user wants to keep the reports somewhere else.

## 1. Intake (ask only what you cannot find)

Read the repo for framework, styling system, tokens, fonts, server command and existing design decisions.
Use the table to spot gaps. For creative intake, use the [two questions in the skill](../../SKILL.md#when-someone-says-build-my-website-with-this). Ask for the URL or scope only if the target itself is unclear.

| Need | Why |
| --- | --- |
| URL to inspect (local dev server preferred) | The audit and verification run against it |
| What the site is for, who uses it, the one thing visitors should do | Decides the focal subject and primary action |
| References: games, a vibe, or "you choose" | Starting points for research |
| Constraints: brand colours/fonts, things that must not change, deadlines | Keeps the direction applicable |
| Scope: one component, one page, or the whole site | Sizes the work |

If the user named a game, run `node scripts/library.mjs resolve --bundled "<name>"`. If an edition is ambiguous, use the brief to pick the closest studied edition and name it.

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

Map the visitor's first decision and its destination to a [game screen](../layout/screen-map.md). In a page-wide redesign, an opening pitch and three feature cards can give way to a single working surface. On a gig photographer's site, let someone pick a show from the contact sheets, open a photograph and return to it. Preserve the existing work, booking route and any facts needed to choose. For a component request, apply the diagnosis within that component.

## 4. Gather evidence

For each prioritised screen type:

```
node scripts/library.mjs search --bundled --screen character_select
node scripts/library.mjs search --bundled "detached marker preview" --screen character_select
node scripts/library.mjs show --bundled <observation-id>
```

Use the bundled observation that explains the visitor's decision. Add another when it answers a different question. If coverage is thin, name the closest studied analogue and identify your own design choices.

## 5. Directions: render them, don't just describe them

Frame each direction around what the visitor came to decide. Use [the art-direction guide](../art-direction.md)
to name what stays visible, what changes on selection and what opens on request. In the mock, replace any
ornamental numbering, filler labels or repeated card copy with space for the subject itself.

For a requested comparison, render 2–3 directions that differ in material, shape and motion. For a direct request to change the site, develop one evidence-backed direction and proceed to implementation. For each direction describe:

- **Name** and a one-line idea ("Print registration desk").
- **Evidence**: which observations informed which decision.
- **Material** and **shape vocabulary** ([color-material.md](../styles/color-material.md), [shape.md](../styles/shape.md)).
- **Type roles** ([typography.md](../styles/typography.md)).
- **Signature control**: anatomy plus enter/exit/interruption ([buttons.md](../components/buttons.md), [motion.md](../styles/motion.md)).
- **Placement** of the prioritised sections ([placement.md](../layout/placement.md)).

For a comparison of visual directions, build each candidate as a static mock of the most important section.
Create a fresh directory in the system temporary folder for the draft HTML and CSS. Start from
`templates/tokens.css` and the matching template in the temporary skill.

For a gameplay-led redesign, exercise the visitor's complete action in a working prototype instead. Give
the critic the task and the visitor's current route so they can compare the result, effort and ability to recover.

When comparing candidates, capture them together.

```
node "<absolute skill directory>/scripts/capture.mjs" "<absolute drafts directory>/a.html" "<absolute drafts directory>/b.html" "<absolute drafts directory>/c.html" --labels "A,B,C"
```

Look at `compare-1440.png` and `compare-390.png` yourself. When the user asked to choose between options, show the images and recommendation and wait for their choice.

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
