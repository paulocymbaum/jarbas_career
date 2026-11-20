# Spacing

Padding felt off because there was no single measure. This file is that measure.

## Grid

Base unit **8px**. Allowed values: 4, 8, 16, 24, 32, 40, 48, 64, 96.  
Do not use 10, 12, 14, 18, 20 (except the **20px mobile gutter**), 28, or 72 as padding.

## Tokens

| Token | Mobile | `lg+` | Role |
|-------|--------|-------|------|
| `--page-gutter` | 20px (`px-5`) | 24px (`px-6`) | Left/right of every shell |
| `--header-h` | 64px | 64px | Sticky header, `scroll-padding-top` |
| `--section-y` | 64px (`py-16`) | 96px (`py-24`) | Vertical padding of every section |
| `--section-gap` | 32px (`mb-8`) | 32px | Section title → content |
| `--block-gap` | 16px | 16px | Paragraphs, stacked fields |
| `--chip-gap` | 8px | 8px | Badges, button groups |
| `--content` | 100% | 1152px (`max-w-content`) | Shell |
| `--prose` | 100% | 640px (`max-w-prose`) | Bio, pitch, contact intro |

## Page shell

Every horizontal band (header inner, section inner, footer inner) uses the same class:

```
mx-auto w-full max-w-content px-5 lg:px-6
```

Never mix `px-4 sm:px-6` in one band and `px-6` in the next. That is the bug that made the header and body look misaligned.

## Section rhythm

Hero is the exception: `pt-16 lg:pt-24 pb-8 lg:pb-12` so the first viewport includes the CTAs and the start of About. Other sections keep the full `py-16 lg:py-24`.

Alternating sections (`alt`) may use `bg-muted` and a 1px top/bottom border. They still use the same `py`.

## Component padding

| Surface | Padding |
|---------|---------|
| Header bar | 0 vertical (height 64), shell gutter |
| Primary/secondary button | 0 / 16px (`h-10 px-4`) |
| Project / resume tile | 20px (`p-5`) |
| Dialog header | 24px (`p-6`) |
| Footer | 32px vertical (`py-8`), shell gutter |

## Type measure

- Pitch and about paragraphs: `max-w-prose` (40rem), `text-base leading-7`
- Hero name: full shell width, not stretched to 90rem of tracking
- Experience rows: full shell; the text column can sit in the shell without a nested max-width unless a line exceeds ~90 characters

## Why 72rem not 90rem

90rem (~1440px) made three-column project cards oversized, about text too long, and empty margins that did not match the 20/24px gutter. 72rem is wide enough for a 3-column grid at 16px gap and still leaves a margin on a 1440px laptop.
