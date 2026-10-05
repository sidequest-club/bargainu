# Bargainu design system: "Chirashi"

The system as built in prototype 3. Every value named here is a CSS custom property in
`src/styles/tokens.css`. Extend the app by using those tokens, not by adding new raw values.

## Concept

A チラシ is the loud sale flyer that Japanese stores push through every letterbox. Bargainu is
the pile of flyers after a dog has sniffed through it: cream paper, cut-out pieces with ink
outlines and hard shadows, shouting prices, starburst stickers. Home carries the flyer energy;
Browse and Deal detail keep the same paper and ink but stay calm so they are fast to scan.

## Colour

All colour is flat. No gradients, no glass, no blurred or grey shadows.

| Token | Value | Role |
|---|---|---|
| `--paper` | `#fbf1dc` | Page background (`--color-bg`) |
| `--paper-deep` | `#f1e2bf` | Photo wells, hover fill on quiet controls (`--color-well`) |
| `--card` | `#fffcf4` | Cut-out pieces: cards, nav, inputs (`--color-surface`) |
| `--ink` | `#16120e` | Text, every outline, every shadow, inverse blocks |
| `--ink-soft` | `#51483c` | Secondary text (`--color-text-muted`) |
| `--red` | `#dd2016` | Sale price, big-cut sticker, urgency, counts (`--color-price`, `--color-urgent`) |
| `--yellow` | `#ffd60a` | The one primary action, current nav item, mid sticker, Top Discounts block (`--color-cta`) |
| `--pink` / `--pink-ink` | `#ff9ec6` / `#8c1049` | Band, tile, panel, saved state |
| `--green` / `--green-ink` | `#74d68a` / `#0c4a22` | Band, tile, panel |
| `--blue` / `--blue-ink` | `#8ec9ff` / `#0a3a78` | Band, tile, in-store tag and location, focus ring (`--color-focus` uses blue-ink) |

Rules:

- Red and yellow are the two loud colours. Red means price or discount. Yellow means "press this".
- Pink, green and blue are block colours. On a band, the text is the `-ink` shade of the same hue.
  Everywhere else text on a colour block is `--ink`.
- Blue also marks anything in-store (tag, location box, "near you" block), so it reads as a channel.
- Focus ring: `--color-focus` (blue-ink) on paper, `--color-focus-on-dark` (yellow) on ink.

## Typography

| Role | Family | Used for |
|---|---|---|
| `--font-display` | Anton (one weight, always uppercase) | Headlines, prices, sticker numbers, band words |
| `--font-serif` | Fraunces Variable with `SOFT 100`, weight 900 (`--serif-soft`) or 600 (`--serif-soft-mid`) | Wordmark, footer line, the one warm line per section (`.aside`), speech bubble |
| `--font-body` | Hanken Grotesk Variable | Body and all UI |

Each stack falls back to Hiragino and Noto JP faces for the Japanese copy that comes later.

Scale: `--text-2xs` 11px, `--text-xs` 12, `--text-sm` 14, `--text-md` 16, `--text-lg` 18,
`--text-xl` 22, `--text-2xl` 28, `--text-3xl` 36, `--text-4xl` 48. Fluid sizes:
`--text-title` (calm page titles, 36 to 64px), `--text-section` (Home section shouts, 44 to 104px),
`--text-hero` (52 to 140px), `--text-hero-serif`, `--text-band`, `--text-price-card`,
`--text-price-detail`.

Line height: `--lh-display` 0.92 for Anton, `--lh-tight` 1.1, `--lh-snug` 1.3, `--lh-body` 1.55.
Small caps labels use `--track-label` (0.08em), bold, uppercase, `--text-xs`.

Japanese readiness: titles clamp to two lines (`--clamp-title`), cards grow in height rather
than truncate prices, buttons wrap, and labels never rely on a fixed width.

## Spacing and layout

