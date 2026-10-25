# Verification: what each check means and how to fix it

`verify.mjs` runs a real Chromium (Playwright) against a URL or local file and writes `report.json`,
`summary.md` and screenshots per control. Exit code 1 means at least one `fail`.

```
node scripts/verify.mjs <url|file> --selector "<css>" [--selector "<css>"] [--max 3]
     [--context "<css>"]       # include a shared marker/preview container in screenshots and stale checks
     [--click-first "<css>"]   # open a menu or dialog before every check
     [--viewport 390x844]      # primary viewport (default 1440x900)
     [--long-label]            # triple the label text and check clipping
     [--no-axe] [--out dir]
```

Pick selectors that match the **interactive element** (the `<a>`/`<button>`, or the wrapper containing a
native input), one or two instances per component type. Always **look at the strips**: `states-strip.png`
(rest, hover, interrupted, pressed, focus, reduced-motion hover, mobile), `enter-strip.png` and `exit-strip.png`.
The script checks behaviour; you judge the art.

## Checks

| Check | Fails when | Usual cause → fix |
| --- | --- | --- |
| `hover-visible` (warn) | Hover changes < 0.2% of the art box | No intent state, or the item is already current → add an intent state (current items may legitimately not change) |
| `decoration-pointer` | Pointer > 12px outside the control still hits it | Exterior art without `pointer-events: none`, or oversized pseudo-elements → add `pointer-events: none` |
| `motion-captured` (info) | No CSS/WAAPI animation found | Instant change, or JS-driven animation (GSAP, rAF) that the script can't pause → fine, but check by eye |
| `entry-duration` (warn) | Entry > 700ms | Too slow for hover → shorten or move the drama to a one-time moment |
| `interruption` | After rapid in/out/in, the pose differs > 1% from a clean hover, or animations are still running | Queued animations, JS that doesn't redirect from the current state, state flags that get stuck → use CSS transitions, or cancel and animate from computed values |
| `hover-flicker` | `:hover` toggles ≥ 2 times with the pointer still near an edge | The hit area moves on hover: translating/scaling the link itself, or changing its own `clip-path` → move a child span; put shapes on pseudo-elements |
| `press-visible` (warn) | Pressed looks like hover | No `:active` state → add compression, fill or a darker plate |
| `keyboard-reachable` | Can't be reached with Tab (or arrow keys inside its widget) | `div` with a click handler, `tabindex="-1"`, hidden by CSS → use a real `<button>`/`<a>`, fix roving tabindex |
| `focus-visible` | Focus changes nothing visible, or `:focus-visible` doesn't match | `outline: none` without a replacement, or `clip-path` hiding the outline → restore the focus style; make focus show the intent art |
| `target-size` | Smaller than 24px (fail) or 44px (warn) | Tiny icon buttons → enlarge padding; keep the art small if needed |
| `contrast-rest` / `contrast-hover` | Text below 4.5:1 (3:1 large) against the dominant rendered backdrop | Accent plate too light, text over images → adjust tokens, add a plate. "Busy backdrop" warns: check by eye |
| `long-label` (warn) | Tripled label is clipped | Fixed widths, `overflow: hidden` → let plates grow, allow wrapping |
| `reduced-motion-movement` | Movement animations > 150ms under `prefers-reduced-motion` | Transitions not shortened → shorten via motion tokens in the media query |
| `reduced-motion-state` | Reduced motion removes the hover state entirely | Intent art hidden behind animation only → keep the final pose |
| `mobile-visible` | Control extends past 390px | Fixed widths, projection margins → recompose at small widths |
| `mobile-target` (warn) | < 44px on touch | Enlarge |
| Page `horizontal-overflow-*` | The page scrolls sideways | Exterior art or wide elements without room → reserve space, clip decorative layers in a wrapper |
| Page `axe` | Serious/critical accessibility violations | Follow the axe rule text |
| Page `console-errors` (warn) | Errors in the console | Fix them: they often mean broken behaviour |

## Limits (say so in reports)

- Script-driven animation (requestAnimationFrame, GSAP, canvas, WebGL) can't be paused and frame-stepped.
  Judge it from the strips and by running the page.
- Contrast is measured against the dominant colour behind the text; gradients and images need an eye check.
- Passing verification doesn't mean the design is good, only that it behaves.

## Other tools

- `audit.mjs <url>`: before and after a redesign; the generic-UI signal list should shrink.
- `capture.mjs a b c --labels "…"`: side-by-side images of mocks or before/after.
- With Playwright MCP available, use it for exploration (clicking through flows, reading the page). Use these
  scripts for anything you report as verified, because they are repeatable.
