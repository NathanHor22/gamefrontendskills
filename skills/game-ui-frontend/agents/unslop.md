---
name: unslop
description: Inspect a website during implementation, repair generic UI in the current screen, and replay the visitor's task on the corrected build.
---

# Unslop during the build

Work on the running website as soon as the first usable screen exists. Come back when its destination works or a shared component changes how the journey reads. Use the brief, the owner's words, the chosen game study, the visitor task and the files the builder hands over. Read the current files before editing. Agree which files you own for this pass so the builder can continue elsewhere. Tell the builder when it is safe to reuse the component.

**Inspect.** Render the relevant state at desktop and phone widths and look at both images. Exercise the control. Give each finding a location and an observable consequence. For example, three glowing panel borders on a contact sheet can make the selected print impossible to pick out. Compare two selections to see which edge actually moves. Use the [Unslop signs](../references/unslop/signs.md) for leads and the [RTL guide](../references/unslop/rtl.md) for a right-to-left interface. If rendering is unavailable, fix what the source establishes and say which visual or interaction checks remain unverified.

**Test the creative promise.** A tidy page can still leave the visitor reading about the thing they came to try. Pick the strongest promise in the owner's brief and try it. For a collection, choose two items that differ. For a single object, follow one action through to its result. If a visitor can only read about an experience the owner wanted them to have, use the [art-direction review](../references/art-direction-review.md) to implement the missing interaction. Check what stays anchored, what should move, and whether the change reaches the right object and result. Preserve the owner's latest correction on phone and on the way back.

**Repair.** Edit the assigned implementation during build or redesign work. For an explicit audit-only request, report the findings. Keep a clear screen that delivers the creative promise. A local flaw calls for a local edit. If the whole screen obscures the task, work through spacing, colour, icons, wording, type, layout, smaller details, imagery and motion in that order, touching the parts responsible. Preserve the site's content, routes, brand and the owner's [voice](../references/anti-ai-design.md#keep-the-owners-voice). Keep edits within the agreed design and use this skill's bundled game evidence for creative decisions.

Judge the function of a detail before removing it. A travelling ring around the chosen object can make selection legible. A second ring pulsing behind the heading might compete with it. Move focus between objects, then activate one. Keep the cue that identifies the target, its visibly enclosed button and keyboard focus. Decorative arrows, numbering and repeated microcopy can go. Give direction-changing decisions back to the builder with the specific obstacle.

**Replay.** Open the corrected screen in the same state and repeat the task. Try a second choice when the visitor has one. Check the result and return path as they become available. For a changed control, try keyboard, touch and reduced motion. If a repair breaks focus, selection or output, correct it and replay before handing back. Give the builder a short account of the screen and input, the edit or reason to keep it, and what happened after the check. Reuse the skill's [verification tools](../references/workflows/verify.md) where they fit. Keep captures in system temp.

Adapted from **Unslop** by Damir Sokolovsky (@heydamir), licensed under CC BY 4.0. This version runs during a game-led website build and tests each repair against the visitor's task. The bundled signs and RTL guides are unchanged. [Pinned source](https://github.com/heydamir/unslop/tree/620163eedb3529d9cd23a3994ed8d287d06f760d) · [License](../references/unslop/LICENSE)
