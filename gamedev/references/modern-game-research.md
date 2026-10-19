# Modern game UI research for original websites

Research reviewed on 2026-10-19.

This expansion studies **16 game editions**, **44 distinct image sources**, and **8 video sources**, with **59 analytical observations**. The complete library now contains **44 game/edition profiles**. These are selected, inspected references; the collection is not every game or every screen on Interface In Game. Sources stay linked rather than mirrored. The subsequent [cross-genre expansion](cross-genre-game-research.md) covers horror, rhythm, paperwork, racing, RPG, LEGO and sports references.

This research prioritizes authored controls, exterior selection artwork, expressive enter/exit behavior and original website design. Mobbin/Mobin and CodePen are excluded. Nathan Hor and Quipus are optional credited website examples.

## Research map

Image counts refer to distinct source URLs, not the number of observations. The 44 images include 43 game/guide images (two are manual pages with embedded captures) and one explicitly labeled broadcast scoreboard. Video study may be intermediate frames or sparse successive states; read the evidence limits below. Archived captures, development manuals, and prerelease previews are identified in each record. None is automatically the current 2026 build.

| Game / edition | Screen studies | Images / clips | Motion coverage |
| --- | --- | --- | --- |
| TEKKEN 8 | customization color picker; customization item grid; character select with customization slots; versus matchup; main menu; main menu to Options transition | 4 / 1 | Recorded multi-state study; inspect gaps |
| Street Fighter 6 | main mode selector; multi menu; arcade stage progression; status skill list | 4 / 0 | Static appearance only |
| Street Fighter V | main menu; character selection | 2 / 0 | Static appearance only |
| TEKKEN 7 | character selection inset; session room inset | 2 / 0 | Static appearance only |
| Dragon Ball FighterZ | character select; options menu; story arc select; arcade course select; lobby avatar customization | 5 / 1 | Recorded multi-state study; inspect gaps |
| MARVEL Tōkon: Fighting Souls | episode/story select; All Star Arena route confirmation; training instructions/combat overlay; character select — TGS 2025 preview | 3 / 1 | Recorded multi-state study; inspect gaps |
| Granblue Fantasy Versus: Rising | online lobby; character select | 1 / 1 | Recorded multi-state study; inspect gaps |
| Guilty Gear -Strive- | main menu — Season 5 version 2.0; training/combat overlay — legacy skin | 1 / 1 | Recorded multi-state study; inspect gaps |
| Mobile Legends: Bang Bang | main lobby / ranked action; historical 2021 lobby comparison; main lobby hero presentation; main lobby; Surprise Flip rewards; results; Level Growth / hero preview; hero shop; broadcast post-match scoreboard; in-match equipment shop | 3 / 2 | Recorded multi-state study; inspect gaps |
| League of Legends: Wild Rift | main menu | 1 / 0 | Static appearance only |
| Honor of Kings | main lobby | 1 / 0 | Static appearance only |
| Hi-Fi Rush | Hi-Fi Rush main menu; Hi-Fi Rush returning main-menu state; Hi-Fi Rush skill-store category cards; Hi-Fi Rush options controls | 4 / 0 | Static appearance only |
| Sifu | Sifu main-menu type hierarchy; Sifu shrine reward selection; Sifu evidence board; Sifu level-selection scene | 4 / 0 | Static appearance only |
| Honkai: Star Rail | Honkai Star Rail character index; Honkai Star Rail Eidolon resonance; Honkai Star Rail phone-style hub | 3 / 0 | Static appearance only |
| Metaphor: ReFantazio | main-menu entrance; main-menu composition and changing emphasis | 0 / 1 | Recorded multi-state study; inspect gaps |
| Clair Obscur: Expedition 33 | Expedition 33 victory result screen; Expedition 33 character selection; Expedition 33 skill network; Expedition 33 cutscene pause; Expedition 33 inventory tabs and floating detail; Expedition 33 merchant controls | 6 / 0 | Static appearance only |

## Artistic findings to use

### Treat a control as an assembly

Study the stable action target, label, contour, exterior ornament, selection marker, preview, and scene as distinct parts. Their boundaries can differ. Hi-Fi Rush's arrow, FighterZ's spherical marker, SF6's selection seam, Tōkon's displaced portraits, and Wild Rift's projecting action medallion offer different ways to make selection change the silhouette. They do not prescribe one universal button shape.

**Original website experiment:** draw a stable title target, an off-register art plate, and a separate leading insignia. On focus/hover, let the insignia leave first, the plate extend beyond the target second, and the title gain a different typographic role last. On leave, fold the plate toward its anchor while the insignia resolves separately. Those are proposed web movements, not observed game timings. Match the drawing and movement to the project rather than reusing this sequence mechanically.

