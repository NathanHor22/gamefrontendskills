# Panels, dialogs, drawers and detail panes

Working code: [templates/overlay.html](../../templates/overlay.html) (pause-style `<dialog>` with separate
entry/exit gestures). Placement: [screen-map.md](../layout/screen-map.md#modal-drawer-overlay--pause-pause).

## What games teach about panels

1. **The world stays visible.** Overlays blur, dim or letterbox what's behind them rather than replacing it.
   Evidence: `clair-obscur-expedition-33-pause-anatomy`, `forza-horizon-4-upgrade-confirmation-anatomy`, `ff7rebirth-tactical-overlay`
2. **Panels are translucent instruments over the scene**, with fine luminous borders that echo the scene's own lines.
   Evidence: `pso2ngs-inventory-pair`, `sf6-editor-keeps-world-present`, `dbxv2-skills-material`
3. **Detail is a second, separate sheet**: smaller, floating beside the list, often with a different edge
   (torn paint, cream paper). Evidence: `clair-obscur-expedition-33-inventory-anatomy`, `sf6-editor-keeps-world-present`, `pso2ngs-inventory-pair`
4. **Panels can enter at an angle and be clipped by the viewport**, as when a confirm sheet slides in from a corner.
   Evidence: `tokon-route-proof`
5. **Overlays break the composition on purpose** and partly cover the subject, which signals a temporary layer.
   Evidence: `tk8-slot-overlay-breaks-composition`

## Archetypes

| Archetype | Use for | Placement |
| --- | --- | --- |
| **Pause overlay** | Global menu, quick settings, "are you sure you want to leave" | Full-viewport layer; quiet title centre; 2–4 choices anchored lower-right |
| **Comparison sheet** | Checkout confirm, plan change, upgrade | Compact centred sheet; before/after chips; long primary strip above a quiet cancel strip |
| **Corner confirm** | Destructive or route-changing decisions | Sheet entering from a corner at the site's angle |
| **List + floating detail** | Asset libraries, inventories, file browsers | Tall list left; smaller detail sheet floating right |
| **Side drawer** | Filters, cart, secondary navigation | Edge-anchored; shares the site's slant on its leading edge |
| **Command palette** | Power users, apps | Compact stack in a lower corner over the dimmed page |

## Behaviour

- Use `<dialog>` with `showModal()` for modal layers: focus trapping, `inert` background, top layer and
  Escape (the `cancel` event) come built in. Style the backdrop with `::backdrop`.
- Entry and exit are different gestures. For example, the menu slides in from its edge and leaves by collapsing.
  Run the exit animation *before* calling `dialog.close()`. If the dialog reopens during the exit, cancel
  the close (check a state flag in the `animationend` handler).
- Focus goes to the first meaningful choice on open and returns to the opener on close.
- Clicking the blurred page (`e.target === dialog`) closes non-destructive overlays only.
- Respect `env(safe-area-inset-*)` for corner-anchored menus on phones.

## Placement rules

- Overlay choices are anchored (lower-right by default), not floating in the centre of a card.
- A comparison sheet sits in the reading path (centre) because the decision *is* the content.
- Detail sheets never cover the list item they describe.
- Phones: corner menus become full-width bottom sheets with the same edge treatment; drawers become full-screen.

## Generic tells to avoid

- A white centred modal with an X in the corner and two buttons bottom-right, over a 50% black backdrop.
- A modal that fades in and out with the same gesture.
- A drawer that is a plain rectangle sliding in with `ease-in-out`.

## Checklist

- [ ] The page behind stays visible and recognisable.
- [ ] `<dialog>`/`showModal` (or an equivalent focus trap + inert background); Escape works; focus returns.
- [ ] Separate entry and exit gestures; reopen during exit cancels the close.
- [ ] Choices anchored; detail sheet separate from the list; phone layout recomposed.
- [ ] `verify.mjs --selector "<dialog item>" --click-first "<opener>" --context "<menu>"` passes.
