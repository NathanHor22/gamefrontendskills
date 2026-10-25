# Shape language

Shape is what makes a direction recognisable with the colour removed. Pick a small vocabulary and use it
everywhere: buttons, cells, panels, markers, loaders.

## What games teach

1. **One family of angles across the interface.** Evidence: `hi-fi-rush-main-menu-anatomy`, `apex-legends-main-menu-anatomy`, `tokon-training-step-stack`
2. **Cut corners and chamfers** instead of rounding. Evidence: `sf6-cut-corner-grid-and-separate-cursor`, `clair-obscur-expedition-33-character-selection-anatomy`
3. **Pointed and notched ends** that interlock. Evidence: `hok-interlocking-mode-start`, `dbxv2-cloud-spear-choices`, `clair-obscur-expedition-33-merchant-anatomy`
4. **Circles as tokens and medallions** set against angular rails. Evidence: `wild-rift-play-medallion`, `lego-marvel-roster-anatomy`, `ff16-abilities-orbit`
5. **Brackets and ticks** instead of filled boxes. Evidence: `alien-isolation-radial-anatomy`, `silent-hill-2-2001-inventory-anatomy`
6. **Irregular, drawn edges**: torn paint, brush loops, rough frames. Evidence: `clair-obscur-expedition-33-inventory-anatomy`, `batman-arkham-asylum-main-menu-anatomy`, `dbfz-brush-scene-options`

## Build a vocabulary of 3–5 shapes

| Slot | Example choices |
| --- | --- |
| **Plate** (buttons, cells, panels) | Skewed parallelogram, chamfered rectangle, pointed plaque, torn sheet |
| **Marker** (selection) | Arrowhead, diamond, numbered disc, bracket pair, sphere with trail |
| **Rail / divider** | Hairline with diamond joint, slash rail, dotted guide, tick ruler |
| **Emblem** (primary, success) | Medallion, crest, seal, stamp |
| **Texture edge** (optional) | Brush, halftone, scanline, paper fibre |

Write the vocabulary down in the direction ("plates are −9° parallelograms with a 14px cut; the marker is a
red arrowhead; rails are hairlines with diamond joints") and reuse it. Don't invent a new shape per component.

## Making shapes in CSS/SVG

| Shape | Technique | Watch out |
| --- | --- | --- |
| Parallelogram plate | `transform: skewX(var(--angle))` on a pseudo-element | Don't skew the element holding text, or un-skew the text |
| Chamfer / cut corner | `clip-path: polygon(...)` on a pseudo-element | `clip-path` clips hit-testing and the focus outline, so never put it on the control itself |
| Pointed plaque | `clip-path: polygon(10px 0, calc(100% - 10px) 0, 100% 50%, …)` | Use two stacked pseudo-elements for an outline (an outer and an inner layer) |
| Bracket corners | Four small borders via gradients or SVG | Keep them `pointer-events: none` |
| Torn / brush edges | SVG `mask-image` or an SVG path background | Keep a solid fallback; check contrast behind text |
| Medallion | `border-radius: 50%` + ring shadows (`box-shadow: 0 0 0 4px …`) | Ring shadows don't affect layout |
| Line drawing that draws on | SVG `stroke-dasharray` / `stroke-dashoffset` | Reduced motion shows the finished line |

## Rules

- Rounded rectangles aren't forbidden. They just can't be the *default* that decides the aesthetic.
- Shapes scale with content: test long labels and wrapping inside clipped plates.
- Keep the semantic box rectangular and stable; draw the shape inside or around it.

## Generic tells to avoid

- `border-radius: 8px` on everything.
- Blobs and wavy section dividers with no relationship to the content.
- A different decorative shape on every section.
