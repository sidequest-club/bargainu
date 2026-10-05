---
name: Bargainu
description: Live discounts from three Japanese stores, wrapped in a green carrier bag and closed with a yellow paper seal.
colors:
  ground: "oklch(0.984 0.006 150)"
  surface: "oklch(0.996 0.003 150)"
  sunken: "oklch(0.955 0.012 150)"
  line: "oklch(0.895 0.016 150)"
  line-strong: "oklch(0.61 0.03 152)"
  ink: "oklch(0.22 0.035 155)"
  ink-muted: "oklch(0.43 0.03 155)"
  ink-faint: "oklch(0.5 0.026 155)"
  shell: "oklch(0.33 0.072 155)"
  shell-deep: "oklch(0.27 0.062 155)"
  on-shell: "oklch(0.975 0.012 150)"
  on-shell-muted: "oklch(0.84 0.04 150)"
  accent: "oklch(0.875 0.168 95)"
  accent-hover: "oklch(0.83 0.17 90)"
  on-accent: "oklch(0.23 0.05 155)"
  selected: "oklch(0.33 0.072 155)"
  selected-soft: "oklch(0.93 0.035 150)"
  link: "oklch(0.36 0.09 155)"
  danger: "oklch(0.48 0.17 27)"
typography:
  display:
    fontFamily: "Geist Variable, Hiragino Sans, Yu Gothic UI, Noto Sans JP, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Geist Variable, Hiragino Sans, Yu Gothic UI, Noto Sans JP, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Geist Variable, Hiragino Sans, Yu Gothic UI, Noto Sans JP, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0"
  label:
    fontFamily: "Geist Variable, Hiragino Sans, Yu Gothic UI, Noto Sans JP, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0"
  figure:
    fontFamily: "Geist Variable, Hiragino Sans, Yu Gothic UI, Noto Sans JP, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
rounded:
  pill: "999px"
  well: "0.875rem"
  field: "0.625rem"
  sm: "0.375rem"
spacing:
  "1": "0.25rem"
  "2": "0.5rem"
  "3": "0.75rem"
  "4": "1rem"
  "5": "1.25rem"
  "6": "1.5rem"
  "8": "2rem"
  "10": "2.5rem"
  "12": "3rem"
  "16": "4rem"
components:
  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.pill}"
    padding: "0.5rem 1.25rem"
    height: "2.75rem"
  button-accent-hover:
    backgroundColor: "{colors.accent-hover}"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0.5rem 1.25rem"
    height: "2.75rem"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0.25rem 0.75rem"
    height: "2.25rem"
  chip-selected:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.on-shell}"
  seal:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.pill}"
    size: "3.25rem"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "0 0.75rem"
    height: "2.75rem"
---

# Design System: Bargainu

Source of truth for every value below is `src/styles/tokens.css`. If this file and the tokens
disagree, the tokens win and this file is out of date.

## Overview

A bargain is something you carry home wrapped. Bargainu borrows the department-store carrier
bag and its paper seal (包装紙 / 紙袋): one bottle green for the shell, one saffron-yellow
sticker for the discount, and everything else is paper and ink. It refuses the category default
(red and yellow flyer noise in boxed cards) and its opposite (a white grid with a grey accent).

The mode is Operate: a shopper is in a task. The world lends only type, palette, density and one
signature move. Layout, navigation and controls are the standard ones.

Taste Skill dials: `DESIGN_VARIANCE 5`, `MOTION_INTENSITY 4`, `VISUAL_DENSITY 6`.

**The signature move: the seal.** Every discount is a round yellow sticker, tilted 8 degrees,
straddling the edge of the product photo as if it closed the wrapping. Its diameter steps up
with the discount (under 30%, 30 to 49%, 50% and over). It straightens when you point at the
deal and presses down once when you save it.

## Colors

Strategy: Restrained on the content, committed on the shell. Neutrals are tinted toward green
(hue 150 to 155). There is exactly one accent.

| Token | Role |
|---|---|
| `--color-ground` | Page background. Green-tinted paper, never pure white. |
| `--color-surface` | Inputs, outline buttons, chips. One step lighter than the ground. |
| `--color-sunken` | Photo wells, category cells, empty states, the segmented track. |
| `--color-line` | Hairlines between groups, photo outlines. |
| `--color-line-strong` | Borders of controls (3:1 against the surface). |
| `--color-ink` | Text, prices, the toast background. |
| `--color-ink-muted` | Secondary text. 7.6:1 on the ground. |
| `--color-ink-faint` | Placeholders and disabled text only. 5.6:1 on the ground. |
| `--color-shell` / `--color-shell-deep` / `--color-shell-line` | Header, hero field, tab bar, login panel; the deeper step is for insets and the paper dots. |
| `--color-on-shell` / `--color-on-shell-muted` | Text on the shell. |
| `--color-accent` / `--color-accent-hover` / `--color-on-accent` | The seal, the primary action, counts, the current tab. Nothing else. |
| `--color-selected` / `--color-on-selected` / `--color-selected-soft` | Chosen filter chips, the segmented choice, the range and checkbox accent, active-filter chips. Green in both themes. |
| `--color-link` | Text links and "more" links. |
| `--color-danger` / `--color-danger-soft` | Form errors only. |
| `--color-focus` / `--color-focus-on-shell` | Focus ring: ink on paper, yellow on the shell. |
| `--color-scrim`, `--color-photo-veil` | Dialog backdrop; the disc behind the heart on a photo. |

