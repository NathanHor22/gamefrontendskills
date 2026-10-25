# Motion

Game UI motion has **layers, order and asymmetry**: things arrive in a sequence, leave differently, and are
interrupted constantly by fast input. This file covers how to study motion in a reference, how to specify it,
and how to build it so it survives real users.

## What the motion evidence shows

- **Layered handoff:** outgoing UI dims → a clean "scene beat" → panel → masked title → selection sweep, each in its own pass.
  Evidence: `tk8-options-mask-and-selection-sweep`
- **Paint and type entrance:** world UI recedes → paint field and band cover → portrait and scattered letterforms →
  the organised menu. Evidence: `metaphor-painted-entry`
- **Staged introduction:** an empty grid and panels → tilted selection cards project → large boards → character actors.
  Evidence: `tokon-preview-selection-choreography`
- **Coupled preview:** a small index token moves while the large foreground and background change together.
  Evidence: `dbfz-preview-handoff-motion`, `gbvsr-portrait-ledger`, `ggst-illustrated-mode-dock`
- **Subject-drawn progress:** footprints accumulate along a path. Evidence: `sh2r-footprints`

These are sampled video frames: they establish **order and layering, not exact easing or duration**.
Durations below are proposals.

## Specify motion as a state model

For every animated component, write:

```
states:        rest → intent → active/selected → leaving → rest   (+ pressed, disabled, busy)
enter:         which layer moves first, from where, how far, how long, easing, stagger
exit:          a DIFFERENT gesture: order, direction, speed (exits are usually faster)
interruption:  leave mid-entry, re-enter mid-exit, sweep across neighbours → what happens
reduced:       the final pose shown without travel; what still changes
```

Pattern records in the library include this as `motion_spec`; copy their structure.

## Default timing (proposals; tune per direction)

| Gesture | Duration | Easing |
| --- | --- | --- |
| Hover/focus entry (small control) | 160–260ms | Fast out, slight overshoot: `cubic-bezier(0.2, 0.9, 0.1, 1.15)` |
| Hover/focus exit | 100–180ms | Accelerating away: `cubic-bezier(0.5, 0, 0.75, 0)` |
| Stagger between layers | 30–60ms | — |
| Preview swap | 220–320ms | `cubic-bezier(0.3, 0, 0, 1)` |
| Panel/dialog entry | 220–350ms | Fast out |
| Panel/dialog exit | 150–220ms | Accelerating |
| Route/section transition | 350–600ms total | Layered passes |
| Success ceremony | ≤ 600ms, never blocking | Any |

Hover entry over ~700ms feels sluggish (verify warns). Exits should be noticeably faster than entries.

## Building it: rules that prevent real bugs

1. **CSS transitions for state changes.** Put the exit transition on the rest rule and the entry transition on the
   `:hover, :focus-visible` rule. Transitions reverse from their current value, so interruption is free.
2. **Web Animations API for sequences.** Before starting a new animation on an element, read its current computed
   values, `cancel()` the running animation, and animate *from* those values. Never queue.
3. **One-shot exit before removal** (dialogs, toasts): run the exit, then remove or close; if the element is
   reopened meanwhile, abort the removal.
4. **Animate `transform`/`translate`/`scale`/`opacity`/`clip-path` on decorative layers.** Never animate the hit
   area (target box) or layout properties of controls.
5. **Nothing moves the pointer target.** Motion belongs to labels, plates and exterior art.
6. **Direct manipulation is never eased** (dragging sliders, scrolling).
7. **Reduced motion keeps the state, not the travel:**
   ```css
   @media (prefers-reduced-motion: reduce) {
     :root { --t-enter: 1ms; --t-exit: 1ms; --t-stagger: 0ms; }
   }
   ```
   plus overriding any translate/rotate offsets to their final values. The intent pose must still appear
   (verify's `reduced-motion-state` check).
8. **No flashing** more than three times per second; loops stop under reduced motion.

## Studying motion in a reference (research)

- A screenshot cannot establish motion. Use clips with recorded playheads or live interaction.
- Record per layer: origin, path, maximum extension, settle, and what stays still.
- Record what you did **not** see (exit, interruption) as gaps. Never invent a reference's easing.
- For your own site, `verify.mjs` writes `enter-strip.png` and `exit-strip.png` by pausing the page's
  animations and stepping through them. Use them to check order and layering frame by frame.

## Generic tells to avoid

- Everything fades up 20px on scroll.
- `transition: all 0.3s ease-in-out` on every element.
- Identical entry and exit.
- Parallax as the only "motion design".
