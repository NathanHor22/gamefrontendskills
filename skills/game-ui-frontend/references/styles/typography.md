# Typography

Game interfaces use type as a material and a moving part, not just a label. This file covers choosing
typefaces, building the scale, and the type behaviours worth borrowing.

## What games teach about type

1. **Words can be the composition.** Oversized menu words overlap portraits; a menu reads as a poster.
   Evidence: `metaphor-menu-anatomy`, `colin-mcrae-rally-2-0-main-menu-anatomy`
2. **Different destinations get different lettering**: graffiti, geometric, neon, in one menu.
   Evidence: `sf6-main-mode-three-typographic-worlds`
3. **Huge background lettering sits behind the subject.** Evidence: `tk8-versus-authored-illustration-layering`, `gbvsr-portrait-ledger`
4. **Selection changes weight and regularity**: the chosen line is heavier and less even than the others.
   Evidence: `sifu-main-menu-anatomy`
5. **Display and reading type contrast sharply**: a condensed or serif display face against a compact
   functional face. Evidence: `ff16-abilities-orbit`, `clair-obscur-expedition-33-results-anatomy`, `batman-arkham-asylum-main-menu-anatomy`
6. **Production marks become type**: mastheads, spines, signatures, trim guides.
   Evidence: `tokon-comic-spines`

## Pick two roles, not two fonts

| Role | Job | Typical choices |
| --- | --- | --- |
| **Display** | Headlines, menu words, numbers, labels on primary actions | Condensed grotesk, wide extended, high-contrast serif, stencil, hand-lettered: something with a *silhouette* |
| **Reading** | Paragraphs, metadata, forms | A sturdy text face with open counters; body ≥ 16px |
| *(optional)* **Data** | Tables, codes, stats, timers | Monospace or tabular-figure face (`font-variant-numeric: tabular-nums`) |

Make the heading distinguishable from the reading text at a glance. One family can do both jobs through
weight, size and spacing. Self-host fonts or use the project's licensed fonts; check the licence
covers web use.

## Scale

Start with readable body text. Size a single heading to identify the page or current selection and leave
room for its subject and controls. Cut repeated eyebrows, card captions and decorative numbering.

```css
--step-0:  clamp(1rem, 0.98rem + 0.15vw, 1.1rem);     /* reading text, labels, useful metadata */
--step-1:  clamp(1.2rem, 1.1rem + 0.5vw, 1.5rem);     /* menu items, buttons */
--step-3:  clamp(1.6rem, 1.4rem + 1vw, 2.25rem);      /* section titles */
--step-4:  clamp(2rem, 1.6rem + 2vw, 3rem);           /* page title */
```

- Check the longest heading at phone width alongside the actions it introduces.
- Remove giant background lettering and duplicated headings. Give required facts body size and contrast beside the choice they affect. Clear the tiny text bands from section footers.

## Type behaviours to borrow

| Behaviour | How on the web | Notes |
| --- | --- | --- |
| Uppercase tracked labels | `text-transform: uppercase; letter-spacing: 0.06–0.12em` | Short labels only; never paragraphs |
| Weight shift on selection | Variable font `font-variation-settings` or swap weight | Use `font-weight` changes with care: widths change, so reserve the width or use a variable font with stable widths |
| Typographic slip on intent | Translate a label span within its plate | Keep the link target fixed and the label fully readable |
| Mixed lettering per destination | Different display treatment per section/mode | Keep the reading face constant |
| Stamped / hand words | SVG lettering or a display face, used once per view | `mlbb-broadcast-result-type` |

## Rules

- Body text: 16px minimum, line-height 1.4–1.6, measure 45–75ch, ≥ 4.5:1 contrast.
- Never put long text in the display face or in uppercase.
- Use semantic headings in logical order. Print each heading once.
- Test with the longest real strings and with a translation 30% longer.
- Load fonts with `font-display: swap` and check layout when the fallback is showing (marker positions
  must recompute after fonts load; a `ResizeObserver` handles it).

## Generic tells to avoid

- A display face chosen by habit, such as Instrument Serif with an italic word in every headline. Test the project's own titles in its chosen face.
- Every heading the same weight, differing only in size.
- Gradient text as the "expressive" move.