Dark theme: the same roles are redefined under `prefers-color-scheme: dark`. The ground goes to
a near-neutral green-black, the shell stays visibly bottle green, the accent does not change.

### Named Rules

- **The One Sticker Rule.** Yellow means "this is the discount" or "this is the main thing to
  press". A yellow that is neither is a mistake.
- **Selection is green, never yellow.** Selected state and accent must not be confused.
- **No colour outside tokens.** Components never contain a colour literal.

## Typography

One family, Geist Variable (self-hosted through `@fontsource-variable/geist`), with a Japanese
system fallback chain (Hiragino Sans, Yu Gothic UI, Noto Sans JP). No display face, no mono.
The scale is fixed rem with a ratio near 1.2; only `--text-display` and `--text-2xl` step up at
900px. Nothing is fluid.

### Hierarchy

| Token | Size | Use |
|---|---|---|
| `--text-display` | 2.125rem, 3rem from 900px | Home headline only. Weight 700, tracking -0.03em, leading 1.1. |
| `--text-2xl` | 2.25rem, 2.5rem from 900px | Page titles on desktop, the detail price. |
| `--text-xl` | 1.75rem | Page titles on phones, section titles on desktop. |
| `--text-lg` | 1.375rem | Section titles on phones, tile price on desktop. |
| `--text-md` | 1.125rem | Tile price, hero paragraph. |
| `--text-base` | 1rem | Body, buttons, inputs. |
| `--text-sm` | 0.875rem | Labels, chips, tile titles on phones, meta on desktop. |
| `--text-xs` | 0.75rem | Store name, meta on phones, help text. |
| `--text-2xs` | 0.6875rem | Tab bar labels and count badges only. |

Weights: 400 body, 500 titles of tiles and chips, 600 labels and buttons, 700 headings and
prices, 800 the seal figure and the detail price.

### Named Rules

- **Figures are tabular.** Every price, percent, count and time uses `tabular-nums`.
- **No eyebrows.** No small uppercase label above a heading, anywhere.
- **Headings balance, paragraphs stay under `--measure` (62ch).**
- **Room for Japanese.** Titles clamp at two lines (`--line-clamp`), buttons grow with their
  label, nothing depends on a fixed text width.

## Layout

Spacing is a 4px scale: `--space-1` 4, `-2` 8, `-3` 12, `-4` 16, `-5` 20, `-6` 24, `-8` 32,
`-10` 40, `-12` 48, `-16` 64, `-20` 80. `--gutter` is 16px on phones and 32px from 900px;
`--section-gap` is 48px and 64px. Tight inside a group (4 to 12), generous between groups
(32 to 64), and always more space above a heading than below it.

- Page width caps at `--page-max` (82rem), left-aligned content, no centred hero.
- Breakpoints: 640px (two-column lists, kana in the logo), 900px (desktop shell). They are
  literal in `@media` because custom properties cannot be read there.
- Phone: green top bar, fixed green tab bar with four destinations, filters in a bottom sheet.
- Desktop: green top bar with nav, search and account; Browse gets a sticky filter rail of
  `--sidebar-width`.
- Deal grids: two columns on phones (`--tile-min`), four on desktop. Top Discounts is a
  scroll-snap rail on phones.
- Each Home section uses a different layout family: split hero, tile grid, compact category
  cells, twin row lists, one sunken band.

## Elevation & Depth

Flat by default. Depth is tone, not shadow: `ground` < `surface` (controls) and `sunken`
(wells). Groups are separated by space or a single hairline, never a box.

### Shadow Vocabulary

| Token | Use |
|---|---|
| `--shadow-seal` | The seal only. It is a sticker and sits on top of the photo. |
| `--shadow-float` | The toast. |
| `--shadow-sheet` | The phone filter sheet. |

All shadows are tinted with the ink hue, carry an offset and a blur, and have dark-theme values.

### Named Rules

- **Three things float: the seal, the toast, the sheet.** Nothing else gets a shadow.
- Layers come from four tokens: `--z-seal`, `--z-sticky`, `--z-header`, `--z-toast`.

## Shapes

One rule, followed everywhere: **anything you press is a pill, anything that holds is soft.**

