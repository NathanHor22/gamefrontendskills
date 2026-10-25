# Screen map: website surfaces and their game equivalents

Every website surface has a game screen that already solved a similar problem. Use this file to
(1) classify each part of the site you are improving or building, (2) find the evidence to study,
and (3) place things on the page. Zone diagrams are desktop starting points, not templates to copy;
[placement.md](placement.md) explains the rules behind them and how they reflow on narrow screens.

Look evidence up with `node scripts/library.mjs show <id>`, or list everything for a screen type with
`node scripts/library.mjs search --screen <type>`. Pattern ids are original web proposals, not game facts.

Legend for diagrams: `■` focal subject, `▶` primary action, `≡` index/list, `·` utility perimeter,
`▢` detail/preview pane, `~` scene/background that stays visible.

---

## Landing hero ← title screen (`title`)

**Job:** one feeling, one focal subject, one primary action. Title screens are the purest
composition lesson in games: a wordmark or subject, very few choices, and atmosphere doing the rest.

```
┌──────────────────────────────────────────────┐
│ ·logo                         ·nav  ·nav  ·cta│  utility row: small, quiet
│                                              │
│      ■ ■ ■  OVERSIZED WORDMARK / SUBJECT     │  focal: 50–70% of the first viewport
│      ■ ■ ■                                   │
│                                              │
│   ▶ PRIMARY ACTION      secondary text link  │  1 primary, at most 1 secondary
│ ~ ~ ~ ~ ~ scene / texture / image ~ ~ ~ ~ ~ ~│
└──────────────────────────────────────────────┘
```

- The menu sits *under* or *beside* the wordmark, small, with no box around each item. The wordmark
  carries the identity; the choices stay quiet.
- The selected or primary item gets a field of light, colour or texture *outside its text*
  (a glow band, a mist band, a pigment smear). The label itself barely changes.
- Leave large empty space. The empty space is part of the composition, not unused room.

Evidence: `silent-hill-2-2001-main-anatomy`, `sh2r-main`, `sifu-main-menu-anatomy`, `lego-marvel-menu-anatomy`
Patterns to adapt: `typographic-slipstream-link`, `detached-ink-comet`
Gap: only two title screens are in the library. Research one or two more for any hero-heavy brief.

## Primary navigation ← main menu (`main_menu`)

**Job:** show where the visitor can go and make the current choice unmistakable.

Three proven placements:

```
A. Left column over a scene            B. Bottom dock                    C. Typographic composition
┌─────────────────────────────┐       ┌─────────────────────────────┐   ┌─────────────────────────────┐
│ ≡ ITEM                ■      │       │            ■                 │   │  ITEM        ■ ■            │
│▶≡ ITEM (selected)     ■      │       │       ~ scene ~              │   │      ITEM ▶  ■ ■            │
│ ≡ ITEM                ■      │       │   ┌─sub─┐                    │   │          ITEM               │
│ ≡ ITEM                       │       │ ◇ ◆ ◇ ◇ ◇   ← icon dock      │   │              ITEM   ·count  │
│ ·help text                   │       │ ·hints                       │   └─────────────────────────────┘
└─────────────────────────────┘       └─────────────────────────────┘
```

- **A (left column)** suits sites with 4–7 destinations and a strong image. A narrow list sits over or
  beside a large subject; a marker *outside* the selected row (arrow, bar, sphere) makes the selection.
  Evidence: `hi-fi-rush-main-menu-anatomy`, `batman-arkham-asylum-main-menu-anatomy`, `msmr-main-menu-column`, `sifu-main-menu-anatomy`
- **B (bottom dock)** suits apps and dashboards: large custom emblems in a row, with a submenu rising
  directly above the selected emblem. Evidence: `ggst-illustrated-mode-dock`, `pso2ngs-main-dock`