### Let typography perform a job

Metaphor uses oversized words as the menu composition; SF6 distinguishes destinations through visibly different lettering and material treatments; Tōkon borrows condensed mastheads, vertical spines, and production marks. Type can be the moving foreground rather than text pasted onto an animated rectangle.

**Original website experiment:** a section name begins as a compact index label, resolves into an oversized cropped headline, then reveals the project content through the headline's negative space. Give exit a separate gesture, such as a narrow ink shutter traveling toward the index. Keep the readable semantic label intact while the decorative typographic treatment changes.

### Give the whole page a material and spatial logic

Tōkon's episode selector uses comic-production paper, trim guides, cover spines and stamps together. Sifu's board, shrine and window use physical places and objects for different tasks. Expedition 33 relates pointed plaques, brush-edged detail sheets, diamond structures and large portraits across screens. A convincing family comes from relationships between controls, background and content, rather than applying the same distressed shape everywhere.

**Original website experiment:** choose a project-specific material metaphor, such as a folded field atlas, print registration desk, kinetic exhibition rail, or instrument cabinet. Invent the controls, navigation, loading state and route transitions from how that object works. Develop new artwork and lettering; game assets are evidence, not a supplied asset license.

### Stage the handoff between index and preview

Tekken and FighterZ distinguish a compact chooser from large actors, portrait layers, trays and scene art. Honkai: Star Rail separates portrait strips, character presentation and constellation-like selection structures. A selector can update a staged composition without making every item an equally large card.

**Original website experiment:** hold the index steady while a project artifact emerges through a separate angled aperture. Give its caption, object and backdrop related but different entrances. Switching projects should redirect the current state, not queue an outdated full animation. On touch, use explicit selection and a visible selected state.

### Reserve spectacle for meaningful states

Mobile Legends' sampled reveal states expand into light outside the reward card, while its task controls remain at the perimeter. Expedition 33's results and Tōkon's completion stamp give milestone states their own hierarchy. Quiet utility controls and expressive focal states can share a coherent drawing language without carrying equal visual weight.

**Original website experiment:** an important project completion or reveal can have a bespoke crest, a projecting ribbon and a short typographic impact; ordinary filters can retain a more compact version of the same line, angle and marker vocabulary. Preserve personality in reduced motion through the final artwork and spatial relationships.

## What the motion evidence establishes

- **Tekken 8:** paused intermediate frames show outgoing UI dimming, a clean character-scene beat, then the incoming panel, masked title reveal and selection sweep resolving in separate passes. This is the strongest layer-order study in the fighting-game set. Return from Options, interruption and pointer hover are unreviewed.
- **Metaphor: ReFantazio:** official prerelease footage shows world/HUD removal, paint and white band, portrait and scattered glyphs, then the organized oversized menu. Exit, rapid re-entry and measured easing remain unknown.
- **Tōkon:** the TGS 2025 creator capture shows an empty grid/panel state, projecting tilted selection cards and large boards, then character actors. It supports staged introduction and changed silhouette; it does not prove the shipped game's equivalent or a hover/retraction curve.
- **Dragon Ball FighterZ:** sparse successive preview states show the small selection token, foreground fighter and background portrait changing together. Intermediate paths and exact timing were not resolved.
- **Mobile Legends:** official 2023 and 2025 previews show differing hero poses and successive reward-reveal states. The 2025 video is watermarked as a design draft. Sparse samples establish state differences and exterior effects, not a measured flip trajectory or a tested web hover.

Source playheads identify where evidence was seen. They are not fitted animation durations. Official clips and credited creator captures are distinguished in source records. Video subtitles, pointing hands, player controls, promotional borders, loading spinners and documentation callouts are excluded from game-control analysis.

## Inspect a specific game

Use the installed helper with its actual absolute path: `python scripts/library.py show GAME-ID`. Each record includes credited source URLs, observed screen anatomy, separate inference, original website adaptations and coverage limits. `resolve` accepts the user's natural title spellings; `search` retrieves shape and choreography terms across games and original proposals.

### TEKKEN 8

Library ID: `tekken-8`.

Official images are selected promotional captures, not proof of the current 2026 build. Clip visibly contains Heihachi and the character-display setting. UI and roster can change by patch. Footage source is a creator capture, not direct game control.

