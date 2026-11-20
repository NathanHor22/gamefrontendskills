# Navigation: menus, tabs, docks, breadcrumbs

Working code: [templates/navigation.html](../../templates/navigation.html) (left-column menu with a travelling
marker and phone overlay; slanted ARIA tab rail). Placement: [screen-map.md](../layout/screen-map.md#primary-navigation--main-menu-main_menu).

## What games teach about navigation

1. **The selection is an actor, not a highlight.** One marker (arrow, sphere, wedge, cursor) moves between
   items while the items themselves stay still. Evidence: `sf6-cut-corner-grid-and-separate-cursor`, `dbfz-course-ribbon`, `ff16-scene-dialogue-choice`
2. **The menu is part of a scene.** Lists sit over or beside a large subject, not in an empty header bar.
   Evidence: `msmr-main-menu-column`, `hi-fi-rush-main-menu-anatomy`, `tk8-main-menu-art-vs-utility`
3. **Menu words can be the artwork.** Oversized, overlapping or arranged on a diagonal, with emphasis moving between them.
   Evidence: `metaphor-menu-anatomy`, `colin-mcrae-rally-2-0-main-menu-anatomy`
4. **Category docks use custom emblems**, with submenus rising from the chosen emblem.
   Evidence: `ggst-illustrated-mode-dock`, `pso2ngs-main-dock`
5. **Tabs share one slant** and an active wedge or underline. Evidence: `apex-legends-main-menu-anatomy`, `hi-fi-rush-options-anatomy`, `sifu-board-anatomy`

In a web menu, give each destination its own filled or framed surface. Translate the games' selection cues
into changes of plate shape, fill or an adjacent stamp. The focused item also needs a visible focus outline.

## Archetypes and when to use them

| Archetype | Use for | Items | Placement |
| --- | --- | --- | --- |
| **Left-column menu over scene** | Portfolios, studios, campaign sites | 4–7 | Left third, vertically centred; subject fills the rest |
| **Typographic menu** | Editorial, fashion, music, personal sites | 3–6 | Destination names on individual paper strips set at the site's angle |
| **Bottom emblem dock** | Apps, dashboards, tools with 4–6 sections | 4–6 | Bottom edge; submenu rises above the selected emblem |
| **Slanted tab rail** | Sections within a page (case study, product detail) | 2–6 | Above the content it switches |
| **Top rail with a travelling stamp** | Content-heavy sites that need a conventional header | 4–8 | Each item has a visible plate. A stamp moves beside the active item |
| **Route breadcrumb** | Deep hierarchies, multi-step flows | any | Above the page title; current step emphasised |

Patterns: `elastic-poster-menu`, `tethered-drawer-banner`, `slanted-tab-fan`, `folded-route-breadcrumb`, `chalk-fan-category`.

## The travelling marker

- One element for the whole menu, `aria-hidden="true"`, `pointer-events: none`, positioned with a CSS
  custom property (`translate: 0 var(--marker-y)`) and a CSS transition. A changed value redirects the
  transition from wherever it is, so rapid movement never queues.
- It follows **intent** (pointerenter, focus) and returns to the **current page** when intent leaves the menu
  (pointerleave and focusout outside the menu).
- Compute positions from `offsetTop`/`offsetLeft` relative to the marker's positioned container, and
  recompute in a `ResizeObserver` (fonts loading, wrapping and breakpoints all move items).
- Give the current page a distinct plate fill and `aria-current="page"`. Both persist while the stamp
  follows the pointer to another item.

## Semantics and keyboard

| Pattern | Markup | Keys |
| --- | --- | --- |
| Site menu | `<nav aria-label="…"><ul><li><a href aria-current="page">` | Tab between links |
| Tabs (switch content in place) | `role="tablist"`, `role="tab"` + `aria-selected` + `aria-controls`, `role="tabpanel"` | Tab into the list, ←/→ between tabs, Home/End; roving `tabindex` |
| Phone menu overlay | `<button aria-expanded aria-controls>` toggling the same `<nav>` | Escape closes and returns focus to the toggle |
| Dock with submenus | Disclosure buttons (`aria-expanded`), not `role="menu"` | Enter/Space opens, Escape closes |

Don't use `role="menu"` for site navigation. It promises application-menu keyboard behaviour that
links don't have.

## Placement and reflow

- Desktop: the index stays narrow (≤ 320px) and the scene gets the rest.
- Below ~720px: the same `<nav>` becomes a full-screen overlay opened by a toggle in the top-right.
  It keeps the same type, marker and slant, so phone users get the same direction as desktop.
- Tab rails scroll horizontally on phones. Use a distinct filled surface for the selected tab.
- Never hide navigation behind hover only.

## Engineering rules

1. **Move the label span, not the link.** `translate` on the `<a>` itself shifts its hit area under a
   still pointer and causes flicker. The verify script detects this as `hover-flicker`.
2. The marker and decorative subject are `aria-hidden`; the real labels are live text.
3. Don't animate layout properties (`top`, `width`, `padding`) of items; animate `translate`/`scale`
   of decorative layers.
4. Use one live heading. Let subject artwork behind the menu set the scene without competing with its labels.

## Generic tells to avoid

- A white header bar with logo left, 5 links right and a coloured "Contact" pill.
- Underlines or arrows on button-like navigation items.
- A hamburger on desktop.
- Background plates that only appear on hover, leaving the resting items looking like bare words.

## Checklist

- [ ] Placement archetype chosen for the site's content and number of destinations.
- [ ] One travelling marker (or a deliberate alternative), returning to the current item.
- [ ] Current page marked with `aria-current` and a visible non-marker cue.
- [ ] Correct semantics: links for navigation, ARIA tabs only for in-page switching.
- [ ] Phone overlay keeps the direction; Escape closes; focus returns to the toggle.
- [ ] `verify.mjs --selector "nav a" --context "nav"` passes (use `--viewport 390x844 --click-first "<toggle>"` for the phone menu).
