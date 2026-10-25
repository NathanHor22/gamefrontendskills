# Worked example: improving a generic studio site

An example of the full Workflow A output, run against the test fixture `tests/fixtures/generic-site/`
(a deliberately generic two-page studio site). Use it as the shape and depth of a real answer, not as a
design to copy. The directions are original proposals; the evidence ids are real library records.

---

## 1. Intake

- **Site:** small product studio, two pages (home, about). Goal: visitors open a service and get in touch.
- **Stack:** static HTML/CSS. No framework, no tokens.
- **References:** none given; user said "you choose, but keep it professional".
- **Scope:** home page hero, navigation and services section; contact action.

## 2. Audit (`audit.mjs tests/fixtures/generic-site/index.html`)

Signals found: `single-typeface` (Arial only), `uniform-rounded-rectangles` (all buttons 8px), `transition-all`,
`single-duration` (0.2s), `no-authored-shape`, `uniform-card-grid` (3 × 323×212), `no-reduced-motion`,
`hover-colour-only`. Looking at the screenshots: three primary-looking buttons compete in the hero; the services
grid is three grey boxes with one word each; nav is plain text links.

## 3. Diagnosis

| Section | Screen type | Now | Game equivalent does better | Priority |
| --- | --- | --- | --- | --- |
| Hero | `title` | H1 + 3 equal blue buttons | One subject, one primary action, quiet secondary | High |
| Services | `mode_select` | 3 equal grey cards | Each choice is its own world; the selected one grows; one shared explanation shelf | High |
| Nav | `main_menu` | Text links, colour hover | Persistent current marker, a marker that travels | Medium |
| Contact | `confirmation` + `results` | Button only | A considered submit and a success moment | Low (next round) |

## 4. Evidence

- Title composition: `silent-hill-2-2001-main-anatomy` (huge mark, small unboxed menu), `sifu-main-menu-anatomy` (narrow left column, heavier selected line).
- Mode choice: `sf6-main-mode-three-typographic-worlds` (three panels, different lettering and material), `forza-horizon-5-rally-mode-choice-anatomy` (selected poster taller and wider with exterior rails), `taiko-dnf-mode-anatomy` (shared explanation shelf).
- Primary action: `hok-interlocking-mode-start` (pointed START plate), `wild-rift-play-medallion` (action breaks its rail).
- Navigation: `hi-fi-rush-main-menu-anatomy` (exterior arrow), `sf6-cut-corner-grid-and-separate-cursor` (cursor separate from tiles).

## 5. Directions (mocks compared with `capture.mjs`)

**A. Print registration desk.** Material: print production (cream paper, registration marks, two spot inks).
Shapes: chamfered plates, crop-mark brackets, a circular "registration" marker. Type: condensed grotesk display
plus a humanist text face. Signature control: a primary action whose crop marks snap outward on intent and fold in
on exit. Services become three posters printed in different spot colours and lettering (SF6 worlds); the selected
one is taller and wider.

**B. Instrument panel.** Material: dark instrument glass, hairlines and tick rulers. Shapes: brackets, ticks,
one amber sweep. Type: wide extended display plus a mono for data. Signature control: a bracketed action whose
amber sweep crosses beyond the right bracket. Services as three gauges on one ruler.

**C. Night signage.** Material: deep blue-black scene, warm sign light. Shapes: slanted plates at −9°, one
red arrowhead marker. Signature control: the breakout primary from `templates/buttons.html`.

**Recommendation: A.** It suits "professional" better than B or C, stays bright and readable, and its
material (print) maps naturally onto a studio's work. B risks reading as a monitoring dashboard; C is the most
game-like and the least professional for this client.

## 6. Chosen direction A: specification

**Tokens**

```css
--c-scene: #f3efe6; --c-plate: #fffdf8; --c-ink: #1b1a17; --c-ink-muted: #5b5850;
--c-accent: #e2402c;  /* spot red: selection + primary action */
--c-signal: #1f5fd1;  /* spot blue: registration marks, markers */
--angle: 0deg; --cut: 12px; --seam: 4px;
--t-enter: 200ms; --t-exit: 140ms;
```

**Placement (desktop):** hero wordmark left-aligned across 60% of the viewport; a three-item unboxed menu
under it (`title`); primary action "Start a project" bottom-right of the hero; services stage below as three
unequal posters with an explanation shelf under the row; nav top-right in small caps with a registration-dot
marker. **Phone:** wordmark stacks, primary action becomes a full-width sticky bottom bar with the same crop
marks, posters stack with the selected one first.

**Signature control (primary action):** plate = chamfered red rectangle on a `::before`; exterior art = four
crop marks on `::after`/child spans. Entry: marks travel 6px outward (200ms, overshoot), label nudges 3px.
Exit: marks fold back in 140ms, all at once. Interrupt: CSS transitions reverse from the current value.
Reduced motion: marks appear at the outward pose without travel. Focus shows the same art plus the outline.

## 7. Verification (after implementation)

```
verify.mjs index.html --selector ".cta" --selector ".poster" --selector "nav a" --context ".services" --long-label
audit.mjs index.html
```

Report the real numbers from those runs, in this shape (this example was not implemented, so it has none):

- Counts: fail / warn / pass.
- Every `fail`: fixed (what changed) or still open (why).
- Every `warn`: fixed, or why it's acceptable (for example "`contrast-hover` busy backdrop: checked by eye").
- Audit signals before → after (which generic signals are gone, which remain and why).
- Paths to the strips you looked at.

## 8. Report to the user

What changed per section and why (with the evidence ids above), before/after images from `capture.mjs`,
verification counts, and next steps: contact form with a stamp-style submit (`type-stamp-submit`) and a results
moment; research one more `title` reference because the library has only two.
