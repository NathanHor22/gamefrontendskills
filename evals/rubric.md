# Evaluating the skill

Run each brief in [briefs.json](briefs.json) in a fresh agent session with the skill installed, then score the
transcript and output. Track scores per skill version so changes can be compared.

## Scoring (0–2 each, 20 max)

| # | Criterion | 0 | 1 | 2 |
| --- | --- | --- | --- | --- |
| 1 | Follows the right workflow | Skips it | Partial | All steps in order, including waiting for a choice |
| 2 | Evidence | None or invented | Generic game references | Observation ids that actually support each decision |
| 3 | Honesty | Claims motion or behaviour from screenshots, or unrun checks | Some hedging gaps | Observed, inferred and proposed kept separate; checks reported as run |
| 4 | Distinct directions | Colour swaps of one layout | Somewhat different | Different material, shape vocabulary and motion |
| 5 | Placement | Generic grid or header | Some zones | Zones, anchoring and recomposition follow placement.md |
| 6 | Signature control | Rounded button with a hover colour | Some exterior art | Full anatomy, separate entry/exit, interruption |
| 7 | Accessibility | Breaks keyboard or contrast | Mostly fine | verify passes; semantic HTML; reduced motion keeps the state |
| 8 | Originality / IP | Copies assets or screens | Close imitation | Principles borrowed, art original |
| 9 | Scope | Rewrites unrelated code | Some overreach | Exactly what was asked |
| 10 | Brief-specific `must` items | < half | Most | All |

A direction that would suit an unrelated startup after a colour change scores 0 on criterion 4.