- **C (typographic composition)** suits portfolios and editorial sites: menu words are the artwork,
  oversized and arranged on a diagonal, with emphasis moving between words.
  Evidence: `metaphor-menu-anatomy`, `colin-mcrae-rally-2-0-main-menu-anatomy`
- Separate *art* from *utility*. A large portrait or subject owns the centre; small utility icons sit in
  a corner. Evidence: `tk8-main-menu-art-vs-utility`
- A returning visitor can see a different menu (for example "Continue" added above "Start") inside the
  same assembly. Evidence: `hi-fi-rush-returning-anatomy`

Patterns: `elastic-poster-menu`, `tethered-drawer-banner`, `slanted-tab-fan`. Components: [navigation.md](../components/navigation.md).

## Project / product / team index ← character select (`character_select`)

**Job:** let people scan many items quickly and see one in depth without leaving the page.
This is the most transferable game screen for websites.

```
┌──────────────────────────────────────────────┐
│ NAME OF SELECTED (huge, behind)              │
│        ■■■■  large preview / actor  ▢ detail │  preview: 50–65% of the area
│        ■■■■                         ▢ meta   │
│  ┌─┬─┬─┬─┬─┬─┬─┬─┐                           │
│  │ │▶│ │ │ │ │ │ │  compact roster ≡         │  index: small, dense, stable
│  └─┴─┴─┴─┴─┴─┴─┴─┘                           │
└──────────────────────────────────────────────┘
```

- The **index stays still**. Only the selection marker moves across it. The **preview changes**.
  Never resize the whole grid on hover. Evidence: `dbfz-preview-handoff-motion`, `gbvsr-portrait-ledger`
- The preview subject may rise far beyond its cell or frame. That overflow is the drama.
  Evidence: `dbfz-perspective-roster`, `tokon-preview-selection-choreography`
- Show identity at two scales: a small marked cell *and* a large name. Evidence: `tk8-slot-overlay-breaks-composition`
- Make availability states visible in the same geometry (locked, unknown, owned, new).
  Evidence: `apex-legends-legends-anatomy`, `honkai-star-rail-roster-anatomy`, `lego-marvel-roster-anatomy`
- Tall portrait strips or plaques over the real scene beat a generic card grid.
  Evidence: `clair-obscur-expedition-33-character-selection-anatomy`, `sfv-perspective-character-rail`

Patterns: `registration-slip-selector`, `shutter-cut-project-link`, `poster-peel-project`. Components: [selectors.md](../components/selectors.md).

## Plan / path chooser ← mode select (`mode_select`)

**Job:** a small number of big choices (2–5) that differ in kind, such as pricing tiers, onboarding paths or product lines.

```
┌──────────────────────────────────────────────┐
│ HEADING FLAG                                 │
│ ┌──────┐ ┌════════┐ ┌──────┐                 │  selected poster is taller AND wider,
│ │ A    │ ║ B ▶    ║ │ C    │                 │  with an exterior contour
│ │      │ ║        ║ │      │                 │
│ └──────┘ ╚════════╝ └──────┘                 │
│ ▢ description shelf for the selected choice  │
└──────────────────────────────────────────────┘
```

- Make each choice a different *world* (lettering, material, texture), not the same card in three accent colours.
  Evidence: `sf6-main-mode-three-typographic-worlds`
- The selected option grows past its neighbours on both axes; a contour sits outside its edge.
  Evidence: `forza-horizon-5-rally-mode-choice-anatomy`, `fc25-live-start-anatomy`, `forza-horizon-4-pre-race-anatomy`
- Locked, incomplete and completed are distinct artwork states: monochrome with a lock footer,
  full colour, and gold coat with a check footer. Evidence: `forza-horizon-5-mode-state-sheet-anatomy`
- One explanation shelf under the set, updated by selection, beats a paragraph in every card.
  Evidence: `taiko-dnf-mode-anatomy`, `ff7rebirth-difficulty-artwork`

## Dashboard home ← hub / lobby (`hub_lobby`)

