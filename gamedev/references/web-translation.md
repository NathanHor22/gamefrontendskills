# Translating game interfaces into frontend website design

Use this reference when the requested product is a website, web app, portfolio,
landing page, shop, dashboard, or browser experience. Game UI is the design
research material. The website's audience, content, and tasks determine the result.

## Understand the reference request

Recognize informal names, spelling errors, franchises, editions, and mixed titles.
Resolve a likely typo silently when it has one clear meaning; preserve the user's
original wording in research notes alongside the canonical candidate.

| User wording | Working interpretation | Handling |
| --- | --- | --- |
| yakuzo 0, yakuza zero | Yakuza 0 | Normalize for lookup. |
| crisis 2 | Crysis 2 | Treat as a likely typo; verify the reference title. |
| infamous 2 | inFAMOUS 2 | Normalize spelling for lookup. |
| persona 3 golden | Ambiguous mix of Persona 3 and Persona 4 Golden | Use current context or an explicit local preference; clarify when the edition changes the design. |
| marvel's spiderman | Marvel's Spider-Man family of games | Verify the title/edition when different candidates affect the visual research. |
| gears of war, gears | Franchise or a particular installment | Use franchise scope provisionally; label the installment for every inspected reference. |
| persona style | A broad visual intention | Offer plausible interpretations and label the chosen assumption; do not claim one franchise-wide UI system. |

Do not make the user memorize catalog names. Match their creative intent before
asking for precision. A request such as "Persona energy with Spider-Man clarity"
can be a blend brief; it does not require choosing one game as the only source.
Distinguish the qualities the user wants from literal screen recreation.

## Build a useful visual vocabulary

Describe observations in terms that survive translation between media. Store
screen-level evidence separately from these general analytical dimensions.

| Dimension | What to record | Website translation |
| --- | --- | --- |
| Composition | Anchors, asymmetry, dominant shape, negative space, alignment | Hero arrangement, section grid, reading order, content emphasis |
| Hierarchy | First focal point, rank changes, grouping, contrast | Page title, supporting copy, primary action, secondary navigation |
| Rhythm | Dense versus quiet regions, repetition, pauses, interruptions | Section pacing, card cadence, reading breaks, controlled visual peaks |
| Typography | Display versus reading roles, weight, width, case, spacing | Expressive headings with a legible body system and real content lengths |
| Shape language | Angles, curves, frames, cutouts, borders, detached layers | Original control contours, overflowing hover art, selectors, masks, spatial transitions |
| Color roles | Base, surface, emphasis, state, decoration | Semantic design tokens with accessible foreground/background pairs |
| Material and depth | Flatness, texture, translucency, overlap, shadow | A consistent authored material story across surfaces, controls, scene, and movement |
| Imagery | Crop, scale, placement, subject isolation, repeated motifs | Art direction for original or licensed photography and illustration |
| Motion grammar | Trigger, anticipation, layer order, overshoot, settling, exit, reversal | Distinct control choreography and expressive transitions with their own character |
| Navigation | Visible choices, location cues, nested levels, back behavior | Discoverable links, breadcrumbs where useful, browser history, clear active state |
| Information density | Visible items, metadata grouping, scanning aids | Card/table choice, filter placement, progressive disclosure |
| Feedback | Selection, hover, focus, success, failure, loading | Explicit web interaction states and readable status messages |
| Tone | Energetic, restrained, tense, playful, clinical, editorial | Copy voice, pacing, visual intensity, and the amount of ornament |

Record relationships, not just adjectives: "oversized display title against a
quiet content field" is more actionable than "cinematic." Use evidence to explain
the effect; avoid assuming a static screenshot reveals animation or input behavior.

## Translate the intention, then choose the web pattern

Start with the website task and content, then study the reference's authored
geometry and interaction at component and scene scale. Invent an original visual
and motion language around reliable browser behavior. Read
[interaction-art-direction.md](interaction-art-direction.md) for state-by-state
research. A native button or link can carry a radical visible contour and an
animated artwork layer outside its hit area.

Examples below are design proposals, not claims about any inspected game's UI:

- A dramatic selection screen could inspire a portfolio project index with a
  custom detached selection marker, a dramatic preview handoff, and expressive
  project links with reliable keyboard behavior.
- A dense equipment interface could inform a product comparison tool through
  clear categories, aligned attributes, filters, and an explicit selected state.
- A mission overview could inspire a project dashboard with priorities and progress,
  while keeping familiar navigation and meaningful labels.
- A high-contrast title treatment could inform a campaign hero, with the website's
  own typography, artwork, and calls to action.

