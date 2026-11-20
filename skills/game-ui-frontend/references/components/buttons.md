# Buttons and actions

In the [Picture House Archive](../../templates/buttons.html), select a room, follow the foyer bearing and turn over the object kept there. The page also includes a breakout primary, signal band, keycap and hold-to-confirm. Verify any button with
`node scripts/verify.mjs <page> --selector "<css>"`.

## What games teach about buttons

Look up the exact game in the [edition catalogue](../research/catalog.md#by-game). For the PSP compilation, use the [timecoded game list](../research/handheld-control-footage.md). An in-world prompt offers a different design lesson from a menu button. Identify what accepts the input, what merely reports state and what changes elsewhere on the screen. Where a clip shows only play, use its visible cue for that job and cite a menu study for the button itself.

For a single moving cursor, target ring, bearing, radar or object with depth, see the [close studies and original reconstructions](../research/target-and-menu-controls.md). Sketch the quiet pose and the acquired pose side by side. Mark the fixed hit area, the object the art attaches to, its pivot and the part that takes the input. Switch directly from one choice to another, confirm, then come back. Captured playheads establish the order of visible states. Choose web durations against the actual travel distance and label length.

For a *Persona 3 Reload* brief, study how the combat words sit across a disc and how the pause menu layers
a figure with a diagonal field. Choose a project-specific object whose edge the verb can share. The
ceramics example gives **Inspect glaze** a cutout, a moving ink edge and a stable focus target.
[Persona composition study](../research/persona-composition.md)

1. **Selection changes the silhouette, not just the colour.** A marker appears outside the row, a plate
   extends past its neighbours, or a band of colour reaches beyond the text.
   Evidence: `hi-fi-rush-main-menu-anatomy`, `dbfz-brush-scene-options`, `ff7rebirth-difficulty-artwork`, `sh2r-main`
2. **The primary action is physically different from everything else**: a medallion, a pointed plate,
   an interlocking pair. It is often larger than its rail and breaks out of it.
   Evidence: `wild-rift-play-medallion`, `hok-interlocking-mode-start`, `mlbb-lobby-art-and-action`
3. **Some source games leave choices unboxed.** For the web, borrow their spacing and type weight and put each action on its own plate.
   Evidence: `silent-hill-2-2001-main-anatomy`, `sifu-main-menu-anatomy`, `lego-marvel-menu-anatomy`
4. **Labels can be embedded in objects** such as stamps, plaques and keycaps.
   Evidence: `papers-please-stamp-anatomy`, `clair-obscur-expedition-33-merchant-anatomy`
5. **Shortcut hints hang outside the control** as small keycaps below or beside it.
   Evidence: `clair-obscur-expedition-33-pause-anatomy`, `clair-obscur-expedition-33-merchant-anatomy`

## Anatomy: four layers, separate boundaries

```
        ◆ exterior art (marker, emblem, rail, glow)  ← may leave the box, pointer-events: none
   ┌────────────────────────────┐
   │  plate (drawn body)        │  ← clip-path / skew / texture on a CHILD or pseudo-element
   │      LABEL (live text)     │  ← readable, stable, never moved under the pointer
   └────────────────────────────┘
   target = the <button>/<a> box   ← owns hit area, focus, semantics; never reshaped on hover
```

| Layer | Element | Rules |
| --- | --- | --- |
| Target | `<button>` for actions, `<a href>` for navigation | Its box never changes on hover. Min 44×44px on touch. |
| Label | Text node or `<span>` | Use a short, readable verb or destination. Keep arrow glyphs and underlines off the label in every state. |
| Plate | Child `<span aria-hidden>` or `::before` | Enclose the label with a visible fill or continuous frame at rest. Use the site's material, cuts and edges to give the container character. |
| Exterior art | Child `<span aria-hidden>` or `::after` | `pointer-events: none`; parent reserves margin for it. |

## Archetypes

### Breakout primary
The one main action per view can use a clipped plate with a distinct fill. In the demo, an exterior
emblem and contour mark this as the primary control. A flat plate can carry the action by itself.
- **Where:** bottom-right of the composition, or directly under the focal subject. One per view.
- **Size:** the largest control on screen (≥ 56px tall on desktop).
- **Motion:** entry is rail draws → emblem lifts → label nudges (staggered). Exit is emblem drops first, rail retracts last.
- **Lineage:** `wild-rift-play-medallion`, `hok-interlocking-mode-start`, `apex-legends-main-menu-anatomy`
- Patterns: `ripcord-burst-action`, `unequal-beacon-reticle`, `stencil-breakout-action`

### Signal band action
A quiet, filled plate encloses each menu choice. On intent a band of colour projects past the plate while its edges and label stay legible.
- **Where:** title-screen-style menus with 2–5 choices, hero secondary actions, quiet nav.
- **Rule:** the label barely changes (colour only); the *field* carries the state.
- **Current/selected** shows the band permanently (`aria-current`).
- **Lineage:** `sh2r-main`, `silent-hill-2-2001-main-anatomy`, `ff7rebirth-difficulty-artwork`

### Exterior-marker row
A filled menu row with a separate disc or stamp outside its left edge to mark selection.
Use one shared marker that travels rather than one per row (see [navigation.md](navigation.md)).
- **Lineage:** `hi-fi-rush-main-menu-anatomy`, `batman-arkham-asylum-main-menu-anatomy`, `dbfz-brush-scene-options`, `ff16-scene-dialogue-choice`
- Patterns: `detached-ink-comet`, `satellite-caption-rig`

### Keycap secondary
Set a working shortcut inside the plaque beside the action when it helps someone use the interface repeatedly.
Declare it with `aria-keyshortcuts` and ignore it while the user types in a field.
- **Where:** dialogs, editors, media players, multi-step flows ("Back", "Skip", "Next").

### Hold to confirm
Destructive or irreversible actions. Holding fills the plate; releasing early drains it *from where it is*.
- **Must** offer an alternative for people who cannot hold: a second click within a few seconds, or a confirm dialog.
- **Must** handle Enter (fires click on keydown) and Space (fires click on keyup). Call `preventDefault` and run your own press logic.
- Announce the result in a `role="status"` region.

### Stamp / physical object action
The label is engraved on an object that moves (a stamp, lever or latch) for approve/reject and submit flows.
- **Lineage:** `papers-please-stamp-anatomy`. Patterns: `type-stamp-submit`, `machined-latch-toggle`

## State table (every button must define every row)

| State | Trigger | Must show | Notes |
| --- | --- | --- | --- |
| Rest | none | Visible, styled container around the whole label | Includes secondary actions and links presented as buttons |
| Intent | `:hover` (pointer) and `:focus-visible` (keyboard) | Same art for both | Keyboard users get the full composition |
| Pressed | `:active`, pointer down, key down | Compression, fill or darker plate | Visible within 1 frame |
| Selected / current | `aria-current`, `aria-pressed`, `aria-selected` | Persistent, different from intent | Survives pointer leaving |
| Disabled | `disabled` / `aria-disabled` | Same geometry, desaturated + reason nearby | Never only lower opacity |
| Busy | after activation | Progress inside the same silhouette | `aria-busy`, keep the label readable |
| Reduced motion | `prefers-reduced-motion: reduce` | Final intent pose, no travel | The state change must remain |

## Engineering rules (each of these is a real bug the verify script catches)

1. **Never move or reshape the target on hover.** Translating the link, changing its padding, or changing
   its own `clip-path` moves the hit area out from under a still pointer and causes hover flicker.
   Move a child `<span>`, and put `clip-path` on a pseudo-element. (`clip-path` clips hit-testing too.)
2. **Exterior art is `pointer-events: none`**, or it extends the hit area beyond the visible control
   and steals clicks from neighbours.
3. **Reserve space for projection** with margin/padding on the target or its wrapper. Never let an
   ancestor's `overflow: hidden` clip it, and never let it cause horizontal scroll on phones.
4. **Asymmetric timing with plain CSS:** declare the *exit* transition on the rest rule and the *entry*
   transition on the `:hover, :focus-visible` rule. CSS transitions reverse from their current value,
   so interruption is handled for free.
5. **The focus outline must stay visible.** `clip-path` on the target clips its outline, which is another
   reason to draw shapes on pseudo-elements.
6. **Use a link for navigation and a button for actions.** Never a `<div onclick>`.
7. **Text must not rely on the plate for contrast alone** when the plate animates in. Check contrast at
   rest *and* at intent (verify does both).

## Generic tells to avoid

- Every button the same 8px-radius rectangle, differing only in colour.
- Hover = darker background, `transition: all 0.2s ease`.
- Scale-up on hover (`scale: 1.05`). It's the most common "game-like" cliché and it shifts the hit area.
- Icons inside every button "to make it look designed".
- Three primary-looking buttons in one view.

## Checklist

- [ ] One primary action per view, visibly the largest control, in an anchored position.
- [ ] Every action has a visible plate before interaction. Its label stays free of arrows and underlines.
- [ ] Intent is visible. Any exterior art has a job, such as identifying the selected action or showing its progress.
- [ ] Target box never changes; exterior art is `pointer-events: none`; projection space reserved.
- [ ] Hover and focus-visible share the art; pressed, selected, disabled and busy are all defined.
- [ ] Reduced motion keeps the final silhouette; nothing travels.
- [ ] `verify.mjs` passes: no flicker, no decoration-pointer failures, interruption settles cleanly.