**Job:** one main action plus fast access to many utilities, without the utilities competing with it.

```
┌──────────────────────────────────────────────┐
│ ·tab ·tab ·TAB ·tab                ·currency │  slim top rail
│ ·                                          · │
│ ·        ■ hero subject / key metric       · │  perimeter utilities: icons, small labels
│ ·                                          · │
│ ·icons                     ┌──────┐▶ START  │  main action: bottom-right, oversized,
│                            └mode──┘          │  breaks out of the rail
└──────────────────────────────────────────────┘
```

- Primary action bottom-right, larger than anything else interactive, often breaking out of its rail.
  Evidence: `wild-rift-play-medallion`, `hok-interlocking-mode-start`, `mlbb-lobby-art-and-action`, `apex-legends-main-menu-anatomy`
- Utilities live on the perimeter as free-standing icons. Evidence: `mlbb-2025-lobby-visual-rails`
- A "today" or task column with a large date heading works for work dashboards. Evidence: `fc25-career-hub-anatomy`
- Unequal tile sizes on one stage: one large current item, smaller secondary ones. Evidence: `dirt-rally-2-0-hub-anatomy`, `forza-horizon-5-garage-anatomy`

## Modal, drawer, overlay ← pause (`pause`)

**Job:** interrupt without losing context.

- The page stays visible behind the overlay (blurred, dimmed or letterboxed). Never use a blank backdrop.
  Evidence: `clair-obscur-expedition-33-pause-anatomy`, `forza-horizon-4-upgrade-confirmation-anatomy`
- Very few choices, in a corner rather than the centre (lower right is a strong default).
- Modular asymmetric stage for content-rich menus (one large tile, smaller flanking tiles).
  Evidence: `forza-horizon-5-layout-guide-anatomy`

Components: [panels.md](../components/panels.md).

## Settings and forms ← options (`settings`), name entry (`text_entry`)

- Label and value in aligned columns; a separate side field explains the focused setting.
  Evidence: `hi-fi-rush-options-anatomy`, `sh2r-setup`, `colin-mcrae-rally-2-0-options-anatomy`
- The selected row brightens its text, marker *and* adjacent rules together.
- Most of the screen can stay open. A small settings list on a large calm field reads as considered, not empty.
  Evidence: `dbfz-brush-scene-options`

Components: [forms.md](../components/forms.md).

## Pricing, store, catalogue ← shop (`shop`), confirmation (`confirmation`)

- Item, stock and price aligned on long strips. A merchant or subject anchors one side.
  Evidence: `clair-obscur-expedition-33-merchant-anatomy`, `mlbb-hero-shop-active-arrow`
- Selected merchandise is ringed or projected; a build or upgrade tree can sit beside it.
  Evidence: `mlbb-shop-circular-selection`
- Confirmation is a compact comparison sheet over a blurred scene: before/after values as coloured chips
  with direction marks, a bright long primary strip and a quiet cancel strip below it.
  Evidence: `forza-horizon-4-upgrade-confirmation-anatomy`, `tokon-route-proof`
- Choices with consequences: long columns sharing one baseline for the reward and one for the expiry.
  Evidence: `fifa23-decisions-anatomy`

## Success, receipt, report ← results (`results`)

- Give completion a ceremony: a large heading, an emblem projecting past its plaque, statistics in
  separated corners rather than identical cards. Evidence: `clair-obscur-expedition-33-results-anatomy`, `mlbb-2025-result-crest`
- Mix a rigid statistical layout with one hand-drawn or expressive word. Evidence: `mlbb-broadcast-result-type`
- A ledger in an open dark field with small status seals suits finance and summaries.
  Evidence: `papers-please-night-anatomy`

## Roadmap, onboarding, achievements ← progression (`progression`)

