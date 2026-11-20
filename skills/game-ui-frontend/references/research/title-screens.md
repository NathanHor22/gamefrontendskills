# From a game title screen to a site entrance

A title screen gives the world a face. The main menu tells you what you can do there. A game may
separate those screens; the web version can compose both into one view. A visitor should not have to
dismiss a logo, wait for a cinematic or guess what **Start** means before reaching the work.

## Which menu should you study?

| Design question | Evidence to inspect | Decision for the website |
| --- | --- | --- |
| How can someone browse without disturbing a place? | In the original *Life is Strange* PC recording, pointer movement enlarges successive handwritten choices while the coast holds its framing. Backing through settings replaces the available words over the same view. [Life is Strange study](life-is-strange-title.md) | Keep the scene running independently of the controls. Give each action a visible surface and put the emphasis inside it. |
| How can a view carry several decisions? | In the original PS4 *Marvel's Spider-Man*, the same perched figure carries the visitor from title to save slot to difficulty. In the PC remaster, the row marker and help text change before the selected row's brackets finish spreading. [Spider-Man study](spider-man-title.md) | Identify the current choice immediately. The slower drawing or camera move can finish afterwards. |
| When should the camera move? | In *Arkham Asylum*, the new action list is readable over Batman's chest before the composition settles on his profile. In *Arkham City*, moving between squares changes the heading while the grid holds still. [Arkham series study](arkham-title.md) | Reserve a change of framing for a change of context. When someone is comparing neighbours, keep those choices in place. |
| How can the selection direct a scene? | *Persona 3 Reload* moves from the classroom window into the room before offering its choices. *Persona 5 Royal* lets the selected action change the stage picture. [Persona by edition](persona-title-menus.md) | On a cinema site, let the current film direct the image. Keep the destination and its button readable during every cut. |
| How can someone browse a collection on a small screen? | *Gran Turismo* on PSP gives a shelf an orange light and label, opens a collection, and returns to the grid. GT3 carries its selected mode name across a colour change into the submenu. [Gran Turismo menus](gran-turismo-menus.md) | Carry the identity of the selected work into the detail view. Back should restore its position and keyboard focus. |
| When does a character become the navigation? | *God of War* widens from Kratos to the cliff after a decision. The PSP games and *Crash* show other ways for a character, stage or object to hold a choice. [God of War, Crash and LocoRoco](playstation-and-psp-title-menus.md) | Let the subject of the work connect the entrance to its destination. Test whether people can still make the choice with the scene paused. |
| Can someone get straight back to their work? | *Sunset Overdrive* offers play as the current profile or change player directly on the title. The selected route becomes a loading state in the same part of the composition. [Sunset Overdrive, action, sport and racing](action-and-racing-title-menus.md) | Offer an immediate return to a real saved set. Show a wait only while that set is being retrieved. |
| Which parts of a screen belong to a button? | *Metaphor: ReFantazio* moves the red emphasis between words while the painted city holds. *Taiko* lets a selected mode unfold among compact neighbours. [RPG and rhythm menus](rpg-and-rhythm-title-menus.md) | Give each choice one readable label on a visible surface. Change the face or reveal its preview within a stable hit area. |
| How does someone know whether they have committed? | *Warframe* opens a different description as the cursor moves across daily tribute items. In the mobile *Honor of Kings* opening, choosing a starting hero reveals a separate confirmation. [Fighting games, mobile lobbies and Warframe](fighting-and-online-title-menus.md) | On a site with a lasting choice, make inspecting something feel different from actually accepting it. Give ordinary navigation one-tap access. |

