# Placement: where things go and why

Games are composed for one fixed screen. Websites scroll, resize and get read by keyboards and
screen readers. These rules carry game composition over without breaking the web. Numbers are
**starting defaults**. Change them on purpose, and say so in the design rationale.

## 1. Assign zones before drawing anything

Every screen in the library breaks down into the same six zones. Name them for each page or section
before choosing colours or components.

| Zone | What lives there | Game habit | Web default |
| --- | --- | --- | --- |
| **Scene** | Background image, texture, environment, the content itself | Stays visible behind menus | Never a flat blank page behind overlays |
| **Focal subject** | One portrait, product, wordmark, headline or metric | Owns 40–70% of the screen | One per viewport; the first thing seen |
| **Index** | The list of choices: nav, roster, filters | Compact, stable, at an edge | Never resizes when something in it is hovered |
| **Primary action** | The one thing you want done | Biggest interactive element, often breaks its rail | One per view, in a predictable corner |
| **Detail** | Description, metadata and stats for the current selection | A separate pane or shelf that updates in place | Fixed position; swaps content, doesn't move |
| **Utility perimeter** | Settings, account, help, currency, hints | Small icons at the edges and corners | Edges and corners, low contrast until focused |

If two zones fight for the same space, the zone higher in the list above wins the large area and the
other zone shrinks. Sites look generic when every zone gets equal weight, as in a 3×N card grid.

## 2. Scale contrast

- The focal subject should be **3–5×** the size of the largest interactive label. Games get drama from
  very large subjects next to small, crisp controls (`dbfz-perspective-roster`, `tk8-main-menu-art-vs-utility`).
- Display type: **≥ 6×** body size for title or hero words, `clamp()`-scaled (see [typography.md](../styles/typography.md)).
- Index items stay small and dense: 14–18px labels, tight rhythm. They are a tool, not the show.
- The primary action is the **largest control**, at least 1.5× the height of other buttons. It may break
  out of the rail or row it belongs to (`wild-rift-play-medallion`).

## 3. Anchor to corners and edges, not the centre

Game UI is anchored: lists hug the left, actions sit bottom-right, status sits at the top edge, hints sit
at the bottom edge. Centred stacks are rare and kept for ceremonies (results, pause labels).

| Element | Default anchor (LTR) | Reason |
| --- | --- | --- |
| Index / nav list | Left edge, vertically centred or upper third | Read first, scanned often |
| Primary action | Bottom-right of the composition, or directly under the focal subject | End of the reading path |
| Detail pane | Right of the index, or a shelf under the focal subject | Follows the eye from list to result |
| Utility icons | Top-right and bottom-left corners | Out of the reading path |
| Status / progress | Top edge rail | Glanceable, never covers content |
| Hints / shortcuts | Bottom edge, small | Available, not loud |

For right-to-left languages, mirror the horizontal anchors with logical properties
(`inset-inline-start`, `margin-inline-end`) rather than writing a second layout.

## 4. Let art break frames, but never let controls or text break

Frame-breaking is the signature of game UI: a character rising out of a card, a sphere sitting outside a
row, a contour wrapping past the edge. Rules:

- **Allowed to overflow:** decorative plates, exterior markers, subject cut-outs, glows, splashes,
  contour rails, oversized background lettering.
- **Never overflow or be covered:** readable labels, body text, focus indicators, other controls' hit areas.
- Overflowing art is `pointer-events: none` and lives in an overflow-visible wrapper whose parent
  reserves room for it (padding or margin equal to the maximum projection), so it never causes
  horizontal scroll or clipping by an ancestor's `overflow: hidden`.
- Budget it: on desktop, each control may project up to ~40% of its own height outside its box; the
  focal subject may project past its frame by any amount, as long as it doesn't cover text.

## 5. Layer order (back to front)

```
scene → plates/panels → focal subject → oversized decorative type → index & labels
      → selection marker → primary action → focus indicator (always top)
```

