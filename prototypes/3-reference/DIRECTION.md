# Prototype 3 direction: "Chirashi"

Chosen by browsing the reference galleries on 2026-10-04. No design skill is used for this
prototype. The direction comes from the references below.

## Concept

A チラシ (chirashi) is the loud, dense sale flyer that Japanese stores push through every
letterbox. Bargainu is the digital version of the flyer pile, with a dog that has already sniffed
through it. Take the flyer's energy (bursts, stickers, tape, shouting prices) and run it through
the craft of two current e-commerce sites so it reads as designed, not as clutter.

## References and what to take from each

| Reference | Found via | Take this |
|---|---|---|
| Vibe, https://vibebevvy.com/ | https://www.awwwards.com/sites/vibe (Awwwards e-commerce, nominee 2026-09-25) | A thin ticker strip across the very top with small round sticker icons between phrases. A chunky soft serif for the big emotional line. A yellow pill call-to-action with an arrow. Small hand-drawn doodles sitting on top of the type. |
| Ring Pop, https://ringpopcandy.com/ | https://www.awwwards.com/sites/ring-pop-r-candy (Awwwards e-commerce, nominee 2026-09-29) | A cream paper background. Heavy condensed grotesque capitals for headlines. Tilted, overlapping full-width colour bands that scroll as marquees (pink, green, yellow), each with darker text of the same hue. A floating rounded navigation bar. Flat saturated colour blocks for section changes. |
| Nothin', https://www.noth.in/ | https://www.footer.design/sites/nothin (footer.design, Editor's Choice) | A footer that is one short inviting line above a wordmark set so large it runs edge to edge. |
| Fancy components, https://github.com/danielpetho/fancy (MIT) | given by the team | The motion building blocks listed below. |

Scroll.gallery and Cosmos were browsed too. Scroll.gallery turned out to be a feed of tools and
news rather than layouts, and nothing from either was used.

## Rules that follow from the references

- **Colour:** cream paper, near-black ink, flyer red and flyer yellow as the two loud colours,
  plus pink, green and blue as band and sticker colours. Colour blocks are flat. No gradients,
  no glassmorphism, no soft grey shadows.
- **Type:** one heavy condensed grotesque in capitals for headlines and prices, one chunky soft
  serif for the wordmark and the occasional warm line, one plain grotesque for body and UI.
  Use free fonts.
- **Signature pieces:**
  1. Top ticker strip (live-feeling facts: deals sniffed out today, biggest discount, stores covered).
  2. Tilted overlapping category bands as marquees on Home. Each band item links into Browse.
  3. Discount shown as a starburst price sticker, slightly rotated, on cards and on the detail page.
  4. Ink outlines and hard offset shadows on cards and buttons, like cut-out paper.
  5. A hand-drawn dog mark (your own SVG) that appears in the logo, the empty states and the login screen.
  6. Edge-to-edge BARGAINU wordmark footer with one short line above it.
- **Restraint:** Home carries the flyer energy. Browse and Deal detail must stay fast to scan:
  the grid is calm and regular, and the loud pieces there are limited to the sticker and the
  primary button. Rotation is never applied to anything a user has to read at length.

## Fancy components to use

Source is cloned at
`/private/tmp/claude-502/-Users-yutaasakura-Documents-GitHub-bargainu/83c108fb-2db9-413c-835b-57b306f02e70/scratchpad/skills/fancy-danielpetho/src/fancy/components/`
(commit f9f62c6). Copy the component files you use into `src/fancy/` and keep the MIT notice.

- `blocks/simple-marquee.tsx` for the ticker and the category bands
- `text/text-rotate.tsx` for a rotating word in the Home headline
- `text/basic-number-ticker.tsx` for the discount number on the detail page or the result count
- `text/vertical-cut-reveal.tsx` for headline entrances
- `text/underline-*.tsx` for text links
- `physics/gravity.tsx` is optional, for example category stickers that drop into the hero or
  an empty state. Leave it out if it hurts performance or reduced-motion handling.

They are written for Tailwind and the `motion` library. Either add Tailwind or port the class
names to plain CSS, whichever keeps tokens in `src/styles/tokens.css` as the single source.
