# Recipe 1: frontend-design + web-design-guidelines + Emil Kowalski

Result: `prototypes/1-default`. The agent's own log of choices is in
[RECIPE-NOTES.md](../../../prototypes/1-default/RECIPE-NOTES.md) and the design system it produced is in
[DESIGN.md](../../../prototypes/1-default/DESIGN.md).

## Sources

| Source | Where it comes from | Version used |
|---|---|---|
| `frontend-design` | Claude Code plugin skill `frontend-design:frontend-design` | as installed on 2026-10-04 |
| `web-design-guidelines` | Claude Code skill, reviews UI code against Vercel's Web Interface Guidelines | as installed on 2026-10-04 |
| Emil Kowalski's `emil-design-eng` | https://github.com/emilkowalski/skills, `skills/emil-design-eng/SKILL.md` | commit `e8a175de22ae1e49370fc144c1f3bb9aeedf988d` |

The two installed skills have no commit recorded here because they were loaded through the Skill
tool from the local Claude Code installation.

## Prompt given to the agent

`$SKILLS` stands for the folder holding the cloned repositories.

```
You are building one of three competing UI/UX prototypes for a web app called Bargainu. The team will compare the three and pick one, so yours should be a complete, polished, clickable app that shows what your design recipe produces at its best.

Your folder: /Users/yutaasakura/Documents/GitHub/bargainu/prototypes/1-default
Product brief (read it first, it is binding): /Users/yutaasakura/Documents/GitHub/bargainu/prototypes/BRIEF.md
Dev server port: 5171 (run `npx vite --port 5171 --strictPort` in the background from your folder)

## Your recipe: frontend-design + web-design-guidelines + Emil Kowalski

Use exactly these three sources for design direction and nothing else. Do not consult other design skills, and do not look at the other prototype folders.

1. Invoke the `frontend-design:frontend-design` skill with the Skill tool before designing. It sets the aesthetic direction, typography and overall visual choices.
2. Read Emil Kowalski's design engineering skill at
   $SKILLS/skills-emilkowalski/skills/emil-design-eng/SKILL.md
   and apply it to interaction detail and motion. The sibling folders `animate`, `review-animations` and `animation-vocabulary` in the same `skills/` directory are also his and may be used.
3. When the app is built, invoke the `web-design-guidelines` skill with the Skill tool and review your own UI code against it. Fix what it finds.

Order of work: read the brief, load skills 1 and 2, decide the design direction and write the tokens, build all five screens, check screenshots at 390 and 1440 wide and iterate, run the web-design-guidelines review and fix findings, then write DESIGN.md and RECIPE-NOTES.md as the brief describes.

Nobody is available to answer questions. Where a skill tells you to ask the user something, answer it yourself from the brief and record the answer in RECIPE-NOTES.md.

Done means: `npm run build` passes, every screen and every filter in the brief works, you have looked at screenshots of every screen at both widths, both markdown deliverables exist, and your dev server is stopped. Do not commit anything to git.

Report back in under 200 words: the design direction in two sentences, libraries and fonts added, anything in the brief you could not deliver, and anything you are unsure works.
```

## What came out

- **Direction:** a Japanese sale-day shop floor. Every product photo carries a tilted yellow
  割引シール (discount sticker) with red numerals, on indigo ink and white.
- **Added:** `lucide-react` 1.51.0, `@fontsource/dela-gothic-one` 5.3.0 (display and prices),
  `@fontsource/zen-kaku-gothic-new` 5.3.0 (body).
- **Deviations the agent reported:** media-query breakpoints and the `theme-color` meta are raw
  values outside `tokens.css`; the web-design-guidelines "Title Case" rule was declined in favour
  of sentence case.
- **Run cost:** about 15 minutes, 83 tool calls.
