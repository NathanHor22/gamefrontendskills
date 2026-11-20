---
name: game-ui-frontend
description: Build or redesign playable website interfaces in JavaScript, TypeScript and React using this skill’s game research. Use for game-led website builds, creative direction, interaction critique and game UI research.
---

# Game UI for frontend websites

A game gives someone a reason to act and makes the consequence visible. Start with what the visitor
came to do. Study how a game handles an equivalent decision, then design the website's own space,
controls and feedback around its subject.

For website direction, builds and redesigns, draw the interaction and art direction exclusively from the game
research shipped with this skill. The user's project supplies the subject, content, artwork, brand
and technical constraints. Use the bundled studies and `data/games.json` for game evidence. A
template or web pattern can help implement a decision once you have its source. Use `--bundled`
for library lookups. Leave website galleries, component showcases, personal reference
sites and new game searches out of this process. A request to research new material has its own workflow.

All paths below are relative to this skill's directory. Run scripts with the skill's **absolute** path
from the user's project directory. With `skills use`, resolve paths from the temporary supporting directory
provided in the prompt. Read the research, role prompts and templates from that directory. Keep the skill
bundle and its dependencies there. Only write the website changes or deliverables the user requested
into their project.

In a web-only chat, use the [art-direction guide](references/art-direction.md) to find the game study
that fits the job. Resolve relative links against the raw URL of the document containing them, keeping
the same repository revision. This route needs no install or catalogue download.

## When someone says "build my website with this"

Read their brief and any available project content first. A loose build request is an invitation to
make a working site. Ask up to two short questions together, in the person's own vocabulary. Ask
for a concrete example of their work and the part a visitor should experience. Inventing the
interface is the designer's job. Different answers should change what you build.

- For **photography**, try "How do you arrange the pictures from a shoot when you show them to someone?" and "What would you like them to do when a particular photo catches their eye?"
- For **SaaS**, try "Walk me through one job your product does for a customer, from what goes in to what comes out." and "How much of that job should a visitor be able to try here?" If the brief already identifies a team of agents, spend the missing question on what passes between them or what counts as a finished run.
- If you only know they want a website, first find out what it is for. Use what they volunteer. A game name or visual treatment is optional.

Use an answer to shape the first scene, the thing the visitor operates, and the consequence. "I shoot
in pairs and want people to notice the small differences" is enough to invent a wall of paired
prints. The person need never suggest pegs or zoom. Let the visitor open the whole image, zoom
into a detail they choose, then pull back to the same spot. Software that spins up agents could let someone submit one
representative job, see its work handed on and open its output. Choose the mechanic that belongs
to this person's work. The [art-direction guide](references/art-direction.md#design-from-one-real-example)
works through both decisions.

