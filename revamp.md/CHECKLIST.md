# Implementation checklist

Map from [DESIGN.md](./DESIGN.md) and [SPACING.md](./SPACING.md) into `src/`.

## Tokens

- [x] `--background` cool slate, `--foreground` navy, `--primary` steel blue (not terracotta / not ink-only)
- [x] `--radius: 0.375rem`
- [x] IBM Plex Sans + IBM Plex Mono in `index.html` and `tailwind.config.js`
- [x] `max-w-content: 72rem`, `max-w-prose: 40rem`
- [x] Shared `pageShellClass` / `sectionYClass` in `src/lib/panel.ts`

## Layout

- [x] Header, sections, footer: same gutter
- [x] Every public section: `py-16 lg:py-24`
- [x] Nav inline from `lg`
- [x] Hero: name, Full-stack · AI · Product, pitch, city, two CTAs
- [x] No serif display face on headings

## UX (already in place, do not regress)

- [x] Skills on the page
- [x] Experience always visible
- [x] Three resume cards
- [x] Static project grid
- [x] No 3D heatmap in the intro

## Review

- [x] Light and dark, 375px and 1280px
- [x] Body contrast ≥ 4.5:1
- [x] Header, hero CTAs, and resume cards reachable (click + keyboard; skip-link is `sr-only` until focused)