Use the [catalogue by game and screen](catalog.md#by-game) to find individual editions. Some recordings show an occupied save, a first-time setup, an attract sequence or a lobby. Follow the case that matches the visitor's situation. Dates, platforms, playheads and the limits of each input claim are in the individual studies.

## Study the actual opening

Search the library for `title` and `main_menu`. For first-run choices and returning players, also check `character_select`, `hub_lobby` and `confirmation`. Find two useful openings with different staging,
then study the relevant clip or capture before deciding. Scrub to four moments: first readable
frame, untouched idle, change of focus, and the moment a choice opens or returns. Record the source
and playhead for each motion claim. Mark anything an image cannot establish as unverified.

| Evidence | What to borrow, not copy |
| --- | --- |
| `silent-hill-2-2001-main-anatomy` (still) | The title controls the scale hierarchy; the choices sit in a readable quiet zone. The capture does not establish movement. |
| `sh2r-main` (video frames) | The washroom is the stage, and the selection reads as light or pigment against it. Do not infer pointer response, easing or interruption from the frames. |
| `colin-mcrae-rally-2-0-main-menu-anatomy` (still) | The lower menu and central track-like composition have different jobs. The track motif serves the subject rather than decorating a generic menu. |
| [Metroid Prime Hunters manual, pp. 10–11](https://www.nintendo.com/eu/media/downloads/games_8/emanuals/nintendo_ds_21/Manual_NintendoDS_MetroidPrimeHunters_EN.pdf) | The game separates title, choice and return. On the web, keep that distinction without requiring the title-screen tap. This source establishes the flow, not motion timing. |

## What a real mouse hover does in osu! (lazer)

The developers' source for release `2026.1117.0-lazer` lets us distinguish pointer entry, a sustained hover, departure and activation. These are programmed timings. A recording alone would have to show the cursor crossing the boundary to establish the same input.

**Reveal.** Activating the logo from the initial state opens the top-level choices. The logo starts shrinking as the menu opens. The button area begins its reveal 150 ms after leaving the initial state. That small overlap lets the eye follow the logo into the menu. [Logo input and button reveal](https://github.com/ppy/osu/blob/078f5a226368e62fd2974f8eb167303b41d71cab/osu.Game/Screens/Menu/ButtonSystem.cs#L390-L449) · [Logo movement](https://github.com/ppy/osu/blob/078f5a226368e62fd2974f8eb167303b41d71cab/osu.Game/Screens/Menu/ButtonSystem.cs#L480-L506)

**Enter and linger.** The button has a slanted face, a label and a separate icon. Entering an expanded button plays its hover sound and sends the face towards 150% of its resting width over 500 ms with elastic easing. The icon takes a compressed pose by the next musical beat. While the pointer stays, the icon bounces on successive beats. The move that answers the pointer and the move that follows the music have different clocks. [Button construction](https://github.com/ppy/osu/blob/078f5a226368e62fd2974f8eb167303b41d71cab/osu.Game/Screens/Menu/MainMenuButton.cs#L95-L171) · [Beat and hover handlers](https://github.com/ppy/osu/blob/078f5a226368e62fd2974f8eb167303b41d71cab/osu.Game/Screens/Menu/MainMenuButton.cs#L176-L242)

**Leave and commit.** Leaving clears the icon animation. Its scale returns in 200 ms while its position and rotation settle over 500 ms. A click invokes the action immediately and lets the local highlight fade over 800 ms. The player can leave before a beat or commit during the stretch. For a website, put that expanding face inside a fixed hit area and keep the action available from the first frame. [Departure, click and key handlers](https://github.com/ppy/osu/blob/078f5a226368e62fd2974f8eb167303b41d71cab/osu.Game/Screens/Menu/MainMenuButton.cs#L233-L296)

## Choreograph one website choice

Consider a documentary site with **Watch the film** and **Read the shoot notes**. The following is an original direction. The notebook belongs to this filmmaker and the opening still is from this film.

| Moment | What the visitor would see or do |
| --- | --- |
| Arrival and idle | The film still and both labelled buttons are available immediately. A draft lifts the corner of the filmmaker's notebook. Pause the movement over a frame where the choices are equally legible. |
| Hover or keyboard focus | Focusing **Read the shoot notes** changes the button face immediately. The notebook opens just enough to show an actual contact sheet. Keep its label and hit area in place. |
| Leave or change choice quickly | If the visitor crosses to **Watch the film** halfway through the lift, turn the page back from its current angle. Give the new choice its own focus treatment immediately. Never queue previews the visitor has already passed. |
| Activate | Selecting **Read the shoot notes** opens the notes directly. Carry the same contact sheet into the article header and move reading focus to its heading. A touch visitor reaches it with one tap. |
| Return or reduce motion | Back restores the chosen button and the menu's position. With reduced motion, exchange the two still compositions directly. The visitor can make the same choice without waiting for the notebook. |

To critique the result, observe someone crossing both choices without clicking, activating midway through a preview, then returning. They should be able to tell which choice has focus, reach only the destination they selected and recover their place. Drop any transition that obscures one of those moments.

## Draw the scene before the layout

1. **Title and text.** Give the title one deliberate anchor and reserve a quiet pocket for the menu.
   Compare a few real text lengths; keep action labels legible at the busiest phase of the scene.
   Use a scrim, a surface or a different crop instead of hiding words behind the art.
2. **Background.** Pick one subject tied to the work. Draw near, middle and far only if they clarify
   depth. Decide whether the opener is a held tableau, an ambient loop, a scene reacting to menu focus,
   a scene navigating through space, or a hybrid. A video loop can establish a place; it does not
   become an interaction just because it plays. Do not prescribe a 3D engine when a still or SVG works.
3. **Input and response.** Identify what changes on hover and keyboard focus, what first tap does,
   what commits, and how Back works. Use a stable menu and move the scene, light or preview rather than
   its hit areas. Touch should work without first hovering; use a real separate control if inspection
   and activation differ. Audio should never be necessary or autoplay.
4. **Arrival and return.** Specify first paint, idle, focus, commit, interrupted transition and return.
   Keep deep links and native navigation usable; do not require a modal or capture scroll to enter.
   Bring focus back to the opener when closing UI you opened over the scene.
5. **Phone and still version.** Recompose the crop and text zones instead of shrinking everything.
   Keep the scene optional. Respect reduced motion, provide pause for continuous movement, and keep
   all destinations available without WebGL, video, pointer tracking or autoplay.

Reject a centered headline, two stock CTAs and a grid of cards with a looping backdrop when the
brief calls for a game-led entrance. If the scene can be replaced by unrelated stock footage without
changing the experience, the art and interaction are not earning their place.

## Try the whole opening

[Signal Room](../../templates/title-screen.html) uses original art and a fixed two-choice menu.
Focus or pointer intent redirects a searchlight; choosing a destination opens real content and the
return link restores a useful focus target. The ambient movement can be paused without affecting
navigation. This is one scene-responsive composition, not a template to apply to every site.

Check keyboard, touch and mouse; narrow portrait and desktop; motion disabled and paused; repeated
choice changes; readable text in the brightest frame; destination deep links and return. Compare
screens at rest and after selection. Report what was actually played or measured.
