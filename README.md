# Game UI Art Direction for Frontend Development · `$gamedev`

A Codex skill for designing original frontend websites through game interface research: distinctive silhouettes, typography, artwork outside control bounds, and expressive entrance and exit choreography.

Use it to turn a reference such as “Persona 3 Reload meets Papers, Please” into a coherent website direction, then implement the direction in your project when asked. It studies the relationship between controls, their selected states, and the surrounding scene. The skill excludes Mobbin/Mobin and CodePen.

## Install in Codex

Ask Codex to install the skill from [NathanHor22/gamefrontendskills](https://github.com/NathanHor22/gamefrontendskills):

```text
$skill-installer install the gamedev skill from
https://github.com/NathanHor22/gamefrontendskills/tree/main/gamedev
```

For a project-local installation, copy the entire `gamedev/` directory into your project's `.agents/skills/gamedev/` directory. Preserve its `data/`, `references/`, `scripts/`, and `agents/` subfolders. See the [official Codex skills documentation](https://learn.chatgpt.com/docs/build-skills) for skill discovery and installation.

Use Codex with a configured account or API access. Online research and visual inspection depend on the tools available in your Codex environment. The bundled research can be queried offline with Python; the local helper requires **Python 3.10+ with SQLite FTS5**, uses only the standard library, and needs no API key.

## Use it

```text
$gamedev research Persona 3 Reload and Papers, Please for my
portfolio. Develop three original directions, each with a signature
navigation control and distinct enter and exit choreography.
```

```text
$gamedev study Tōkon and Dragon Ball FighterZ. Design a project
selector with artwork that extends outside the hit area. Separate
observed game behavior from your new website animation proposal.
```

```text
$gamedev implement the chosen direction in this project. Keep its
character on keyboard, touch, narrow screens, and reduced motion.
Test rapid re-entry and interrupted transitions.
```

Research requests produce research and design suggestions. Implementation requests use the current project's stack and instructions. The skill does not publish a website by itself.

## Included research

The 2026-10-19 research snapshot contains:

| Coverage | Count |
| --- | ---: |
| Game and edition profiles | 44 |
| Profiles with visually studied interfaces | 38 |
| Reviewed image sources, including production references | 107 |
| Inspected video sources | 9 |
| Visual observations | 128 |
| Original website interaction proposals | 24 |

The remaining profiles include one atmosphere-only study and five without visual observations. A composite counts as one image source. An inspected clip does not imply every transition or hover state was reviewed.

References span Persona, Tekken, Street Fighter, Tōkon, FighterZ, Mobile Legends, horror interfaces, racing games, Taiko, LEGO, Final Fantasy, Apex, FIFA/FC, and more. Start with the [modern game studies](gamedev/references/modern-game-research.md) or [cross-genre studies](gamedev/references/cross-genre-game-research.md). Full records preserve source links, exact editions where known, observations, inferences, proposed website adaptations, and research gaps.

This is a sourced research collection with original design proposals. It is not an exhaustive game catalog, a trained model, or a bundle of game artwork. Screenshots establish appearance at an instant; motion claims require separate evidence. Capture dates, prerelease material, production sheets, and unknown builds remain labeled.

## Query or rebuild the library

Run these commands from the repository root:

```sh
python gamedev/scripts/library.py stats
python gamedev/scripts/library.py check
python gamedev/scripts/library.py resolve "dragonball fighterz"
python gamedev/scripts/library.py search "detached selection"
python gamedev/scripts/library.py show persona-3-reload
```

The helper uses SQLite FTS5 keyword search, not embeddings, and never fetches URLs. The repository stores portable JSON records rather than a generated database binary. When no local database exists, these commands query the bundled records in memory automatically. Importing new research creates a persistent local database, seeded with the bundled records; that generated file is ignored by Git.

You can also build a separate database explicitly:

```sh
python gamedev/scripts/library.py --db work/rebuilt-library.sqlite import --file gamedev/data/games.json
python gamedev/scripts/library.py --db work/rebuilt-library.sqlite import --file gamedev/data/patterns.json
python gamedev/scripts/library.py --db work/rebuilt-library.sqlite check
```

To preserve research added after installation, run this from your installed skill directory before replacing it:

```sh
python scripts/library.py export --file my-library-backup.json
```

See [research-library.md](gamedev/references/research-library.md) for the schema, evidence rules, import behavior, and coverage definitions.

## Make it yours

Public defaults do not assume that you created the example websites or share their creator's title preferences. Tell the skill your audience, content, visual references, and rejected directions. Use exact game editions when they matter.

For persistent personal settings, add `gamedev/data/preferences.local.json` in your installed copy. That file is ignored by Git. For example:

```json
{
  "personal_reference_sites": ["https://your-portfolio.example/"],
  "title_resolutions": {
    "my blue persona reference": "persona-3-reload"
  }
}
```

Local dictionaries merge with the public defaults; local lists replace the corresponding default lists. The included Nathan Hor and Quipus studies are optional credited examples of authored website interaction, not a default identity or style to impose on every project.

## Validate changes

Run `python -B -m unittest discover -s tests -v` and `python gamedev/scripts/library.py check` from the repository root. The included GitHub Actions workflow runs the behavioral tests and integrity check on Linux and Windows with Python 3.10 and 3.13.

## Sources and license

Original code, instructions, analysis, and proposals are distributed under the [MIT license](LICENSE). Linked games, websites, images, footage, fonts, and trademarks retain their respective owners' rights. No game image or video files are bundled. Use original or appropriately permitted assets in your own designs.

See [CREDITS.md](CREDITS.md) for source acknowledgments. New research should include provenance, actual inspection, exact edition information where available, and a clear separation between observation and new design proposals. Do not scrape or mirror source galleries.