4px base: `--s-1` 4, `--s-2` 8, `--s-3` 12, `--s-4` 16, `--s-5` 20, `--s-6` 24, `--s-8` 32,
`--s-10` 40, `--s-12` 48, `--s-16` 64, `--s-20` 80, `--s-24` 96.

- Page: `--page-max` 1320px, `--gutter` clamp(16px, 4vw, 40px).
- Breakpoints (media queries cannot read tokens): 640px phone to tablet, 960px tablet to desktop.
- Deal grid: auto-fill with `--card-min` (208px; 150px on phones), so two columns at 375px and four
  beside the 272px filter rail at 1440px.
- Minimum hit target: `--tap` 44px.

## Radius, outline, elevation

- Outline: every piece has `--border` (2px ink). Frames that carry a section (nav, panels,
  detail photo, form card, hero word) use `--border-thick` (3px). Dashed ink (`--border-dashed`)
  is the "cut here" line: price box, card footer, empty state.
- Radius: `--r-sm` 6, `--r-md` 12 (cards, inputs), `--r-lg` 20 (panels, sheets), `--r-pill` (buttons, chips, nav).
- Elevation is a hard ink offset, never blurred: `--shadow-sm` 2px, `--shadow-md` 4px, `--shadow-lg` 7px.
  Hover lifts a piece by `--lift` and grows the shadow one step; press pushes it flat
  (`--press-deep`, `--shadow-none`). Flat pieces inside a block (filter rail, rows) have no shadow at rest.

## Motion

- CSS: `--dur-fast` 120ms for hover and press, `--dur-base` 200ms, `--dur-slow` 420ms for the filter sheet;
  `--ease-out` by default, `--ease-pop` for small playful moves (logo dog, favourite, toast).
- JS motion reads unitless tokens through `tokenNumber()` in `src/lib/tokens.ts`:
  `--marquee-ticker`, `--marquee-band`, `--marquee-hover-factor`, `--rotate-interval`, `--rotate-hold`,
  `--stagger`, `--reveal-stagger`, `--count-duration`, `--spring-stiffness`, `--spring-damping`, `--settle-ms`.
- Marquees slow to a quarter speed on hover so their links can be clicked.
- Entrances (headline reveal, number tickers) are replaced by their finished state after `--settle-ms`,
  so a throttled tab never shows a half-finished number.
- `prefers-reduced-motion`: marquees stand still, the hero word stops rotating, reveals and tickers
  render their final state, CSS transitions are cut to zero.
- Tilt tokens (`--tilt-*`) are for stickers, bands, collage pieces, tape, the hero word and the dog.
  Never tilt anything a user reads at length.

## Signature pieces

1. **Ticker** (`.ticker`): ink strip at the very top with live facts and round sticker dots between them.
2. **Category bands** (`.band`): three tilted, overlapping full-bleed marquees on Home; every word links into Browse.
3. **Starburst sticker** (`Sticker`): 16-point burst with a hard shadow, tilted `--tilt-sticker`. Red from 40% off, yellow below. Sizes sm (rows), md (cards), lg (detail).
4. **Cut-out paper**: ink outline plus hard offset shadow on cards, buttons, nav, panels.
5. **Dog mark** (`Dog`): white dog, one yellow eye patch, oversized nose. Moods: `happy` (logo), `sniff` (hero, login, sign-in gate, footer), `sleepy` (empty states).
6. **Wordmark footer** (`.footer`): one serif line, then BARGAINU fitted edge to edge in yellow on ink.

## Components

**Card** (`DealCard`): surface, 2px outline, `--r-md`, `--shadow-md`. Square photo on a `--color-well`,
sticker hanging off the top right corner, favourite button top left. Body order is fixed: store and
channel tag, title (2 lines), brand, sale price in Anton red with the struck original beside it,
dashed rule, time left and (in-store only) place. The title link covers the whole card. Time left turns
red and bold under 24 hours. `rank` adds a "No.1" tab for ranked lists only.

