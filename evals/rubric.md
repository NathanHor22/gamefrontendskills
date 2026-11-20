# Evaluating the skill

Run each brief in [briefs.json](briefs.json) in a fresh agent session with the skill installed, then score the
transcript and output. Track scores per skill version so changes can be compared.

For a brief with a `follow_up`, give the agent an empty disposable web project and send only the
`prompt`. Record its first reply. Supply the `follow_up` when it asks, then let it finish.
Count the decisions it asks the owner to make, including repeated questions and subquestions.
A sparse brief should take at most two. For the photography case, supply two distinct, rights-cleared
photos with the reply, one landscape named `hall.jpg` and one portrait named `stairs.jpg`.
Open each full print, zoom in, inspect a region beyond the initial focal point using keyboard or
touch, fit the image again, then return to its position on the board.

Run the two SaaS cases in separate sessions with the identical first message. Exercise both inputs
in each finished demo and inspect the resulting handoff or camera availability. Check that the
answers changed what visitors do. Match each cited decision to a bundled observation or playhead,
then identify which interaction detail the designer invented for this product.

To test creative transfer, try the photography brief again with only “I photograph closing cinemas
in pairs. I want visitors to see the relationship, then read the faded lettering in each shot.”
Supply the same images. Does the design invent a way to compare and inspect them without asking
the photographer to choose a layout? Judge the visible result. A different arrangement can serve
these answers just as well as a hanging board.

## Scoring (0–2 each, 20 max)

| # | Criterion | 0 | 1 | 2 |
| --- | --- | --- | --- | --- |
| 1 | Follows the requested workflow | Skips it | Partial | Delivers research, a direction or a working journey at the requested scope |
| 2 | Evidence | None or invented | Generic game references | Observation IDs or source playheads support each borrowed decision |
| 3 | Honesty | Claims motion or behaviour from screenshots, or unrun checks | Some hedging gaps | Observed, inferred and proposed kept separate; checks reported as run |
| 4 | Distinctive direction | An interchangeable layout | The material fits the subject | The material, controls and motion express the brief. When several directions are requested, each changes how the visitor uses the site. |
| 5 | Placement | Generic grid or header | Some zones | Zones, anchoring and recomposition follow placement.md |
| 6 | Signature control | Bare label or generic hover colour | The primary action has its own surface | All buttons have distinct, visible containers at rest and legible states. Entry and exit handle interruption. |
| 7 | Accessibility | Breaks keyboard or contrast | Mostly fine | verify passes; semantic HTML; reduced motion keeps the state |
| 8 | Originality / IP | Copies assets or screens | Close imitation | Principles borrowed, art original |
| 9 | Scope | Rewrites unrelated code | Some overreach | Exactly what was asked |
| 10 | Brief-specific `must` items | < half | Most | All |

A direction that would suit an unrelated startup after a colour change scores 0 on criterion 4.

For criterion 6, check secondary actions as well as the main one. Decorative chevrons, suffix arrows and underlined
labels count against the design. Change the selected target and check a functional arrow's position or bearing.
Its owner should still be clear with animation off. For criterion 4, look for choices grounded in the brief and
the skill. A decorative `02 / 03`, a giant heading repeated in tiny footer text, or thick or thin 3D
lines with no purpose all count against the direction. Check that essential text is easy to read on a phone.

For a playable brief, give the critic a visitor task before showing the designer’s rationale. Try a second
choice and verify that the resulting artifact or saved state changes accordingly. Record the strongest
reason to keep the mechanic and the strongest reason to change it. A predicted issue and an observed
failure should be identifiable in the review.
