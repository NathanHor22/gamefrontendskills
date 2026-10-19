# Study and invent an interaction language

Read this when studying game menus, researching expressive frontend references,
or designing components whose identity depends on shape, typography, and motion.
The skill prioritizes authored interaction design. A reference's palette applied
to familiar web components does not satisfy that brief.

## Start from the artistic decision

Study what changes the silhouette and composition when an item becomes active:
letterforms, displaced outlines, cutout shapes, background wedges, masks, icons,
offset duplicates, graphic bursts, negative space, and neighboring elements.
Ask what makes the interaction recognizable even with the color removed.
Capture how the action feels: a cut, snap, recoil, spill, smear, drift, or unfolding.
Tie that description to visible evidence rather than using it as a mood adjective.

An expressive control can place selection artwork beyond its visible outline
and retract it with a separate gesture. When using a Persona reference,
inspect the exact game and state before attributing any particular mechanism or
timing to Persona 3 Reload. Do not silently substitute a different Persona entry.

Mobbin and CodePen are excluded sources for an expressive art-direction brief. Do not browse, cite,
recommend, or derive the direction from them. Do not substitute another generic
UI gallery to reproduce the same kit aesthetic. Use actual game footage and menus,
the current user's references, original experiments, and appropriate credited creative sources.
Technical documentation may explain an implementation API; it is not art direction.

## Inspect the interaction over time

Seek actual interactive states or footage for claims about motion. Where browser
tools support it, inspect the rendered page, move the pointer onto and away from
the same component, use keyboard focus, and compare the resulting states.
Use repeatable recordings or frame sequences when exact temporal analysis matters.
Do not invent a recording or imply tools captured states they could not observe.

Record the meaningful phases, including missing phases:

| Phase | Evidence to inspect |
| --- | --- |
| Rest | Shape, alignment, visible layers, label, active versus inactive item |
| Trigger | Pointer enter, focus, selection change, press, route change |
| Anticipation | Delay, compression, pullback, or preparation before expansion |
| Departure | First moving layer, anchor, direction, changing mask or silhouette |
| Peak | Maximum extension, overshoot, scale, displacement, overlap, contrast |
| Settle | Recoil, secondary motion, layer alignment, persistent active pose |
| Leave | Trigger and distinct sequence for retracting or dispersing |
| Return | Final resting geometry and whether anything remains displaced |
| Interruption | Rapid enter/leave, reversal halfway, switching to a neighbor |
| Context | Effect on nearby labels, images, selection marker, background, cursor |

Do not assume every reference contains anticipation, overshoot, or all these phases.
Record the absence when observed; omit unjustified stages from the interpretation.
For each animated layer, record its origin, path, deformation, opacity, clipping,
depth, and relationship to the label. Note what remains still: contrast between a
stable label and unruly surrounding art can be the defining decision.

Label evidence explicitly:

- **Observed:** visible state or sequence, with source and relevant timestamp.
- **Measured:** duration or displacement measured from identified footage/frames;
  include the recording's limits when dropped frames or playback affect precision.
- **Inferred:** plausible mechanism or unseen continuation, with uncertainty.
- **Proposed:** an original frontend choice, including any chosen duration/easing.

A screenshot can establish silhouette, overlap, typography, and a captured state.
It cannot establish easing, duration, animation order, exit behavior, hover trigger,
or reversal. A source-code duration describes implementation settings; confirm
rendered behavior before treating it as the full visual experience.

## Separate artwork from the input target

Map the interaction into three things: semantic action, stable hit area, and
visible artwork. These need not have the same geometry. Preserve reliable input
while allowing the artwork to extend, rotate, tear, offset, or project beyond it.
Distinguish decorative overflow from text or controls that must remain reachable.
Avoid hover flicker when a graphic expands beyond the target; decorative layers
should not capture pointer events or repeatedly retrigger the interaction.

Draw original geometry for the brief. SVG paths, masks, CSS pseudo-elements,
clip paths, layered DOM, canvas, or WebGL are implementation choices after the
concept is clear. Pick the simplest suitable technique that preserves the design.
A native button can host an unconventional composition. Rectangles, rounded
corners, shadows, gradients, and familiar technologies are not forbidden; their
default combination should not decide the aesthetic before the reference study.

Treat typography as part of the interaction: baseline shift, tracked or compressed
lettering, changing weight, displaced shadow copies, staggered fragments, and
occlusion can create identity. Keep the meaningful label readable and available
to assistive technology. Distinguish text movement from layout reflow so nearby
controls do not unexpectedly move under the pointer.

## Specify entry and exit as separate gestures

Define a component's motion as a small state model: rest, entering, active,
leaving, pressed, and disabled where relevant. Give entry and exit independent
paths, layer order, timing, and easing when the concept benefits from asymmetry.
Do not default every property to a shared ease-in-out transition.

For an original proposal, describe the gesture before choosing numeric values:
for example, a sharp wedge projects past the label, a separate outline catches
up, and the wedge folds inward on leave. Then propose layer offsets, pivots,
duration, stagger, and overshoot. Mark these values as proposed, not game facts.
Use distinct motion for meaningful changes; arbitrary animation on every element
weakens the component's signature.

Specify what happens when a user leaves before entry settles, reenters during
exit, or moves quickly through several items. Prefer continuous reversal or a
deliberate interruption rule over queues of stale animations. Persistent selected
state and temporary hover/focus state must remain distinguishable.

## Learn the user's authorship across projects

Use reference sites supplied by the current user. Nathan Hor and Quipus in
[data/style-examples.json](../data/style-examples.json) are optional credited examples. Inspect actual rendered states
before writing claims about either. Text extraction alone does not reveal their
art direction, layering, or motion. Record access limits as research gaps.

Build a vocabulary ledger with the source, observed decision, perceptual effect,
possible reusable principle, confidence, and project-specific context. Separate
what the user explicitly endorses from what the agent merely observes on a site.
Do not assume every visible third-party widget expresses the user's authorship.

Look for relationships across the projects: bold versus quiet type, spatial
tension, transitions between content, material contrast, and interaction pacing.
Keep transferable principles separate from a particular palette, font, or layout.
Use recurring principles as hypotheses; strengthen them through user feedback.
The goal is an evolving personal vocabulary with room for different project
identities. Do not force a portfolio and a sales assistant into one visual skin.

## Deliver research or design at the requested depth

For interaction research, supply source-linked state observations, the defining
artistic decision, gaps in evidence, and a concrete original frontend translation.
For a design proposal, show or describe rest, entry, active, exit, and interrupted
states with the outside-the-button layers made explicit. A small state storyboard
is often more useful than a moodboard of static colored buttons.

When implementation is requested, retain the art direction for keyboard focus,
touch press/selection, and reduced motion. Focus may activate the same expressive
art with a clear persistent cue; touch must expose essential actions without
hover. Reduced motion can use the authored final silhouette, static offset layers,
or a brief non-spatial reveal instead of collapsing to a generic default button.
Check clipping, stacking, long labels, narrow screens, rapid pointer movement,
focus visibility, target reliability, and decorative layers obscuring other content.

Reject a proposal that could fit an unrelated startup merely by changing its
accent color. Identify the original geometry, typographic behavior, and motion
rule that make this direction specific. Research requests improve the skill's
reusable knowledge; they do not automatically authorize a new website build.