Treat a landing page, a dashboard, and a store differently even when they share a
game reference. A reference can influence one section, one interaction, or the
whole art direction; name the intended scope.

## Blend references deliberately

Assign each reference a job. For two games, choose a primary source for composition
and tone, and a secondary source for a narrower quality such as navigation clarity,
surface treatment, or motion pacing. The split is a creative decision, not a
mathematical claim about the games.

Write a short blend recipe before designing:

1. **Product goal:** what the visitor should understand or do.
2. **Source A contribution:** the observed principle to adapt and its evidence.
3. **Source B contribution:** a complementary principle and its evidence.
4. **Unifying rule:** a shared grid, spacing rhythm, type scale, color role system,
   or motion rule that makes the result feel coherent.
5. **Original expression:** new layout, copy, imagery, components, and interaction.

Resolve competing signals rather than averaging them: if both references demand
dominant display typography, assign one to the hero and reduce the other to a
smaller accent. If ornamental framing hurts scanning, retain it only at important
moments. Do not assemble a collage of recognizable screens or reproduce a game's
branding, proprietary artwork, or distinctive interface wholesale.

## Deliver a design response that moves the work forward

For an exploratory brief, offer two or three genuinely distinct original directions.
Differentiate the silhouettes and interaction choreography as well as composition.
Each direction needs a signature control with a described hover entry and exit;
a list of palette adjectives or generic cards is insufficient for an expressive art-direction brief.
For a precise brief or an existing chosen direction, proceed with that direction.

Use this compact output structure when it helps:

- **Interpretation:** the website type, intended feeling, and title assumptions.
- **Reference evidence:** a few relevant inspected screens with source links and
  the specific observed principles. Mark gaps and inferred behavior plainly.
- **Directions:** name, composition, typography roles, color roles, motion idea,
  signature control anatomy, enter/exit sequence, and one reason the direction
  suits the website's content.
- **Recommendation:** select one and explain the practical benefit.
- **Next artifact:** provide the requested wireframe, component plan, mockup,
  implementation, or critique. Do not turn every research request into a full build.

Keep uninspected ideas visibly labeled as proposals. Separate "observed in the
reference" from "my proposed translation" wherever that distinction could be lost.
Use specific suggestions such as "use a left-aligned project list with a large
preview on desktop" instead of "make it immersive and dynamic."

## Implementation behavior

When the user requests a build, inspect the repository and follow its stack,
components, tokens, asset conventions, and applicable instructions. Preserve useful
existing design decisions; express the reference through the product's own system.
Present user-facing copy about the product, not the implementation or research.

Keep the visual character across widths by adapting composition: change columns,
crop decoration, reduce layer counts, and prioritize essential content. Do not
shrink a desktop game screen into a phone-sized canvas. Use real content lengths
and plan for wrapping, localization, empty states, and unavailable imagery.

Use semantic HTML and native links/buttons for their intended actions. Keep a
logical document and focus order even when the visual composition is asymmetric.
Make keyboard focus visible and navigation discoverable without hover. Provide
touch equivalents for hover interactions. Decorative layers must not block input
or conceal text. Keep forms, error recovery, and status messages understandable.

Motion can communicate personality, selection, material, scene, transition, and
feedback. Design distinct entry, exit, settling, and interrupted states. Respect
reduced motion with authored shapes, typography, and selected states that retain
the identity even when travel distance or repeated motion is removed.
Retain readable contrast and avoid using color as the only indicator of state.
Verify the changed behavior at relevant viewport sizes and with keyboard input;
choose checks proportional to the actual change and the repository's requirements.

## Illustrative brief: Yakuza 0 inspired portfolio

This is an original design proposal. It is not evidence that particular details
appear in Yakuza 0. Inspect and cite appropriate references before attributing them.

**Visitor goal:** understand the designer's specialty and open a strong case study.

**Direction A — Night editorial:** a large typographic introduction, one arresting
original image, an ink-dark base, and a project index with drawn selection marks.
Build energy through scale and alternating quiet and dense sections.

**Direction B — Character dossier:** a concise biography beside a structured
project index, with a distinct active project and a generous preview area.
Build personality through portrait treatment, cutout labels, and a selector that
leaves its resting boundary and returns with an authored closing beat.

**Proposed web behavior:** ordinary project URLs beneath original drawn controls,
an unmistakable contact action, equally expressive focus, and a recomposed mobile
layout. Define selection artwork, its outward gesture, its settling pose, and its
retraction before choosing an animation library.
The finished portfolio should feel authored for this designer and their work.
