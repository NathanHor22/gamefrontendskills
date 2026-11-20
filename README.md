# game-ui-frontend

Ever asked Claude or ChatGeeBeeTee to make you a website and thought, **“Rah, didn’t my barber get this exact same one?”**

Same purple gradient. Same three little boxes. Same “revolutionising the future” waffle. Man asked for a portfolio and got a SaaS landing page selling productivity to accountants. Allow it, fam.

Plug this skill into your website project and give it some prime Adel Taarabt at Loftus Road. A little nutmeg and a cheeky one-two. Bang, your website’s looking leng now, y’know.

Want a portfolio where picking a project feels like choosing your fighter? A print shop where you pull the ink yourself and take the print home? Exactly, brev. We didn’t spend all those years playing games just to make another website with three cards and a purple blob.

There’s enough Man City in this world. Be prime Neymar Jr at Barcelona.

## Try it in chat, brev

Drop this line into your Claude or ChatGeeBeeTee chat. No terminals. No tech wizardry. Straight-up easy, like getting a Tesco Meal Deal. Bosh.

```text
Use https://raw.githubusercontent.com/NathanHor22/gamefrontendskills/main/skills/game-ui-frontend/SKILL.md to build my website from the game research in the skill. Ask me up to two quick questions about anything missing, then build it.
```

If the links are moving funny, yeah, paste the [skill instructions](skills/game-ui-frontend/SKILL.md) into the chat and say:

> Build my site with this skill. If you need another game study, tell me which one to paste.

“Build me a site for my gig photography” is plenty to get going, mate. It might ask **“What should people come here to do?”** and **“What should it feel like when they arrive?”** Try this:

> Let people pick a band and see the night I shot them. I want it to feel like flicking through the gig posters outside the Brixton Academy.

Now the posters are your opening menu. Pick a band, see its shoot, come back to the poster you picked. The skill gets that browsing behaviour from its game studies. The photographs and the character of the venue come from you. Already know what you want? Stick it all in the first message and it can crack on.

In a coding agent it builds in your project. In an ordinary chat you can get one HTML file to save and open. Fancy seeing where the moves come from? [Start-screen studies](skills/game-ui-frontend/references/research/title-screens.md)

## For dem technical mandem

<details>
<summary>Go on then, show us the workings.</summary>

### Running it on your own patch

From your project folder, run the line for your agent. You’ll need Git, Node.js **22.20 or newer**, and a signed-in Claude Code or Codex CLI. Make sure they’re all there before you start blaming the computer, yeah?

```sh
# Codex
npx skills@latest use NathanHor22/gamefrontendskills@game-ui-frontend --agent codex

# Claude Code
npx skills@latest use NathanHor22/gamefrontendskills@game-ui-frontend --agent claude-code
```

PowerShell kicking off and throwing hands? Run this instead, then paste what it prints into Claude Code or Codex on the same machine.

```powershell
npx.cmd skills@latest use NathanHor22/gamefrontendskills@game-ui-frontend
```

The skill lives in a temporary folder outside your repo. npm might keep a cached copy too. [How skills.sh works](https://github.com/vercel-labs/skills/blob/main/docs/commands.md#skills-use)

### Who’s doing what?

Say you want a character-select portfolio.

The **philosopher** studies how a fighting game handles its roster. The **designer** gives each project a slot. Then the **critic** pulls up and asks the real question: can someone pick a project with one thumb while the night bus is taking corners like it’s auditioning for *Fast & Furious: Peckham Drift*?

If the menu only looks good on a massive monitor in a fancy studio, it’s getting sent back to the training ground.

[The three roles](skills/game-ui-frontend/agents/) · [Creative direction guide](skills/game-ui-frontend/references/art-direction.md) · [Print Room demo](skills/game-ui-frontend/templates/print-room.html)

The research covers **112 game/edition profiles**, **251 visual observations from 112 reviewed images and 95 video sources**, and **24 original web interaction patterns**. Man’s done the homework, fam.

Fancy checking the footage yourself? The studies have timestamps and everything.

[Start screens and menus](skills/game-ui-frontend/references/research/title-screens.md) · [Video studies](skills/game-ui-frontend/references/research/game-design-philosophy.md) · [Library commands](skills/game-ui-frontend/references/library.md)

### Under the bonnet

Working on the skill itself? Run these from the repo, bossman.

```sh
npm ci --ignore-scripts
node --test tests/library.test.mjs tests/package.test.mjs
npm run check
```

For the browser checks, run `npx playwright install chromium`, then:

```sh
node --test --test-concurrency=1 tests/browser.test.mjs
```

Want to see the reports? Open your system’s temporary folder and look for directories starting with `guf-browser-`. They’re in there somewhere, hiding like your mate when it’s his round.

[Browser setup](skills/game-ui-frontend/SKILL.md#tools)

</details>

[Credits](CREDITS.md) · [MIT licence](LICENSE)

## More information

What, you the feds? Allow it, fam. Check the repo itself, blud. We’re from the ends.
