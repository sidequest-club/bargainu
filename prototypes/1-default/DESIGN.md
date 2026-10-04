# Bargainu design system (prototype 1)

## Concept

Bargainu looks like a Japanese shop floor on sale day: products shown plainly, and a yellow
割引シール (discount sticker) slapped on each one, slightly crooked, the way a clerk would do it.
The sticker is the only loud element. Everything around it is indigo ink on white, so the eye
goes to the discount first and the price second.

Every token lives in `src/styles/tokens.css`. Nothing outside that file uses a raw colour, size or
duration. The two exceptions are forced by the platform: media-query breakpoints (custom properties
cannot be used there) and the `theme-color` meta tag in `index.html`.

## Colour

Raw palette values are private to `tokens.css`. Components use the role tokens only.

| Role token | Value | Use |
|---|---|---|
| `--color-page`, `--color-surface` | white | Page and control backgrounds |
| `--color-band` | indigo-50 `#f3f5fa` | Alternating section band, quiet info panels |
| `--color-surface-sunk` | indigo-100 `#e9edf6` | Image placeholders, segmented control track, active nav item |
| `--color-ink` | indigo-900 `#16224a` | All body text and headings |
| `--color-ink-muted` | indigo-500 `#55607f` | Secondary text, original price, meta |
| `--color-line`, `--color-line-strong` | indigo-200, indigo-300 | Hairlines, control borders |
| `--color-brand`, `--color-brand-hover`, `--color-brand-deep` | indigo-900, 800, 950 | Hero band, primary buttons, selected chips, footer |
| `--color-on-brand`, `--color-on-brand-muted` | white, indigo-300 | Text on indigo |
| `--color-link` | indigo-600 `#3a4c8c` | Text links |
| `--color-sticker`, `--color-sticker-edge` | `#ffd52e`, `#f5c400` | Discount sticker, the main call to action, count badges, active tab |
| `--color-sticker-wash` | `#fff6cc` | Applied-filter chips, "you save" pill |
| `--color-on-sticker`, `--color-sale` | stamp red `#c4160a` | Sticker numerals, sale price, urgent time left |
| `--color-sale-wash` | `#fde6e3` | Urgent countdown panel |
| `--color-success` | `#136b4a` | "Found 2 hr. ago" freshness label |
| `--color-focus`, `--color-focus-on-brand` | indigo-600, sticker yellow | Focus ring on white, on indigo |

Rules: red means money or urgency, never decoration. Yellow means "discount" or "the main action".
There is no dark theme; `color-scheme` is `light`.

## Typography

| Family | Token | Role |
|---|---|---|
| Dela Gothic One (400) | `--font-display` | Hero, section and page headings, prices, sticker numerals, result count, wordmark |
| Zen Kaku Gothic New (400, 500, 700, 900) | `--font-body` | Everything else |

Both are Japanese typefaces with Latin glyphs, so the Japanese release keeps the same two families.
Only the Latin subsets are bundled now; add the `japanese-*` fontsource CSS files when Japanese copy lands.

Scale (16px base, minor third): `--text-xs` 12, `--text-sm` 14, `--text-md` 16, `--text-lg` 18,
`--text-xl` 22, `--text-2xl` 28, then fluid `--text-3xl` (28 to 40), `--text-price` (36 to 52) and
`--text-hero` (36 to 72). Line height: `--leading-tight` 1.1 for display, `--leading-snug` 1.3 for
titles and UI, `--leading-body` 1.6 for prose. Prose is capped at `--measure` (62ch).

Product titles are body 700, not display, so long Japanese titles stay readable. Titles clamp to two
lines on cards. Numbers that change or line up use `.num` (tabular figures). Sentence case everywhere.

## Spacing, radius, elevation

- Spacing is a 4px scale, `--space-1` (4) to `--space-20` (80). Page gutter is the fluid `--gutter`;
  sections are separated by `--section-gap`.
- Radius carries meaning: `--radius-round` for stickers and icon buttons, `--radius-pill` for chips
  and badges, `--radius-md` for photos and buttons, `--radius-sm` for inputs, `--radius-lg` for the
  detail photo and the filter sheet.