Large type can sit *behind* the subject (`tk8-versus-authored-illustration-layering`, `gbvsr-portrait-ledger`).
Keep a short list of `z-index` tokens (`--z-scene: 0` … `--z-focus: 50`) instead of arbitrary numbers.

## 6. One angle, one rhythm

- Choose **one dominant angle** for the whole site (for example −8° or 12°) and reuse it for slants,
  skews, clip-path cuts and motion paths. Several unrelated angles look like noise
  (`hi-fi-rush-main-menu-anatomy`, `apex-legends-main-menu-anatomy` keep one family of slants).
- Choose **one seam width** between modules (for example 4px or 8px) and keep it everywhere, the way
  production guides specify module seams (`forza-horizon-5-layout-guide-anatomy`).
- Use a spacing scale on a 4px base: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.

## 7. Asymmetric module stages beat uniform grids

Prefer a stage of **unequal modules**, one large and a few small, over N equal cards:

```
┌───────────┬───────────────────┬───────────┐
│  small    │                   │  small    │
├───────────┤      LARGE        ├───────────┤
│  small    │   (current item)  │  strip    │
│           │                   │  strip    │
└───────────┴───────────────────┴───────────┘
```

CSS Grid with named areas and `grid-template-columns: 1fr 2fr 1fr` does this with no special tricks.
Reserve the large module for the current or featured item, never for whatever happens to be first.

## 8. Reading order is not visual order

The composition can be diagonal, layered and asymmetric. **The DOM order must still be the logical order:**
heading → index → detail → primary action → utilities. Achieve the visual arrangement with CSS Grid
placement, never with `tabindex` values above 0 or by duplicating content. Test by tabbing through the
page (the `verify` script does this) and by reading the page with CSS disabled.

## 9. Density

| Surface | Density | Why |
| --- | --- | --- |
| Hero / title | Very low: 1 subject, 1–2 actions | Atmosphere is the message |
| Navigation | Low: 4–7 items | Choice paralysis is real on menus too |
| Index / roster | High: many small items | Built for scanning; the preview carries the detail |
| Detail pane | Medium | Readable paragraphs, aligned metadata columns |
| Dashboard | Medium-high at the perimeter, low in the centre | Utilities stay small, the focus stays clear |

## 10. Reflow: keep the character, change the composition

Do not shrink a desktop composition onto a phone. Recompose it, keeping the same drawing logic:

| Pattern | ≥ 1024px | 600–1023px | < 600px |
| --- | --- | --- | --- |
| Left column nav over scene | Column + large subject | Column narrows, subject crops tighter | Full-screen overlay menu, same markers and type |
| Bottom dock | Dock with rising submenus | Dock, fewer labels | Bottom tab bar, same emblems, submenu becomes a sheet |
| Index + large preview | Side by side or preview above roster | Preview above, roster below | Preview becomes the top of a stacked detail page; roster becomes a horizontal scroller with snap |
| Module stage (1 large + small) | 3 columns | 2 columns, large spans both | 1 column, large first |
| Primary action bottom-right | Bottom-right | Bottom-right | Sticky bottom bar, full width minus gutters, same shape language |
| Detached exterior markers | Full projection | Reduced projection | Inside the box, or reduced to a short inline mark |

- Phone gutters: 16px minimum. Use `env(safe-area-inset-*)` for notches and home indicators. This is the
  web's equivalent of the console "TV-safe area".
- Touch targets ≥ 44×44px. Exterior art must not shrink the real target.
- Test with real content lengths: long names, long translations, empty states, missing images.

## Placement checklist

- [ ] Zones named for every page section; one focal subject per viewport.
- [ ] One primary action per view, in a predictable anchored position, the largest control on screen.
- [ ] Index stays still on hover; the detail pane swaps content in place.
- [ ] Overflowing art never covers text, focus rings or other controls, and never causes horizontal scroll.
- [ ] One angle, one seam width, one spacing scale used everywhere.
- [ ] DOM order matches the logical reading order; no positive `tabindex`.
- [ ] Each breakpoint recomposed, not shrunk, and each keeps the signature shapes and markers.
