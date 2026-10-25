# Workflow B: build a new site or page with game design principles

Use when the user asks for a new website, landing page, portfolio, product page or app UI "with these game
design principles" or "inspired by <game>".

## 1. Brief

Agree on, in a few lines:

- **Product goal:** what the visitor should understand or do.
- **Content inventory:** real sections, real copy lengths, real images or a plan for original art.
- **Audience and tone.**
- **References:** games (resolve with `library.mjs resolve`), or "you choose".
- **Stack:** the user's choice, or the simplest fit (static HTML/CSS, or their framework if a repo exists).

## 2. Map the site to screen types

List the pages and sections and assign each a screen type from [screen-map.md](../layout/screen-map.md). A
typical portfolio: hero → `title`, nav → `main_menu`, work → `character_select`, case study → `codex`,
contact → `text_entry` + `results`.

## 3. Research

For each screen type, gather 2–4 observations from different games (`library.mjs search --screen <type>`).
Assign each reference a **job** when blending: one gives composition and tone, another the navigation or
motion pacing. Write a blend recipe:

1. Product goal
2. Source A contribution (observed principle + evidence id)
3. Source B contribution (observed principle + evidence id)
4. Unifying rule (one angle, one material, one marker logic)
5. What is original (layout, art, copy, interactions)

If coverage is thin, research new references first ([research.md](research.md)).

## 4. Directions (render, compare, choose)

Same as Workflow A, step 5: 2–3 distinct directions, each with evidence, material, shape vocabulary, type roles,
a signature control and placement. Build each as a static mock of the hero and the primary index, compare them
with `capture.mjs`, and recommend one. Wait for the user's choice unless they asked you to decide.

## 5. Build

Order of work:

1. **Tokens:** colour roles, type scale, angle, cut, seam, spacing, motion timings, z-layers
   (start from [templates/tokens.css](../../templates/tokens.css)).
2. **Layout skeleton:** zones per page ([placement.md](../layout/placement.md)), semantic HTML in reading order.
3. **Signature components:** primary action, navigation, main index (from the templates).
4. **Content sections** with real copy.
5. **Feedback and states:** loading, empty, error, success, focus everywhere.
6. **Responsive recomposition** at 390 / 768 / 1440.
7. **Reduced motion** pass.

## 6. Verify and report

Run `verify.mjs` on every interactive component type (one or two instances each), `audit.mjs` on the finished
pages (the generic-UI signals should be gone), and `capture.mjs` for the final desktop/phone images. Report as
in Workflow A, step 8.

## Original-work rules

- Game screenshots are research, not assets. Draw original shapes, use the project's own or licensed imagery
  and licensed fonts.
- Don't reproduce a game's logo, characters, distinctive HUD or trade dress. Borrow principles (placement,
  layering, state logic, motion order), not identity.
- If the user asks for a near-copy of a specific game screen, explain the IP risk and offer a version that keeps
  the principle with original art.