- Elevation is rare. `--shadow-sticker` (stickers), `--shadow-raised` (heart button, toast),
  `--shadow-photo` (hero pile), `--shadow-overlay` (filter sheet). Deal cards have no shadow and no
  box: a card is a photo with text under it.

## Motion

Motion answers an action; nothing moves on its own except the hero stickers on first load.

| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | Press feedback, toast, anything entering |
| `--ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | Filter sheet |
| `--duration-press` | 140ms | `scale(0.97)` on every pressable control |
| `--duration-fast` | 160ms | Colour and border changes |
| `--duration-base` / `--duration-exit` | 220ms / 150ms | Toast in / out, heart pop |
| `--duration-sheet` / `--duration-sheet-exit` | 380ms / 220ms | Sheet in / out (exit is faster than enter) |
| `--duration-slap`, `--stagger-step` | 420ms, 70ms | Hero sticker slap, staggered |

Rules: animate `transform`, `scale`, `rotate` and `opacity` only. Never `transition: all`. Use CSS
transitions for anything that can be interrupted (toast, sheet); keyframes only for one-shot moments
(sticker slap, heart pop). Hover effects sit behind `(hover: hover) and (pointer: fine)`. Filtering,
sorting and page changes do not animate because they happen many times per visit. Under
`prefers-reduced-motion`, movement and scaling are removed and colour and opacity changes stay.

## Components

- **Sticker** (`Sticker.tsx`): yellow disc, white die-cut ring, red Dela numerals, tilted
  `--tilt-sticker`. Sizes `sm` 44, `md` 56, `lg` 88. Overhangs the top-left corner of a photo. Used
  for discount % and nothing else.
- **Deal card** (`DealCard`): square photo, sticker, heart button top-right, brand, title, sale price
  (Dela, red) with struck original, store and place, time left. Time left turns red at 24 hours or
  less. The whole card is one link; the heart is a separate button. `DealRow` is the compact
  one-line version for dense lists.
- **Badge**: small yellow pill with a count (favorites, active filters).
- **Button**: `btn--sticker` (yellow, the main action per screen: Browse all deals, Go to store,
  demo sign-in), `btn--primary` (indigo), `btn--outline`, `btn--on-brand` (on indigo). `btn--lg` and
  `btn--block` modify size. One yellow button per view at most.
- **Filter**: chips are real checkboxes, the Online / In-store switch is a radio group, prefecture and
  city are native selects, minimum discount is a native range. Filter state lives in the URL query
  (`#/browse?cat=Audio&min=30`). Desktop shows a sticky sidebar; below 64rem the same form opens in a
  bottom sheet (`<dialog>`) with a "Show N deals" button. Applied filters repeat above the grid as
  removable yellow-wash chips, with "Clear all".
- **Nav**: sticky top bar with wordmark, three links and the account link. Below 48rem the links move
  to a fixed bottom tab bar; the active tab gets a yellow pill behind its icon.
- **Form**: label above field, 2px border, 44px minimum height, focus changes the border and shows
  the ring. Hints sit under the group they explain.
- **Empty state** (`EmptyState`): the dog mark, a display heading, one sentence that says what to do,
  one or two buttons.
- **Toast**: indigo pill, bottom centre, above the tab bar on phones. Removing a favorite adds an Undo
  button and stays for 6 seconds.

## Copy voice

Plain, short, sentence case. Say what the thing does. Button labels name the action and its result
keeps the name ("Save" then "Saved to favorites"). Numbers are numerals. One dog reference per
screen at most ("sniffed out", "the nose found nothing here"); never baby talk. Empty states tell
the user what to do next. No exclamation marks.

## Do / don't

Do
- Put the sticker on every product photo that shows a discount.
- Keep prices in red Dela, original prices struck and muted.
- Leave room: titles wrap to two lines, buttons grow in height, nothing has a fixed text width.
- Add new values to `tokens.css` first, then use the token.
- Keep URL state for anything a user would want to share or come back to.

Don't
- Use sticker yellow for large backgrounds, or red for anything that is not price or urgency.
- Put deal cards in boxes, add shadows to them, or give everything the same radius.
- Add entrance animations to sections or lists.
- Use all-caps labels, eyebrow labels above headings, or a monospace face for data.
- Add store or brand logos. Store names are text.
