# Recipe notes: Impeccable + Taste Skill

What was actually done to build this prototype, in enough detail to repeat it.

## Skill files read and followed

`SKILLS` = the session scratchpad `skills/` folder.

| File | Read | Used for |
|---|---|---|
| `taste-skill-Leonxlnx/skills/taste-skill/SKILL.md` (`design-taste-frontend`) | in full | Design read, three dials, typography, colour, layout and AI-tell rules, pre-flight check |
| `impeccable-pbakaus/.claude/skills/impeccable/SKILL.md` (v4.5.0) | in full | Setup, mode, command routing |
| `reference/init.md` | in full | `PRODUCT.md` |
| `reference/new-work.md` | in full | Direction derivation, `concept-seed`, direction contract, build and finish rules |
| `reference/craft-floor.md` | in full | Quality floor and refusals |
| `reference/operate.md`, `reference/mode-operate.md` | in full | Operate-mode rules (app UI) |
| `reference/critique.md` | Assessment A and B, report and scoring sections | `critique` |
| `reference/audit.md` | in full | `audit` |
| `reference/polish.md` | in full | `polish` |
| `reference/document.md` | frontmatter schema, eight-section body, sidecar schema | `DESIGN.md`, `.impeccable/design.json` |

Scripts run: `impeccable context`, `impeccable concept-seed --scope direction --mode operate`,
`impeccable surface-brief write|read src/App.tsx`, `impeccable detect --json src` (by the
Assessment B agent), `npx impeccable detect src/` (npm `impeccable@4.1.0`).

No other design skill was used. The other prototype folders were not opened.

## Questions the skills wanted to ask, answered from the brief

Nobody was available, and this harness exposes no question tool, so no probe was possible.
Every answer below is my inference from `BRIEF.md`.

| Skill asks | Answer used |
|---|---|
| Impeccable init: who is the user, in what situation? | Shoppers in Japan scanning what is on sale now across three stores, on a phone in spare minutes and on a desktop for bigger purchases. Marked "(inferred)" in `PRODUCT.md`. |
| Init: what does the product make possible? | One list across stores, including in-store deals located by prefecture and city. |
| Init: durable constraints? | Yen, English now with room for Japanese, no store logos, no backend, tokens only. |
| Init: stack? | Fixed by the brief: Vite + React + TypeScript. |
| Init step 5: comp-first or code-first? | No image generation in this session, so code-led is the only path. Nothing written to `.impeccable/config.json`. |
| New-work: which direction (decision page, re-roll, canon)? | Took the assigned direction from the roll. No decision page was served because nobody could answer it. No telemetry ping was sent (the round was unattended). |
| Taste 0.C: one clarifying question? | Not needed; the design read was confident. |
| Critique: closing questions to the user | Questions skipped: unattended run. |

## Taste Skill settings

Design read: "Reading this as: a consumer deal-finding web app for Japanese bargain shoppers,
with a plain, quick, retail language, leaning toward native CSS tokens + one workhorse sans +
restrained motion."

| Dial | Value | Why |
|---|---|---|
| `DESIGN_VARIANCE` | 5 | Offset, left-aligned, an asymmetric hero and mixed section layouts, but a predictable grid where people compare deals. |
| `MOTION_INTENSITY` | 4 | Fluid CSS transitions for state only. A shopper is in a task; no choreography. |
| `VISUAL_DENSITY` | 6 | Daily-app spacing, leaning dense, because Japanese copy and price lists need the room. |

Taste says in its own section 13 that dense product UI is out of its scope, so its rules were
applied where they fit: typography, colour, shape lock, states, forms, copy audit, AI tells,
reduced motion, dark mode, pre-flight.

## Impeccable settings

- Mode: Operate.
- Colour strategy: Restrained content, committed shell.
- Build path: code-led (no image generation available).
- Seed key `73351ce9`, assigned index 7 of my seven grounded candidates.
- My ordered list: 1 supermarket half-price stickers (値引きシール), 2 electronics-store shelf
  price cards, 3 shotengai handwritten POP cards, 4 point and stamp cards, 5 the dog (dog tag,
  the literal reading of the name), 6 station wayfinding signage, 7 department-store wrapping
  paper and carrier bag (包装紙 / 紙袋). Rut kept off the list: red and yellow flyer density,
  and its opposite, a white marketplace grid.
- Challengers dealt and verdicts (all declined on audience identification and product clarity):
  star atlas, cassette j-card, dark developer console, zoo guide map, character goods catalog,
  darkroom exposure record. Raises taken from them: seal diameter as a fixed ramp (star atlas:
  magnitude as size); flat unmodulated colour with capsule controls (zoo guide map); hairline
  seams instead of shadow (developer console).
- Direction contract: `.impeccable/surfaces/src-app-tsx.md`.

## Libraries added

| Package | Version | Why |
|---|---|---|
| `@phosphor-icons/react` | 2.1.10 | Taste's first-choice icon family. One family, no hand-drawn SVG. The logo is the Phosphor dog on a yellow seal. |
| `@fontsource-variable/geist` | 5.3.0 | Self-hosted Geist Variable (Taste: self-host, never a Google Fonts link). |

Not added: Tailwind, Motion, a router. Plain CSS with custom properties, CSS transitions, and
a 40-line hash router were enough.

## Fonts

Geist Variable (weights 400 to 800), Latin subset loaded from the package. Japanese falls back
to Hiragino Sans, Yu Gothic UI, Noto Sans JP, then system-ui.

