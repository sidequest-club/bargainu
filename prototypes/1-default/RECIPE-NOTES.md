# Recipe notes: frontend-design + web-design-guidelines + Emil Kowalski

## Skill files read and followed

1. `frontend-design:frontend-design` (plugin skill, loaded with the Skill tool) for aesthetic
   direction, typography, layout and copy.
2. `skills-emilkowalski/skills/emil-design-eng/SKILL.md` for interaction detail and motion. The
   sibling folders `animate`, `review-animations` and `animation-vocabulary` were not opened.
3. `web-design-guidelines` (Skill tool), which reads its pinned `references/guidelines.md`, for the
   final review.

No other design skill was consulted and the other prototype folders were not read.

## Questions the skills ask, answered from the brief

- frontend-design, "identify the subject, audience and primary job and confirm with the client":
  subject is a Japanese deal aggregator named after a dog; audience is shoppers in Japan comparing
  Yodobashi, Rakuten and Amazon; primary job is to show the biggest discount first. Not confirmed with
  anyone, as instructed.
- web-design-guidelines, "which files to review": every `.tsx` and `.css` file under `src/`.

## Design plan (frontend-design, first pass, then reviewed)

- Colour: indigo ink `#16224a`, white page, indigo-50 band `#f3f5fa`, sticker yellow `#ffd52e`,
  stamp red `#c4160a`.
- Type: Dela Gothic One for display and prices, Zen Kaku Gothic New for body.
- Layout: left aligned. Hero is an indigo band with the headline on the left and a tilted pile of the
  three biggest discounts on the right, each with its sticker.
- Signature: the discount sticker. Boldness is spent there and nowhere else.
- Review against the skill's list of generated-design defaults: no cream and terracotta, no
  near-black with acid accent, no broadsheet rules, no boxed card kit with one shadow, no all-caps
  eyebrows, no middle-dot meta strings, no monospace data labels, no arrow glyphs typed into labels,
  and the hero is not a big-number-plus-stats block. Rank numerals on Top Discounts are kept because
  that list is a real ranking.
- Changes made after review: deal cards lost their box and shadow; Ending soon and Just found exclude
  deals already shown above them so the home page shows 18 different deals; category tiles went from
  auto-fill (orphan row) to fixed 2 / 4 / 6 columns.

## Dials and settings

| Setting | Value |
|---|---|
| Display font | Dela Gothic One 400, Latin subset |
| Body font | Zen Kaku Gothic New 400 / 500 / 700 / 900, Latin subset |
| Type scale | 16px base, minor third, fluid display sizes via `clamp()` |
| Spacing base | 4px |
| Breakpoints | 48rem (tab bar to top nav, 2 to 4 columns), 64rem (filter sheet to sidebar) |
| Page max width | 80rem |
| Minimum hit target | 44px (`--hit-min`); chips grow to it on coarse pointers |
| Ease out | `cubic-bezier(0.23, 1, 0.32, 1)` (Emil) |
| Ease in-out | `cubic-bezier(0.77, 0, 0.175, 1)` (Emil; token defined, not yet used) |
| Drawer ease | `cubic-bezier(0.32, 0.72, 0, 1)` (Emil) |
| Press feedback | `scale(0.97)`, 140ms |
| Colour transitions | 160ms `ease` |
| Toast | 220ms in, 150ms out, shown 2.6s, 6s when it carries Undo |
| Filter sheet | 380ms in, 220ms out |
| Hero sticker slap | 420ms from `scale(1.35)`, 70ms stagger, once per load |
| Heart pop | `scale(1.18)` at 50%, 220ms, only at the moment of saving |
| Sticker tilt | -8deg (cards), 6deg (hero and rows) |
| Urgent threshold | 24 hours or less |
| Home counts | Top Discounts 8, Ending soon 4, Just found 6, categories 12 |
| Discount slider | 0 to 60 in steps of 5 (max derived from the data) |
| Locale | `en`, one constant in `src/lib/time.ts` |