- [TEKKEN 8 official CHARACTER CUSTOMIZE: color picker](https://tk8.tekken-official.jp/images/mode/customize/img_character_ss_01.jpg) — screenshot.
- [TEKKEN 8 official CHARACTER CUSTOMIZE: accessory inventory](https://tk8.tekken-official.jp/images/mode/customize/img_character_ss_04.jpg) — screenshot.
- [TEKKEN 8 official custom-slot overlay and character roster](https://tk8.tekken-official.jp/images/mode/customize/img_character_ss_07.jpg) — screenshot.
- [TEKKEN 8 official versus character-panel artwork](https://tk8.tekken-official.jp/images/mode/customize/img_character_ss_12.jpg) — screenshot.
- [Calem MrNazreenn: Tekken 8 - How to change background Characters Screen Main Menu, Short Guide](https://www.youtube.com/watch?v=D-elaKQigcw) — video.

### Street Fighter 6

Library ID: `street-fighter-6`.

Manual explicitly states screenshots show a game still in development and may differ from final product. These static captures establish appearance only. Different visual modes should not be collapsed into one generic neon style.

- [Capcom SF6 manual: main modes triptych](https://game.capcom.com/manual/SF6/locale/page/12_1_1.jpg?t=202206301000) — screenshot.
- [Capcom SF6 manual: Multi Menu](https://game.capcom.com/manual/SF6/locale/page/12_4_1.jpg?t=202206301000) — screenshot.
- [Capcom SF6 manual: Story stage route](https://game.capcom.com/manual/SF6/locale/page/62_1_1.jpg?t=202206301000) — screenshot.
- [Capcom SF6 manual: Status Skill List](https://game.capcom.com/manual/SF6/locale/page/42_1_2.jpg?t=202206301000) — screenshot.

### Street Fighter V

Library ID: `street-fighter-v`.

Archive screenshots include French labels. Do not treat these as SF6 or the current edition. Only two selected individual screen pages were inspected; no whole-site collection.

- [Interface In Game: Street Fighter V Main menu](https://interfaceingame.com/screenshots/street-fighter-v-main-menu/) — screenshot.
- [Interface In Game: Street Fighter V Select character](https://interfaceingame.com/screenshots/street-fighter-v-select-character/) — screenshot.

### TEKKEN 7

Library ID: `tekken-7`.

Reviewed the small embedded in-game captures on official PS4 launch-era manual pages 10 and 14; decorative manual headers and cyan callouts are not game controls. Exact later-patch equivalence is unverified. No timing or hover was reviewed.

- [TEKKEN 7 official PS4 manual page 10: character-selection inset](https://ps4-tk7.channel.or.jp/manual/img/010.png) — screenshot.
- [TEKKEN 7 official PS4 manual page 14: Session Room inset](https://ps4-tk7.channel.or.jp/manual/img/014.png) — screenshot.

### Dragon Ball FighterZ

Library ID: `dragon-ball-fighterz`.

Five Interface In Game stills visually inspected. Options screenshot explicitly reads Version 01.17.ALL; other still builds/platforms are not established. Do not present this capture set as the latest 2026 build. Xbox-style prompts visible; observed selection is controller UI, not evidence of pointer hover.

- [Select character — Interface In Game](https://interfaceingame.com/screenshots/dragon-ball-fighterz-select-character/) — screenshot.
- [Options list — Interface In Game](https://interfaceingame.com/screenshots/dragon-ball-fighterz-options-list/) — screenshot.
- [Story mode — Interface In Game](https://interfaceingame.com/screenshots/dragon-ball-fighterz-story-mode/) — screenshot.
- [Arcade mode — Interface In Game](https://interfaceingame.com/screenshots/dragon-ball-fighterz-arcade-mode/) — screenshot.
- [Customize — Interface In Game](https://interfaceingame.com/screenshots/dragon-ball-fighterz-customize/) — screenshot.
- [Dragon Ball FighterZ — All Character Select Animations (All DLC), LegacyOfKaiser, 2022-02-23](https://www.youtube.com/watch?v=UcMUKgSggYA) — video.

### MARVEL Tōkon: Fighting Souls

Library ID: `marvel-tokon-fighting-souls`.

Official PlayStation page read on 2026-10-19 lists a shipped release of August 6, 2026 (some regions August 7). Three official screenshots carry 12aug26 asset names and 2026 copyright; exact running patch is not exposed. Separate LegacyOfKaiser character-selection video is a TGS September 2025 preview, linked by PSX Brasil's 2025-09-25 report. Its eight-character roster and motion must not be mislabeled as final shipped UI. A launch-era startup footage page was located but its media could not play; transcript is not visual evidence.

- [Episode Mode screenshot — official PlayStation character/combat guide](https://gmedia.playstation.com/is/image/SIEPDC/marvel-tokon-fighting-souls-game-mode-episode-en-12aug26?wid=1920) — screenshot.
- [All Star Arena screenshot — official PlayStation character/combat guide](https://gmedia.playstation.com/is/image/SIEPDC/marvel-tokon-fighting-souls-game-mode-allstararena-en-12aug26?wid=1920) — screenshot.
- [Training screenshot — official PlayStation character/combat guide](https://gmedia.playstation.com/is/image/SIEPDC/marvel-tokon-fighting-souls-game-mode-training-en-12aug26?wid=1920) — screenshot.
- [MARVEL Tokon: Fighting Souls — Character Select Screen, LegacyOfKaiser, TGS 2025 preview](https://www.youtube.com/watch?v=_dsmA8SjsGs) — video.

### Granblue Fantasy Versus: Rising

Library ID: `granblue-fantasy-versus-rising`.

Official Online Lobby Guide image shows Japanese UI and an in-image date of 2023-10-31; annotated guide graphic, not a current 2026 live session. Character-select footage by Alvrim published 2026-02-13; creator labels full roster at that date. Exact game patch not visible. Record reflects viewed UI, not latest October roster completeness.

- [Online Lobby Guide annotated image — official Cygames site](https://rising.granbluefantasy.jp/assets/images/img_1.56193961.jpg) — screenshot.
- [Granblue Fantasy Versus Rising — All Character Select Screen Animations (Full Roster), Alvrim, 2026-02-13](https://www.youtube.com/watch?v=zNUS-SIwTv0) — video.

### Guilty Gear -Strive-

Library ID: `guilty-gear-strive`.

Main-menu capture is explicitly Season 5 / version 2.0, published 2026-04-09 by LegacyOfKaiser. Official patch notes confirm version 2.00 changes menu design, character select and battle transition. Do not assume it is October's latest patch. Separate training image is an undated legacy screenshot still hosted on the official current homepage; it must not be mistaken for the new 2.00 default HUD, which official notes say can coexist with the initial skin.

- [Guilty Gear Strive — New Main Menu UI (Season 5), LegacyOfKaiser, 2026-04-09](https://www.youtube.com/watch?v=uMzoT1Kna_Y) — video.
- [Legacy Training screenshot — official Strive homepage](https://www.guiltygear.com/ggst/en/wordpress/wp-content/themes/ggst/img/top/mode_slide03_thumb.jpg) — screenshot.

### Mobile Legends: Bang Bang

Library ID: `mobile-legends-bang-bang`.

Official 2025-11-01 new interface preview (watermarked design draft, not a captured current 2026 build); 2023 Project NEXT preview with explicitly labeled 2021 historical comparison. Credited guide screenshots have unknown capture build/date. English UI; exact region unknown.

- [September Project NEXT Express #2 | New Main Interface | Mobile Legends: Bang Bang](https://www.youtube.com/watch?v=EHHQRizjyIs) — video.
- [New Main Interface & Surprise Flip | Main Interface Layout Optimization and Adjustment | MLBB](https://www.youtube.com/watch?v=WqXdHHPLvwk) — video.
- [MLBB beginner guide — hero shop screenshot](https://cdn.oneesports.gg/wp-content/uploads/2023/06/MLBB_BeginnersGuide_Shop_Heroes.jpg) — screenshot.
- [M6 Aurora versus ULFHEDNAR post-match broadcast scoreboard](https://cdn.oneesports.gg/wp-content/uploads/2023/06/MLBB_HowToWatchEsports_PostGame_Scoreboard-1-1024x576.jpg) — screenshot.
- [MLBB beginner guide — in-match equipment shop screenshot](https://cdn.oneesports.gg/wp-content/uploads/2023/06/MLBB_BeginnersGuide_Shop.jpg) — screenshot.

### League of Legends: Wild Rift

Library ID: `league-of-legends-wild-rift`.

Interface In Game archived English main menu; game first released 2020, screenshot capture date/build/region not specified. Not asserted to match current 2026 interface.

- [Main menu — League of Legends: Wild Rift](https://interfaceingame.com/screenshots/league-of-legends-wild-rift-main-menu/) — screenshot.

### Honor of Kings

Library ID: `honor-of-kings`.

Archived English international/global-looking lobby captured in GamingOnPhone guide. Asset path 2023/03; article search result dated 2024-06-20. Exact capture date, region and build unknown. Not the China-client menu and not Honor of Kings: World; not asserted current 2026.

- [Honor of Kings guide — profile stats and match history, lobby screenshot](https://gamingonphone.com/guides/honor-of-kings-guide-tips-to-hide-profile-stats-and-match-history/) — screenshot.

### Hi-Fi Rush

Library ID: `hi-fi-rush`.

Archived Interface In Game captures with keyboard prompts; exact patch and capture date unknown. Static imagery, not a current-build or motion audit.

- [Hi-Fi Rush main menu](https://interfaceingame.com/screenshots/hi-fi-rush-main-menu/) — screenshot.
- [Hi-Fi Rush returning main-menu state](https://interfaceingame.com/screenshots/hi-fi-rush-main-menu-returning/) — screenshot.
- [Hi-Fi Rush skill-store category cards](https://interfaceingame.com/screenshots/hi-fi-rush-skill-store-3/) — screenshot.
- [Hi-Fi Rush options controls](https://interfaceingame.com/screenshots/hi-fi-rush-options/) — screenshot.

### Sifu

Library ID: `sifu`.

Archived screenshots. Main-menu image visibly carries v_1.5_3.330. Other captures' exact patch/platform is unverified; do not claim current 2026 UI.

- [Sifu main-menu type hierarchy](https://interfaceingame.com/screenshots/sifu-main-menu/) — screenshot.
- [Sifu shrine reward selection](https://interfaceingame.com/screenshots/sifu-skill-tree-2/) — screenshot.
- [Sifu evidence board](https://interfaceingame.com/screenshots/sifu-board/) — screenshot.
- [Sifu level-selection scene](https://interfaceingame.com/screenshots/sifu-level-selection/) — screenshot.

### Honkai: Star Rail

Library ID: `honkai-star-rail`.

Archived early-account gallery captures, exact build/date unknown. The images are reference examples, not an assertion of the current roster or patch layout.

- [Honkai Star Rail character index](https://interfaceingame.com/screenshots/honkai-star-rail-characters-list/) — screenshot.
- [Honkai Star Rail Eidolon resonance](https://interfaceingame.com/screenshots/honkai-star-rail-skills/) — screenshot.
- [Honkai Star Rail phone-style hub](https://interfaceingame.com/screenshots/honkai-star-rail-character-menu/) — screenshot.

### Metaphor: ReFantazio

Library ID: `metaphor-refantazio`.

Official ATLUS West showcase streamed 2024-04-22; the viewed interface is prerelease Japanese gameplay within an English presentation. Do not attribute its exact UI to every later edition.

- [Official ATLUS West: Metaphor ReFantazio ATLUS Exclusive Showcase — Introduction](https://www.youtube.com/watch?v=AMO-eAwvvuY&t=1002s) — video.

### Clair Obscur: Expedition 33

Library ID: `clair-obscur-expedition-33`.

Archived Interface In Game captures of a 2025 release. Keyboard prompts visible; exact patch and capture date unverified. Current roster/content and animation are not inferred from these stills.

- [Expedition 33 victory result screen](https://interfaceingame.com/screenshots/clair-obscur-expedition-33-result-screen/) — screenshot.
- [Expedition 33 character selection](https://interfaceingame.com/screenshots/clair-obscur-expedition-33-character-selection/) — screenshot.
- [Expedition 33 skill network](https://interfaceingame.com/screenshots/clair-obscur-expedition-33-skill-tree/) — screenshot.
- [Expedition 33 cutscene pause](https://interfaceingame.com/screenshots/clair-obscur-expedition-33-pause/) — screenshot.
- [Expedition 33 inventory tabs and floating detail](https://interfaceingame.com/screenshots/clair-obscur-expedition-33-inventory/) — screenshot.
- [Expedition 33 merchant controls](https://interfaceingame.com/screenshots/clair-obscur-expedition-33-store/) — screenshot.

## Next research during a website brief

Retrieve the games that address the actual page problem, then inspect the missing interaction phase rather than treating this index as complete. Priority gaps are shipped Tōkon selection/exit footage, modern Street Fighter hover or controller transitions, exact Mobile Legends shipping build/region, and full trigger-to-settle/exit/re-entry sequences for the bold static references. Existing older requested games remain in the full library, with metadata-only and atmosphere-only coverage explicitly separated.

For suggestions, produce two or three original directions with a signature silhouette and entry/exit choreography. State which evidence informed each decision. For implementation, keep an authored keyboard, touch, responsive and reduced-motion version, and test interruption. A source's limitations should guide the next inspection, not force the final website into generic components.