## References used

Only the two skills, the brief and the shared dataset. No external sites, no screenshots of
other products. The Impeccable catalog images (QUALITY BAR boards) were not opened.

## Where the two skills disagreed, and what I followed

| Topic | Taste | Impeccable | Followed |
|---|---|---|---|
| Font | Names Geist as a first choice | The bundled detector, run on `dist/`, flags Geist as an overused font; Operate mode allows familiar workhorse sans faces | Taste. Geist stays. The required `npx impeccable detect src/` does not report it. |
| Colour | Max one accent on neutral bases | Operate wants a committed palette for the shell, "a grey screen with one accent is the category default" | Both: one accent (yellow), and the green is the shell and the tint of the neutrals rather than a second accent. |
| Dark mode | Mandatory, follow system | Pick light or dark from the use scene | Taste. Both themes, system preference. |
| Styling stack | Tailwind v4 by default | No opinion | Neither: the brief requires all values as CSS custom properties in `tokens.css`, so plain CSS. |
| Animation library | Motion by default | 150 to 250ms state motion only | Impeccable, and Taste's own dial 4 ("Fluid CSS"). No library. |
| Labels on images | No pills or labels over photos | Signature move must be concrete | Impeccable, narrowed: the seal is the only thing allowed on a photo, and it straddles the edge rather than sitting on the image. |
| Motion | Hover physics welcome | Craft floor: no bounce | Impeccable. The first easing overshot; the detector flagged it and it was replaced. |
| Review | Self pre-flight | Shipped `impeccable-finish-reviewer` and `impeccable-documenter` agents | Those agent types do not exist in this harness. The critique's isolated Assessment A agent served as the independent review; `DESIGN.md` was written in-thread from `document.md`. |

Skill versus brief: the brief won every time (tokens file, hash routing, no store logos, the
"Go to store" label).

## Impeccable commands as run

**critique** (dual-agent: A design review, B detector, isolated from each other).
Nielsen total 25/40. Verdict: the seal is owned, the rest read as a tidy green shop. Priority
issues and what was done:

| Finding | Action |
|---|---|
| P1 dark theme: shell and ground merge | Dark ground made near-neutral, shell kept bottle green. |
| P1 rows used a flat percent pill instead of the seal | Rows now carry an `xs` seal on the thumbnail. |
| P2 time left under-weighted | Ink colour, larger on desktop, filled clock and bold when under 24h. |
| P2 row titles truncated on one line | Two-line clamp. |
| P2 no search on phone outside Browse | Search field added to Home on phones. |
| Save gave no announcement | Toast with `role="status"`. |
| Selection was yellow in dark, green in light | Green in both. |
| "Where is the wrapping paper?" | Printed-dot pattern on the hero and the login panel. |

Not done: English-shaped date format and "City, Prefecture" order (belongs with the Japanese
copy pass); the detail page still labels the action "Go to store" for in-store deals because
the brief names it.

**audit** (in-thread). Score 17/20: Accessibility 3, Performance 3, Responsive 4, Theming 4,
Implementation integrity 3. Fixed: control borders raised to 3:1, a global reduced-motion kill
replaced by token-level reduction, four raw ratios moved into tokens, icon buttons raised to
44px. Left: chips and the segmented control are 36px high.

**polish** (in-thread). White product photos got a hairline so they do not dissolve into the
page; first-row images load eagerly; category grid forced to four columns to remove an orphan
row; "Just found" no longer repeats "Ending soon"; hook moved out of the component file to
clear the one lint warning.

## Detector

`npx impeccable detect src/` (impeccable 4.1.0)

| | Findings |
|---|---|
| Before | 1 (`bounce-easing`, `tokens.css`, `cubic-bezier(0.34, 1.4, 0.64, 1)`) |
| After | 0 |

## Order of steps

1. Read `BRIEF.md`, the scaffold and `shared/deals.ts`.
2. Read both skills and the Impeccable references listed above.
3. `impeccable context`, then init: wrote `PRODUCT.md`.
4. Listed seven grounded directions, ran `concept-seed`, weighed challengers, wrote the
   direction contract with `surface-brief write`.
5. Set the Taste dials; wrote `src/styles/tokens.css`.
6. Built router, store, filters, components and the five screens. `npm run build`.
7. Screenshots at 1440 and 390. `shot.sh` cannot go below a 500px window, so phone shots were
   taken through a 390px iframe served from the scratchpad; the same frame forced the light
   theme (the machine is in dark mode). Flows were also driven in the built-in browser at
   375px: every filter, sort, clear, empty state, sign-in (form, error, demo), save, remove,
   sign-out, missing deal, missing page. `scrollWidth` equals the viewport at 375px.
8. Round one fixes: header search leaking onto phones, hero title wrap, category grid.
9. Critique (two agents), audit and polish; fixes applied in one batch.
10. Second and last screenshot round, both themes, both widths.
11. `npx impeccable detect src/`: 1 before, 0 after.
12. Wrote `DESIGN.md`, `.impeccable/design.json` and this file. Stopped the dev server.

## Known gaps

- Signed-in Favorites with saved deals was checked in the DOM (count, summary, removal), not in
  a screenshot.
- Some photos are blank in the tall phone screenshots because lazy images below the fold do not
  load inside the screenshot frame. They load in a real browser.
- Contrast was computed for token pairs (all text pairs at or above 5.2:1 in light), not
  measured per element.
- Not tested in Safari or Firefox, or with a screen reader.
