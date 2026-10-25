# Selectors and indexes: rosters, grids, carousels, filters

Working code: [templates/selector.html](../../templates/selector.html) (radio-based roster, travelling numbered
marker, stage that swaps subject and name, locked items). Placement: [screen-map.md](../layout/screen-map.md#project--product--team-index--character-select-character_select).

## What games teach about choosing from many

1. **Two speeds: a dense, stable index and a large, changing preview.** Pointing at an item updates
   the preview immediately; the index never reflows. Evidence: `dbfz-preview-handoff-motion`, `gbvsr-portrait-ledger`, `sfv-perspective-character-rail`
2. **The preview subject breaks its frame.** Characters, products and posters rise past the panel edges.
   Evidence: `dbfz-perspective-roster`, `hi-fi-rush-skill-store-anatomy`, `taiko-dnf-mode-anatomy`
3. **The selected item is larger than its neighbours on both axes**, with an exterior contour.
   Evidence: `forza-horizon-4-playlist-anatomy`, `forza-horizon-5-buy-sell-anatomy`, `fc25-live-start-anatomy`
4. **Availability is drawn, not just disabled.** Locked, unknown, owned, new and complete each have artwork in
   the same geometry. Evidence: `forza-horizon-5-mode-state-sheet-anatomy`, `lego-marvel-roster-anatomy`, `honkai-star-rail-roster-anatomy`, `apex-legends-legends-anatomy`
5. **Cells have a shape language**: slanted portrait cells, circular tokens, tall plaques, spines.
   Evidence: `tokon-comic-spines`, `clair-obscur-expedition-33-character-selection-anatomy`, `mlbb-shop-circular-selection`

## Archetypes

| Archetype | Use for | Shape |
| --- | --- | --- |
| **Roster + stage** | Projects, products, team, case studies (6–40 items) | Compact grid at the bottom or side; 50–65% preview stage |
| **Poster wall** | 3–8 featured items | Unequal posters; the selected one extends beyond its neighbours |
| **Spine shelf** | Archives, issues, chapters, releases | Narrow vertical spines; the selected one opens wide |
| **Token ring / constellation** | Skills, services, tags, categories | Circular tokens in a ring or network; the selected one blooms |
| **Ribbon carousel** | Sequential items (tracks, courses, episodes) | Horizontal ribbon; the selected name bright, the rest muted |
| **Filter chips with drawn selection** | Narrowing a collection | Patterns: `chalk-fan-category`, `scratch-cut-filter-label` |

Patterns: `registration-slip-selector`, `poster-peel-project`, `shutter-cut-project-link`, `screenprint-overlap-switcher`.

## Interaction model: preview vs commit

| Input | Preview (temporary) | Commit (persistent) |
| --- | --- | --- |
| Pointer | `pointerenter` on a cell | click |
| Keyboard | focus moves with arrow keys | radio change (arrow keys) or Enter on a link |
| Touch | (none: no hover) | tap |
| Leaving the index | Preview returns to the committed item | — |

- Build single-choice rosters from **native radio inputs** in a `<fieldset>`: arrow keys, a single tab stop,
  form semantics and screen-reader announcements are free. If each item navigates to a page, use a list of
  links instead and make the stage a preview of the focused or hovered link.
- Announce **commits** in a `role="status"` region, never every preview.
- On touch, the first tap commits. Never require "tap to preview, tap again to open".

## The stage swap

- Start every swap from the *current on-screen state*: read `getComputedStyle` (opacity/translate), cancel the
  running animation, then animate from those values. Rapid browsing redirects instead of queueing.
- Give subject, name and detail shelf different entries (subject rises, name slides, detail cross-fades)
  and keep the roster still.
- Detail shelf in a fixed position: title, 1–2 lines, 2–4 aligned metadata pairs, one action.
- Reduced motion: swap instantly; keep the marker position change, which is state rather than decoration.

## Placement and reflow

- Desktop: stage top-left or centre, detail shelf on the right, roster along the bottom.
- Tablet: stage above, detail beside the roster.
- Phone: stage then detail stacked; the roster becomes a horizontal scroller with `scroll-snap-type: x mandatory`;
  the marker moves with the scrolled cell.

## Engineering rules

1. Visually hide radio inputs with a 1px technique, not `display: none` (that removes them from keyboard and AT).
2. A clipped cell can't show an outline, so draw focus on the wrapper: `.cell:has(input:focus-visible) { outline: … }`.
3. Locked items: `disabled` input + visually hidden "(locked)" text + drawn lock art. Don't make them focusable dead ends.
4. The stage is `aria-hidden` when it only duplicates the detail shelf's text.
5. Marker position from `offsetLeft/offsetTop`, recomputed in a `ResizeObserver`.

## Generic tells to avoid

- A 3-column grid of equal rounded cards with an image, title, two lines and a "Read more" link.
- Hover that lifts the card with a shadow and `scale(1.03)`.
- Carousels with dots and auto-advance.

## Checklist

- [ ] Index stays still; only the marker and stage change.
- [ ] Preview on intent, commit on choice, preview returns to the committed item on leave.
- [ ] Availability states are drawn in the same geometry.
- [ ] Native radios or links; one tab stop for a radio roster; commits announced.
- [ ] Swaps redirect from the current state; reduced motion swaps instantly.
- [ ] `verify.mjs --selector ".cell" --context "<root>"` passes.