**Row** (`DealRow`): the compact card for lists inside a coloured panel. Thumb, note, one-line title, price, small sticker.

**Badge**: `.tag` is an outlined pill in small caps; `--online` is plain, `--in-store` is blue,
`--store` is inverse. `.count` is a red pill with a number. The sticker is the only tilted badge.

**Button** (`.btn`): pill, 2px outline, hard shadow, bold body font, minimum 44px tall.
`--cta` (yellow) is the single primary action per view. `--ink` is the secondary strong action
(no shadow, turns red on hover). `--paper` is neutral. Sizes `--sm`, default, `--lg`; `--block` for forms.
Text links use fancy's centre underline and stay 44px tall.

**Filter**: left rail on desktop (sticky, calm, no shadow), bottom sheet on phones with a scrim, a close
button, Escape to close and a "Show N deals" action. Controls: search input, segmented control for
channel, range slider for minimum discount, checkbox chips for category and store (checked = ink fill),
a scrolling checklist for brand, two selects for prefecture then city. City is disabled until a
prefecture is picked; the whole location group is disabled for "Online". Active filters repeat above
the grid as ink chips with a remove cross, followed by "Clear all". Filter state lives in the URL hash query.

**Nav**: floating pill bar (`.nav`), sticky under the ticker. Logo, three links, sign-in or the user chip.
The current item is a yellow pill with an outline. Under 640px the links move to a floating bottom tab bar
with four tabs and a favourites count pip.

**Form** (`.form-card`): surface card with thick outline and `--shadow-lg`. Labels are small caps above the field.
Inputs are 44px, `--r-md`, 2px outline. The one-click demo button is the yellow primary; the email form's
submit is the ink button. Hints sit below in `--text-sm` muted.

**Empty state** (`EmptyState`): dashed outline box on surface, the dog (sleepy when there is nothing,
sniffing when the user needs to sign in), an Anton title, one or two sentences, one yellow button.

**Colour block** (`.block--yellow`, `.block--blue`, `.panel--pink`, `.panel--green`): flat fill with a thick
ink rule. Use one to change section on Home. Do not use them on Browse or Deal detail.

## Copy voice

Short, plain, a little dry. The dog does the work and is talked about in the third person ("The dog
has already been through it."). The stock of deals is "the pile". Headlines are two or three words in
capitals. One warm serif sentence per section at most. Say what a control does ("Show 12 deals",
"Clear all filters"), state facts with numbers ("Ends in 2d 4h", "You save ¥3,950 (50%)"), and never
hype ("amazing", "unbeatable"). No exclamation marks except in the dog's speech bubble.

## Do

- Put every new value in `tokens.css` first, then use it.
- Give every interactive piece an ink outline, and a hard shadow if it sits directly on paper.
- Keep one yellow button per view.
- Show the discount only as a sticker, and the sale price only in Anton red.
- Use `--blue` for anything about physical stores.
- Keep Browse and Deal detail to paper, surface and ink plus the sticker and the yellow button.
- Leave room for longer Japanese strings: wrap, clamp to two lines, never fix a text width.

## Don't

- No gradients, blur, soft or grey shadows, transparency effects on surfaces.
- No rotation on body text, form controls, cards in a grid, or anything read at length.
- No second display face, and no lowercase Anton.
- No store or brand logos. Store names are plain text.
- No marquee, colour block or collage on Browse, Deal detail, Login or Favorites beyond the shared ticker and footer.
- No animation that hides content without a settled fallback and a reduced-motion path.

## Known exceptions to "tokens only"

- Media query widths (640px, 960px).
- `0`, `1`, `50%`, `100%` and the 45 degree chevron geometry of the select arrow.
- SVG geometry inside fixed viewBoxes (dog, icons, sticker, doodles). Their colours and stroke widths are tokens.
- The footer wordmark's font size is computed at runtime to fit the container width.