Emil's rules applied: custom easing curves, no `ease-in`, UI motion under 300ms (the sheet is the
allowed exception for drawers), press scale on every pressable element, nothing enters from
`scale(0)`, exits faster than enters, transitions rather than keyframes for interruptible UI,
`@starting-style` for the sheet entrance, hover behind a hover media query, no animation on
high-frequency actions (filtering, sorting, navigation), reduced motion keeps opacity and colour.

## Libraries added

| Package | Version | Why |
|---|---|---|
| `lucide-react` | 1.51.0 | Icons |
| `@fontsource/dela-gothic-one` | 5.3.0 | Self-hosted display font |
| `@fontsource/zen-kaku-gothic-new` | 5.3.0 | Self-hosted body font |

Already in the scaffold: React 19.3.0, Vite 8.3.2, TypeScript 6.0. No router library (a 40-line hash
router in `src/lib/router.ts`), no CSS framework, no animation library.

## References

- The 割引シール discount stickers and yellow price POP cards of Japanese electronics stores and
  supermarkets (from memory, no image was fetched).
- Indigo noren shop curtains for the ink colour.
- The dog mark and logo were drawn by hand as SVG in `src/components/Logo.tsx`.

## web-design-guidelines review

Fixed:
- Removing a favorite was immediate and final: the toast now offers Undo.
- Hard-coded time and number formats: now `Intl.NumberFormat` (unit style) and
  `Intl.RelativeTimeFormat`, with non-breaking spaces between number and unit.
- Straight quotes in the search chip became curly quotes.
- Counts written as words ("eight", "three") became numerals.
- No hover state on the heart, icon buttons, text links, breadcrumb, applied chips and footer links:
  added.
- Fixed tab bar could cover a focused element: `scroll-padding-bottom` added.
- `viewport-fit=cover` and `theme-color` added so the safe-area insets and browser chrome are right.
- Heading order skipped a level on Browse and Favorites: visually hidden `h2` added.
- Brand names got `translate="no"`.
- Chips and segmented options were 36px tall on touch: 44px on coarse pointers.
- The toast read a ref during render (oxlint): changed to derived state.

Declined, with reasons:
- "Title Case for headings and buttons": frontend-design asks for sentence case, and Japanese has no
  case. Sentence case kept. "Top Discounts" keeps the brief's own capitalisation.
- "Virtualize lists over 50 items": Browse shows at most 60 light cards with lazy images.
  `content-visibility: auto` would clip the sticker that overhangs each photo.
- "Preload critical fonts": the fonts are bundled with hashed names and use `font-display: swap`.
- `outline: none` on `<main>`: it only receives focus from script on route change and from the skip
  link. Commented in the CSS.

## Order of steps

1. Read `BRIEF.md`, the scaffold and `shared/deals.ts`.
2. Loaded frontend-design and Emil's skill.
3. Installed lucide-react and the two fontsource packages.
4. Wrote the design plan and `tokens.css`.
5. Built router, store, filters and time helpers, then shared components, then the five screens
   (plus account view and not-found states).
6. `npm run build`, started the dev server on 5171, took screenshots.
7. `shot.sh` cannot go below a 500px window (Chrome's minimum), so phone screenshots were taken
   through a temporary 390px iframe page served by the dev server. It was deleted afterwards.
8. Iterated on screenshots: card meta stacking, category grid, hero copy wrap, dog mark ears, section
   de-duplication.
9. Drove the app in the built-in browser at 390 and 375 wide with scripted clicks: every filter,
   sort, search, clear, the filter sheet, save while signed out, demo sign-in, favorites, undo, sign
   out, not-found routes, horizontal overflow on all five routes, console errors.
10. Ran the web-design-guidelines review, fixed the findings above, re-checked.
11. Wrote `DESIGN.md` and this file, ran the final build, stopped the dev server.

## Known gaps

- Screenshots were taken with headless Chrome only. Safari and Firefox were not checked. The sheet
  entrance uses `@starting-style` and `transition-behavior: allow-discrete`; browsers without them
  show the sheet without the slide.
- Motion was checked by reading the code and by state, not by watching it: the browser pane was not
  visible during the session, so no animation was seen playing.
- Some shared product photos show real brand marks (a sneaker and a watch). They come from
  `shared/public/images` and were not changed.
