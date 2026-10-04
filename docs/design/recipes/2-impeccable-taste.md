# Recipe 2: Impeccable + Taste Skill

Result: `prototypes/2-impeccable-taste`. The agent's own log of choices is in
[RECIPE-NOTES.md](../../../prototypes/2-impeccable-taste/RECIPE-NOTES.md), the design system it produced is in
[DESIGN.md](../../../prototypes/2-impeccable-taste/DESIGN.md), and the product context Impeccable's init step
asks for is in [PRODUCT.md](../../../prototypes/2-impeccable-taste/PRODUCT.md).

## Sources

| Source | Where it comes from | Version used |
|---|---|---|
| Taste Skill, `design-taste-frontend` (v2) | https://github.com/Leonxlnx/taste-skill, `skills/taste-skill/SKILL.md` | commit `ce26fc25c0e5e8cab638f883de62d9a86ee5e45b` |
| Impeccable | https://github.com/pbakaus/impeccable, `.claude/skills/impeccable/` | commit `e103efe779e2dd01274dabae83531fef00bf2563` |
| Impeccable detector | `npx impeccable detect src/` | version resolved by `npx` on 2026-10-04 |

Neither skill was installed with its installer. The agent read the skill files from local clones
at the commits above. To install them normally instead:

```
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
npx impeccable install
```

## Prompt given to the agent

`$SKILLS` stands for the folder holding the cloned repositories.

```
You are building one of three competing UI/UX prototypes for a web app called Bargainu. The team will compare the three and pick one, so yours should be a complete, polished, clickable app that shows what your design recipe produces at its best.

Your folder: /Users/yutaasakura/Documents/GitHub/bargainu/prototypes/2-impeccable-taste
Product brief (read it first, it is binding): /Users/yutaasakura/Documents/GitHub/bargainu/prototypes/BRIEF.md
Dev server port: 5172 (run `npx vite --port 5172 --strictPort` in the background from your folder)

## Your recipe: Impeccable + Taste Skill

Use exactly these two sources for design direction and nothing else. Do not invoke any other design skill with the Skill tool (in particular not frontend-design or web-design-guidelines), and do not look at the other prototype folders.

1. Taste Skill (`design-taste-frontend`, the repo's default v2 skill): read $SKILLS/taste-skill-Leonxlnx/skills/taste-skill/SKILL.md in full and follow it when generating the UI. It asks you to infer the design language from the brief and set three dials (DESIGN_VARIANCE, MOTION_INTENSITY, VISUAL_DENSITY). Choose the values that suit a deal-finding app and record them.
2. Impeccable: read $SKILLS/impeccable-pbakaus/.claude/skills/impeccable/SKILL.md and the files it points to under `reference/` that apply. Follow its flow: do what its `init` step asks (create the context files it wants inside your folder), then use its commands as written procedures on your own work: at minimum `critique`, `audit` and `polish`.
3. Final pass: run `npx impeccable detect src/` from your folder and fix what it reports. Record the before and after finding counts.

Order of work: read the brief, read both skills, do Impeccable's init, set the Taste dials and write the tokens, build all five screens, check screenshots at 390 and 1440 wide and iterate, run the Impeccable critique/audit/polish procedures and the detector, then write DESIGN.md and RECIPE-NOTES.md as the brief describes. If Impeccable's init already produced a DESIGN.md, make that one file satisfy the brief's DESIGN.md requirements too.

Nobody is available to answer questions. Where a skill tells you to ask the user something, answer it yourself from the brief and record the answer in RECIPE-NOTES.md. If the two skills disagree, note the conflict and which one you followed.

Done means: `npm run build` passes, every screen and every filter in the brief works, you have looked at screenshots of every screen at both widths, both markdown deliverables exist, and your dev server is stopped. Do not commit anything to git.

Report back in under 200 words: the design direction in two sentences, the dial values, libraries and fonts added, detector counts before and after, anything in the brief you could not deliver, and anything you are unsure works.
```

## What came out

- **Direction:** the department-store carrier bag and its paper seal. A bottle-green shell,
  green-tinted paper and ink, one yellow accent. Every discount is a tilted round seal straddling
  the photo edge, sized by the discount, on cardless deal tiles.
- **Dials:** `DESIGN_VARIANCE 5`, `MOTION_INTENSITY 4`, `VISUAL_DENSITY 6`.
- **Added:** `@phosphor-icons/react` 2.1.10, `@fontsource-variable/geist` 5.3.0.
- **Detector:** 1 finding before (bounce easing), 0 after, on `src/`. Run on `dist/`, the bundled
  detector flags Geist as an overused font. The agent kept Geist because Taste Skill recommends it.
- **Impeccable steps not run:** its decision page, comp round, finish-reviewer and documenter
  agents. Critique ran as two isolated agents; audit and polish were done in the main thread.
- **Deviation from the brief:** the login form rejects an empty email. Any non-empty input, or the
  demo button, signs in.
- **Run cost:** about 21 minutes, 86 tool calls.