| Token | Value | Use |
|---|---|---|
| `--radius-pill` | 999px | Buttons, chips, search, segmented control, seal, badges, toast. |
| `--radius-well` | 14px | Photo wells, sunken panels, the sheet's top corners. |
| `--radius-field` | 10px | Text inputs, selects, small thumbnails. |
| `--radius-sm` | 6px | Focus shape of inline text links. |

Borders are 1px (`--border-width`), 1.5px on buttons. No side-stripe borders.

## Motion

- Durations: `--dur-fast` 120ms (hover, colour), `--dur-base` 200ms (seal, toast, links),
  `--dur-slow` 320ms (sheet, stamp). Easing: `--ease-out` and `--ease-press`, both exponential
  ease-out. No bounce.
- Motion only reports state: hover, press (`--press-scale`), the seal straightening on hover,
  the seal stamp on save, the sheet rising, the toast arriving. No page-load choreography, no
  scroll effects, no loops.
- Only `transform` and `opacity` animate.
- Reduced motion: the duration tokens become 0ms and the scale tokens become 1 in `tokens.css`,
  so every state still changes, it just does not travel.

## Components

### Deal tile (the card)

There is no card. A tile is a square photo well with a hairline outline, the seal straddling
its bottom edge, and text set directly on the ground: store name (plain text, never a logo),
brand in muted ink plus title (two-line clamp), sale price with struck original price, then
time left and, for in-store deals, a pin and "City, Prefecture". The whole tile is one link
through the title; the heart is a separate button at the photo's top corner. Use `DealGrid`.

### Deal row

For short lists where time matters more than the photo: 64px thumbnail with an `xs` seal,
title, store and time, price on the right. Five rows at most, separated by space, no rules.

### Seal (the badge)

`<Seal pct size? />`. Sizes `xs` 34px, `sm` 44px, `md` 52px, `lg` 62px, `xl` 92px (desktop
hero and detail photo). Size comes from `sealTier(pct)` unless a layout needs a fixed one.
Always yellow, always tilted, always carries a screen-reader "N% off". It is the only badge on
a photo. Small counts use `.count` (yellow on the shell, green in content).

### Buttons

Pills, 44px high (`--control-height`), 36px small, 52px large. `button--accent` (yellow) is
the one primary action per view. `button--outline` is secondary. `button--on-shell` is the
outline version on green. `text-button` is an underlined link for "Clear all". Press scales to
0.97. Labels are a verb and fit on one line.

### Filters

Each filter is a labelled field in `FilterPanel`: a native range for minimum discount with its
value written out, a three-way segmented control for where to buy, native selects for
prefecture, city and brand, toggle chips (`aria-pressed`) for category, checkboxes with counts
for store. City is disabled until a prefecture is chosen, and both are disabled for
online-only, with a sentence that says why. Filters apply at once and live in the URL. Above
the results every active filter is a removable chip, followed by "Clear all". The count reads
"10 deals of 60". The same panel renders in the desktop rail and in the phone sheet.

### Navigation

Green shell. Desktop: text links with a yellow bar under the current one, a search field, and
either "Sign in" or the account chip. Phone: four icon-and-label tabs, the current one yellow
with a filled icon. Favorites shows a count when signed in. Breadcrumbs on the detail page.

### Forms

Label above, input 44px with a 10px radius, help text below, error text below in danger colour
with an icon and `role="alert"`, focus returned to the field. No placeholder used as a label.

### Empty state

A sunken panel, left-aligned: the dog on a tilted yellow disc, a plain title, one or two
sentences that say what happened and how to fix it, then the action. Used for no results,
signed-out favorites, no favorites, a missing deal and a missing page.

### Toast

One dark pill above the tab bar, 2.6 seconds, `role="status"`. Confirms save, remove, sign out.

## Copy voice

Plain, short, specific. Say what the thing is and what happens next. Numbers come from the
data ("Browse all 60 deals", "10 deals of 60"), never invented. Sentence case everywhere except
the product name and "Top Discounts". Buttons are verbs. Errors name the problem and the way
out. No exclamation marks, no fake urgency, no em dashes. The dog is in the mark, not in every
sentence.

## Do's and Don'ts

### Do:

- Read every value from `tokens.css`; add a token before adding a number.
- Put the seal on every deal photo and nowhere else.
- Keep store names as text.
- Show real time left and real counts.
- Give every new list a state for empty, and every new control hover, focus, active, disabled.
- Test at 375px and 1440px, in light and dark.

### Don't:

- Don't add a second accent, a gradient, glass, or a glow.
- Don't put deals in bordered or shadowed cards.
- Don't add other labels or pills on top of photos.
- Don't use yellow for selection, or green for the primary action.
- Don't add eyebrows, section numbers, decorative dots or scroll cues.
- Don't animate layout properties or add entrance animations.
- Don't use red for discounts; red is for errors only.