When you ask, wait for the reply. These questions are for the person commissioning the site.
If the brief already answers them, or the person says "you choose", go straight to the build.
Use a fitting game moment and implement the first useful action **and its result**. The
[build workflow](references/workflows/build.md) carries that choice into the rest of the site.
Give each content destination an address that opens it directly, including a fragment in a single-file
site. After a choice from the entrance, browser Back restores the chosen item and its focus.
On a direct visit, offer a link to the entrance and preserve the visitor's actual browser history.
Make the same trip work by keyboard, touch and with reduced motion.
Follow the feature’s [JavaScript or TypeScript conventions](references/workflows/build.md#javascript-and-typescript). For React, use [Build it in React](references/workflows/build.md#build-it-in-react). In chat, honour the requested language and give the files, styles and integration code the person needs.
For a web brief with no project or stack specified in ordinary chat, deliver a self-contained HTML file or one complete HTML code block the person can save and open.

If only this file is available, *Life is Strange: Before the Storm* shows a focus frame moving
between three pictures while the chapter chooser stays open (`life-is-strange-before-the-storm-opening-study`).
*Sifu* shows portraits and clippings arranged on a board (`sifu-board-anatomy`, a still). The
string, pegs and camera zoom on a photographer's wall would be your own design. In *Warframe*, a
mission brief keeps neighbouring nodes visible and equipment can be changed in Navigation
(`wf-desdemona-node-brief`, `wf-navigation-inline-loadout`). Use that preparation sequence when
it fits the product. A public demo uses clearly labelled sample work unless a real service is
connected and intended for visitors. For other briefs, *Persona 5 Royal* reframes a plaza around
a fixed row of choices (`persona-5-royal-opening-study`), and *Gran Turismo* on PSP returns
from a car to its shelf grid (`gran-turismo-psp-opening-study`). If another reference matters,
request that bundled study by name or identify the nearest studied analogue.

## Pick the workflow

| The user wants… | Follow |
| --- | --- |
| "Improve my site / page / component" (existing code or URL) | [workflows/improve.md](references/workflows/improve.md) |
| "Build my website with this", a named game, or a game-like opening for an existing project | [workflows/build.md](references/workflows/build.md) |
| "Give me a creative direction" or "study these videos" | [Art direction](references/art-direction.md) routes a brief to a game moment. The [essay reading index](references/research/essay-readings.md) links all seventeen arguments to their footage, caveats and website decisions. |
| "Research this game" or "add this footage to the library" | [workflows/research.md](references/workflows/research.md) |
| Check that controls behave (after any UI change) | [workflows/verify.md](references/workflows/verify.md) |

Compare rendered directions when asked for options. For a build, follow the chosen direction to its working destination.

## Title screens and start menus

Use the [title-screen workflow](references/research/title-screens.md) and [Stryxo’s main-menu study](references/research/main-menus-stryxo.md) before drawing the opening.
Give the first visit a recognisable place and an immediately usable action. Decide what moves while idle, on focus, on choosing and on return.
Restore the actual item where the work supports resuming. A deliberate bookmark survives further browsing. A shared address opens its stated destination.
Let sound be a choice. Test the entrance in silence. The [design studies](references/research/game-design-philosophy.md#read-the-argument-alongside-the-screen) pair each author’s argument with the information, input and visible consequence. [Signal Room opening](templates/title-screen.html)

## Buttons, type and detail

Apply the [anti-AI design rules](references/anti-ai-design.md) to new screens and redesigns. Start with the real subject and its first usable control. Strip out stock badges, headline flourishes, nested boxes and decorative diagrams. Keep a detail when removing it costs the visitor information, a usable action or a quality the brief actually asks for.

Give every button a visible container at rest, including secondary actions, icon buttons and links styled
as buttons. Enclose the label or icon in a filled surface or a complete border shaped to suit the project.
For a print shop that could be an inked block with a paper edge. Change the fill, edge or depth for hover,
press and selection. Leave decorative arrows, chevron suffixes and underlines off labels. A game cursor can
point at the current choice, a ring can acquire an object and a bearing can direct someone to a place.
Give the indicator a real target. Change targets during the build and check that it follows the right one.
Keep the hit box still and the keyboard focus outline visible. For a named game, find its control in the
[edition catalogue](references/research/catalog.md#by-game), the [PSP footage](references/research/handheld-control-footage.md)
or the [close studies](references/research/target-and-menu-controls.md). Rebuild the relationship between
the command, the selected subject and the next screen with the site's own art and content.

Say each thing once. One readable label can carry a choice or a whole section. Skip the oversized
background word, tiny eyebrow and fine-print caption that all repeat the same idea. Put essential
instructions, prices and errors beside the decision in readable body text, including on phones.
Use the [bundled No AI Slop editor](references/no-ai-slop/editor.md) when writing or revising visitor-facing copy.
Follow the [website narrative pass](references/anti-ai-design.md#keep-the-owners-voice) to carry the owner's
words, facts and point of view from the first screen to the result. Keep familiar action labels clear.

Leave out ornamental slashes and padded numbers such as `/ WORK`, `PROJECT / 02` and `03 / 06`.
Use an actual name like **Work**, or **Step 2 of 3** when someone is completing a real sequence.
Keep the surface simple. Omit thick or hairline 3D strokes, stacked bevels and wireframe grids added
just to fill space. A press bed can have a working rail. A flat, inked button already has a shape.

## Research, design and critique

For a game-led experience, give the [game design philosopher](agents/game-design-philosopher.md) the brief and
relevant bundled studies. For an explicit research request, include the supplied sources instead.
Pass its findings to the [gameplay web designer](agents/gameplay-web-designer.md). On builds and redesigns,
invoke the [Unslop agent](agents/unslop.md) at the first working screen and again when the destination or a shared control changes. Give it the visitor task and files it can repair. Use the [art-direction review](references/art-direction-review.md) to check whether the visitor can experience the detail the owner cares about. Integrate the fixes before reusing that surface.
Ask the [design critic](agents/game-design-critic.md) to challenge the direction or play the built journey. Resolve and retest its strongest objection. Use the relevant role alone for a research-only, transfer-only or review request.
When delegation is available, give each role's prompt and the absolute skill path to a separate general subagent. Otherwise perform the same passes inline at those milestones and identify the self-review.

## Tools

```
node scripts/library.mjs search --bundled --kind observation --screen character_select
node scripts/library.mjs search --bundled "exterior marker" --limit 5
node scripts/library.mjs resolve --bundled "dragonball fighterz"
node scripts/library.mjs show --bundled <id>
node scripts/library.mjs screens --bundled

node scripts/audit.mjs <url> [--pages 6]                         # screenshots + inventory + generic-UI signals
node scripts/capture.mjs <a> <b> <c> --labels "A,B,C"            # side-by-side mocks or before/after
node scripts/verify.mjs <url> --selector "<css>" [--context "<css>"] [--click-first "<css>"] [--viewport 390x844]
```

Library commands need only Node ≥ 20. Browser scripts need Playwright and axe-core. Reuse them if available;
otherwise install them beside this skill copy (including when it is temporary):

```sh
npm install --prefix "<absolute skill directory>" --no-save --package-lock=false playwright@1.56.1 axe-core@4.10.3
node "<absolute skill directory>/node_modules/playwright/cli.js" install chromium
```

Use `npm.cmd` on Windows if PowerShell blocks `npm.ps1`. Keep this setup outside the user's project;
Chromium is downloaded into Playwright's browser cache. Research alone needs none of these dependencies.
Never claim a visual or behavioural check you could not run. If Playwright MCP tools are
available, use them for exploring; use the scripts for anything you report as verified.

**Always look at the images** the scripts write (screenshots, `*-strip.png`). The scripts measure behaviour;
judging the art is your job.

## Where to put things and what to build

- **Placement:** [layout/screen-map.md](references/layout/screen-map.md) maps every website surface to its game
  screen, with zone diagrams and evidence. [layout/placement.md](references/layout/placement.md) gives zones,
  scale contrast, anchoring, frame-breaking art, layer order and responsive recomposition.
- **Components:** [buttons](references/components/buttons.md) · [navigation](references/components/navigation.md) ·
  [selectors](references/components/selectors.md) · [panels](references/components/panels.md) ·
  [forms](references/components/forms.md) · [feedback](references/components/feedback.md)
- **Styles:** [typography](references/styles/typography.md) · [colour and material](references/styles/color-material.md) ·
  [shape](references/styles/shape.md) · [motion](references/styles/motion.md)
- **Working code:** [Print Room](templates/print-room.html) demonstrates a playable 3D workshop and a local
  PNG export. The [component templates](templates/) cover buttons, navigation, a selector and an overlay.
  Translate the applicable behavior into the project's stack.
- **Evidence:** [research/findings.md](references/research/findings.md) (synthesis) and
  [research/catalog.md](references/research/catalog.md) (every observation by screen type and game).
- **Example answer:** [examples/worked-example.md](examples/worked-example.md).

## Rules that always apply

1. **Original work.** Game images are research, not assets. No game logos, characters, fonts or wholesale screen
   copies. Borrow placement, layering, state logic and motion order; draw new art.
2. **Evidence honesty.** Separate what a source shows (`observed`) from interpretation and from your proposals.
   A screenshot can't establish motion, timing or hover. Cite a library observation ID or a source playhead
   from the linked video study for game-derived decisions.
3. **Directions must differ in material, shape vocabulary and motion**, not in accent colour. Reject any direction
   that would fit an unrelated startup after a colour swap.
4. **Never move or reshape a control's hit area on hover.** Move child layers; decorative art is `pointer-events: none`;
   `clip-path` goes on pseudo-elements.
5. **Every interactive element defines** rest, intent (hover = focus-visible), pressed, selected/current, disabled
   and reduced-motion states, with entry and exit as different gestures and clean interruption.
6. **Semantic HTML first:** links navigate, buttons act, native inputs where possible, DOM order = reading order.
7. **Respect the source policy** in `data/preferences.json` (and the user's `~/.game-ui-frontend/preferences.json`):
   excluded sites are never used; sites marked `no_automated_access` or `link_only` are never crawled.
8. **Scope:** research requests produce research and directions; build only what was asked; never publish or deploy.

## Preferences

Read `data/preferences.json` and respect the user's project requirements. Personal preferences can help
interpret a name or a constraint. The bundled game studies supply the creative references for builds.
