# Recipe 3: reference-driven, no design skill

Result: `prototypes/3-reference`. The agent's own log of choices is in
[RECIPE-NOTES.md](../../../prototypes/3-reference/RECIPE-NOTES.md) and the design system it produced is in
[DESIGN.md](../../../prototypes/3-reference/DESIGN.md).

This recipe has two steps. A person (here, the orchestrating Claude session) browses reference
galleries and writes a direction. Then a build agent follows that direction with no design skill.

## Step 1: choose references and write the direction

Galleries browsed on 2026-10-04:

- https://www.awwwards.com/websites/e-commerce/
- https://www.footer.design/
- https://scroll.gallery/
- https://github.com/danielpetho/fancy (component source, MIT, commit `f9f62c61207b2dd3210476dd98af3c9a5be24094`)

Cosmos (https://www.cosmos.so/explore/ui-ux) was on the list and was not opened.

References chosen and what was taken from each are written in
[prototypes/3-reference/DIRECTION.md](../../../prototypes/3-reference/DIRECTION.md). That file is the
real recipe: change it and the result changes. No screenshots of the reference sites are stored in
this repo, because they are other people's work. The URLs are in DIRECTION.md.

How the direction was reached: the listing was scanned for sites whose look could carry a "sale
flyer" idea, which fits a bargain app in Japan (チラシ). Vibe and Ring Pop were the two with loud
colour bands, tickers and sticker-like elements, so their live sites were opened and their
patterns written down. The Nothin' footer was added for the edge-to-edge wordmark.

## Step 2: prompt given to the build agent

```
You are building one of three competing UI/UX prototypes for a web app called Bargainu. The team will compare the three and pick one, so yours should be a complete, polished, clickable app that shows what your design recipe produces at its best.

Your folder: /Users/yutaasakura/Documents/GitHub/bargainu/prototypes/3-reference
Product brief (read it first, it is binding): /Users/yutaasakura/Documents/GitHub/bargainu/prototypes/BRIEF.md
Dev server port: 5173 (run `npx vite --port 5173 --strictPort` in the background from your folder)

## Your recipe: reference-driven, no design skills

Your design direction is already written in /Users/yutaasakura/Documents/GitHub/bargainu/prototypes/3-reference/DIRECTION.md. Read it and follow it. It names three reference sites, the rules drawn from them, six signature pieces, and the components to take from the `fancy` library (source path is in the file).

Do not invoke any design skill with the Skill tool (not frontend-design, not web-design-guidelines, nothing else), and do not look at the other prototype folders. The point of this prototype is to show what references alone produce.

You may open the three reference sites to look closer if you have a way to, but do not copy their assets, logos, text or code. Take the patterns, not the material. The fancy components are MIT licensed and may be copied with the notice kept.

Order of work: read the brief and DIRECTION.md, choose the fonts and write the tokens, copy and adapt the fancy components, build all five screens, check screenshots at 390 and 1440 wide and iterate until the signature pieces look intentional and Browse and Deal detail are still easy to scan, then write DESIGN.md and RECIPE-NOTES.md as the brief describes.

Nobody is available to answer questions. Decide for yourself and record the decision in RECIPE-NOTES.md.

Done means: `npm run build` passes, every screen and every filter in the brief works, all six signature pieces from DIRECTION.md are present, you have looked at screenshots of every screen at both widths, both markdown deliverables exist, and your dev server is stopped. Do not commit anything to git.

Report back in under 200 words: fonts and libraries added, which fancy components you used, anything in the brief or direction you could not deliver, and anything you are unsure works.
```

## What came out

- **Fonts:** Anton (headlines and prices), Fraunces Variable with the SOFT axis (wordmark and warm
  lines), Hanken Grotesk Variable (body and UI), all self-hosted through Fontsource 5.3.0.
- **Added:** `motion` 12.43.0. No Tailwind (the fancy class names were ported to plain CSS) and
  no router library.
- **Fancy components used:** `simple-marquee`, `text-rotate`, `vertical-cut-reveal`,
  `basic-number-ticker`, `underline-center`. The optional `gravity` was left out.
- **All six signature pieces from DIRECTION.md are present.**
- **Deviation from the direction:** the category bands are pink, green and blue. Yellow is kept
  for the primary action instead of being a band colour.
- **Workaround the agent added:** entrance animations stalled in tall headless screenshots, so it
  added a 1.6s settle failsafe and a 5.2s hold on the first hero word.
- **Run cost:** about 25 minutes, 91 tool calls.