- Draw relationships as a structure: orbit, branch, constellation, route. Don't use a list of checkmarks.
  Evidence: `ff16-abilities-orbit`, `clair-obscur-expedition-33-skills-anatomy`, `mlbb-2025-growth-branch`, `sf6-stage-route-scene-and-index`
- Locked, current and done states must be readable without colour (locks, rings, fills).
  Evidence: `honkai-star-rail-eidolon-anatomy`
- A small central ceremony for level-ups (seal, flare, progress rail). Evidence: `ff16-tomes-update-anatomy`

Patterns: `sliced-ribbon-stepper`.

## Case studies, docs, team pages ← codex / dossier (`codex`), status sheet (`status`)

- Content as physical objects on a board: clippings, portraits, notes, with missing items shown as
  pale silhouettes. Evidence: `sifu-board-anatomy`
- A rotated contact sheet with a nameplate hanging below the selected portrait. Evidence: `batman-arkham-asylum-character-bios-anatomy`
- A profile page can pair a portrait and meters with a radar/axis chart. Evidence: `p4g-status-screen`

## Asset library, file browser ← inventory (`inventory`), save/load (`save_load`)

- A list window plus a *separate, smaller* floating detail window, both over the visible scene.
  Evidence: `pso2ngs-inventory-pair`, `clair-obscur-expedition-33-inventory-anatomy`
- Objects floating in a line with the centred one isolated by offset corner brackets.
  Evidence: `silent-hill-2-2001-inventory-anatomy`
- Version history and drafts: ruled rows on a translucent coloured sheet with compact codes.
  Evidence: `silent-hill-2-2001-load-anatomy`

## Locations, site map, timeline ← map (`map`)

- A readable list beside an atmospheric map; one high-contrast selected row. Evidence: `p3r-map-select-list`
- Fine technical grids, object-specific glyphs, a detached focus ring and a separate detail channel.
  Evidence: `alien-isolation-map-anatomy`
- A historical atlas with a chronological rail along the bottom. Evidence: `ff16-situation-map-anatomy`

## App chrome, status bars, live widgets ← HUD (`hud`)

- Compact clusters at edges; the content (the "scene") owns the centre.
- Step lists with completed lines filled and a detached marker pointing at the current line suit
  tutorials and checklists. Evidence: `tokon-training-step-stack`
- Controls embedded in physical objects (stamps, racks) suit approval workflows. Evidence: `papers-please-stamp-anatomy`

## Command palette, quick actions ← command menu (`combat_menu`)

- A compact translucent command stack in a lower corner while the content stays dominant.
  Evidence: `ff7rebirth-tactical-overlay`, `p3r-battle-command-cluster`, `p4g-battle-command-stack`
- Radial menus: sparse ticks and open brackets beat filled pie slices. Evidence: `alien-isolation-radial-anatomy`, `apex-legends-ping-menu-anatomy`

## Chat, guided questions ← dialogue (`dialogue`)

- Only a few choices in a lower corner, a separate pointer cursor outside the selected strip.
  Evidence: `ff16-scene-dialogue-choice`
- An organic speech shape with an outlined indicator. Evidence: `p3r-daily-life-dialogue`

## Loading and waiting ← loading (`loading`)

- Make progress from the subject matter (footprints, ink impressions, route traces), and keep
  indeterminate feedback visibly different from a real percentage. Evidence: `sh2r-footprints`

Components: [feedback.md](../components/feedback.md).

## Head-to-head, launch hero ← versus (`versus`)

- Two halves with deliberately different treatments, oversized lettering behind the subjects and a
  narrow bright seam. Evidence: `tk8-versus-authored-illustration-layering`, `apex-legends-champion-squad-anatomy`

## Route and section transitions ← transition (`transition`)

- Layered handoff: outgoing UI dims, a clean "scene beat", then panel, masked title and selection resolve
  in separate passes. Evidence: `tk8-options-mask-and-selection-sweep`, `metaphor-painted-entry`

See [motion.md](../styles/motion.md).
