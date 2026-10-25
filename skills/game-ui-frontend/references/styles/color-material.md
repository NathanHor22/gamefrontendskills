# Colour and material

Games rarely have a palette alone; they have a **material**: brush paint, comic paper, instrument glass,
toy plastic, VHS noise, printed ledger. The material decides edges, textures, colours *and* how things move.

## What games teach

1. **One material for the whole interface**: labels, focus marks, panels and feedback all belong to it.
   Evidence: `tokon-comic-spines`, `papers-please-stamp-anatomy`, `alien-isolation-crafting-composite-anatomy`
2. **The same game uses different dialects per area** without losing coherence. Evidence: `sf6-main-mode-three-typographic-worlds`
3. **Colour roles are strict**: one selection colour, one alert colour, one ownership/status colour.
   Evidence: `tk8-main-menu-art-vs-utility` (pink selection throughout), `forza-horizon-5-garage-anatomy` (white/magenta selection edge)
4. **Selected = full colour, unavailable = monochrome**, applied to the artwork itself.
   Evidence: `dbfz-splashed-campaign`, `forza-horizon-5-mode-state-sheet-anatomy`
5. **Atmosphere lives behind the UI**: night scenes, mist, rain, light. Evidence: `y0-night-street-atmosphere`, `sifu-main-menu-anatomy`, `sh2r-main`

## Pick a material, then derive everything from it

| Material | Edges | Texture | Colour logic | Motion character |
| --- | --- | --- | --- | --- |
| Brush paint | Dry-brush, torn | Bristle streaks | Black field, one hot accent, gold/cream type | Strokes wipe on, dry off |
| Comic / print production | Trim guides, registration marks | Halftone, paper | Cream paper, CMYK accents | Panels slide, stamps hit |
| Instrument / HUD glass | Hairlines, brackets, ticks | Scanlines, grid | Dark field, cyan/amber signal | Sweeps, scans, snaps |
| Toy / plastic | Thick outlines, offset shadows | Flat | Saturated primaries | Bounce, pop, wobble |
| Ledger / paperwork | Ruled lines, stamps | Paper fibre | Off-white, ink, red stamp | Slide, stamp, file away |
| Night city | Neon outlines | Wet reflections, haze | Deep blue-black, warm signage | Flicker-free glow fades |

Choose for the **content and audience**, not the reference game. A law firm can be "ledger"; a music festival
can be "print production".

## Colour roles (tokens)

```css
--c-scene      /* page / environment */
--c-scene-2    /* depth layer */
--c-plate      /* translucent panel over the scene */
--c-ink        /* primary text */
--c-ink-muted  /* secondary text (≥ 4.5:1 on scene) */
--c-accent     /* selection + primary action: ONE colour */
--c-accent-ink /* text on accent */
--c-signal     /* exterior markers, alerts */
--c-focus      /* focus indicator: highest contrast in the system */
```

- Components only use roles, never raw hex values. Re-theming changes token values only.
- Check every text/background pair you actually render, at rest and at intent: 4.5:1 for body, 3:1 for ≥ 24px
  or bold ≥ 18.66px, 3:1 for focus indicators and essential graphics.
- State is never colour-only: pair it with shape, marker, weight or text.
- Dark scenes need `color-scheme: dark` so form controls and scrollbars match.

## Texture and depth

- Texture as CSS (`repeating-linear-gradient`, SVG filters, small tiled images) at low opacity. Keep it
  off text where possible.
- Translucent plates: `background: color-mix(in srgb, var(--c-scene) 85%, transparent)` plus optional
  `backdrop-filter: blur()`. Always keep a solid fallback for contrast.
- Depth from overlap and scale, not from drop shadows on everything.

## Generic tells to avoid

- A palette swap of the reference game's colours onto standard components.
- Purple-to-blue gradients, glassmorphism cards and neon glow on everything.
- Grain or glitch overlays added at the end with no relationship to the content.
