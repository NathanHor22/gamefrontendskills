# Feedback: loading, progress, toasts, results, empty and error states

Working code: [templates/overlay.html](../../templates/overlay.html) (determinate stamps vs indeterminate sweep,
result toast with a projecting crest). Placement: [screen-map.md](../layout/screen-map.md#success-receipt-report--results-results).

## What games teach about feedback

1. **Completion is a ceremony.** A large heading, an emblem projecting past its plaque, statistics placed in
   separate corners. Evidence: `clair-obscur-expedition-33-results-anatomy`, `mlbb-2025-result-crest`, `ff16-tomes-update-anatomy`
2. **Rigid data plus one expressive gesture**: a hand-drawn "Victory" over a strict scoreboard.
   Evidence: `mlbb-broadcast-result-type`
3. **Progress is drawn from the subject**: accumulating footprints, route nodes, stamps.
   Evidence: `sh2r-footprints`, `sf6-stage-route-scene-and-index`, `tokon-training-step-stack`
4. **Rewards reveal in stages** (card backs → colour → final card with light trails).
   Evidence: `mlbb-2025-surprise-flip`
5. **Completion states recolour the whole object** (gold coat + check footer), not just a badge.
   Evidence: `forza-horizon-5-mode-state-sheet-anatomy`

## Types and rules

| Feedback | When | Rules |
| --- | --- | --- |
| **Determinate progress** | Known amount of work | `role="progressbar"` with `aria-valuenow/min/max`; show the number; draw it from the subject (stamps, route, ink) |
| **Indeterminate wait** | Unknown duration | Must *look* different from determinate: no fake percentages, no bar that fills; `aria-busy` on the region |
| **Skeleton** | Content layout is known | Use the real layout's silhouettes in the site's shape language, not grey rounded bars |
| **Toast / status** | Background success, saved, copied | `role="status"`; anchored bottom-right; a small crest projecting above the plate; auto-hide ≥ 3s and pause on hover/focus if it has actions |
| **Results / success page** | Purchase, submission, completion | The ceremony: heading, emblem, separated stats, one next action |
| **Empty state** | Nothing here yet | Drawn object + one sentence + one action. Missing items as pale silhouettes (`sifu-board-anatomy`) |
| **Error** | Something failed | Plain words on what happened and what to do; keep the user's input; `role="alert"` only for blocking errors |

## Motion

- Entry gestures for success can be bigger than anything else on the site. They are rare, so they can
  carry the drama. Keep them under ~600ms and never block the next action.
- Indeterminate loops: slow (≥ 1s cycles), no flashing (≤ 3 flashes per second), stopped under reduced motion
  (replace with a static "working" mark).
- Staged reveals (`mlbb-2025-surprise-flip`) only where the outcome is genuinely a reveal. Never delay a plain confirmation.

## Generic tells to avoid

- Spinner circles everywhere, including for determinate work.
- A green check in a circle in the middle of a white page for every success.
- Toasts that slide in and out with the same gesture from the top-centre.

## Checklist

- [ ] Determinate and indeterminate look different; real values are reported.
- [ ] Success has a designed moment; errors are plain and recoverable.
- [ ] Status messages use `role="status"`; nothing important is conveyed by colour alone.
- [ ] Loops stop under reduced motion; nothing flashes more than three times a second.
